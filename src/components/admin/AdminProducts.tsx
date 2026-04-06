import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Product } from "@/data/products";

const emptyProduct = { name: "", slug: "", description: "", price: "", sale_price: "", category: "", image_url: "", specs: "" };

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (data) setProducts(data.map((p) => ({ ...p, specs: p.specs as Record<string, string> | null })));
  };

  useEffect(() => { fetchProducts(); }, []);

  const toForm = (p: Product) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description || "",
    price: String(p.price),
    sale_price: p.sale_price ? String(p.sale_price) : "",
    category: p.category || "",
    image_url: p.images?.[0] || "",
    specs: p.specs ? JSON.stringify(p.specs, null, 2) : "",
  });

  const handleSave = async () => {
    if (!editing?.name || !editing?.slug || !editing?.price) {
      toast.error("Name, slug, and price are required");
      return;
    }

    let parsedSpecs = {};
    if (editing.specs) {
      try { parsedSpecs = JSON.parse(editing.specs); }
      catch { toast.error("Specs must be valid JSON"); return; }
    }

    const payload = {
      name: editing.name,
      slug: editing.slug,
      description: editing.description || null,
      price: Number(editing.price),
      sale_price: editing.sale_price ? Number(editing.sale_price) : null,
      category: editing.category || null,
      images: editing.image_url ? [editing.image_url] : [],
      specs: parsedSpecs,
    };

    if (editing.id) {
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
      if (error) { toast.error("Failed: " + error.message); return; }
      toast.success("Product updated");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast.error("Failed: " + error.message); return; }
      toast.success("Product created");
    }

    setOpen(false);
    setEditing(null);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error("Failed: " + error.message); return; }
    toast.success("Product deleted");
    fetchProducts();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Products</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2" onClick={() => setEditing({ ...emptyProduct })}>
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">{editing?.id ? "Edit Product" : "New Product"}</DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="space-y-4 mt-4">
                <div><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="mt-1" /></div>
                <div><Label>Slug</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="mt-1" /></div>
                <div><Label>Description</Label><Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="mt-1" rows={3} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Price (₹)</Label><Input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} className="mt-1" /></div>
                  <div><Label>Sale Price (₹)</Label><Input type="number" value={editing.sale_price} onChange={(e) => setEditing({ ...editing, sale_price: e.target.value })} className="mt-1" /></div>
                </div>
                <div><Label>Category</Label><Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="mt-1" /></div>
                <div><Label>Image URL</Label><Input value={editing.image_url} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} className="mt-1" /></div>
                <div><Label>Specs (JSON)</Label><Textarea value={editing.specs} onChange={(e) => setEditing({ ...editing, specs: e.target.value })} className="mt-1 font-mono text-xs" rows={4} placeholder='{"Volume": "100ml"}' /></div>
                <Button onClick={handleSave} className="w-full">Save Product</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products yet. Add one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground">
                <th className="pb-2">Image</th><th className="pb-2">Name</th><th className="pb-2">Category</th><th className="pb-2">Price</th><th className="pb-2">Sale</th><th className="pb-2">Actions</th>
              </tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2"><img src={p.images?.[0] || "/placeholder.svg"} alt={p.name} className="w-10 h-10 object-contain bg-secondary rounded" /></td>
                    <td className="py-2 font-medium">{p.name}</td>
                    <td className="py-2 text-muted-foreground">{p.category}</td>
                    <td className="py-2">₹{p.price}</td>
                    <td className="py-2">{p.sale_price ? `₹${p.sale_price}` : "—"}</td>
                    <td className="py-2">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(toForm(p)); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminProducts;
