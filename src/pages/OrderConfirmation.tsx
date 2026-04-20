import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    supabase
      .from("orders")
      .select("order_number")
      .eq("id", orderId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.order_number) setOrderNumber(data.order_number);
      });
  }, [orderId]);

  const display = orderNumber || (orderId ? orderId.slice(0, 8) : "");

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="container max-w-md text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="font-display text-3xl font-semibold">Order Confirmed!</h1>
        <p className="text-muted-foreground">
          Thank you for your purchase. Your order <span className="font-medium text-foreground">#{display}</span> has been placed successfully.
        </p>
        <p className="text-sm text-muted-foreground">
          You will receive an SMS with your tracking details shortly.
        </p>
        <Button asChild size="lg">
          <Link to="/shop">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
