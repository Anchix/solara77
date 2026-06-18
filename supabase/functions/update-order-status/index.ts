import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const statusMessages: Record<string, string> = {
  confirmed: "Your Solura order #{orderId} has been confirmed! We're preparing it for shipment. 💚",
  shipped: "Great news! Your Solura order #{orderId} has been shipped! Track it here: {trackingId}. 📦",
  delivered: "Your Solura order #{orderId} has been delivered! We hope you love it. Thank you for choosing Solura! ✨",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return new Response(JSON.stringify({ error: "orderId and status are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return new Response(JSON.stringify({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update order status
    const { data: order, error: updateError } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select()
      .single();

    if (updateError) throw new Error(`Failed to update order: ${updateError.message}`);

    // Send SMS notification if we have a message template for this status
    const template = statusMessages[status];
    if (template && order.phone) {
      const message = template
        .replace("{orderId}", orderId.slice(0, 8))
        .replace("{trackingId}", order.tracking_id || "check your email");

      try {
        await supabase.functions.invoke("send-sms", {
          body: {
            phone: order.phone,
            name: order.customer_name,
            orderId: orderId,
            customMessage: message,
          },
        });
      } catch (e) {
        console.error("SMS notification failed:", e);
      }
    }

    return new Response(JSON.stringify({ success: true, order }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("update-order-status error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
