import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { blogPosts as fallbackPosts, BlogPost as BlogPostType, useProducts } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";

const SITE_URL = "https://soluracosmo.com";

function setMeta(attr: "name" | "property", key: string, value: string) {
  if (typeof document === "undefined") return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function setCanonical(href: string) {
  if (typeof document === "undefined") return;
  let el = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setJsonLd(data: Record<string, unknown>) {
  if (typeof document === "undefined") return;
  let el = document.head.querySelector('script[data-jsonld="blogpost"]') as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.setAttribute("data-jsonld", "blogpost");
    document.head.appendChild(el);
  }
  el.text = JSON.stringify(data);
}

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<BlogPostType[]>([]);
  const { data: products = [] } = useProducts();

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setPost(data as BlogPostType);
        } else {
          setPost(fallbackPosts.find((p) => p.slug === slug) || null);
        }
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    const url = `${SITE_URL}/blog/${post.slug}`;
    const desc = (post.excerpt || post.content || "").slice(0, 160).replace(/\s+/g, " ").trim();
    const image = post.featured_image || `${SITE_URL}/placeholder.svg`;
    document.title = `${post.title} — Solura Journal`;
    setMeta("name", "description", desc);
    setCanonical(url);
    setMeta("property", "og:type", "article");
    setMeta("property", "og:title", post.title);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", image);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", post.title);
    setMeta("name", "twitter:description", desc);
    setMeta("name", "twitter:image", image);
    setJsonLd({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: desc,
      image: [image],
      datePublished: post.published_at,
      author: { "@type": "Person", name: post.author || "Solura Team" },
      publisher: {
        "@type": "Organization",
        name: "Solura Cosmetics",
        logo: { "@type": "ImageObject", url: `${SITE_URL}/placeholder.svg` },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
    });
  }, [post]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading...</div>;
  }

  if (!post) {
    return <div className="min-h-screen flex items-center justify-center"><p>Post not found.</p></div>;
  }

  return (
    <div className="min-h-screen py-12">
      <article className="container max-w-3xl">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>
        <img src={post.featured_image || ""} alt={post.title} className="w-full h-64 md:h-80 object-cover rounded-lg mb-8" />
        <p className="text-xs text-muted-foreground mb-2">{post.published_at ? format(new Date(post.published_at), "MMMM d, yyyy") : ""} · {post.author}</p>
        <h1 className="font-display text-3xl md:text-5xl font-semibold mb-6">{post.title}</h1>
        <div className="prose prose-neutral max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">{post.content}</div>
      </article>
    </div>
  );
};

export default BlogPost;
