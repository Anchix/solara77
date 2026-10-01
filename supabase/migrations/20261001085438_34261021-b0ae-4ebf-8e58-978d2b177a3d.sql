ALTER TABLE public.payment_attempts ADD COLUMN IF NOT EXISTS order_payload jsonb;
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);