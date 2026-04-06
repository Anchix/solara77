import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window { Razorpay: any; }
}

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "" });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handlePay = async () => {
    if (!form.name || !form.email || !form.phone || !form.address || !form.city || !form.state || !form.pincode) {
      toast.error("Please fill in all fields"); return;
    }
    if (items.length === 0) { toast.error("Cart is empty"); return; }

    setLoading(true);
    try {
      const { data: orderData, error: orderError } = await supabase.functions.invoke("create-razorpay-order", {
        body: { amount: totalPrice * 100, currency: "INR" },
      });
      if (orderError || !orderData?.id) throw new Error(orderError?.message || "Failed to create order");

      const options = {
        key: "rzp_test_SaCviik1qz5ZZp",
        amount: totalPrice * 100,
        currency: "INR",
        name: "Solura Cosmetics",
        description: `Order of ${items.length} item(s)`,
        order_id: orderData.id,
        handler: async (response: any) => {
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-payment", {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                customer: form,
                items: items.map((i) => ({
                  product_id: i.product.id,
                  name: i.product.name,
                  quantity: i.quantity,
                  price: i.product.sale_price ?? i.product.price,
                })),
                total: totalPrice,
              },
            });
            if (verifyError) throw new Error(verifyError.message);
            toast.success("Payment received! Order confirmed ✅", { description: `Order #${verifyData.orderId}`, duration: 5000 });
            clearCart();
            navigate(`/order-confirmation/${verifyData.orderId}`);
          } catch (err: any) { toast.error("Payment verification failed: " + err.message); }
        },
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: "#2D5A3D" },
      };
      const rzp = new window.Razorpay(options);
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
                { name: "phone", label: "Phone", type: "tel" },
                { name: "address", label: "Address", type: "text", full: true },
                { name: "city", label: "City", type: "text" },
                { name: "state", label: "State", type: "text" },
                { name: "pincode", label: "Pincode", type: "text" },
              ].map((f) => (
                <div key={f.name} className={f.full ? "sm:col-span-2" : ""}>
                  <Label htmlFor={f.name}>{f.label}</Label>
                  <Input id={f.name} name={f.name} type={f.type} value={form[f.name as keyof typeof form]} onChange={onChange} className="mt-1" />
                </div>
              ))}
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
              <div className="border-t border-border pt-3 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
              <Button className="w-full" size="lg" onClick={handlePay} disabled={loading}>
                {loading ? "Processing..." : "Pay Now"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">Secured by Razorpay</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
