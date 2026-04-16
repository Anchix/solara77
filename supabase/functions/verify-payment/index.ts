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

    // Verify signature using HMAC SHA256
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
    if (!RAZORPAY_KEY_SECRET) throw new Error("Razorpay secret not configured");

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(RAZORPAY_KEY_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`)
    );
    const expectedSignature = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (expectedSignature !== razorpay_signature) {
      return new Response(JSON.stringify({ error: "Invalid payment signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the actual paid amount from Razorpay to prevent client-side manipulation
    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    if (!RAZORPAY_KEY_ID) throw new Error("Razorpay key ID not configured");

    const rzpOrderRes = await fetch(
      `https://api.razorpay.com/v1/orders/${razorpay_order_id}`,
      {
        headers: {
          Authorization: "Basic " + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`),
        },
      }
    );
    if (!rzpOrderRes.ok) throw new Error("Failed to fetch Razorpay order details");
    const rzpOrder = await rzpOrderRes.json();
    const verifiedTotal = rzpOrder.amount / 100; // paise → rupees

    if (Math.abs(verifiedTotal - total) > 0.01) {
      console.error(`Amount mismatch: paid=${verifiedTotal}, claimed=${total}`);
      return new Response(JSON.stringify({ error: "Payment amount mismatch" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save order to database
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
        total: verifiedTotal,
        payment_id: razorpay_payment_id,
        razorpay_order_id,
        status: "confirmed",
      })
      .select()
      .single();

    if (orderError) throw new Error(`Order save failed: ${orderError.message}`);

    // Save order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));
    await supabase.from("order_items").insert(orderItems);

    // Trigger SMS (fire and forget)
    try {
      await supabase.functions.invoke("send-sms", {
        body: {
          phone: customer.phone,
          name: customer.name,
          orderId: order.id,
        },
      });
    } catch (e) {
      console.error("SMS failed:", e);
    }

    // Trigger shipment creation (fire and forget)
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

    return new Response(JSON.stringify({ orderId: order.id, status: "confirmed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("verify-payment error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
