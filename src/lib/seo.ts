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
  noindex?: boolean;
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

/**
 * Normalises a path into a canonical URL:
 * - drops query strings and hashes (tracking params never create a new page)
 * - drops a trailing slash (except the homepage)
 * - always resolves against the canonical https, non-www host
 */
export function canonicalUrl(path: string) {
  let clean = (path || "/").split("?")[0].split("#")[0];
  if (!clean.startsWith("/")) clean = `/${clean}`;
  if (clean.length > 1) clean = clean.replace(/\/+$/, "");
  return `${SITE_URL}${clean}`;
}

export function setRobots(value: string | null) {
  if (typeof document === "undefined") return;
  const el = document.head.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
  if (value === null) {
    if (el) el.remove();
    return;
  }
  upsertMeta("name", "robots", value);
}

export function applySeo({ title, description, path, image, type = "website", noindex = false }: SeoOptions) {
  if (typeof document === "undefined") return;
  const url = canonicalUrl(path);
  const img = image || `${SITE_URL}/og-image.jpg`;
  document.title = title;
  upsertMeta("name", "description", description);
  upsertCanonical(url);
  setRobots(noindex ? "noindex, follow" : "index, follow");
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
