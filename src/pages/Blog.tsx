import { Link } from "react-router-dom";
import { blogPosts } from "@/data/products";
import { format } from "date-fns";

const Blog = () => (
  <div className="min-h-screen py-12">
    <div className="container max-w-4xl">
      <div className="text-center mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Solura Journal</p>
        <h1 className="font-display text-4xl md:text-5xl font-light">Beauty & Wellness</h1>
        <p className="mt-4 text-muted-foreground max-w-md mx-auto">Tips, guides, and insights for your skincare and haircare journey.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
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
    </div>
  </div>
);

export default Blog;
