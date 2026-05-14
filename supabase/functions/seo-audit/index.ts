// SEO quick-audit edge function.
// Fetches a public page, extracts on-page SEO signals, and asks Lovable AI
// (Gemini) to suggest concrete improvements + extract target keywords.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface AuditRequest {
  url: string;
}

interface AuditResult {
  url: string;
  fetched: {
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
  };
  ai: {
    score: number;
    summary: string;
    primaryKeywords: string[];
    secondaryKeywords: string[];
    suggestions: { priority: "high" | "medium" | "low"; title: string; detail: string }[];
  };
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

    // Fetch the page
    const resp = await fetch(body.url, {
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

    const fetched = {
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
    };

    // Ask Lovable AI for keyword extraction + suggestions
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `You are an SEO expert auditing a page for Solura Cosmetics (premium chemical-free natural skincare/haircare from India).

URL: ${body.url}
TITLE (${fetched.titleLength} chars): ${title ?? "(missing)"}
META DESCRIPTION (${fetched.descriptionLength} chars): ${description ?? "(missing)"}
CANONICAL: ${canonical ?? "(missing)"}
H1s: ${h1.join(" | ") || "(none)"}
H2s: ${h2.join(" | ") || "(none)"}
WORD COUNT: ${wordCount}
IMAGES: ${fetched.imgCount} (${fetched.imgMissingAlt} missing alt)
HAS JSON-LD: ${hasJsonLd}

PAGE CONTENT (first 3000 chars):
${bodyText.slice(0, 3000)}

Return ONLY a JSON object with:
- score (0-100, overall on-page SEO quality)
- summary (1-2 sentence honest assessment)
- primaryKeywords (3-5 main keywords this page is/should be ranking for, lowercase)
- secondaryKeywords (3-5 supporting long-tail keywords)
- suggestions (array of 4-6 actionable items, each {priority: "high"|"medium"|"low", title: short action, detail: 1-sentence specific change})

Focus on real wins: title/description rewrites, missing alt text, schema gaps, thin content, weak H1, keyword opportunities specific to natural skincare/haircare buyers in India.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an SEO expert. Respond with valid JSON only, no markdown fences." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      throw new Error(`AI gateway: ${aiResp.status} ${errText}`);
    }

    const aiData = await aiResp.json();
    let aiText: string = aiData.choices?.[0]?.message?.content ?? "{}";
    aiText = aiText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const ai = JSON.parse(aiText);

    const result: AuditResult = { url: body.url, fetched, ai };
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
