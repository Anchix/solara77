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

declare global {
  interface Window { Razorpay: any; }
}

const COD_FEE = 0;
const SHIPPING_FEE = 50;

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [codEnabled, setCodEnabled] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "" });

  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "cod_enabled").maybeSingle().then(({ data }) => {
      const enabled = data ? (data.value === true || (data.value as any) === "true") : true;
      setCodEnabled(enabled);
      if (!enabled) setPaymentMethod("online");
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
  const afterDiscount = totalPrice - bogo.totalDiscount - discountAmount;
  const finalTotal = Math.max(0, afterDiscount) + SHIPPING_FEE + (paymentMethod === "cod" ? COD_FEE : 0);

  const handlePay = async () => {
    if (!form.name || !form.email || !form.phone || !form.address || !form.city || !form.state || !form.pincode) {
      toast.error("Please fill in all fields"); return;
    }
    if (form.phone.length < 10) { toast.error("Enter a valid phone number"); return; }
    if (form.pincode.length !== 6) { toast.error("Enter a valid 6-digit pincode"); return; }
    if (items.length === 0) { toast.error("Cart is empty"); return; }

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
          }))
        );

        toast.success("Order placed! Cash on Delivery ✅", { description: `Order #${orderData.order_number || orderData.id.slice(0, 8)}`, duration: 5000 });

        // Trigger Shiprocket shipment for COD (fire-and-forget)
        try {
          await supabase.functions.invoke("create-shipment", {
            body: {
              orderId: orderData.id,
              customer: { ...form },
              items: items.map((i) => ({
                product_id: i.product.id, name: i.product.name,
                quantity: i.quantity, price: i.product.sale_price ?? i.product.price,
              })),
              total: finalTotal,
              paymentMethod: "cod",
            },
          });
        } catch (e) { console.error("COD shipment creation failed:", e); }

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

      // Log the payment attempt as "created"
      try {
        await supabase.from("payment_attempts").insert({
          razorpay_order_id: orderData.id,
          status: "created",
          amount: finalTotal,
          customer_name: form.name,
          email: form.email,
          phone: form.phone,
        });
      } catch (e) { console.error("Log attempt failed:", e); }

      const options = {
        key: "rzp_live_ScznhZSQVoONHS",
        amount: finalTotal * 100, currency: "INR",
        name: "Solura Cosmetics",
        description: `Order of ${items.length} item(s)`,
        order_id: orderData.id,
        handler: async (response: any) => {
          try {
            const { data: user } = await supabase.auth.getUser();
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-payment", {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                customer: { ...form, user_id: user?.user?.id || null },
                items: items.map((i) => ({
                  product_id: i.product.id, name: i.product.name,
                  quantity: i.quantity, price: i.product.sale_price ?? i.product.price,
                })),
                total: finalTotal,
              },
            });
            if (verifyError) throw new Error(verifyError.message);
            toast.success("Payment received! Order confirmed ✅", { description: `Order #${verifyData.orderNumber || verifyData.orderId}`, duration: 5000 });
            clearCart(); navigate(`/order-confirmation/${verifyData.orderId}`);
          } catch (err: any) {
            // Mark attempt as failed
            try {
              await supabase.from("payment_attempts").update({
                status: "failed",
                razorpay_payment_id: response.razorpay_payment_id,
                error_message: err.message,
              }).eq("razorpay_order_id", response.razorpay_order_id);
            } catch {}
            toast.error("Payment verification failed: " + err.message);
          }
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
                {bogo.totalDiscount > 0 && (
                  <div className="flex justify-between text-sm text-primary font-medium">
                    <span className="flex items-center gap-1"><Gift className="h-3 w-3" /> BOGO (Buy 1 Get 1)</span>
                    <span>−₹{bogo.totalDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {couponApplied && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Coupon Discount</span>
                    <span>−₹{couponApplied.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>₹{SHIPPING_FEE}</span>
                </div>
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
