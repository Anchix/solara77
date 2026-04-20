import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { IndianRupee, Package, ShoppingCart, Clock } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    confirmed: 0,
    pending: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: prods } = await supabase.from("products").select("*");

      if (orders) {
        const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
        const confirmed = orders.filter((o) => o.status === "confirmed").length;
        const pending = orders.filter((o) => o.status === "pending").length;
        setStats({
          totalOrders: orders.length,
          totalRevenue,
          confirmed,
          pending,
        });
        setRecentOrders(orders.slice(0, 5));

        // Build last 7 days chart
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const last7 = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return {
            day: days[d.getDay()],
            revenue: orders
              .filter(
                (o) =>
                  new Date(o.created_at).toDateString() === d.toDateString()
              )
              .reduce((s, o) => s + Number(o.total), 0),
          };
        });
        setChartData(last7);
      }

      if (prods) setProducts(prods);
    };
    fetch();
  }, []);

  const statCards = [
    {
      label: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`,
      sub: "All time",
      icon: IndianRupee,
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      sub: "All orders",
      icon: ShoppingCart,
    },
    {
      label: "Confirmed",
      value: stats.confirmed,
      sub: "Completed orders",
      icon: Package,
    },
    {
      label: "Pending",
      value: stats.pending,
      sub: "Needs attention",
      icon: Clock,
      highlight: true,
    },
  ];

  const statusPill = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-accent/20 text-accent-foreground",
      confirmed: "bg-primary/10 text-primary",
      shipped: "bg-yellow-100 text-yellow-800",
      delivered: "bg-primary/10 text-primary",
    };
    return map[status] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-7">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="bg-card border border-border p-5"
            >
              <p className="text-[11px] tracking-[0.1em] uppercase text-muted-foreground mb-2">
                {c.label}
              </p>
              <p
                className={`text-[28px] font-semibold mb-1 ${
                  c.highlight ? "text-accent" : "text-foreground"
                }`}
              >
                {c.value}
              </p>
              <p className="text-xs text-primary">{c.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Chart + Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">
        {/* Revenue Chart */}
        <div className="bg-card border border-border">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-[13px] font-medium">Revenue — Last 7 Days</p>
          </div>
          <div className="p-5">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 4,
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="hsl(var(--accent))"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Product List / Stock */}
        <div className="bg-card border border-border">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-[13px] font-medium">Products Overview</p>
          </div>
          <div className="p-5 space-y-0">
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground">No products</p>
            ) : (
              products.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center py-[10px] border-b border-border last:border-0 text-[13px]"
                >
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {p.category || "Uncategorized"}
                    </p>
                  </div>
                  <p className="font-semibold">
                    ₹{Number(p.sale_price || p.price).toLocaleString("en-IN")}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border">
        <div className="px-5 py-4 border-b border-border flex justify-between items-center">
          <p className="text-[13px] font-medium">Recent Orders</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {["Order ID", "Customer", "Total", "Payment", "Status", "Date"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left text-[10px] tracking-[0.12em] uppercase text-muted-foreground font-medium px-5 py-2 border-b border-border"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-4 text-sm text-muted-foreground"
                  >
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-border/30 last:border-0 hover:bg-secondary/50"
                  >
                    <td className="px-5 py-3 font-mono text-xs font-semibold">
                      {o.order_number || o.id.slice(0, 8)}
                    </td>
                    <td className="px-5 py-3">{o.customer_name}</td>
                    <td className="px-5 py-3 font-semibold">
                      ₹{Number(o.total).toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3 uppercase text-xs">
                      {o.payment_id ? "PAID" : "COD"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-[10px] px-[10px] py-[3px] rounded-full font-medium tracking-[0.06em] ${statusPill(
                          o.status
                        )}`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">
                      {new Date(o.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
