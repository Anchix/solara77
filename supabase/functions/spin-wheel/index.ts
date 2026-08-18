import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// index, label, discount %, weight
const SEGMENTS = [
  { index: 0, label: "20% OFF", value: 20, weight: 7 },
  { index: 1, label: "25% OFF", value: 25, weight: 1 },
  { index: 2, label: "Better luck next time", value: 0, weight: 0.5 },
  { index: 3, label: "15% OFF", value: 15, weight: 2 },
  { index: 4, label: "80% OFF", value: 80, weight: 0.5 },
];

const pickSegment = () => {
  const total = SEGMENTS.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  for (const s of SEGMENTS) {
    r -= s.weight;
    if (r <= 0) return s;
  }
  return SEGMENTS[0];
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

    if (segment.value === 0) {
      return new Response(JSON.stringify({ index: segment.index, label: segment.label, code: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
