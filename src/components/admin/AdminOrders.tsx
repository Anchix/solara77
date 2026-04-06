import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const statuses = ["pending", "confirmed", "shipped", "delivered"] as const;

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = () => {
    supabase.from("orders").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setOrders(data);
    });
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const { data, error } = await supabase.functions.invoke("update-order-status", {
        body: { orderId, status: newStatus },
      });

      if (error) throw new Error(error.message);

      toast.success(`Order updated to "${newStatus}"`, {
        description: "SMS notification sent to customer",
      });

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      toast.error("Failed to update status: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">All Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2">ID</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Phone</th>
                  <th className="pb-2">City</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Tracking</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="py-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                    <td className="py-3">{o.customer_name}</td>
                    <td className="py-3">{o.phone}</td>
                    <td className="py-3">{o.city}</td>
                    <td className="py-3">₹{Number(o.total).toLocaleString("en-IN")}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {updatingId === o.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                          <Select
                            value={o.status}
                            onValueChange={(val) => handleStatusChange(o.id, val)}
                          >
                            <SelectTrigger className={`w-[130px] h-8 text-xs border ${statusColors[o.status] || ""}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statuses.map((s) => (
                                <SelectItem key={s} value={s} className="text-xs capitalize">
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-xs">{o.tracking_id || "—"}</td>
                    <td className="py-3 text-muted-foreground text-xs">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminOrders;
