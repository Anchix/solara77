import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Download, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = async () => {
    const { data: ordersData } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersData) {
      setOrders(ordersData);
      // Fetch all order items
      const { data: items } = await supabase.from("order_items").select("*");
      if (items) {
        const grouped: Record<string, any[]> = {};
        items.forEach((item) => {
          if (!grouped[item.order_id]) grouped[item.order_id] = [];
          grouped[item.order_id].push(item);
        });
        setOrderItems(grouped);
      }
    }
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
      o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.email?.toLowerCase().includes(search.toLowerCase()) ||
      o.phone?.includes(search);
    return matchStatus && matchSearch;
  });

  const exportCSV = () => {
    const headers = [
      "Order Number", "Order ID", "Date", "Customer Name", "Email", "Phone",
      "Address", "City", "State", "Pincode",
      "Items", "Total (₹)", "Payment Mode", "Payment ID",
      "Razorpay Order ID", "Status", "Tracking ID",
    ];

    const rows = filtered.map((o) => {
      const items = orderItems[o.id] || [];
      const itemsSummary = items.map((i: any) => `${i.product_name} x${i.quantity}`).join("; ");
      const paymentMode = o.payment_id && o.payment_id !== "COD" ? "Online" : "COD";

      return [
        o.order_number || "",
        o.id,
        new Date(o.created_at).toLocaleString("en-IN"),
        o.customer_name,
        o.email,
        o.phone,
        `"${(o.address || "").replace(/"/g, '""')}"`,
        o.city,
        o.state,
        o.pincode,
        `"${itemsSummary}"`,
        Number(o.total).toFixed(2),
        paymentMode,
        o.payment_id || "",
        o.razorpay_order_id || "",
        o.status,
        o.tracking_id || "",
      ];
    });

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Orders exported to CSV");
  };

  return (
    <div className="bg-card border border-border">
      {/* Filters + Export */}
      <div className="px-5 py-4 border-b border-border flex gap-3 flex-wrap items-center justify-between">
        <div className="flex gap-3 flex-wrap">
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
            placeholder="Search by ID, name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[280px] h-9 text-xs bg-secondary border-border"
          />
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2 text-xs">
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {["", "Order ID", "Date", "Customer", "Email", "Phone", "Total", "Payment", "Status", "Tracking", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] tracking-[0.12em] uppercase text-muted-foreground font-medium px-4 py-2 border-b border-border"
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
                <td colSpan={11} className="px-5 py-4 text-sm text-muted-foreground">
                  No orders found
                </td>
              </tr>
            ) : (
              filtered.map((o) => {
                const isExpanded = expandedId === o.id;
                const items = orderItems[o.id] || [];
                const paymentMode = o.payment_id ? "Online" : "COD";

                return (
                  <>
                    <tr
                      key={o.id}
                      className="border-b border-border/30 last:border-0 hover:bg-secondary/50 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : o.id)}
                    >
                      <td className="px-4 py-3">
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-semibold">
                        {o.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(o.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3">{o.customer_name}</td>
                      <td className="px-4 py-3 text-xs">{o.email}</td>
                      <td className="px-4 py-3 text-xs">{o.phone}</td>
                      <td className="px-4 py-3 font-semibold">
                        ₹{Number(o.total).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-[2px] rounded-full font-medium tracking-wide ${
                          paymentMode === "Online"
                            ? "bg-primary/10 text-primary"
                            : "bg-accent/20 text-accent-foreground"
                        }`}>
                          {paymentMode}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        {updatingId === o.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                          <Select
                            value={o.status}
                            onValueChange={(val) => handleStatusChange(o.id, val)}
                          >
                            <SelectTrigger
                              className={`w-[120px] h-7 text-[10px] border tracking-[0.06em] font-medium rounded-full ${statusPill(o.status)}`}
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
                      <td className="px-4 py-3 text-xs">{o.tracking_id || "—"}</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
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

                    {/* Expanded Details */}
                    {isExpanded && (
                      <tr key={`${o.id}-detail`} className="border-b border-border/30 bg-secondary/30">
                        <td colSpan={11} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                            {/* Address */}
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
                                Shipping Address
                              </p>
                              <p>{o.customer_name}</p>
                              <p>{o.address}</p>
                              <p>{o.city}, {o.state} - {o.pincode}</p>
                              <p>{o.phone}</p>
                              <p>{o.email}</p>
                            </div>

                            {/* Payment Info */}
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
                                Payment Details
                              </p>
                              <p><span className="text-muted-foreground">Mode:</span> {paymentMode}</p>
                              {o.payment_id && (
                                <p><span className="text-muted-foreground">Payment ID:</span> {o.payment_id}</p>
                              )}
                              {o.razorpay_order_id && (
                                <p><span className="text-muted-foreground">Razorpay Order:</span> {o.razorpay_order_id}</p>
                              )}
                              <p><span className="text-muted-foreground">Status:</span>{" "}
                                <span className={o.payment_id ? "text-primary font-medium" : "text-accent-foreground font-medium"}>
                                  {o.payment_id ? "Paid" : "Pending (COD)"}
                                </span>
                              </p>
                            </div>

                            {/* Items */}
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
                                Order Items
                              </p>
                              {items.length === 0 ? (
                                <p className="text-muted-foreground">No items data</p>
                              ) : (
                                <div className="space-y-1">
                                  {items.map((item: any) => (
                                    <div key={item.id} className="flex justify-between">
                                      <span>{item.product_name} × {item.quantity}</span>
                                      <span className="font-medium">₹{Number(item.price * item.quantity).toLocaleString("en-IN")}</span>
                                    </div>
                                  ))}
                                  <div className="border-t border-border pt-1 mt-1 flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span>₹{Number(o.total).toLocaleString("en-IN")}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
