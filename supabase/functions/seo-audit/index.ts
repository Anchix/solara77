// SEO quick-audit edge function.
// Two-phase: `mode=fetch` returns on-page signals fast; `mode=ai` runs the LLM analysis.
// This keeps the admin UI responsive instead of blocking on a single slow request.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface AuditRequest {
  url: string;
  mode?: "fetch" | "ai" | "both";
  fetched?: FetchedSignals;
}

interface FetchedSignals {
  statusCode: number;
  title: string | null;
  titleLength: number;
  description: string | null;
  descriptionLength: number;
  canonical: string | null;
  h1: string[];
  h2: string[];
  imgCount: number;
  imgMissingAlt: number;
  wordCount: number;
  hasJsonLd: boolean;
  ogTitle: string | null;
  ogImage: string | null;
  bodyPreview?: string;
}

function stripTags(html: string) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMeta(html: string, name: string, attr: "name" | "property" = "name") {
  const re = new RegExp(`<meta[^>]+${attr}=["']${name}["'][^>]*content=["']([^"']*)["']`, "i");
  const m = html.match(re) ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*${attr}=["']${name}["']`, "i"));
  return m?.[1] ?? null;
}

function extractAll(html: string, tag: string) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  const out: string[] = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const txt = stripTags(m[1]);
    if (txt) out.push(txt);
  }
  return out;
}

async function fetchSignals(url: string): Promise<FetchedSignals> {
  const resp = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; SoluraSEOBot/1.0)" },
  });
  const html = await resp.text();

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? stripTags(titleMatch[1]) : null;
  const description = extractMeta(html, "description");
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  const canonical = canonicalMatch?.[1] ?? null;
  const h1 = extractAll(html, "h1");
  const h2 = extractAll(html, "h2").slice(0, 10);
  const imgs = html.match(/<img[^>]*>/gi) ?? [];
  const imgMissingAlt = imgs.filter((t) => !/\balt=/i.test(t)).length;
  const bodyText = stripTags(html);
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;
  const hasJsonLd = /<script[^>]+type=["']application\/ld\+json["']/i.test(html);
  const ogTitle = extractMeta(html, "og:title", "property");
  const ogImage = extractMeta(html, "og:image", "property");

  return {
    statusCode: resp.status,
    title,
    titleLength: title?.length ?? 0,
    description,
    descriptionLength: description?.length ?? 0,
    canonical,
    h1,
    h2,
    imgCount: imgs.length,
    imgMissingAlt,
    wordCount,
    hasJsonLd,
    ogTitle,
    ogImage,
    bodyPreview: bodyText.slice(0, 3000),
  };
}

async function runAI(url: string, s: FetchedSignals) {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const prompt = `You are an SEO expert auditing a page for Solura Cosmetics (premium chemical-free natural skincare/haircare from India).

URL: ${url}
TITLE (${s.titleLength} chars): ${s.title ?? "(missing)"}
META DESCRIPTION (${s.descriptionLength} chars): ${s.description ?? "(missing)"}
CANONICAL: ${s.canonical ?? "(missing)"}
H1s: ${s.h1.join(" | ") || "(none)"}
H2s: ${s.h2.join(" | ") || "(none)"}
WORD COUNT: ${s.wordCount}
IMAGES: ${s.imgCount} (${s.imgMissingAlt} missing alt)
HAS JSON-LD: ${s.hasJsonLd}

PAGE CONTENT (first 3000 chars):
${s.bodyPreview ?? ""}

Return ONLY a JSON object with:
- score (0-100)
- summary (1-2 sentence honest assessment)
- primaryKeywords (3-5 lowercase)
- secondaryKeywords (3-5 long-tail)
- suggestions (4-6 items, each {priority: "high"|"medium"|"low", title, detail})`;

  const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are an SEO expert. Respond with valid JSON only, no markdown fences." },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!aiResp.ok) throw new Error(`AI gateway: ${aiResp.status} ${await aiResp.text()}`);
  const aiData = await aiResp.json();
  let aiText: string = aiData.choices?.[0]?.message?.content ?? "{}";
  aiText = aiText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(aiText);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json()) as AuditRequest;
    if (!body?.url || !/^https?:\/\//.test(body.url)) {
      return new Response(JSON.stringify({ error: "Valid URL required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const mode = body.mode ?? "both";

    if (mode === "fetch") {
      const fetched = await fetchSignals(body.url);
      return new Response(JSON.stringify({ url: body.url, fetched }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "ai") {
      if (!body.fetched) throw new Error("fetched signals required for ai mode");
      const ai = await runAI(body.url, body.fetched);
      return new Response(JSON.stringify({ url: body.url, ai }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // both
    const fetched = await fetchSignals(body.url);
    const ai = await runAI(body.url, fetched);
    return new Response(JSON.stringify({ url: body.url, fetched, ai }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
