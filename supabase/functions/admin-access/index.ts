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

const createAdminClient = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

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

const getAdminCount = async (adminClient: ReturnType<typeof createAdminClient>) => {
  const { count, error } = await adminClient
    .from("user_roles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  if (error) throw error;

  return count ?? 0;
};

const getIsAdmin = async (adminClient: ReturnType<typeof createAdminClient>, userId: string) => {
  const { data, error } = await adminClient
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (error) throw error;

  return Boolean(data);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();
    const adminClient = createAdminClient();

    if (!["setup", "status", "bootstrap"].includes(action)) {
      return json({ error: "Invalid action" }, 400);
    }

    if (action === "setup") {
      const adminExists = (await getAdminCount(adminClient)) > 0;
      return json({ adminExists });
    }

    const user = await getAuthenticatedUser(req);
    const adminCount = await getAdminCount(adminClient);

    if (action === "bootstrap" && adminCount === 0) {
      const { error } = await adminClient
        .from("user_roles")
        .upsert(
          { user_id: user.id, role: "admin" },
          { ignoreDuplicates: true, onConflict: "user_id,role" },
        );

      if (error) throw error;
    }

    const isAdmin = await getIsAdmin(adminClient, user.id);

    return json({
      adminExists: isAdmin || adminCount > 0,
      claimed: action === "bootstrap" && adminCount === 0 && isAdmin,
      isAdmin,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message === "Unauthorized" ? 401 : 500;
    return json({ error: message }, status);
  }
});