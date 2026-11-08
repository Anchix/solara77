import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const pickSegment = () => {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  const index = Math.floor((bytes[0] / 0x1_0000_0000) * 100);
  if (index < 90) return { index, label: "15% OFF", value: 15 };
  if (index < 99) return { index, label: "10% OFF", value: 10 };
  return { index, label: "20% OFF", value: 20 };
};

const randomCode = (value: number) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 5; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `SPIN${value}${suffix}`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const segment = pickSegment();

    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    let code = randomCode(segment.value);

    for (let attempt = 0; attempt < 4; attempt++) {
      const { error } = await supabase.from("coupons").insert({
        code,
        discount_type: "percentage",
        discount_value: segment.value,
        min_order_amount: 0,
        max_uses: 1,
        is_active: true,
        expires_at: expires,
      });
      if (!error) {
        await supabase.from("spin_wheel_spins").insert({
          prize_label: segment.label,
          discount_value: segment.value,
          code,
        });
        return new Response(
          JSON.stringify({ index: segment.index, label: segment.label, code, expires_at: expires }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      code = randomCode(segment.value);
    }

    return new Response(JSON.stringify({ error: "Could not generate code" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
