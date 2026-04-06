import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, Package, ShoppingCart, TrendingUp } from "lucide-react";

const AdminAnalytics = () => {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, confirmed: 0, pending: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: orders } = await supabase.from("orders").select("*");
      if (!orders) return;

      const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
      const confirmed = orders.filter((o) => o.status === "confirmed").length;
      const pending = orders.filter((o) => o.status === "pending").length;

      setStats({ totalOrders: orders.length, totalRevenue, confirmed, pending });
      setRecentOrders(orders.slice(-5).reverse());
    };
    fetchStats();
  }, []);

  const cards = [
    { title: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "text-primary" },
    { title: "Revenue", value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-accent" },
    { title: "Confirmed", value: stats.confirmed, icon: TrendingUp, color: "text-green-600" },
    { title: "Pending", value: stats.pending, icon: Package, color: "text-yellow-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Recent Orders</CardTitle></CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2">Customer</th><th className="pb-2">Total</th><th className="pb-2">Status</th><th className="pb-2">Date</th>
                </tr></thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b last:border-0">
                      <td className="py-2">{o.customer_name}</td>
                      <td className="py-2">₹{Number(o.total).toLocaleString("en-IN")}</td>
                      <td className="py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${o.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-2 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
