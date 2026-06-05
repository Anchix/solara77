import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const STORAGE_KEY = "solura_off_pw";

export default function Off() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPassword(saved);
      verify(saved);
    }
  }, []);

  const verify = async (pw: string) => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("site-control", {
      body: { password: pw, action: "get" },
    });
    setLoading(false);
    if (error || (data as any)?.error) {
      sessionStorage.removeItem(STORAGE_KEY);
      toast.error("Invalid password");
      setAuthed(false);
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, pw);
    setAuthed(true);
    setEnabled(Boolean((data as any)?.enabled));
  };

  const toggle = async (val: boolean) => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("site-control", {
      body: { password, action: "set", enabled: val },
    });
    setLoading(false);
    if (error || (data as any)?.error) {
      toast.error("Failed to update");
      return;
    }
    setEnabled(val);
    toast.success(val ? "Site is now OFF (maintenance mode)" : "Site is back ONLINE");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-md border rounded-2xl p-8 shadow-sm bg-card">
        <h1 className="text-2xl font-semibold mb-2">Site Control</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Restricted access. Toggle the website on or off.
        </p>

        {!authed ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              verify(password);
            }}
            className="space-y-4"
          >
            <Input
              type="password"
              placeholder="Enter control password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <Button type="submit" disabled={loading || !password} className="w-full">
              {loading ? "Verifying…" : "Unlock"}
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between border rounded-xl p-4">
              <div>
                <div className="font-medium">Maintenance Mode</div>
                <div className="text-xs text-muted-foreground">
                  {enabled ? "Site is OFF for visitors" : "Site is LIVE"}
                </div>
              </div>
              <Switch checked={enabled} onCheckedChange={toggle} disabled={loading} />
            </div>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                sessionStorage.removeItem(STORAGE_KEY);
                setAuthed(false);
                setPassword("");
              }}
            >
              Lock
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
