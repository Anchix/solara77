import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AdminSettings = () => {
  const [codEnabled, setCodEnabled] = useState(true);
  const [freePrepaid, setFreePrepaid] = useState(false);
  const [prepaidShipping, setPrepaidShipping] = useState<number>(50);
  const [codShipping, setCodShipping] = useState<number>(75);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(999);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPrepaid, setSavingPrepaid] = useState(false);
  const [savingShipping, setSavingShipping] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key,value")
        .in("key", ["cod_enabled", "shipping_prepaid", "shipping_cod", "free_shipping_threshold", "free_prepaid_shipping"]);
      if (data) {
        for (const row of data) {
          const v: any = row.value;
          if (row.key === "cod_enabled") setCodEnabled(v === true || v === "true");
          if (row.key === "free_prepaid_shipping") setFreePrepaid(v === true || v === "true");
          if (row.key === "shipping_prepaid") setPrepaidShipping(Number(v) || 0);
          if (row.key === "shipping_cod") setCodShipping(Number(v) || 0);
          if (row.key === "free_shipping_threshold") setFreeShippingThreshold(Number(v) || 0);
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const toggleFreePrepaid = async (checked: boolean) => {
    setSavingPrepaid(true);
    setFreePrepaid(checked);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "free_prepaid_shipping", value: checked as any }, { onConflict: "key" });
    if (error) {
      toast.error("Failed to update: " + error.message);
      setFreePrepaid(!checked);
    } else {
      toast.success(`Free prepaid shipping ${checked ? "enabled" : "disabled"}`);
    }
    setSavingPrepaid(false);
  };


  const toggleCod = async (checked: boolean) => {
    setSaving(true);
    setCodEnabled(checked);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "cod_enabled", value: checked as any }, { onConflict: "key" });
    if (error) {
      toast.error("Failed to update: " + error.message);
      setCodEnabled(!checked);
    } else {
      toast.success(`Cash on Delivery ${checked ? "enabled" : "disabled"}`);
    }
    setSaving(false);
  };

  const saveShipping = async () => {
    setSavingShipping(true);
    const rows = [
      { key: "shipping_prepaid", value: Number(prepaidShipping) as any },
      { key: "shipping_cod", value: Number(codShipping) as any },
      { key: "free_shipping_threshold", value: Number(freeShippingThreshold) as any },
    ];
    const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
    if (error) toast.error("Failed to save: " + error.message);
    else toast.success("Shipping settings saved");
    setSavingShipping(false);
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6 max-w-2xl">
        <h2 className="font-display text-lg font-semibold mb-1">Payment Settings</h2>
        <p className="text-xs text-muted-foreground mb-5">Control which payment methods customers can use at checkout.</p>
        <div className="flex items-center justify-between py-3 border-t border-border">
          <div>
            <Label htmlFor="cod-toggle" className="text-sm font-medium">Cash on Delivery (COD)</Label>
            <p className="text-xs text-muted-foreground mt-1">
              {codEnabled
                ? "Customers can choose COD or online payment."
                : "Only online payment is available at checkout."}
            </p>
          </div>
          <Switch id="cod-toggle" checked={codEnabled} disabled={saving} onCheckedChange={toggleCod} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 max-w-2xl">
        <h2 className="font-display text-lg font-semibold mb-1">Shipping Settings</h2>
        <p className="text-xs text-muted-foreground mb-5">
          Set shipping charges and the free-shipping threshold. Free shipping applies when the subtotal is at or above the threshold.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="prepaid">Prepaid shipping (₹)</Label>
            <Input id="prepaid" type="number" min={0} value={prepaidShipping}
              onChange={(e) => setPrepaidShipping(Number(e.target.value))} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="codfee">COD shipping (₹)</Label>
            <Input id="codfee" type="number" min={0} value={codShipping}
              onChange={(e) => setCodShipping(Number(e.target.value))} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="thresh">Free shipping above (₹)</Label>
            <Input id="thresh" type="number" min={0} value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(Number(e.target.value))} className="mt-1" />
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={saveShipping} disabled={savingShipping} size="sm">
            {savingShipping ? "Saving..." : "Save Shipping"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
