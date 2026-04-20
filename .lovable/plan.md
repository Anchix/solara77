
## Issues

**1. Missing orders after payment:** In `verify-payment`, if the Razorpay signature passes but a subsequent step fails (Razorpay API fetch, amount mismatch, DB insert), the customer is charged but no order is saved. Also, if `verify-payment` itself errors out or times out, the client-side handler shows "verification failed" but the money is already taken.

Root causes:
- `process.env.RAZORPAY_KEY_SECRET` is used (should be `Deno.env.get`) — this can throw immediately on Deno runtime, killing the function before insert.
- Order is only inserted AFTER signature + Razorpay API verification. If Razorpay API call fails transiently, the paid order is lost forever.
- No fallback insert on partial failure.

**2. Order ID format:** Currently UUIDs (`62ca598f-...`). User wants `SOLURA1`, `SOLURA2`, `SOLURA3`...

## Plan

### A. Fix missing orders (verify-payment edge function)
1. Replace `process.env.RAZORPAY_KEY_SECRET` with `Deno.env.get("RAZORPAY_KEY_SECRET")` (bug — Deno doesn't have `process.env` reliably).
2. Restructure flow: **Always insert the order to DB first** (with status `confirmed` and the verified payment_id) once the HMAC signature passes. Then do the Razorpay amount cross-check as a flag (`amount_verified` field or status note) — never lose a paid order.
3. Wrap each step in try/catch and log clearly; return success once order is saved even if SMS/shipment fail.
4. Add better error logging so future failures are debuggable from edge function logs.

### B. Human-readable order IDs (SOLURA1, SOLURA2…)
Add a new column `order_number` (text, unique) to `orders`, auto-populated as `SOLURA{n}` where n is a sequence.

Implementation:
1. **Migration:**
   - Create sequence `orders_number_seq` starting at 1.
   - Add column `order_number text unique`.
   - Add trigger `BEFORE INSERT ON orders` that sets `NEW.order_number = 'SOLURA' || nextval('orders_number_seq')` if null.
   - Backfill existing orders with sequential `SOLURA1, SOLURA2…` ordered by `created_at`.
2. **UI updates** — display `order_number` instead of `id.slice(0,8)`:
   - `src/components/admin/AdminOrders.tsx` (table + expanded view + CSV export)
   - `src/components/admin/AdminDashboard.tsx` (recent orders)
   - `src/pages/MyOrders.tsx` (customer order list)
   - `src/pages/OrderConfirmation.tsx` (success page — fetch the order_number using the orderId param)
   - `src/pages/Checkout.tsx` (toast messages — use returned order_number)
3. **Edge functions** that return order info (`verify-payment`, `send-sms`, `create-shipment`) — return/use `order_number` in messages so customers see `SOLURA42` in their SMS.

### Files to edit
- `supabase/functions/verify-payment/index.ts` — fix env var bug + reorder save-first flow
- New migration — add sequence, column, trigger, backfill
- `src/components/admin/AdminOrders.tsx`
- `src/components/admin/AdminDashboard.tsx`
- `src/pages/MyOrders.tsx`
- `src/pages/OrderConfirmation.tsx`
- `src/pages/Checkout.tsx`
- `supabase/functions/send-sms/index.ts` (use order_number in SMS body)

### Out of scope
- Changing the underlying UUID primary key (keep `id` as PK for FK integrity with `order_items`; `order_number` is a display alias).
