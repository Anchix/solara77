import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Gift, Ticket, CheckCircle2, Percent } from "lucide-react";

interface Spin {
  id: string;
  prize_label: string;
  discount_value: number;
  code: string | null;
  created_at: string;
}

const AdminSpinWheel = () => {
  const [spins, setSpins] = useState<Spin[]>([]);
  const [redeemed, setRedeemed] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: spinRows } = await supabase
        .from("spin_wheel_spins")
        .select("*")
        .order("created_at", { ascending: false });

      const list = (spinRows ?? []) as Spin[];
      setSpins(list);

      const codes = list.map((s) => s.code).filter(Boolean) as string[];
      if (codes.length) {
        const { data: coupons } = await supabase
          .from("coupons")
          .select("code, used_count")
          .in("code", codes);
        const map: Record<string, number> = {};
        (coupons ?? []).forEach((c: any) => { map[c.code] = c.used_count ?? 0; });
        setRedeemed(map);
      }
      setLoading(false);
    };
    void load();
  }, []);

  const totalSpins = spins.length;
  const codesGenerated = spins.filter((s) => s.code).length;
  const codesUsed = spins.filter((s) => s.code && (redeemed[s.code] ?? 0) > 0).length;
  const conversion = codesGenerated ? Math.round((codesUsed / codesGenerated) * 100) : 0;

  const breakdown = spins.reduce<Record<string, number>>((acc, s) => {
    acc[s.prize_label] = (acc[s.prize_label] ?? 0) + 1;
    return acc;
  }, {});

  const cards = [
    { label: "Total Spins", value: totalSpins, icon: Gift },
    { label: "Codes Generated", value: codesGenerated, icon: Ticket },
    { label: "Codes Redeemed", value: codesUsed, icon: CheckCircle2 },
    { label: "Redemption Rate", value: `${conversion}%`, icon: Percent },
  ];

  if (loading) return <p className="text-sm text-muted-foreground">Loading spin analytics...</p>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-light">Spin Wheel Performance</h2>
        <p className="text-sm text-muted-foreground">Spins, codes generated and how many were redeemed.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <c.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-semibold mt-2">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-medium mb-3">Prize Breakdown</h3>
        {Object.keys(breakdown).length === 0 ? (
          <p className="text-sm text-muted-foreground">No spins yet.</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(breakdown).map(([label, count]) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs w-40 shrink-0">{label}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${(count / totalSpins) * 100}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Prize</th>
              <th className="text-left p-3">Code</th>
              <th className="text-left p-3">Redeemed</th>
            </tr>
          </thead>
          <tbody>
            {spins.slice(0, 100).map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="p-3 whitespace-nowrap">{new Date(s.created_at).toLocaleString("en-IN")}</td>
                <td className="p-3">{s.prize_label}</td>
                <td className="p-3 font-mono text-xs">{s.code ?? "—"}</td>
                <td className="p-3">
                  {s.code ? ((redeemed[s.code] ?? 0) > 0 ? "Yes" : "No") : "—"}
                </td>
              </tr>
            ))}
            {spins.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No spins recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSpinWheel;
