import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderId, customer, items, total, paymentMethod } = await req.json();
    const isCOD = paymentMethod === "cod" || paymentMethod === "COD";

    const SHIPROCKET_EMAIL = Deno.env.get("SHIPROCKET_EMAIL");
    const SHIPROCKET_PASSWORD = Deno.env.get("SHIPROCKET_PASSWORD");
    if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
      throw new Error("Shiprocket credentials not configured");
    }

    // 1. Authenticate with Shiprocket
    const authResponse = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: SHIPROCKET_EMAIL, password: SHIPROCKET_PASSWORD }),
    });
    const authData = await authResponse.json();
    if (!authResponse.ok || !authData.token) {
      throw new Error(`Shiprocket auth failed: ${JSON.stringify(authData)}`);
    }
    const token = authData.token;

    // 2. Create order on Shiprocket
    const orderPayload = {
      order_id: orderId,
      order_date: new Date().toISOString().split("T")[0],
      pickup_location: "Primary",
      billing_customer_name: customer.name,
      billing_last_name: "",
      billing_address: customer.address,
      billing_city: customer.city,
      billing_pincode: customer.pincode,
      billing_state: customer.state,
      billing_country: "India",
      billing_email: customer.email,
      billing_phone: customer.phone.replace("+91", ""),
      shipping_is_billing: true,
      order_items: items.map((item: any) => ({
        name: item.name,
        sku: item.product_id,
        units: item.quantity,
        selling_price: item.price,
      })),
      payment_method: "Prepaid",
      sub_total: total,
      length: 20,
      breadth: 15,
      height: 10,
      weight: 0.5,
    };

    const shipResponse = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderPayload),
    });
    const shipData = await shipResponse.json();

    // 3. Update order with tracking info
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const trackingId = shipData.shipment_id || shipData.order_id || `SR-${orderId.slice(0, 8)}`;

    await supabase
      .from("orders")
      .update({ tracking_id: String(trackingId) })
      .eq("id", orderId);

    // Fetch order_number for SMS
    const { data: orderRow } = await supabase
      .from("orders")
      .select("order_number")
      .eq("id", orderId)
      .maybeSingle();
    const displayOrderId = orderRow?.order_number || orderId;

    // 4. Send SMS with tracking ID
    try {
      await supabase.functions.invoke("send-sms", {
        body: {
          phone: customer.phone,
          name: customer.name,
          orderId: displayOrderId,
          trackingId: String(trackingId),
        },
      });
    } catch (e) {
      console.error("SMS with tracking failed:", e);
    }

    return new Response(JSON.stringify({ success: true, trackingId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("create-shipment error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
