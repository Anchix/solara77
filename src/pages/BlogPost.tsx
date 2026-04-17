import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { blogPosts as fallbackPosts, BlogPost as BlogPostType } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);

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
