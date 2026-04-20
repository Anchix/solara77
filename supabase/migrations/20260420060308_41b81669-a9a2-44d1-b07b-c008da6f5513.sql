
-- Sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS public.orders_number_seq START 1;

-- Add order_number column
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number text UNIQUE;

-- Backfill existing orders ordered by created_at
DO $$
DECLARE
  r RECORD;
  n INT := 1;
BEGIN
  FOR r IN SELECT id FROM public.orders WHERE order_number IS NULL ORDER BY created_at ASC LOOP
    UPDATE public.orders SET order_number = 'SOLURA' || n WHERE id = r.id;
    n := n + 1;
  END LOOP;
  -- Set sequence to continue from next value
  PERFORM setval('public.orders_number_seq', GREATEST(n - 1, 1));
END $$;

-- Trigger function to assign order_number on insert
CREATE OR REPLACE FUNCTION public.assign_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'SOLURA' || nextval('public.orders_number_seq');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_order_number ON public.orders;
CREATE TRIGGER set_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.assign_order_number();
