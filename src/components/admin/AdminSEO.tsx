import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, AlertCircle, CheckCircle2, TrendingUp, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const SITE = "https://soluracosmo.com";

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

const AdminSEO = () => {
  const [presets, setPresets] = useState<{ label: string; path: string }[]>([
    { label: "Home", path: "/" },
    { label: "Shop", path: "/shop" },
    { label: "Blog", path: "/blog" },
    { label: "About", path: "/about" },
    { label: "Founder Story", path: "/founder-story" },
  ]);
  const [customPath, setCustomPath] = useState("/");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: prods }, { data: posts }] = await Promise.all([
        supabase.from("products").select("slug, name").limit(20),
        supabase.from("blog_posts").select("slug, title").not("published_at", "is", null).limit(10),
      ]);
      const dyn: { label: string; path: string }[] = [];
      prods?.forEach((p: any) => dyn.push({ label: `Product · ${p.name}`, path: `/product/${p.slug}` }));
      posts?.forEach((p: any) => dyn.push({ label: `Blog · ${p.title}`, path: `/blog/${p.slug}` }));
      setPresets((prev) => [...prev, ...dyn]);
    })();
  }, []);

  const runAudit = async (path: string) => {
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("seo-audit", {
        body: { url: `${SITE}${path}` },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult(data as AuditResult);
    } catch (e: any) {
      toast.error(e.message || "Audit failed");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (s: number) =>
    s >= 80 ? "text-primary" : s >= 60 ? "text-accent-foreground" : "text-destructive";

  const checkRow = (label: string, ok: boolean, detail: string) => (
    <div className="flex items-start gap-3 py-2 border-b border-border last:border-0">
      {ok ? (
        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{detail}</p>
      </div>
    </div>
  );

  const priorityPill = (p: string) => {
    const cls =
      p === "high"
        ? "bg-destructive/10 text-destructive"
        : p === "medium"
        ? "bg-accent/20 text-accent-foreground"
        : "bg-muted text-muted-foreground";
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${cls}`}>
        {p}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Picker */}
      <div className="bg-card border border-border p-5">
        <p className="text-[11px] tracking-[0.1em] uppercase text-muted-foreground mb-3">Audit a page</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {presets.map((p) => (
            <button
              key={p.path}
              disabled={loading}
              onClick={() => {
                setCustomPath(p.path);
                runAudit(p.path);
              }}
              className="text-xs px-3 py-1.5 border border-border hover:bg-secondary disabled:opacity-50"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <span className="text-xs text-muted-foreground self-center">{SITE}</span>
          <input
            value={customPath}
            onChange={(e) => setCustomPath(e.target.value)}
            placeholder="/path"
            className="flex-1 border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            disabled={loading}
            onClick={() => runAudit(customPath)}
            className="bg-foreground text-primary-foreground px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Run Audit
          </button>
        </div>
      </div>

      {loading && (
        <div className="bg-card border border-border p-8 text-center text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
          Fetching page and analysing...
        </div>
      )}

      {result && (
        <>
          {/* Score + Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-5">
            <div className="bg-card border border-border p-5 flex flex-col items-center justify-center">
              <p className="text-[10px] tracking-[0.12em] uppercase text-muted-foreground mb-2">SEO Score</p>
              <p className={`text-5xl font-semibold ${scoreColor(result.ai.score)}`}>{result.ai.score}</p>
              <p className="text-[10px] text-muted-foreground mt-1">/ 100</p>
            </div>
            <div className="bg-card border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] tracking-[0.1em] uppercase text-muted-foreground">Audit summary</p>
                <a href={result.url} target="_blank" rel="noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                  {result.url} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="text-sm leading-relaxed">{result.ai.summary}</p>
            </div>
          </div>

          {/* Keywords */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-card border border-border p-5">
              <p className="text-[11px] tracking-[0.1em] uppercase text-muted-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5" /> Primary keywords
              </p>
              <div className="flex flex-wrap gap-2">
                {result.ai.primaryKeywords.map((k) => (
                  <span key={k} className="text-xs px-3 py-1.5 bg-primary/10 text-primary font-medium">{k}</span>
                ))}
              </div>
            </div>
            <div className="bg-card border border-border p-5">
              <p className="text-[11px] tracking-[0.1em] uppercase text-muted-foreground mb-3">Long-tail opportunities</p>
              <div className="flex flex-wrap gap-2">
                {result.ai.secondaryKeywords.map((k) => (
                  <span key={k} className="text-xs px-3 py-1.5 bg-secondary text-foreground">{k}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-card border border-border">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-[13px] font-medium">Recommended actions</p>
            </div>
            <div className="p-5 space-y-3">
              {result.ai.suggestions.map((s, i) => (
                <div key={i} className="flex gap-3 items-start py-2 border-b border-border last:border-0">
                  <div className="pt-0.5">{priorityPill(s.priority)}</div>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical checks */}
          <div className="bg-card border border-border">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-[13px] font-medium">On-page checks</p>
            </div>
            <div className="px-5 py-2">
              {checkRow(
                "Title tag",
                !!result.fetched.title && result.fetched.titleLength >= 30 && result.fetched.titleLength <= 60,
                result.fetched.title
                  ? `${result.fetched.titleLength} chars · ${result.fetched.title}`
                  : "Missing"
              )}
              {checkRow(
                "Meta description",
                !!result.fetched.description && result.fetched.descriptionLength >= 120 && result.fetched.descriptionLength <= 160,
                result.fetched.description
                  ? `${result.fetched.descriptionLength} chars · ${result.fetched.description}`
                  : "Missing"
              )}
              {checkRow("Canonical URL", !!result.fetched.canonical, result.fetched.canonical || "Missing")}
              {checkRow(
                "H1 heading",
                result.fetched.h1.length === 1,
                result.fetched.h1.length === 0
                  ? "Missing"
                  : result.fetched.h1.length > 1
                  ? `${result.fetched.h1.length} found (should be exactly 1)`
                  : result.fetched.h1[0]
              )}
              {checkRow(
                "Image alt text",
                result.fetched.imgMissingAlt === 0,
                `${result.fetched.imgCount} images, ${result.fetched.imgMissingAlt} missing alt`
              )}
              {checkRow("Structured data (JSON-LD)", result.fetched.hasJsonLd, result.fetched.hasJsonLd ? "Present" : "Missing")}
              {checkRow("Open Graph image", !!result.fetched.ogImage, result.fetched.ogImage || "Missing")}
              {checkRow("Word count", result.fetched.wordCount >= 300, `${result.fetched.wordCount} words`)}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminSEO;
