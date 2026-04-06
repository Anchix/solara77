import { useParams, Link } from "react-router-dom";
import { blogPosts } from "@/data/products";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";

const BlogPost = () => {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

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
