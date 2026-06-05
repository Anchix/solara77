import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CONTROL_PASSWORD = "solura-control-2024";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { password, action, enabled } = await req.json();

    if (password !== CONTROL_PASSWORD) {
      return json({ error: "Invalid password" }, 401);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (action === "get") {
      const { data } = await admin
        .from("site_settings")
        .select("value")
        .eq("key", "maintenance_mode")
        .maybeSingle();
      return json({ enabled: Boolean((data?.value as any)?.enabled) });
    }

    if (action === "set") {
      const { error } = await admin
        .from("site_settings")
        .upsert(
          { key: "maintenance_mode", value: { enabled: Boolean(enabled) } },
          { onConflict: "key" },
        );
      if (error) throw error;
      return json({ ok: true, enabled: Boolean(enabled) });
    }

    return json({ error: "Invalid action" }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Error" }, 500);
  }
});
