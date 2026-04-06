import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminLogin from "@/components/admin/AdminLogin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import AdminBlog from "@/components/admin/AdminBlog";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminAnalytics from "@/components/admin/AdminAnalytics";

const Admin = () => {
  const { isAuthenticated, logout } = useAdminAuth();

  if (!isAuthenticated) return <AdminLogin />;

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-semibold">Admin Panel</h1>
          <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>

        <Tabs defaultValue="analytics">
          <TabsList className="mb-6">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics"><AdminAnalytics /></TabsContent>
          <TabsContent value="orders"><AdminOrders /></TabsContent>
          <TabsContent value="products"><AdminProducts /></TabsContent>
          <TabsContent value="blog"><AdminBlog /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
