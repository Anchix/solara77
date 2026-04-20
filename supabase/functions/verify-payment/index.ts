import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customer,
      items,
      total,
    } = await req.json();

    // 1. Verify HMAC signature first — non-negotiable
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    if (!RAZORPAY_KEY_SECRET || !RAZORPAY_KEY_ID) {
      console.error("Razorpay credentials missing");
      throw new Error("Razorpay not configured");
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(RAZORPAY_KEY_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuf = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`)
    );
    const expectedSignature = Array.from(new Uint8Array(signatureBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (expectedSignature !== razorpay_signature) {
      console.error("Signature mismatch", { razorpay_order_id, razorpay_payment_id });
      return new Response(JSON.stringify({ error: "Invalid payment signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Signature valid → SAVE ORDER IMMEDIATELY (do not lose paid orders)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        pincode: customer.pincode,
        total: total,
        payment_id: razorpay_payment_id,
        razorpay_order_id,
        status: "confirmed",
        user_id: customer.user_id || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("CRITICAL: Order save failed after payment", orderError, { razorpay_payment_id });
      throw new Error(`Order save failed: ${orderError?.message}`);
    }

    console.log(`Order saved: ${order.order_number} (${order.id}) for payment ${razorpay_payment_id}`);

    // Mark payment attempt as paid
    try {
      await supabase
        .from("payment_attempts")
        .update({
          status: "paid",
          razorpay_payment_id,
          order_id: order.id,
        })
        .eq("razorpay_order_id", razorpay_order_id);
    } catch (e) {
      console.error("Update payment attempt failed:", e);
    }

    // 3. Save order items
    try {
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));
      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) console.error("Order items save failed:", itemsError);
    } catch (e) {
      console.error("Order items insert exception:", e);
    }

    // 4. Cross-check Razorpay amount (non-blocking — log discrepancies)
    try {
      const rzpOrderRes = await fetch(
        `https://api.razorpay.com/v1/orders/${razorpay_order_id}`,
        {
          headers: {
            Authorization: "Basic " + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`),
          },
        }
      );
      if (rzpOrderRes.ok) {
        const rzpOrder = await rzpOrderRes.json();
        const verifiedTotal = rzpOrder.amount / 100;
        if (Math.abs(verifiedTotal - total) > 0.01) {
          console.error(`AMOUNT MISMATCH on ${order.order_number}: paid=${verifiedTotal}, claimed=${total}`);
        }
      } else {
        console.error("Razorpay verify fetch failed:", rzpOrderRes.status);
      }
    } catch (e) {
      console.error("Razorpay amount cross-check failed:", e);
    }

    // 5. SMS (fire and forget)
    try {
      await supabase.functions.invoke("send-sms", {
        body: {
          phone: customer.phone,
          name: customer.name,
          orderId: order.order_number,
        },
      });
    } catch (e) {
      console.error("SMS failed:", e);
    }

    // 6. Shipment (fire and forget)
    try {
      await supabase.functions.invoke("create-shipment", {
        body: {
          orderId: order.id,
          customer,
          items,
          total,
        },
      });
    } catch (e) {
      console.error("Shipment creation failed:", e);
    }

    return new Response(
      JSON.stringify({ orderId: order.id, orderNumber: order.order_number, status: "confirmed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("verify-payment error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
