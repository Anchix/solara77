import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tag, Gift } from "lucide-react";
import { computeBogo } from "@/lib/bogo";
import { trackDiscountApplied, trackPurchase } from "@/lib/analytics";


declare global {
  interface Window { Razorpay: any; }
}


const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [codEnabled, setCodEnabled] = useState(true);
  const [prepaidShipping, setPrepaidShipping] = useState<number>(50);
  const [codShipping, setCodShipping] = useState<number>(75);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(999);
  const [freePrepaid, setFreePrepaid] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "" });

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("key,value")
      .in("key", ["cod_enabled", "shipping_prepaid", "shipping_cod", "free_shipping_threshold", "free_prepaid_shipping"])
      .then(({ data }) => {
        if (!data) return;
        for (const row of data) {
          const v: any = row.value;
          if (row.key === "cod_enabled") {
            const enabled = v === true || v === "true";
            setCodEnabled(enabled);
            if (!enabled) setPaymentMethod("online");
          }
          if (row.key === "shipping_prepaid") setPrepaidShipping(Number(v) || 0);
          if (row.key === "shipping_cod") setCodShipping(Number(v) || 0);
          if (row.key === "free_shipping_threshold") setFreeShippingThreshold(Number(v) || 0);
          if (row.key === "free_prepaid_shipping") setFreePrepaid(v === true || v === "true");
        }
      });
  }, []);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phone" || name === "pincode") {
      setForm((f) => ({ ...f, [name]: value.replace(/\D/g, "") }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  useEffect(() => {
    const fetchPincode = async () => {
      if (form.pincode.length !== 6) return;
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${form.pincode}`);
        const data = await res.json();
        if (data?.[0]?.Status === "Success" && data[0].PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          setForm((f) => ({ ...f, state: po.State || f.state, city: po.District || f.city }));
        }
      } catch { /* ignore */ }
    };
    fetchPincode();
  }, [form.pincode]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (error || !data) { toast.error("Invalid coupon code"); setCouponLoading(false); return; }
      if (data.expires_at && new Date(data.expires_at) < new Date()) { toast.error("Coupon has expired"); setCouponLoading(false); return; }
      if (data.max_uses && data.used_count >= data.max_uses) { toast.error("Coupon usage limit reached"); setCouponLoading(false); return; }
      if (totalPrice < (data.min_order_amount || 0)) { toast.error(`Minimum order ₹${data.min_order_amount} required`); setCouponLoading(false); return; }

      let discount = 0;
      if (data.discount_type === "percentage") {
        discount = Math.round(totalPrice * data.discount_value / 100);
      } else {
        discount = data.discount_value;
      }
      discount = Math.min(discount, totalPrice);

      setCouponApplied({ code: data.code, discount });
      toast.success(`Coupon applied! You save ₹${discount}`);
      trackDiscountApplied({ discount_type: "coupon", code: data.code, value: discount });


      // Increment used_count via secure function
      await supabase.rpc("increment_coupon_usage", { _coupon_id: data.id });
    } catch { toast.error("Failed to apply coupon"); }
    setCouponLoading(false);
  };

  const removeCoupon = () => {
    setCouponApplied(null);
    setCouponCode("");
  };

  const bogo = computeBogo(items);
  const discountAmount = couponApplied?.discount || 0;
  // Weekend gifts are added FREE on top of paid items — they never reduce the paid amount
  const afterDiscount = totalPrice - discountAmount;
  const baseShipping = paymentMethod === "cod" ? codShipping : prepaidShipping;
  const prepaidFreeApplies = freePrepaid && paymentMethod === "online";
  const shippingFee = prepaidFreeApplies || totalPrice >= freeShippingThreshold ? 0 : baseShipping;
  const finalTotal = Math.max(0, afterDiscount) + shippingFee;

  // Fire discount_applied once when BOGO savings kick in
  useEffect(() => {
    if (bogo.savings > 0) {
      trackDiscountApplied({ discount_type: "bogo", value: bogo.savings, code: "BOGO_JULY_2026" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bogo.savings]);

  const gaItems = () => items.map((i) => ({
    item_id: i.product.id,
    item_name: i.product.name,
    price: i.product.sale_price ?? i.product.price,
    quantity: i.quantity,
  }));


  const handlePay = async () => {
    if (!form.name || !form.email || !form.phone || !form.address || !form.city || !form.state || !form.pincode) {
      toast.error("Please fill in all fields"); return;
    }
    if (form.phone.length < 10) { toast.error("Enter a valid phone number"); return; }
    if (form.pincode.length !== 6) { toast.error("Enter a valid 6-digit pincode"); return; }
    if (items.length === 0) { toast.error("Cart is empty"); return; }
    if (finalTotal <= 0) { toast.error("Order total can't be ₹0. Please refresh your cart."); return; }

    if (paymentMethod === "cod") {
      setLoading(true);
      try {
        const { data: user } = await supabase.auth.getUser();
        const { data: orderData, error } = await supabase.from("orders").insert({
          customer_name: form.name, email: form.email, phone: form.phone,
          address: form.address, city: form.city, state: form.state, pincode: form.pincode,
          total: finalTotal, status: "pending", payment_id: "COD",
          user_id: user?.user?.id || null,
        }).select().single();

        if (error) throw error;

        await supabase.from("order_items").insert(
          items.map((i) => ({
            order_id: orderData.id, product_id: i.product.id, product_name: i.product.name,
            quantity: i.quantity, price: i.product.sale_price ?? i.product.price,
          })).concat(bogo.gifts.map((g) => ({
            order_id: orderData.id, product_id: g.productId, product_name: g.productName,
            quantity: g.quantity, price: 0,
          })))
        );

        toast.success("Order placed! Cash on Delivery ✅", { description: `Order #${orderData.order_number || orderData.id.slice(0, 8)}`, duration: 5000 });

        trackPurchase({
          transaction_id: orderData.order_number || orderData.id,
          value: finalTotal,
          shipping: shippingFee,
          coupon: couponApplied?.code,
          payment_method: "cod",
          items: gaItems(),
        });

        clearCart(); navigate(`/order-confirmation/${orderData.id}`);

      } catch (err: any) { toast.error("Order failed: " + err.message); }
      finally { setLoading(false); }
      return;
    }

    setLoading(true);
    try {
      const { data: orderData, error: orderError } = await supabase.functions.invoke("create-razorpay-order", {
        body: { amount: finalTotal * 100, currency: "INR" },
      });
      if (orderError || !orderData?.id) throw new Error(orderError?.message || "Failed to create order");

      const { data: authUser } = await supabase.auth.getUser();
      const customerPayload = { ...form, user_id: authUser?.user?.id || null };
      const itemsPayload = items.map((i) => ({
        product_id: i.product.id, name: i.product.name,
        quantity: i.quantity, price: i.product.sale_price ?? i.product.price,
      })).concat(bogo.gifts.map((g) => ({
        product_id: g.productId, name: g.productName, quantity: g.quantity, price: 0,
      })));

      // Log the payment attempt with full order details so a paid order can always be recovered
      try {
        await supabase.from("payment_attempts").insert({
          razorpay_order_id: orderData.id,
          status: "created",
          amount: finalTotal,
          customer_name: form.name,
          email: form.email,
          phone: form.phone,
          order_payload: { customer: customerPayload, items: itemsPayload, total: finalTotal },
        } as any);
      } catch (e) { console.error("Log attempt failed:", e); }

      const finishOrder = (orderId: string, orderNumber?: string) => {
        toast.success("Payment received! Order confirmed ✅", { description: `Order #${orderNumber || orderId}`, duration: 5000 });
        trackPurchase({
          transaction_id: orderNumber || orderId,
          value: finalTotal,
          shipping: shippingFee,
          coupon: couponApplied?.code,
          payment_method: "online",
          items: gaItems(),
        });
        clearCart(); navigate(`/order-confirmation/${orderId}`);
      };

      const options = {
        key: "rzp_live_ScznhZSQVoONHS",
        amount: finalTotal * 100, currency: "INR",
        name: "Solura Cosmetics",
        description: `Order of ${items.length} item(s)`,
        order_id: orderData.id,
        handler: async (response: any) => {
          // Retry verification up to 3 times; then fall back to server-side recovery
          let lastErr: any = null;
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-payment", {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  customer: customerPayload,
                  items: itemsPayload,
                  total: finalTotal,
                },
              });
              if (verifyError || !verifyData?.orderId) throw new Error(verifyError?.message || "Verification failed");
              finishOrder(verifyData.orderId, verifyData.orderNumber);
              return;
            } catch (err) {
              lastErr = err;
              await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
            }
          }
          try {
            const { data: rec } = await supabase.functions.invoke("reconcile-payments", {
              body: { razorpay_order_id: response.razorpay_order_id },
            });
            if (rec?.orderId) { finishOrder(rec.orderId, rec.orderNumber); return; }
          } catch {}
          try {
            await supabase.from("payment_attempts").update({
              razorpay_payment_id: response.razorpay_payment_id,
              error_message: lastErr?.message || "Verification failed",
            }).eq("razorpay_order_id", response.razorpay_order_id);
          } catch {}
          toast.error("Payment received — we're confirming your order. You'll get an SMS shortly; no need to pay again.", { duration: 10000 });
        },
        modal: {
          ondismiss: async () => {
            // User closed the popup → mark as cancelled
            try {
              await supabase.from("payment_attempts").update({
                status: "cancelled",
                error_message: "User dismissed payment popup",
              }).eq("razorpay_order_id", orderData.id);
            } catch {}
            toast.info("Payment cancelled");
          },
        },
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: "#7A6CF0" },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async (resp: any) => {
        try {
          await supabase.from("payment_attempts").update({
            status: "failed",
            error_message: resp?.error?.description || "Payment failed",
          }).eq("razorpay_order_id", orderData.id);
        } catch {}
      });
      rzp.open();
    } catch (err: any) { toast.error("Payment failed: " + err.message); }
    finally { setLoading(false); }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="font-display text-3xl">Your cart is empty</h1>
          <Button onClick={() => navigate("/shop")}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-5xl">
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3 space-y-6">
            <h2 className="font-display text-xl font-semibold">Shipping Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: "name", label: "Full Name", type: "text", full: true },
                { name: "email", label: "Email", type: "email" },
                { name: "phone", label: "Phone", type: "tel", maxLength: 10 },
                { name: "address", label: "Address", type: "text", full: true },
                { name: "pincode", label: "Pincode", type: "text", maxLength: 6 },
                { name: "city", label: "City", type: "text" },
                { name: "state", label: "State", type: "text" },
              ].map((f) => (
                <div key={f.name} className={(f as any).full ? "sm:col-span-2" : ""}>
                  <Label htmlFor={f.name}>{f.label}</Label>
                  <Input
                    id={f.name} name={f.name} type={f.type}
                    value={form[f.name as keyof typeof form]}
                    onChange={onChange} className="mt-1"
                    maxLength={(f as any).maxLength}
                    inputMode={f.name === "phone" || f.name === "pincode" ? "numeric" : undefined}
                    pattern={f.name === "phone" || f.name === "pincode" ? "[0-9]*" : undefined}
                  />
                </div>
              ))}
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <h2 className="font-display text-xl font-semibold">Payment Method</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod("online")}
                  className={`p-4 border rounded-lg text-left transition-all ${paymentMethod === "online" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                >
                  <p className="font-medium text-sm">Online Payment</p>
                  <p className="text-xs text-muted-foreground mt-1">UPI, Cards, Netbanking</p>
                </button>
                <button
                  onClick={() => codEnabled && setPaymentMethod("cod")}
                  disabled={!codEnabled}
                  className={`p-4 border rounded-lg text-left transition-all ${!codEnabled ? "opacity-40 cursor-not-allowed border-border" : paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                >
                  <p className="font-medium text-sm">Cash on Delivery</p>
                  <p className="text-xs text-muted-foreground mt-1">{codEnabled ? "Pay when delivered" : "Currently unavailable"}</p>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-secondary rounded-lg p-6 space-y-4 sticky top-24">
              <h2 className="font-display text-xl font-semibold">Order Summary</h2>
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.product.name} × {item.quantity}</span>
                  <span>₹{((item.product.sale_price ?? item.product.price) * item.quantity).toLocaleString("en-IN")}</span>
                </div>
              ))}

              {/* Coupon Section */}
              <div className="border-t border-border pt-3">
                {couponApplied ? (
                  <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Tag className="h-4 w-4 text-primary" />
                      <span className="font-medium">{couponApplied.code}</span>
                      <span className="text-primary">−₹{couponApplied.discount}</span>
                    </div>
                    <button onClick={removeCoupon} className="text-xs text-destructive hover:underline">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="uppercase text-sm"
                    />
                    <Button variant="outline" size="sm" onClick={applyCoupon} disabled={couponLoading}>
                      {couponLoading ? "..." : "Apply"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Coupon Discount</span>
                    <span>−₹{couponApplied.discount}</span>
                  </div>
                )}
                {bogo.savings > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span className="flex items-center gap-1"><Gift className="h-3.5 w-3.5" /> B1G1 ({bogo.freeUnits} free)</span>
                    <span>FREE (worth ₹{bogo.savings.toLocaleString("en-IN")})</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping {paymentMethod === "cod" ? "(COD)" : "(Prepaid)"}</span>
                  <span>{shippingFee === 0 ? <span className="text-primary font-medium">FREE</span> : `₹${shippingFee}`}</span>
                </div>
                {shippingFee > 0 && totalPrice < freeShippingThreshold && (
                  <p className="text-xs text-muted-foreground">
                    Add ₹{(freeShippingThreshold - totalPrice).toLocaleString("en-IN")} more for free shipping
                  </p>
                )}
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{finalTotal.toLocaleString("en-IN")}</span>
              </div>
              <Button className="w-full" size="lg" onClick={handlePay} disabled={loading}>
                {loading ? "Processing..." : paymentMethod === "cod" ? "Place Order (COD)" : "Pay Now"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                {paymentMethod === "online" ? "Secured by Razorpay" : "Pay when your order arrives"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
