// Build-time prerenderer for blog posts.
// Runs after `vite build`. Fetches published blog posts from Supabase via REST,
// then writes a static HTML file per post into dist/blog/<slug>/index.html
// with full SEO meta tags, canonical URL, OG tags, JSON-LD, and the article
// content inlined so Googlebot indexes the page without executing JavaScript.
// Also generates a sitemap.xml listing all static routes + every blog post.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const SITE_URL = "https://soluracosmo.com";
const SUPABASE_URL = "https://ixzqjchjscjyutlhbxhx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4enFqY2hqc2NqeXV0bGhieGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODMzMDEsImV4cCI6MjA5MTA1OTMwMX0.HNDTM-a6Q33GdTmlWsIWLULU8GucAioPg2MTqR78xg8";

const STATIC_ROUTES = ["/", "/shop", "/blog", "/about", "/founder-story"];

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(str = "") {
  return escapeHtml(str);
}

function paragraphs(content = "") {
  return content
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
    .join("\n");
}

async function fetchPosts() {
  const url = `${SUPABASE_URL}/rest/v1/blog_posts?select=id,title,slug,excerpt,content,featured_image,published_at,author,updated_at&published_at=not.is.null&order=published_at.desc`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Supabase fetch failed: ${res.status}`);
  return res.json();
}

function buildPostHtml(template, post) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const title = `${post.title} — Solura Journal`;
  const description = (post.excerpt || post.content || "").slice(0, 160).replace(/\s+/g, " ").trim();
  const image = post.featured_image || `${SITE_URL}/placeholder.svg`;
  const published = post.published_at || new Date().toISOString();
  const modified = post.updated_at || published;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description,
    image: [image],
    datePublished: published,
    dateModified: modified,
    author: { "@type": "Person", name: post.author || "Solura Team" },
    publisher: {
      "@type": "Organization",
      name: "Solura Cosmetics",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/placeholder.svg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const seoTags = `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeAttr(description)}" />
    <link rel="canonical" href="${escapeAttr(url)}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeAttr(post.title)}" />
    <meta property="og:description" content="${escapeAttr(description)}" />
    <meta property="og:url" content="${escapeAttr(url)}" />
    <meta property="og:image" content="${escapeAttr(image)}" />
    <meta property="article:published_time" content="${escapeAttr(published)}" />
    <meta property="article:author" content="${escapeAttr(post.author || "Solura Team")}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(post.title)}" />
    <meta name="twitter:description" content="${escapeAttr(description)}" />
    <meta name="twitter:image" content="${escapeAttr(image)}" />
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  `;

  // Server-rendered article body for crawlers (replaced once React hydrates)
  const articleHtml = `
    <main>
      <article style="max-width:768px;margin:0 auto;padding:48px 16px;">
        <a href="/blog">← Back to Blog</a>
        ${post.featured_image ? `<img src="${escapeAttr(post.featured_image)}" alt="${escapeAttr(post.title)}" style="width:100%;height:auto;border-radius:8px;margin:24px 0;" />` : ""}
        <p style="font-size:12px;color:#888;">${new Date(published).toDateString()} · ${escapeHtml(post.author || "Solura Team")}</p>
        <h1 style="font-size:36px;font-weight:600;margin:16px 0 24px;">${escapeHtml(post.title)}</h1>
        <div>${paragraphs(post.content || "")}</div>
      </article>
    </main>
  `;

  let html = template;

  // Replace existing <title> and <meta name="description"> + add SEO block
  html = html.replace(/<title>[\s\S]*?<\/title>/, "");
  html = html.replace(/<meta\s+name="description"[^>]*>/g, "");
  html = html.replace(/<meta\s+property="og:title"[^>]*>/g, "");
  html = html.replace(/<meta\s+property="og:description"[^>]*>/g, "");
  html = html.replace(/<meta\s+property="og:type"[^>]*>/g, "");
  html = html.replace("</head>", `${seoTags}\n</head>`);

  // Inject article into <div id="root"> so crawlers see content
  html = html.replace(
    /<div id="root">\s*<\/div>/,
    `<div id="root">${articleHtml}</div>`
  );

  return html;
}

function buildSitemap(posts) {
  const urls = [
    ...STATIC_ROUTES.map((r) => ({ loc: `${SITE_URL}${r}`, changefreq: "weekly", priority: r === "/" ? "1.0" : "0.8" })),
    ...posts.map((p) => ({
      loc: `${SITE_URL}/blog/${p.slug}`,
      lastmod: (p.updated_at || p.published_at || new Date().toISOString()).slice(0, 10),
      changefreq: "monthly",
      priority: "0.7",
    })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
}

async function main() {
  if (!fs.existsSync(DIST)) {
    console.warn("[prerender-blog] dist/ not found — skipping");
    return;
  }
  const indexPath = path.join(DIST, "index.html");
  if (!fs.existsSync(indexPath)) {
    console.warn("[prerender-blog] dist/index.html not found — skipping");
    return;
  }
  const template = fs.readFileSync(indexPath, "utf8");

  let posts = [];
  try {
    posts = await fetchPosts();
  } catch (e) {
    console.warn("[prerender-blog] could not fetch posts:", e.message);
  }

  let count = 0;
  for (const post of posts) {
    if (!post.slug) continue;
    const dir = path.join(DIST, "blog", post.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), buildPostHtml(template, post));
    count++;
  }

  fs.writeFileSync(path.join(DIST, "sitemap.xml"), buildSitemap(posts));
  console.log(`[prerender-blog] wrote ${count} blog page(s) + sitemap.xml`);
}

main().catch((e) => {
  console.error("[prerender-blog] failed:", e);
  // Do not fail the build — SPA still works
});
