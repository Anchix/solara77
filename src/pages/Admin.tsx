import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminBlog from "@/components/admin/AdminBlog";
import { LogOut, LayoutDashboard, Package, ShoppingBag, FileText, Globe } from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: Package },
  { id: "products", label: "Products", icon: ShoppingBag },
  { id: "blog", label: "Blog", icon: FileText },
] as const;

type PageId = (typeof navItems)[number]["id"];

const Admin = () => {
  const { isAuthenticated, logout } = useAdminAuth();
  const [activePage, setActivePage] = useState<PageId>("dashboard");

  if (!isAuthenticated) return <AdminLogin />;

  const activeLabel = navItems.find((n) => n.id === activePage)?.label ?? "";

  return (
    <div className="flex min-h-screen bg-secondary/60">
      {/* SIDEBAR */}
      <aside className="w-60 bg-foreground fixed top-0 left-0 h-screen flex flex-col z-50">
        {/* Logo */}
        <div className="px-6 pt-6 pb-5 border-b border-white/10">
          <h2 className="font-display text-[22px] text-primary-foreground tracking-wide">
            Sol<span className="text-accent italic">u</span>ra
          </h2>
          <p className="text-[10px] text-primary-foreground/30 tracking-[0.12em] mt-1 uppercase">
            Admin Dashboard
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <p className="text-[9px] tracking-[0.18em] uppercase text-primary-foreground/25 px-6 pb-2 pt-4">
            Main
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 text-[13px] transition-all border-l-[3px] ${
                  isActive
                    ? "text-white bg-white/[0.06] border-l-accent"
                    : "text-primary-foreground/60 border-l-transparent hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}

          <p className="text-[9px] tracking-[0.18em] uppercase text-primary-foreground/25 px-6 pb-2 pt-6">
            Settings
          </p>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-6 py-3 text-[13px] text-primary-foreground/60 border-l-[3px] border-l-transparent hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <Globe className="h-4 w-4" />
            View Website
          </a>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-6 py-3 text-[13px] text-primary-foreground/60 border-l-[3px] border-l-transparent hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </nav>

        <div className="px-6 py-4 border-t border-white/10 text-[11px] text-primary-foreground/30">
          Solura Admin
        </div>
      </aside>

      {/* MAIN */}
      <main className="ml-60 flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-card border-b border-border px-8 h-[60px] flex items-center justify-between">
          <h1 className="text-base font-medium">{activeLabel}</h1>
          <span className="text-xs text-muted-foreground">
            Today:{" "}
            <strong>
              {new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </strong>
          </span>
        </div>

        {/* Content */}
        <div className="p-7 flex-1">
          {activePage === "dashboard" && <AdminDashboard />}
          {activePage === "orders" && <AdminOrders />}
          {activePage === "products" && <AdminProducts />}
          {activePage === "blog" && <AdminBlog />}
        </div>
      </main>
    </div>
  );
};

export default Admin;
