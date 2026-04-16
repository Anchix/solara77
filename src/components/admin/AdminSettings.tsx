import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const AdminSettings = () => {
  const [codEnabled, setCodEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "cod_enabled").maybeSingle();
      if (data) setCodEnabled(data.value === true || data.value === "true");
      setLoading(false);
    };
    load();
  }, []);

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
    </div>
  );
};

export default AdminSettings;
