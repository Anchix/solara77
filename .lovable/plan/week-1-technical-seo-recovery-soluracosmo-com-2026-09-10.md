# Week 1 Technical SEO Recovery — soluracosmo.com

Scope confirmed: keep **https://soluracosmo.com** (no www) as the one true address, hosting stays on Vercel, no manufacturing/B2B section yet, and no invented product information. No redesign, no page removals beyond genuine duplicates.

## 1. One address, one version of every page

- Permanently send `www.soluracosmo.com` to `soluracosmo.com` (Vercel handles http to https already; verify).
- Send the duplicate junk addresses to their real page with permanent redirects: `/shop0`, `/shop1`, `/shop5`, `/shop-2` and the same pattern for any number to `/shop`; `/blog0`, `/blog6`, `/blog8` to `/blog`. These are not real pages — today the site answers them with a copy of the homepage text, which is exactly what confuses Google.
- Strip tracking parameters from the address used in canonical tags so `?fbclid=`-style links don't become extra pages.
- Every redirect points straight at the final address — no chains.

## 2. Unknown addresses stop pretending to exist

Anything that isn't a real page currently returns a normal page to Google. The "page not found" screen will carry a "do not index" instruction and a link back to the shop, so Google drops these instead of storing them as thin duplicates.

## 3. Self-referencing canonical on every page

Home, shop, product, blog, blog post, about and founder story each declare their own address. Product and blog-post pages currently don't set a title, description or canonical at all — that gets fixed. Nothing canonicalises to the homepage.

## 4. Product pages

For each product, from data already in the database only:
- Unique title and description built from the product's own name and description.
- One clear H1, visible price, availability, benefits and ingredients where stored.
- Product + Offer structured data with name, description, image, brand, SKU, price, INR, availability and its own address.
- Star-rating data kept **only** where real reviews exist on the page; removed everywhere else.
- Any product missing a description, ingredients or images gets listed in the final report for you to fill in from the admin panel — nothing will be invented.

## 5. Sitemap and robots

- Sitemap rebuilt to list only live, indexable addresses: home, shop, blog, about, founder story, every published product and every published blog post. Redirected, duplicate and admin addresses removed. No made-up "last modified" dates.
- robots.txt: keep admin, checkout, order and account pages out; explicitly leave styles, scripts and images crawlable; drop the outdated `Host` line; keep the sitemap reference.

## 6. Crawlable content

Keep and tighten the static text already in the page source for the homepage, and keep the existing per-post static blog output. Product pages remain app-rendered; the report will flag that accurate per-product previews on social platforms need server rendering.

## 7. Internal links

- Homepage links into shop-by-concern groups and to specific bestsellers.
- Blog articles link to the products they discuss and to two or three related articles.
- Descriptive link text, no stuffing.

## 8. Honest claims

Replace "100% chemical-free" with the approved "innovative herbal" wording sitewide. The homepage source text also states "5,000+ verified customers" and "rated 4.8/5" — unless you can back these up, they get softened. Certification badges stay limited to GMP, ISO, Cruelty Free, Non-GMO.

## 9. Report

Afterwards you get the full breakdown: addresses redirected (with the mapping), canonicals changed, sitemap and robots changes, product data changes, internal linking changes, anything set to "do not index" and why, plus the short list of things only you can do in Google Search Console.

## Needs your confirmation

- The redirect mapping in section 1 (shop/blog variants) — say the word if any of those numbered addresses is a real page you created.
- Whether the "5,000+ customers" and "4.8/5" figures are genuine.

## Technical notes

- Redirects and the www consolidation go in `vercel.json` (`redirects` array, `permanent: true`), placed before the SPA rewrite.
- `src/lib/seo.ts` gains a canonical-cleaning step; `applySeo` is added to `ProductDetail`, `BlogPost`, `Index`, `About`, `FounderStory`, `Blog`.
- `NotFound.tsx` sets `<meta name="robots" content="noindex,follow">` on mount and removes it on unmount.
- Product JSON-LD in `ProductDetail.tsx` audited for `brand`, `sku`, `priceCurrency: INR`, `itemCondition`, `availability`, `url`; `aggregateRating` emitted only when the review count from the database is greater than zero.
- Sitemap moves to `scripts/generate-sitemap.mjs` fed by the products and published blog posts tables, wired to `prebuild` alongside the existing prerender step, writing `public/sitemap.xml`.
- Base URL stays `https://soluracosmo.com` in `seo.ts`, `jsonld` output, `index.html`, robots and sitemap.
