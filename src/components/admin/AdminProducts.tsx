import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type { Product } from "@/data/products";

const emptyProduct = {
  name: "",
  slug: "",
  description: "",
  price: "",
  sale_price: "",
  category: "",
  image_url: "",
  specs: "",
};

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (data)
      setProducts(
        data.map((p) => ({
          ...p,
          specs: p.specs as Record<string, string> | null,
        }))
      );
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
      try {
        parsedSpecs = JSON.parse(editing.specs);
      } catch {
        toast.error("Specs must be valid JSON");
        return;
      }
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
    <div className="bg-card border border-border">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex justify-between items-center">
        <p className="text-[13px] font-medium">Products ({products.length})</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              className="text-[11px] px-4 py-2 bg-foreground text-primary-foreground border border-foreground font-body tracking-[0.1em] hover:opacity-90 transition-opacity flex items-center gap-2"
              onClick={() => setEditing({ ...emptyProduct })}
            >
              <Plus className="h-3 w-3" /> Add Product
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {editing?.id ? "Edit Product" : "New Product"}
              </DialogTitle>
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
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {["Product", "Category", "Price", "MRP", "Status", "Actions"].map((h) => (
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
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-4 text-sm text-muted-foreground">
                  No products yet. Add one above.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border/30 last:border-0 hover:bg-secondary/50"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images?.[0] || "/placeholder.svg"}
                        alt={p.name}
                        className="w-10 h-10 object-contain bg-secondary rounded"
                      />
                      <strong>{p.name}</strong>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-5 py-3 font-semibold">
                    ₹{Number(p.sale_price || p.price).toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground line-through">
                    {p.sale_price ? `₹${p.price}` : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] px-[10px] py-[3px] rounded-full font-medium bg-primary/10 text-primary">
                      Active
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-[6px]">
                      <button
                        onClick={() => { setEditing(toForm(p)); setOpen(true); }}
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

export default AdminProducts;
