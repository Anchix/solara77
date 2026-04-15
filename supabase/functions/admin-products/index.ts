import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

const getAuthenticatedUser = async (req: Request) => {
  const authorization = req.headers.get("Authorization");

  if (!authorization) {
    throw new Error("Unauthorized");
  }

  const authClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
    {
      global: {
        headers: { Authorization: authorization },
      },
    },
  );

  const { data, error } = await authClient.auth.getUser();

  if (error || !data.user) {
    throw new Error("Unauthorized");
  }

  return data.user;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const user = await getAuthenticatedUser(req);
    const { data: adminRole, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) throw roleError;
    if (!adminRole) return json({ error: "Forbidden" }, 403);

    const { action, product, id } = await req.json();

    if (action === "list") {
      const { data, error } = await supabaseAdmin
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return json(data);
    }

    if (action === "create") {
      const { error } = await supabaseAdmin.from("products").insert(product);
      if (error) throw error;
      return json({ success: true });
    }

    if (action === "update") {
      const { error } = await supabaseAdmin.from("products").update(product).eq("id", id);
      if (error) throw error;
      return json({ success: true });
    }

    if (action === "delete") {
      const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
      if (error) throw error;
      return json({ success: true });
    }

    return json({ error: "Invalid action" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message === "Unauthorized" ? 401 : 500;
    return json({ error: message }, status);
  }
});
