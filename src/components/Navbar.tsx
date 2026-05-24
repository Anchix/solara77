import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const { totalItems, setIsOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const links = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/founder-story", label: "Our Story" },
    { to: "/blog", label: "Blog" },
    { to: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="font-display text-2xl md:text-3xl font-semibold tracking-wide text-primary">
          SOLURA
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors uppercase">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={() => navigate("/my-orders")}
              className="p-2 hover:bg-secondary rounded-full transition-colors"
              aria-label="My account"
            >
              <User className="h-5 w-5" />
            </button>
          ) : (
            <Link to="/auth" className="hidden md:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors uppercase">
              Login
            </Link>
          )}
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 hover:bg-secondary rounded-full transition-colors"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                {totalItems}
              </span>
            )}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2" aria-label="Toggle menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-border bg-background px-6 py-4 space-y-3">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="block text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground uppercase">
              {l.label}
            </Link>
          ))}
          {!user && (
            <Link to="/auth" onClick={() => setMobileOpen(false)} className="block text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground uppercase">
              Login
            </Link>
          )}
          {user && (
            <Link to="/my-orders" onClick={() => setMobileOpen(false)} className="block text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground uppercase">
              My Orders
            </Link>
          )}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
