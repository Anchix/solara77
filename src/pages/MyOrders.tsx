import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Package, RotateCcw, Search } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  customer_name: string;
  tracking_id: string | null;
  order_number: string | null;
  phone: string;
  email: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  product_id: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-accent/20 text-accent-foreground",
  confirmed: "bg-primary/10 text-primary",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-destructive/10 text-destructive",
};

const MyOrders = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const trimmed = phone.trim();
    if (!trimmed || trimmed.length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    setSearched(true);

    const { data: ordersData } = await supabase
      .from("orders")
      .select("*")
      .eq("phone", trimmed)
      .order("created_at", { ascending: false });

    if (ordersData && ordersData.length > 0) {
      setOrders(ordersData);
      const ids = ordersData.map((o) => o.id);
      const { data: items } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", ids);
      if (items) {
        const grouped: Record<string, OrderItem[]> = {};
        items.forEach((item) => {
          if (!grouped[item.order_id]) grouped[item.order_id] = [];
          grouped[item.order_id].push(item);
        });
        setOrderItems(grouped);
      }
    } else {
      setOrders([]);
      setOrderItems({});
    }
    setLoading(false);
  };

  const handleCancel = async (orderId: string) => {
    const { error } = await supabase.functions.invoke("update-order-status", {
      body: { orderId, status: "cancelled" },
    });
    if (error) { toast.error("Failed to cancel"); return; }
    toast.success("Order cancelled");
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o)));
  };

  const handleReorder = async (orderId: string) => {
    const items = orderItems[orderId];
    if (!items) return;
    for (const item of items) {
      const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("id", item.product_id)
        .maybeSingle();
      if (product) {
        const p = { ...product, specs: product.specs as Record<string, string> | null };
        for (let i = 0; i < item.quantity; i++) addToCart(p);
      }
    }
    toast.success("Items added to cart!");
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-4xl">
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-8">Track My Orders</h1>

        {/* Search by phone */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <p className="text-sm text-muted-foreground mb-3">Enter the phone number you used while placing the order</p>
          <div className="flex gap-3">
            <Input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="max-w-xs"
            />
            <Button onClick={handleSearch} disabled={loading} className="gap-2">
              <Search className="h-4 w-4" /> {loading ? "Searching..." : "Track Orders"}
            </Button>
          </div>
        </div>

        {searched && orders.length === 0 && !loading && (
          <div className="text-center py-20 space-y-4">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/30" />
            <h2 className="font-display text-2xl">No orders found</h2>
            <p className="text-muted-foreground">No orders found for this phone number</p>
            <Button asChild><Link to="/shop">Shop Now</Link></Button>
          </div>
        )}

        {orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-card border border-border rounded-lg p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Order #{order.order_number || order.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={statusColors[order.status] || "bg-muted"}>{order.status}</Badge>
                    <span className="font-semibold">₹{Number(order.total).toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {orderItems[order.id] && (
                  <div className="border-t border-border pt-3 space-y-1">
                    {orderItems[order.id].map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.product_name} × {item.quantity}</span>
                        <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                )}

                {order.tracking_id && (
                  <p className="text-xs text-muted-foreground mt-2">Tracking: {order.tracking_id}</p>
                )}

                <div className="flex gap-2 mt-3">
                  {order.status === "pending" && (
                    <Button variant="destructive" size="sm" onClick={() => handleCancel(order.id)}>Cancel Order</Button>
                  )}
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => handleReorder(order.id)}>
                    <RotateCcw className="h-3 w-3" /> Reorder
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
