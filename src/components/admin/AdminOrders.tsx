import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("orders").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setOrders(data);
    });
  }, []);

  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">All Orders</CardTitle></CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground">
                <th className="pb-2">ID</th><th className="pb-2">Customer</th><th className="pb-2">Phone</th><th className="pb-2">City</th><th className="pb-2">Total</th><th className="pb-2">Status</th><th className="pb-2">Tracking</th><th className="pb-2">Date</th>
              </tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="py-2 font-mono text-xs">{o.id.slice(0, 8)}</td>
                    <td className="py-2">{o.customer_name}</td>
                    <td className="py-2">{o.phone}</td>
                    <td className="py-2">{o.city}</td>
                    <td className="py-2">₹{Number(o.total).toLocaleString("en-IN")}</td>
                    <td className="py-2">
                      <Badge variant={o.status === "confirmed" ? "default" : "secondary"}>{o.status}</Badge>
                    </td>
                    <td className="py-2 text-xs">{o.tracking_id || "—"}</td>
                    <td className="py-2 text-muted-foreground text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
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
