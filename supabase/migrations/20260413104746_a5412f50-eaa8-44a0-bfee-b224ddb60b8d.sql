
-- Allow guest checkout: anyone can create orders
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow guest order tracking: need public SELECT but we'll filter in app
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;

-- Allow select by anyone (app will filter by email+phone or order ID)
CREATE POLICY "Anyone can view orders by identifier"
  ON public.orders FOR SELECT
  TO public
  USING (true);

-- Same for order_items
DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;
CREATE POLICY "Anyone can view order items"
  ON public.order_items FOR SELECT
  TO public
  USING (true);
