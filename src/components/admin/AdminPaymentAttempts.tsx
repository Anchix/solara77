import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

type Attempt = {
  id: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  status: string;
  amount: number;
  customer_name: string | null;
  email: string | null;
  phone: string | null;
  error_message: string | null;
  order_id: string | null;
  created_at: string;
};

const statusConfig: Record<string, { label: string; cls: string; Icon: any }> = {
  created: { label: "Initiated", cls: "bg-blue-100 text-blue-700", Icon: Clock },
  paid: { label: "Paid", cls: "bg-green-100 text-green-700", Icon: CheckCircle2 },
  failed: { label: "Failed", cls: "bg-red-100 text-red-700", Icon: AlertCircle },
  cancelled: { label: "Cancelled", cls: "bg-amber-100 text-amber-700", Icon: XCircle },
};

const AdminPaymentAttempts = () => {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("payment_attempts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (data) setAttempts(data as any);
      setLoading(false);
    };
    (async () => {
      await load();
      // Recover any payments that went through on Razorpay but never became orders
      try {
        const { data } = await supabase.functions.invoke("reconcile-payments", { body: {} });
        if (data?.recovered?.length || data?.needsDetails?.length) {
          toast.success(`Recovered ${data.recovered.length} paid order(s)`, {
            description: data.needsDetails?.length ? `${data.needsDetails.length} paid without address — check Notes` : undefined,
          });
          await load();
        }
      } catch {}
    })();
  }, []);

  const stats = {
    total: attempts.length,
    paid: attempts.filter((a) => a.status === "paid").length,
    cancelled: attempts.filter((a) => a.status === "cancelled").length,
    failed: attempts.filter((a) => a.status === "failed").length,
    created: attempts.filter((a) => a.status === "created").length,
  };
  const conversion = stats.total > 0 ? ((stats.paid / stats.total) * 100).toFixed(1) : "0";

  const filtered = filter === "all" ? attempts : attempts.filter((a) => a.status === filter);

  if (loading) return <div className="text-sm text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Attempts", value: stats.total, cls: "text-foreground" },
          { label: "Paid", value: stats.paid, cls: "text-green-600" },
          { label: "Cancelled", value: stats.cancelled, cls: "text-amber-600" },
          { label: "Failed", value: stats.failed, cls: "text-red-600" },
          { label: "Conversion", value: `${conversion}%`, cls: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-semibold mt-1 ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", "created", "paid", "cancelled", "failed"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filter === s ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:bg-secondary"
            }`}
          >
            {s === "all" ? "All" : statusConfig[s]?.label || s}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Razorpay Order</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No payment attempts yet
                  </td>
                </tr>
              ) : (
                filtered.map((a) => {
                  const cfg = statusConfig[a.status] || statusConfig.created;
                  const Icon = cfg.Icon;
                  return (
                    <tr key={a.id} className="border-t border-border hover:bg-secondary/40">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${cfg.cls}`}>
                          <Icon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{a.customer_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{a.email || ""}</p>
                      </td>
                      <td className="px-4 py-3 text-xs">{a.phone || "—"}</td>
                      <td className="px-4 py-3 font-semibold">₹{Number(a.amount).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">
                        {a.razorpay_order_id?.slice(-12) || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(a.created_at).toLocaleString("en-IN", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                        {a.error_message || (a.order_id ? "Order created ✓" : "")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentAttempts;
