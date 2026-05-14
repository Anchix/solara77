import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminBlog from "@/components/admin/AdminBlog";
import AdminCoupons from "@/components/admin/AdminCoupons";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminPaymentAttempts from "@/components/admin/AdminPaymentAttempts";
import AdminSEO from "@/components/admin/AdminSEO";
import { LogOut, LayoutDashboard, Package, ShoppingBag, FileText, Globe, Tag, Settings, CreditCard, Search } from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: Package },
  { id: "payments", label: "Payment Attempts", icon: CreditCard },
  { id: "products", label: "Products", icon: ShoppingBag },
  { id: "coupons", label: "Coupons", icon: Tag },
  { id: "blog", label: "Blog", icon: FileText },
  { id: "seo", label: "SEO Audit", icon: Search },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

type PageId = (typeof navItems)[number]["id"];

const Admin = () => {
  const { initialize, isAuthenticated, isLoading, logout } = useAdminAuth();
  const [activePage, setActivePage] = useState<PageId>("dashboard");

  useEffect(() => {
    void initialize();
  }, [initialize]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Checking admin access...</div>;
  }

  if (!isAuthenticated) return <AdminLogin />;

  const activeLabel = navItems.find((n) => n.id === activePage)?.label ?? "";

  return (
    <div className="flex min-h-screen bg-secondary/60">
      <aside className="w-60 bg-foreground fixed top-0 left-0 h-screen flex flex-col z-50">
        <div className="px-6 pt-6 pb-5 border-b border-white/10">
          <h2 className="font-display text-[22px] text-primary-foreground tracking-wide">
            Sol<span className="text-accent italic">u</span>ra
          </h2>
          <p className="text-[10px] text-primary-foreground/30 tracking-[0.12em] mt-1 uppercase">Admin Dashboard</p>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          <p className="text-[9px] tracking-[0.18em] uppercase text-primary-foreground/25 px-6 pb-2 pt-4">Main</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button key={item.id} onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 text-[13px] transition-all border-l-[3px] ${isActive ? "text-white bg-white/[0.06] border-l-accent" : "text-primary-foreground/60 border-l-transparent hover:text-white hover:bg-white/[0.04]"}`}>
                <Icon className="h-4 w-4" />{item.label}
              </button>
            );
          })}
          <p className="text-[9px] tracking-[0.18em] uppercase text-primary-foreground/25 px-6 pb-2 pt-6">Settings</p>
          <a href="/" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 px-6 py-3 text-[13px] text-primary-foreground/60 border-l-[3px] border-l-transparent hover:text-white hover:bg-white/[0.04] transition-all">
            <Globe className="h-4 w-4" />View Website
          </a>
          <button onClick={() => void logout()} className="w-full flex items-center gap-3 px-6 py-3 text-[13px] text-primary-foreground/60 border-l-[3px] border-l-transparent hover:text-white hover:bg-white/[0.04] transition-all">
            <LogOut className="h-4 w-4" />Logout
          </button>
        </nav>
        <div className="px-6 py-4 border-t border-white/10 text-[11px] text-primary-foreground/30">Solura Admin</div>
      </aside>
      <main className="ml-60 flex-1 flex flex-col min-h-screen">
        <div className="sticky top-0 z-40 bg-card border-b border-border px-8 h-[60px] flex items-center justify-between">
          <h1 className="text-base font-medium">{activeLabel}</h1>
          <span className="text-xs text-muted-foreground">Today: <strong>{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong></span>
        </div>
        <div className="p-7 flex-1">
          {activePage === "dashboard" && <AdminDashboard />}
          {activePage === "orders" && <AdminOrders />}
          {activePage === "payments" && <AdminPaymentAttempts />}
          {activePage === "products" && <AdminProducts />}
          {activePage === "coupons" && <AdminCoupons />}
          {activePage === "blog" && <AdminBlog />}
          {activePage === "seo" && <AdminSEO />}
          {activePage === "settings" && <AdminSettings />}
        </div>
      </main>
    </div>
  );
};

export default Admin;
