import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type { Product } from "@/data/products";

const emptyProduct = {
  name: "", slug: "", description: "", price: "", sale_price: "", category: "",
  specRows: [] as { key: string; value: string }[],
  faqRows: [] as { question: string; answer: string }[],
  image1: "", image2: "", image3: "", image4: "", image5: "",
  brand: "", product_type: "", net_quantity: "", skin_type: "", key_benefits: "",
  texture: "", usage_time: "", how_to_use: "", expected_result: "",
  storage_info: "", safety_info: "", package_type: "", country_of_origin: "India",
  is_out_of_stock: false,
  is_bogo: false,
};

const callAdminProducts = async (body: any) => {
  const res = await supabase.functions.invoke("admin-products", { body });
  if (res.error) throw new Error(res.error.message);
  return res.data;
};

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const fetchProducts = async () => {
    try {
      const data = await callAdminProducts({ action: "list" });
      if (data) setProducts(data.map((p: any) => ({ ...p, specs: p.specs as Record<string, string> | null })));
    } catch (e: any) {
      toast.error("Failed to load products: " + e.message);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const invalidateCache = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["product"] });
  };

  const toForm = (p: Product) => ({
    id: p.id, name: p.name, slug: p.slug, description: p.description || "",
    price: String(p.price), sale_price: p.sale_price ? String(p.sale_price) : "",
    category: p.category || "",
    specRows: p.specs ? Object.entries(p.specs).map(([key, value]) => ({ key, value: String(value) })) : [],
    faqRows: Array.isArray(p.faqs) ? p.faqs.map((f) => ({ question: f.question || "", answer: f.answer || "" })) : [],
    image1: p.images?.[0] || "", image2: p.images?.[1] || "", image3: p.images?.[2] || "",
    image4: p.images?.[3] || "", image5: p.images?.[4] || "",
    brand: p.brand || "", product_type: p.product_type || "", net_quantity: p.net_quantity || "",
    skin_type: p.skin_type || "", key_benefits: p.key_benefits || "", texture: p.texture || "",
    usage_time: p.usage_time || "", how_to_use: p.how_to_use || "", expected_result: p.expected_result || "",
    storage_info: p.storage_info || "", safety_info: p.safety_info || "",
    package_type: p.package_type || "", country_of_origin: p.country_of_origin || "India",
    is_out_of_stock: p.is_out_of_stock ?? false,
    is_bogo: p.is_bogo ?? false,
  });

  const handleSave = async () => {
    if (!editing?.name || !editing?.slug || !editing?.price) { toast.error("Name, slug, and price are required"); return; }
    let parsedSpecs = {};
    if (editing.specs) {
      try { parsedSpecs = JSON.parse(editing.specs); } catch { toast.error("Specs must be valid JSON"); return; }
    }
    const images = [editing.image1, editing.image2, editing.image3, editing.image4, editing.image5].filter(Boolean);
    const payload: any = {
      name: editing.name, slug: editing.slug, description: editing.description || null,
      price: Number(editing.price), sale_price: editing.sale_price ? Number(editing.sale_price) : null,
      category: editing.category || null, images, specs: parsedSpecs,
      brand: editing.brand || null, product_type: editing.product_type || null,
      net_quantity: editing.net_quantity || null, skin_type: editing.skin_type || null,
      key_benefits: editing.key_benefits || null, texture: editing.texture || null,
      usage_time: editing.usage_time || null, how_to_use: editing.how_to_use || null,
      expected_result: editing.expected_result || null, storage_info: editing.storage_info || null,
      safety_info: editing.safety_info || null, package_type: editing.package_type || null,
      country_of_origin: editing.country_of_origin || null,
      is_out_of_stock: editing.is_out_of_stock ?? false,
      is_bogo: editing.is_bogo ?? false,
    };

    try {
      if (editing.id) {
        await callAdminProducts({ action: "update", id: editing.id, product: payload });
        toast.success("Product updated");
      } else {
        await callAdminProducts({ action: "create", product: payload });
        toast.success("Product created");
      }
      setOpen(false); setEditing(null); fetchProducts(); invalidateCache();
    } catch (e: any) {
      toast.error("Failed: " + e.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await callAdminProducts({ action: "delete", id });
      toast.success("Product deleted"); fetchProducts(); invalidateCache();
    } catch (e: any) {
      toast.error("Failed: " + e.message);
    }
  };

  const textField = (label: string, key: string, placeholder?: string) => (
    <div key={key}>
      <Label>{label}</Label>
      <Input value={editing?.[key] || ""} onChange={(e) => setEditing({ ...editing, [key]: e.target.value })} className="mt-1" placeholder={placeholder} />
    </div>
  );

  return (
    <div className="bg-card border border-border">
      <div className="px-5 py-4 border-b border-border flex justify-between items-center">
        <p className="text-[13px] font-medium">Products ({products.length})</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="text-[11px] px-4 py-2 bg-foreground text-primary-foreground border border-foreground font-body tracking-[0.1em] hover:opacity-90 transition-opacity flex items-center gap-2" onClick={() => setEditing({ ...emptyProduct })}>
              <Plus className="h-3 w-3" /> Add Product
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display text-xl">{editing?.id ? "Edit Product" : "New Product"}</DialogTitle></DialogHeader>
            {editing && (
              <div className="space-y-4 mt-4">
                {textField("Name", "name")}
                {textField("Slug", "slug")}
                <div><Label>Description</Label><Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="mt-1" rows={3} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Price (₹)</Label><Input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} className="mt-1" /></div>
                  <div><Label>Sale Price (₹)</Label><Input type="number" value={editing.sale_price} onChange={(e) => setEditing({ ...editing, sale_price: e.target.value })} className="mt-1" /></div>
                </div>
                {textField("Category", "category")}

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label>Out of Stock</Label>
                    <p className="text-xs text-muted-foreground">When enabled, customers can view but cannot order this product</p>
                  </div>
                  <Switch checked={editing?.is_out_of_stock ?? false} onCheckedChange={(checked) => setEditing({ ...editing, is_out_of_stock: checked })} />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label>Buy 1 Get 1 FREE 🎁</Label>
                    <p className="text-xs text-muted-foreground">Include this product in the B1G1 offer (ends 15 July)</p>
                  </div>
                  <Switch checked={editing?.is_bogo ?? false} onCheckedChange={(checked) => setEditing({ ...editing, is_bogo: checked })} />
                </div>



                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">Product Details</p>
                <div className="grid grid-cols-2 gap-4">
                  {textField("Brand", "brand", "e.g. Solura")}
                  {textField("Product Type", "product_type", "e.g. Cream")}
                  {textField("Net Quantity", "net_quantity", "e.g. 50g")}
                  {textField("Skin Type", "skin_type", "e.g. All Skin Types")}
                  {textField("Texture", "texture", "e.g. Lightweight")}
                  {textField("Usage Time", "usage_time", "e.g. Day & Night")}
                  {textField("Package Type", "package_type", "e.g. Jar")}
                  {textField("Country of Origin", "country_of_origin", "India")}
                </div>
                {textField("Key Benefits", "key_benefits", "e.g. Brightening, Moisturizing")}
                <div><Label>How to Use</Label><Textarea value={editing.how_to_use || ""} onChange={(e) => setEditing({ ...editing, how_to_use: e.target.value })} className="mt-1" rows={2} /></div>
                <div><Label>Expected Result</Label><Textarea value={editing.expected_result || ""} onChange={(e) => setEditing({ ...editing, expected_result: e.target.value })} className="mt-1" rows={2} /></div>
                {textField("Storage", "storage_info", "e.g. Cool & dry place")}
                <div><Label>Safety Information</Label><Textarea value={editing.safety_info || ""} onChange={(e) => setEditing({ ...editing, safety_info: e.target.value })} className="mt-1" rows={2} /></div>

                <div className="space-y-2">
                  <Label>Product Images (up to 5)</Label>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Input key={n} placeholder={`Image URL ${n}`} value={editing[`image${n}`]} onChange={(e) => setEditing({ ...editing, [`image${n}`]: e.target.value })} />
                  ))}
                </div>
                <div><Label>Specs (JSON)</Label><Textarea value={editing.specs} onChange={(e) => setEditing({ ...editing, specs: e.target.value })} className="mt-1 font-mono text-xs" rows={4} placeholder='{"Volume": "100ml"}' /></div>
                <Button onClick={handleSave} className="w-full">Save Product</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {["Product", "Category", "Price", "MRP", "Stock", "Actions"].map((h) => (
                <th key={h} className="text-left text-[10px] tracking-[0.12em] uppercase text-muted-foreground font-medium px-5 py-2 border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-4 text-sm text-muted-foreground">No products yet.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-border/30 last:border-0 hover:bg-secondary/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0] || "/placeholder.svg"} alt={p.name} className="w-10 h-10 object-contain bg-secondary rounded" />
                      <strong>{p.name}</strong>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-5 py-3 font-semibold">₹{Number(p.sale_price || p.price).toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3 text-muted-foreground line-through">{p.sale_price ? `₹${p.price}` : "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${p.is_out_of_stock ? "bg-destructive/10 text-destructive" : "bg-green-100 text-green-700"}`}>
                      {p.is_out_of_stock ? "Out of Stock" : "In Stock"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-[6px]">
                      <button onClick={() => { setEditing(toForm(p)); setOpen(true); }} className="text-[11px] px-3 py-1 border border-border bg-transparent hover:bg-foreground hover:text-primary-foreground transition-all font-body">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="text-[11px] px-3 py-1 border border-border bg-transparent hover:bg-destructive hover:text-destructive-foreground transition-all font-body">Delete</button>
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
