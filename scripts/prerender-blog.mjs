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

async function fetchProducts() {
  const url = `${SUPABASE_URL}/rest/v1/products?select=slug,updated_at&order=updated_at.desc`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Supabase products fetch failed: ${res.status}`);
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

  // Replace existing <title> and meta/link tags so per-post values are unique
  html = html.replace(/<title>[\s\S]*?<\/title>/, "");
  html = html.replace(/<meta\s+name="description"[^>]*>/g, "");
  html = html.replace(/<link\s+rel="canonical"[^>]*>/g, "");
  html = html.replace(/<meta\s+property="og:title"[^>]*>/g, "");
  html = html.replace(/<meta\s+property="og:description"[^>]*>/g, "");
  html = html.replace(/<meta\s+property="og:type"[^>]*>/g, "");
  html = html.replace(/<meta\s+property="og:url"[^>]*>/g, "");
  html = html.replace("</head>", `${seoTags}\n</head>`);

  // Inject article into <div id="root"> so crawlers see content
  html = html.replace(
    /<div id="root">\s*<\/div>/,
    `<div id="root">${articleHtml}</div>`
  );

  return html;
}

function buildSitemap(posts, products) {
  const urls = [
    ...STATIC_ROUTES.map((r) => ({ loc: `${SITE_URL}${r}`, changefreq: "weekly", priority: r === "/" ? "1.0" : "0.8" })),
    ...posts.map((p) => ({
      loc: `${SITE_URL}/blog/${p.slug}`,
      lastmod: (p.updated_at || p.published_at || new Date().toISOString()).slice(0, 10),
      changefreq: "monthly",
      priority: "0.7",
    })),
    ...products.map((p) => ({
      loc: `${SITE_URL}/product/${p.slug}`,
      lastmod: (p.updated_at || new Date().toISOString()).slice(0, 10),
      changefreq: "weekly",
      priority: "0.8",
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

function buildStaticPages(posts) {
  const postsHtml = (posts || [])
    .slice(0, 12)
    .map(
      (p) => `
        <article style="border-bottom:1px solid #eee;padding:24px 0;">
          <h2 style="font-size:22px;margin:0 0 8px;"><a href="/blog/${escapeAttr(p.slug)}">${escapeHtml(p.title)}</a></h2>
          <p style="font-size:12px;color:#888;margin:0 0 8px;">${new Date(p.published_at || Date.now()).toDateString()} · ${escapeHtml(p.author || "Solura Team")}</p>
          <p style="margin:0;">${escapeHtml((p.excerpt || p.content || "").slice(0, 220))}…</p>
        </article>`
    )
    .join("\n");

  return [
    {
      path: "/blog",
      title: "Solura Journal — Natural Skincare & Haircare Insights from India",
      description:
        "Read the Solura Journal for expert tips on Ayurvedic skincare, chemical-free haircare, ingredient deep-dives and daily glow rituals from India's homegrown beauty brand.",
      h1: "Solura Journal — Natural Beauty Insights",
      intro:
        "Welcome to the Solura Journal. We share ingredient stories, Ayurvedic routines, glow-up guides and behind-the-scenes notes from our chemical-free skincare and haircare lab in India.",
      body: `
        <section>
          <h2>Latest articles</h2>
          ${postsHtml || "<p>New articles drop every week — subscribe via Instagram <a href=\"https://www.instagram.com/soluracosmo\">@soluracosmo</a>.</p>"}
        </section>
        <section>
          <h2>What you'll find here</h2>
          <ul>
            <li><strong>Ingredient spotlights</strong> — the science and Ayurveda behind hibiscus, saffron, rosewater, aloe, sandalwood and turmeric.</li>
            <li><strong>Routine guides</strong> — morning and night rituals for Indian skin types, climates and seasons.</li>
            <li><strong>Hair stories</strong> — combating hair fall, dandruff and dullness with chemical-free formulas.</li>
            <li><strong>Founder notes</strong> — how Solura Cosmetics is built, formulated and certified (GMP, ISO, Cruelty Free, Non-GMO).</li>
            <li><strong>Customer rituals</strong> — real routines from our 5,000+ Solura community.</li>
          </ul>
        </section>
        <section>
          <h2>Explore Solura</h2>
          <p><a href="/shop">Shop all natural skincare & haircare</a> · <a href="/founder-story">Our founder story</a> · <a href="/about">About Solura</a></p>
        </section>`,
    },
    {
      path: "/shop",
      title: "Shop Natural Skincare & Haircare — Solura Cosmetics India",
      description:
        "Shop Solura's chemical-free skincare and haircare collection — face washes, serums, night creams, shampoos and hair oils crafted with Ayurvedic botanicals. GMP & ISO certified.",
      h1: "Shop Solura — Natural Skincare & Haircare",
      intro:
        "Explore our complete collection of chemical-free, Ayurvedic-inspired skincare and haircare. Every product is GMP and ISO certified, cruelty-free, and crafted in small batches in India.",
      body: `
        <section>
          <h2>Skincare bestsellers</h2>
          <p>From the Bright-X brightening face wash to the Glow'e night cream and Aloe Vera face serum, our skincare line targets dullness, pigmentation, dryness and sensitivity with proven natural actives.</p>
        </section>
        <section>
          <h2>Haircare bestsellers</h2>
          <p>The Hibiglow hair cleanser, hibiscus hair oil and amla strengthening masks nourish the scalp, reduce hair fall and restore shine — without sulphates or silicones.</p>
        </section>
        <section>
          <h2>Shop by concern</h2>
          <ul>
            <li>Daily Glow — brightening cleansers, vitamin C serums, radiance creams.</li>
            <li>Hydration — rosewater toners, aloe moisturisers, overnight masks.</li>
            <li>Hair Vitality — hibiscus shampoos, amla oils, scalp treatments.</li>
            <li>Sensitive Care — calm, fragrance-free formulas for reactive skin.</li>
          </ul>
        </section>
        <section>
          <h2>Why Solura</h2>
          <p>100% chemical-free · GMP Certified · ISO Certified · Cruelty Free · Non-GMO · Flat ₹50 shipping across India · Cash on Delivery + secure UPI/card payments.</p>
        </section>`,
    },
    {
      path: "/about",
      title: "About Solura Cosmetics — Chemical-Free Indian Beauty Brand",
      description:
        "Solura Cosmetics is a homegrown Indian beauty brand making luxury, chemical-free skincare and haircare with Ayurvedic ingredients. GMP & ISO certified, cruelty-free.",
      h1: "About Solura Cosmetics",
      intro:
        "Solura is a homegrown Indian beauty brand on a mission to make luxury, chemical-free skincare and haircare accessible to every household — without compromising on results or ethics.",
      body: `
        <section>
          <h2>Our philosophy</h2>
          <p>We believe nature already holds the answers. Every Solura formula pairs time-tested Ayurvedic botanicals — hibiscus, saffron, rosewater, aloe vera, sandalwood and turmeric — with modern cosmetic science, so you get visible results without sulphates, parabens, silicones or mineral oils.</p>
        </section>
        <section>
          <h2>Certifications</h2>
          <p>Solura Cosmetics is GMP Certified, ISO Certified, Cruelty Free and Non-GMO. Every batch is quality-tested in our India-based lab.</p>
        </section>
        <section>
          <h2>Community</h2>
          <p>Trusted by 5,000+ customers across India, with 4.8/5 average reviews on bestsellers like Bright-X, Hibiglow and Glow'e.</p>
        </section>
        <section>
          <h2>Learn more</h2>
          <p><a href="/founder-story">Read our founder story</a> · <a href="/shop">Shop all products</a> · <a href="/blog">Visit the Solura Journal</a></p>
        </section>`,
    },
    {
      path: "/founder-story",
      title: "Our Founder Story — The Origin of Solura Cosmetics",
      description:
        "Discover the founder story behind Solura Cosmetics — a chemical-free, Ayurvedic-inspired Indian beauty brand built on family rituals, science and 5,000+ trusted customers.",
      h1: "The Solura Founder Story",
      intro:
        "Solura Cosmetics was born from a simple frustration: too many Indian beauty shelves were stacked with harsh chemicals, vague claims and overpriced imports. We set out to change that.",
      body: `
        <section>
          <h2>Roots in Ayurveda</h2>
          <p>Growing up in India, our founder watched her family blend hibiscus, rosewater and saffron into daily rituals that delivered real skin and hair results. Solura is the modern, lab-certified continuation of those rituals — chemical-free and built for today's busy routines.</p>
        </section>
        <section>
          <h2>Built in India, for India</h2>
          <p>Every formula is developed and manufactured in India, in a GMP and ISO certified facility, with ingredients sourced from trusted local growers. Cruelty-free and non-GMO, always.</p>
        </section>
        <section>
          <h2>What's next</h2>
          <p>We're expanding our skincare and haircare collections, launching ritual kits and growing the Solura community across India. <a href="/shop">Shop the collection</a> or <a href="/blog">read the journal</a> to follow along.</p>
        </section>`,
    },
  ];
}

function buildStaticHtml(template, page) {
  const url = `${SITE_URL}${page.path}`;
  const image = `${SITE_URL}/og-image.jpg`;
  const seoTags = `
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeAttr(page.description)}" />
    <link rel="canonical" href="${escapeAttr(url)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeAttr(page.title)}" />
    <meta property="og:description" content="${escapeAttr(page.description)}" />
    <meta property="og:url" content="${escapeAttr(url)}" />
    <meta property="og:image" content="${escapeAttr(image)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(page.title)}" />
    <meta name="twitter:description" content="${escapeAttr(page.description)}" />
    <meta name="twitter:image" content="${escapeAttr(image)}" />
  `;

  const bodyHtml = `
    <main style="max-width:880px;margin:0 auto;padding:48px 16px;">
      <header>
        <h1 style="font-size:36px;font-weight:600;margin:0 0 16px;">${escapeHtml(page.h1)}</h1>
        <p style="font-size:16px;color:#444;margin:0 0 24px;">${escapeHtml(page.intro)}</p>
        <img src="${escapeAttr(image)}" alt="${escapeAttr(page.h1)} — Solura Cosmetics" width="1200" height="630" style="width:100%;height:auto;border-radius:8px;margin:0 0 24px;" />
      </header>
      ${page.body}
      <nav style="margin-top:40px;font-size:14px;">
        <a href="/">Home</a> · <a href="/shop">Shop</a> · <a href="/blog">Journal</a> · <a href="/about">About</a> · <a href="/founder-story">Founder Story</a>
      </nav>
    </main>
  `;

  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/, "");
  html = html.replace(/<meta\s+name="description"[^>]*>/g, "");
  html = html.replace(/<link\s+rel="canonical"[^>]*>/g, "");
  html = html.replace(/<meta\s+property="og:title"[^>]*>/g, "");
  html = html.replace(/<meta\s+property="og:description"[^>]*>/g, "");
  html = html.replace(/<meta\s+property="og:type"[^>]*>/g, "");
  html = html.replace(/<meta\s+property="og:url"[^>]*>/g, "");
  html = html.replace(/<meta\s+property="og:image"[^>]*>/g, "");
  html = html.replace(/<meta\s+name="twitter:[^"]+"[^>]*>/g, "");
  html = html.replace("</head>", `${seoTags}\n</head>`);
  html = html.replace(/<div id="root">[\s\S]*?<\/div>\s*<script/, `<div id="root">${bodyHtml}</div>\n    <script`);
  return html;
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

  let products = [];
  try {
    products = await fetchProducts();
  } catch (e) {
    console.warn("[prerender-blog] could not fetch products:", e.message);
  }

  let count = 0;
  for (const post of posts) {
    if (!post.slug) continue;
    const dir = path.join(DIST, "blog", post.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), buildPostHtml(template, post));
    count++;
  }

  const staticPages = buildStaticPages(posts);
  for (const page of staticPages) {
    const dir = path.join(DIST, page.path.replace(/^\//, ""));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), buildStaticHtml(template, page));
  }

  fs.writeFileSync(path.join(DIST, "sitemap.xml"), buildSitemap(posts, products));
  console.log(`[prerender-blog] wrote ${count} blog post(s) + ${staticPages.length} static page(s) + sitemap.xml (${products.length} products)`);
}

main().catch((e) => {
  console.error("[prerender-blog] failed:", e);
  // Do not fail the build — SPA still works
});
