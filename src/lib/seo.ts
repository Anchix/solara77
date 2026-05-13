// Lightweight per-route SEO helper. Sets <title>, description, canonical
// and Open Graph / Twitter meta tags client-side. Use in a useEffect so it
// runs on each route mount and overrides the static index.html defaults.

export const SITE_URL = "https://soluracosmo.com";

type SeoOptions = {
  title: string;
  description: string;
  path: string; // e.g. "/shop"
  image?: string;
  type?: "website" | "article" | "product";
};

function upsertMeta(attr: "name" | "property", key: string, value: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

export function applySeo({ title, description, path, image, type = "website" }: SeoOptions) {
  if (typeof document === "undefined") return;
  const url = `${SITE_URL}${path}`;
  const img = image || `${SITE_URL}/placeholder.svg`;
  document.title = title;
  upsertMeta("name", "description", description);
  upsertCanonical(url);
  upsertMeta("property", "og:title", title);
  upsertMeta("property", "og:description", description);
  upsertMeta("property", "og:url", url);
  upsertMeta("property", "og:type", type);
  upsertMeta("property", "og:image", img);
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", title);
  upsertMeta("name", "twitter:description", description);
  upsertMeta("name", "twitter:image", img);
}
