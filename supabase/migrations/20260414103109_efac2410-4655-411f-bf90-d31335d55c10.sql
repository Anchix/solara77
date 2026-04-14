
-- Add new columns to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS brand text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS product_type text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS net_quantity text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS skin_type text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS key_benefits text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS texture text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS usage_time text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS how_to_use text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS expected_result text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS storage_info text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS safety_info text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS package_type text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS country_of_origin text DEFAULT 'India';

-- Create coupons table
CREATE TABLE public.coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL DEFAULT 'percentage',
  discount_value numeric NOT NULL DEFAULT 0,
  min_order_amount numeric DEFAULT 0,
  max_uses integer DEFAULT NULL,
  used_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons" ON public.coupons
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert coupons" ON public.coupons
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update coupons" ON public.coupons
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete coupons" ON public.coupons
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
