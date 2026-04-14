import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
}

const emptyCoupon = {
  code: "", discount_type: "percentage", discount_value: "", min_order_amount: "0", max_uses: "", is_active: true, expires_at: "",
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const fetchCoupons = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    if (data) setCoupons(data as Coupon[]);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSave = async () => {
    if (!editing?.code || !editing?.discount_value) { toast.error("Code and discount value are required"); return; }
    const payload: any = {
      code: editing.code.toUpperCase(),
      discount_type: editing.discount_type,
      discount_value: Number(editing.discount_value),
      min_order_amount: Number(editing.min_order_amount) || 0,
      max_uses: editing.max_uses ? Number(editing.max_uses) : null,
      is_active: editing.is_active,
      expires_at: editing.expires_at || null,
    };

    if (editing.id) {
      const { error } = await supabase.from("coupons").update(payload).eq("id", editing.id);
      if (error) { toast.error("Failed: " + error.message); return; }
      toast.success("Coupon updated");
    } else {
      const { error } = await supabase.from("coupons").insert(payload);
      if (error) { toast.error("Failed: " + error.message); return; }
      toast.success("Coupon created");
    }
    setOpen(false); setEditing(null); fetchCoupons();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) { toast.error("Failed: " + error.message); return; }
    toast.success("Coupon deleted"); fetchCoupons();
  };

  const toggleActive = async (c: Coupon) => {
    await supabase.from("coupons").update({ is_active: !c.is_active }).eq("id", c.id);
    fetchCoupons();
  };

  return (
    <div className="bg-card border border-border">
      <div className="px-5 py-4 border-b border-border flex justify-between items-center">
        <p className="text-[13px] font-medium">Coupons ({coupons.length})</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="text-[11px] px-4 py-2 bg-foreground text-primary-foreground border border-foreground font-body tracking-[0.1em] hover:opacity-90 transition-opacity flex items-center gap-2" onClick={() => setEditing({ ...emptyCoupon })}>
              <Plus className="h-3 w-3" /> Add Coupon
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="font-display text-xl">{editing?.id ? "Edit Coupon" : "New Coupon"}</DialogTitle></DialogHeader>
            {editing && (
              <div className="space-y-4 mt-4">
                <div><Label>Coupon Code</Label><Input value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} className="mt-1 uppercase" placeholder="e.g. SAVE20" /></div>
                <div>
                  <Label>Discount Type</Label>
                  <select value={editing.discount_type} onChange={(e) => setEditing({ ...editing, discount_type: e.target.value })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
                <div><Label>Discount Value</Label><Input type="number" value={editing.discount_value} onChange={(e) => setEditing({ ...editing, discount_value: e.target.value })} className="mt-1" placeholder={editing.discount_type === "percentage" ? "e.g. 20" : "e.g. 100"} /></div>
                <div><Label>Min Order Amount (₹)</Label><Input type="number" value={editing.min_order_amount} onChange={(e) => setEditing({ ...editing, min_order_amount: e.target.value })} className="mt-1" /></div>
                <div><Label>Max Uses (leave empty for unlimited)</Label><Input type="number" value={editing.max_uses} onChange={(e) => setEditing({ ...editing, max_uses: e.target.value })} className="mt-1" /></div>
                <div><Label>Expires At (optional)</Label><Input type="datetime-local" value={editing.expires_at?.slice(0, 16) || ""} onChange={(e) => setEditing({ ...editing, expires_at: e.target.value ? new Date(e.target.value).toISOString() : "" })} className="mt-1" /></div>
                <Button onClick={handleSave} className="w-full">Save Coupon</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {["Code", "Type", "Value", "Min Order", "Uses", "Status", "Actions"].map(h => (
                <th key={h} className="text-left text-[10px] tracking-[0.12em] uppercase text-muted-foreground font-medium px-5 py-2 border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-4 text-sm text-muted-foreground">No coupons yet.</td></tr>
            ) : coupons.map(c => (
              <tr key={c.id} className="border-b border-border/30 last:border-0 hover:bg-secondary/50">
                <td className="px-5 py-3 font-mono font-semibold">{c.code}</td>
                <td className="px-5 py-3 text-muted-foreground capitalize">{c.discount_type}</td>
                <td className="px-5 py-3 font-semibold">{c.discount_type === "percentage" ? `${c.discount_value}%` : `₹${c.discount_value}`}</td>
                <td className="px-5 py-3 text-muted-foreground">₹{c.min_order_amount}</td>
                <td className="px-5 py-3 text-muted-foreground">{c.used_count}{c.max_uses ? `/${c.max_uses}` : "/∞"}</td>
                <td className="px-5 py-3">
                  <button onClick={() => toggleActive(c)} className={`text-[11px] px-2 py-0.5 rounded-full ${c.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {c.is_active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-[6px]">
                    <button onClick={() => { setEditing({ ...c, discount_value: String(c.discount_value), min_order_amount: String(c.min_order_amount), max_uses: c.max_uses ? String(c.max_uses) : "" }); setOpen(true); }} className="text-[11px] px-3 py-1 border border-border bg-transparent hover:bg-foreground hover:text-primary-foreground transition-all font-body">Edit</button>
                    <button onClick={() => handleDelete(c.id)} className="text-[11px] px-3 py-1 border border-border bg-transparent hover:bg-destructive hover:text-destructive-foreground transition-all font-body"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCoupons;
