import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  published_at: string | null;
  author: string | null;
}

const emptyPost = { title: "", slug: "", excerpt: "", content: "", featured_image: "", author: "Solura Team" };

const AdminBlog = () => {
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [editing, setEditing] = useState<Partial<BlogPostRow> | null>(null);
  const [open, setOpen] = useState(false);

  const fetchPosts = async () => {
    // Use service role via edge function or direct — for now just select all (RLS allows published only, but we'll add admin policy)
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
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
      excerpt: editing.excerpt || null,
      content: editing.content || null,
      featured_image: editing.featured_image || null,
      author: editing.author || "Solura Team",
      published_at: editing.published_at || new Date().toISOString(),
    };

    if (editing.id) {
      const { error } = await supabase.from("blog_posts").update(payload).eq("id", editing.id);
      if (error) { toast.error("Failed to update: " + error.message); return; }
      toast.success("Post updated");
    } else {
      const { error } = await supabase.from("blog_posts").insert(payload);
      if (error) { toast.error("Failed to create: " + error.message); return; }
      toast.success("Post created");
    }

    setOpen(false);
    setEditing(null);
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) { toast.error("Failed to delete: " + error.message); return; }
    toast.success("Post deleted");
    fetchPosts();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Blog Posts</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2" onClick={() => setEditing({ ...emptyPost })}>
              <Plus className="h-4 w-4" /> New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">{editing?.id ? "Edit Post" : "New Post"}</DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Title</Label>
                  <Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input value={editing.slug || ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Excerpt</Label>
                  <Textarea value={editing.excerpt || ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} className="mt-1" rows={2} />
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea value={editing.content || ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} className="mt-1" rows={10} />
                </div>
                <div>
                  <Label>Featured Image URL</Label>
                  <Input value={editing.featured_image || ""} onChange={(e) => setEditing({ ...editing, featured_image: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Author</Label>
                  <Input value={editing.author || ""} onChange={(e) => setEditing({ ...editing, author: e.target.value })} className="mt-1" />
                </div>
                <Button onClick={handleSave} className="w-full">Save Post</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No blog posts yet. Create one above.</p>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <div>
                  <p className="font-medium">{post.title}</p>
                  <p className="text-xs text-muted-foreground">{post.slug} · {post.author}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setEditing(post); setOpen(true); }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(post.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminBlog;
