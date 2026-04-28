// Helper to inject JSON-LD structured data into <head> for SEO.
// Uses a unique `data-jsonld` key per schema type so multiple schemas
// can coexist on a page and be replaced cleanly on route change.

export function setJsonLd(key: string, data: Record<string, unknown> | Record<string, unknown>[] | null) {
  if (typeof document === "undefined") return;
  const selector = `script[data-jsonld="${key}"]`;
  let el = document.head.querySelector(selector) as HTMLScriptElement | null;
  if (data === null) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.setAttribute("data-jsonld", key);
    document.head.appendChild(el);
  }
  el.text = JSON.stringify(data);
}

export function removeJsonLd(key: string) {
  setJsonLd(key, null);
}
