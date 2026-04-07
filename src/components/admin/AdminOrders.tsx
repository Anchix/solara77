import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const statuses = ["pending", "confirmed", "shipped", "delivered"] as const;

const statusPill = (status: string) => {
  const map: Record<string, string> = {
    pending: "bg-accent/20 text-accent-foreground",
    confirmed: "bg-primary/10 text-primary",
    shipped: "bg-yellow-100 text-yellow-800",
    delivered: "bg-primary/10 text-primary",
    cancelled: "bg-destructive/10 text-destructive",
  };
  return map[status] || "bg-muted text-muted-foreground";
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  const fetchOrders = () => {
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setOrders(data);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const { error } = await supabase.functions.invoke("update-order-status", {
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

  const filtered = orders.filter((o) => {
    const matchStatus = !filterStatus || filterStatus === "all" || o.status === filterStatus;
    const matchSearch =
      !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="bg-card border border-border">
      {/* Filters */}
      <div className="px-5 py-4 border-b border-border flex gap-3 flex-wrap">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-border px-3 py-2 text-xs font-body bg-secondary outline-none focus:border-accent"
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </select>
        <Input
          placeholder="Search by Order ID or customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[260px] h-9 text-xs bg-secondary border-border"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {["Order ID", "Date", "Customer", "Phone", "Total", "Status", "Tracking", "Actions"].map(
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-4 text-sm text-muted-foreground">
                  No orders found
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-border/30 last:border-0 hover:bg-secondary/50"
                >
                  <td className="px-5 py-3 font-mono text-xs font-semibold">
                    {o.id.slice(0, 8)}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">
                    {new Date(o.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </td>
                  <td className="px-5 py-3">
                    {o.customer_name}
                    <div className="text-[11px] text-muted-foreground">{o.city}</div>
                  </td>
                  <td className="px-5 py-3 text-xs">{o.phone}</td>
                  <td className="px-5 py-3 font-semibold">
                    ₹{Number(o.total).toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-3">
                    {updatingId === o.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Select
                        value={o.status}
                        onValueChange={(val) => handleStatusChange(o.id, val)}
                      >
                        <SelectTrigger
                          className={`w-[120px] h-7 text-[10px] border tracking-[0.06em] font-medium rounded-full ${statusPill(
                            o.status
                          )}`}
                        >
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
                  </td>
                  <td className="px-5 py-3 text-xs">{o.tracking_id || "—"}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => {
                        const s = prompt(
                          `Update status for ${o.id.slice(0, 8)}:\n\nOptions: pending, confirmed, shipped, delivered`
                        );
                        if (s && statuses.includes(s as any)) {
                          handleStatusChange(o.id, s);
                        }
                      }}
                      className="text-[11px] px-3 py-1 border border-border bg-transparent hover:bg-foreground hover:text-primary-foreground transition-all font-body"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
