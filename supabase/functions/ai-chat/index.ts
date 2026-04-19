import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    // Build live context: products + COD setting
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const [{ data: products }, { data: codSetting }] = await Promise.all([
      supabase.from("products").select("name,slug,price,sale_price,category,skin_type,key_benefits,how_to_use,is_out_of_stock,net_quantity").limit(50),
      supabase.from("site_settings").select("value").eq("key", "cod_enabled").maybeSingle(),
    ]);

    const codEnabled = codSetting ? (codSetting.value === true || codSetting.value === "true") : true;

    const productCatalog = (products || [])
      .map((p) => `- ${p.name} (${p.category || "skincare"}) — ₹${p.sale_price || p.price}${p.net_quantity ? `, ${p.net_quantity}` : ""}${p.is_out_of_stock ? " [OUT OF STOCK]" : ""}${p.skin_type ? ` | For: ${p.skin_type}` : ""}${p.key_benefits ? ` | Benefits: ${p.key_benefits.slice(0, 120)}` : ""} — link: /product/${p.slug}`)
      .join("\n");

    // Try to detect order tracking queries from latest user message
    const lastUser = [...messages].reverse().find((m: { role: string }) => m.role === "user");
    let orderContext = "";
    if (lastUser?.content) {
      const text: string = lastUser.content;
      const phoneMatch = text.match(/\b[6-9]\d{9}\b/);
      const orderIdMatch = text.match(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i);
      if (orderIdMatch) {
        const { data: o } = await supabase.from("orders").select("id,customer_name,status,total,tracking_id,created_at").eq("id", orderIdMatch[0]).maybeSingle();
        if (o) orderContext = `\n\nORDER FOUND: ID ${o.id.slice(0, 8)}, status: ${o.status}, total: ₹${o.total}, tracking: ${o.tracking_id || "not yet shipped"}, placed: ${new Date(o.created_at).toDateString()}`;
      } else if (phoneMatch) {
        const { data: orders } = await supabase.from("orders").select("id,status,total,created_at,tracking_id").eq("phone", phoneMatch[0]).order("created_at", { ascending: false }).limit(3);
        if (orders && orders.length) {
          orderContext = `\n\nORDERS for phone ${phoneMatch[0]}:\n` + orders.map((o) => `- #${o.id.slice(0, 8)} | ${o.status} | ₹${o.total} | ${new Date(o.created_at).toDateString()}${o.tracking_id ? ` | Tracking: ${o.tracking_id}` : ""}`).join("\n");
        } else {
          orderContext = `\n\nNo orders found for phone ${phoneMatch[0]}.`;
        }
      }
    }

    const systemPrompt = `You are Solura's friendly, knowledgeable customer support assistant for soluracosmo.com — a chemical-free natural skincare & haircare brand based in Karur, Tamil Nadu.

## YOUR CAPABILITIES
You CAN help customers with:
1. **Product recommendations** — suggest products from catalog below based on skin/hair type, concerns
2. **Product details** — price, ingredients, how to use, benefits, stock status
3. **Order tracking** — if customer shares phone number or order ID, real order data is injected below
4. **Shipping** — Flat ₹50 shipping on all orders. Delivery in 4-7 business days via Shiprocket
5. **Payment** — Online payments via Razorpay (UPI, cards, netbanking).${codEnabled ? " Cash on Delivery is AVAILABLE." : " Cash on Delivery is currently DISABLED — only online payment accepted."}
6. **Cancellation/Returns** — Orders can be cancelled while status is "pending". Email contact@soluracosmo.com for returns within 7 days
7. **Certifications** — GMP Certified, ISO Certified, Cruelty Free, Non-GMO
8. **Account** — Customers can sign up at /auth and view orders at /my-orders

## LIVE PRODUCT CATALOG
${productCatalog || "Catalog loading..."}

## COMPANY
Solura Cosmetics, Pallapatti, Karur, Tamil Nadu 639205 | contact@soluracosmo.com${orderContext}

## RESPONSE RULES
- Be warm, concise (2-4 sentences usually). Use emojis sparingly (1-2 max).
- ALWAYS recommend specific products by name with their /product/{slug} link when relevant
- If asked about an order without phone/order ID, ask: "Could you share your phone number or order ID so I can check?"
- If you don't know something specific (e.g., exact ingredient list not in catalog), say so honestly and suggest emailing contact@soluracosmo.com
- For medical/skin condition questions, recommend consulting a dermatologist — never diagnose
- Never invent products, prices, or policies not listed above
- Format prices as ₹XXX. Use markdown for links: [Product Name](/product/slug)`;

    const response = await fetch(LOVABLE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.filter((m: { role: string }) => m.role !== "system"),
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      if (response.status === 429) {
        return new Response(JSON.stringify({ reply: "I'm getting a lot of questions right now! Please try again in a moment. 🙏" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ reply: "Our AI assistant is temporarily unavailable. Please email contact@soluracosmo.com and we'll help right away!" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI API error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't understand that. Could you rephrase?";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("AI chat error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg, reply: "Sorry, I'm having trouble right now. Please email contact@soluracosmo.com" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
