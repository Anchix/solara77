import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

// Finds payment attempts that Razorpay shows as paid but have no order, and creates the order.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const onlyOrderId: string | undefined = typeof body?.razorpay_order_id === "string" ? body.razorpay_order_id : undefined;

    const KEY_ID = Deno.env.get("RAZORPAY_KEY_ID")!;
    const KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const auth = "Basic " + btoa(`${KEY_ID}:${KEY_SECRET}`);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    let q = supabase.from("payment_attempts").select("*").is("order_id", null).not("razorpay_order_id", "is", null);
    if (onlyOrderId) q = q.eq("razorpay_order_id", onlyOrderId);
    else q = q.gte("created_at", new Date(Date.now() - 60 * 86400000).toISOString()).order("created_at", { ascending: false }).limit(100);
    const { data: attempts, error } = await q;
    if (error) throw error;

    const recovered: string[] = [];
    const needsDetails: string[] = [];

    for (const a of attempts ?? []) {
      const res = await fetch(`https://api.razorpay.com/v1/orders/${a.razorpay_order_id}/payments`, { headers: { Authorization: auth } });
      if (!res.ok) { await res.text(); continue; }
      const list = await res.json();
      const paid = (list.items ?? []).find((p: any) => p.status === "captured" || p.status === "authorized");
      if (!paid) continue;

      // Already has an order?
      const { data: existing } = await supabase.from("orders").select("id").eq("razorpay_order_id", a.razorpay_order_id).maybeSingle();
      if (existing) {
        await supabase.from("payment_attempts").update({ status: "paid", razorpay_payment_id: paid.id, order_id: existing.id }).eq("id", a.id);
        continue;
      }

      const p = a.order_payload as any;
      if (!p?.customer?.address) {
        await supabase.from("payment_attempts").update({
          status: "paid", razorpay_payment_id: paid.id,
          error_message: "PAID on Razorpay but order details missing — contact customer for address",
        }).eq("id", a.id);
        needsDetails.push(a.razorpay_order_id);
        continue;
      }

      const c = p.customer;
      const { data: order, error: oErr } = await supabase.from("orders").insert({
        customer_name: c.name, email: c.email, phone: c.phone, address: c.address,
        city: c.city, state: c.state, pincode: c.pincode,
        total: paid.amount / 100, payment_id: paid.id, razorpay_order_id: a.razorpay_order_id,
        status: "confirmed", user_id: c.user_id || null,
      }).select().single();
      if (oErr || !order) { console.error("Recover insert failed", oErr); continue; }

      if (Array.isArray(p.items) && p.items.length) {
        await supabase.from("order_items").insert(p.items.map((i: any) => ({
          order_id: order.id, product_id: String(i.product_id), product_name: String(i.name),
          quantity: Number(i.quantity), price: Number(i.price),
        })));
      }
      await supabase.from("payment_attempts").update({
        status: "paid", razorpay_payment_id: paid.id, order_id: order.id, error_message: "Order auto-recovered",
      }).eq("id", a.id);
      try { await supabase.functions.invoke("send-sms", { body: { phone: c.phone, name: c.name, orderId: order.order_number } }); } catch {}
      recovered.push(order.order_number);
      if (onlyOrderId) {
        return new Response(JSON.stringify({ recovered, orderId: order.id, orderNumber: order.order_number }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({ recovered, needsDetails }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("reconcile error", msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
