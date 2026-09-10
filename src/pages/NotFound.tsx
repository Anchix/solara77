import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { applySeo, setRobots } from "@/lib/seo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    applySeo({
      title: "Page Not Found — Solura Cosmetics",
      description: "This page does not exist. Explore Solura's herbal skincare and haircare collection instead.",
      path: location.pathname,
      noindex: true,
    });
    return () => setRobots("index, follow");
  }, [location.pathname]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background">
      <div className="text-center px-6">
        <h1 className="mb-4 font-display text-4xl font-light">Page not found</h1>
        <p className="mb-6 text-muted-foreground">
          The page you were looking for doesn’t exist or has moved.
        </p>
        <nav className="flex flex-wrap justify-center gap-4 text-sm">
          <Link to="/" className="text-primary underline underline-offset-4">Home</Link>
          <Link to="/shop" className="text-primary underline underline-offset-4">Shop all products</Link>
          <Link to="/blog" className="text-primary underline underline-offset-4">Solura Journal</Link>
          <Link to="/about" className="text-primary underline underline-offset-4">About Solura</Link>
        </nav>
      </div>
    </div>
  );
};

export default NotFound;
