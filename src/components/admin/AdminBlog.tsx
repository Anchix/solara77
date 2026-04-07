import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  featured_image: string | null;
  author: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const emptyPost = { title: "", slug: "", content: "", excerpt: "", featured_image: "", author: "Solura Team" };

const AdminBlog = () => {
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPosts(data as BlogPostRow[]);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleSave = async () => {
    if (!editing?.title || !editing?.slug) {
      toast.error("Title and slug are required");
      return;
    }

    const payload = {
      title: editing.title,
      slug: editing.slug,
      content: editing.content || null,
      excerpt: editing.excerpt || null,
      featured_image: editing.featured_image || null,
      author: editing.author || "Solura Team",
      published_at: editing.published_at || new Date().toISOString(),
    };

    if (editing.id) {
      const { error } = await supabase.from("blog_posts").update(payload).eq("id", editing.id);
      if (error) { toast.error("Failed: " + error.message); return; }
      toast.success("Post updated");
    } else {
      const { error } = await supabase.from("blog_posts").insert(payload);
      if (error) { toast.error("Failed: " + error.message); return; }
      toast.success("Post published");
    }

    setOpen(false);
    setEditing(null);
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) { toast.error("Failed: " + error.message); return; }
    toast.success("Post deleted");
    fetchPosts();
  };

  return (
    <div className="bg-card border border-border">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex justify-between items-center">
        <p className="text-[13px] font-medium">Blog Posts ({posts.length})</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              className="text-[11px] px-4 py-2 bg-foreground text-primary-foreground border border-foreground font-body tracking-[0.1em] hover:opacity-90 transition-opacity flex items-center gap-2"
              onClick={() => setEditing({ ...emptyPost })}
            >
              <Plus className="h-3 w-3" /> New Post
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {editing?.id ? "Edit Post" : "New Post"}
              </DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="space-y-4 mt-4">
                <div><Label>Title</Label><Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="mt-1" /></div>
                <div><Label>Slug</Label><Input value={editing.slug || ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="mt-1" /></div>
                <div><Label>Excerpt</Label><Textarea value={editing.excerpt || ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} className="mt-1" rows={2} /></div>
                <div><Label>Content</Label><Textarea value={editing.content || ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} className="mt-1" rows={8} /></div>
                <div><Label>Featured Image URL</Label><Input value={editing.featured_image || ""} onChange={(e) => setEditing({ ...editing, featured_image: e.target.value })} className="mt-1" /></div>
                <div><Label>Author</Label><Input value={editing.author || ""} onChange={(e) => setEditing({ ...editing, author: e.target.value })} className="mt-1" /></div>
                <Button onClick={handleSave} className="w-full">Save Post</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {["Title", "Author", "Published", "Actions"].map((h) => (
                <th
                  key={h}
                  className="text-left text-[10px] tracking-[0.12em] uppercase text-muted-foreground font-medium px-5 py-2 border-b border-border"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-4 text-sm text-muted-foreground">
                  No blog posts yet
                </td>
              </tr>
            ) : (
              posts.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border/30 last:border-0 hover:bg-secondary/50"
                >
                  <td className="px-5 py-3 font-medium">{p.title}</td>
                  <td className="px-5 py-3 text-muted-foreground">{p.author || "—"}</td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">
                    {p.published_at
                      ? new Date(p.published_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Draft"}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-[6px]">
                      <button
                        onClick={() => {
                          setEditing({
                            id: p.id,
                            title: p.title,
                            slug: p.slug,
                            content: p.content || "",
                            excerpt: p.excerpt || "",
                            featured_image: p.featured_image || "",
                            author: p.author || "",
                          });
                          setOpen(true);
                        }}
                        className="text-[11px] px-3 py-1 border border-border bg-transparent hover:bg-foreground hover:text-primary-foreground transition-all font-body"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-[11px] px-3 py-1 border border-border bg-transparent hover:bg-destructive hover:text-destructive-foreground transition-all font-body"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBlog;
