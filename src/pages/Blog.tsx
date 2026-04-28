import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { blogPosts as fallbackPosts, BlogPost } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { setJsonLd, removeJsonLd } from "@/lib/jsonld";

const SITE_URL = "https://soluracosmo.com";

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("*")
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setPosts(data as BlogPost[]);
        } else {
          setPosts(fallbackPosts);
        }
        setLoading(false);
      });
  }, []);

  // Inject Blog + ItemList JSON-LD whenever posts change
  useEffect(() => {
    if (posts.length === 0) return;
    setJsonLd("blog", {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "Solura Journal",
      url: `${SITE_URL}/blog`,
      description: "Tips, guides, and insights for your skincare and haircare journey.",
      publisher: {
        "@type": "Organization",
        name: "Solura Cosmetics",
        logo: { "@type": "ImageObject", url: `${SITE_URL}/placeholder.svg` },
      },
      blogPost: posts.slice(0, 20).map((p) => ({
        "@type": "BlogPosting",
        headline: p.title,
        url: `${SITE_URL}/blog/${p.slug}`,
        image: p.featured_image || undefined,
        datePublished: p.published_at,
        author: { "@type": "Person", name: p.author || "Solura Team" },
      })),
    });
    setJsonLd("blog-itemlist", {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: posts.slice(0, 20).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/blog/${p.slug}`,
        name: p.title,
      })),
    });
    return () => {
      removeJsonLd("blog");
      removeJsonLd("blog-itemlist");
    };
  }, [posts]);

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-4xl">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Solura Journal</p>
          <h1 className="font-display text-4xl md:text-5xl font-light">Beauty & Wellness</h1>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">Tips, guides, and insights for your skincare and haircare journey.</p>
        </div>
        {loading ? (
          <p className="text-center text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                <div className="overflow-hidden rounded-lg">
                  <img src={post.featured_image || ""} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-muted-foreground">{post.published_at ? format(new Date(post.published_at), "MMM d, yyyy") : ""}</p>
                  <h2 className="font-display text-xl font-semibold group-hover:text-primary transition-colors">{post.title}</h2>
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
