# Solura Cosmetics — Luxury Cosmetics Website

## Design Direction

Minimal, luxury aesthetic inspired by Nykaa and Sugar Cosmetics — clean white backgrounds, elegant typography, generous whitespace, soft warm tones (beige/cream accents from the existing brand), and smooth animations.

## Brand Colors

- Primary: chose the best combo
- Background: Warm cream (#fcfbf8) / white
- Accent: Gold/champagne highlights
- Text: chose the best combo

---

## Pages & Features

### 1. Homepage

- Sticky minimal navbar (Logo, Shop, Blog, About, Cart icon with count)
- Hero section with rotating text ("Shampoo / Face Wash / Face Cream") and CTA
- Product highlights carousel (3 products with images from soluracosmo.com)
- Brand values section (Chemical-free, Daily use, Natural glow)
- Testimonials slider (Lakshmi, Shaik Asfaq, Sasi Prabha)
- About section with brand story
- Footer with social links, contact info, policies

### 2. Shop Page

- Grid of 3 products with images, prices, discount badges
- Quick "Add to Cart" button with popup toast notification
- Product cards showing original/sale price

### 3. Product Detail Page

- Image gallery with thumbnails
- Product name, price (with discount), description, specifications
- Quantity selector + Add to Cart button (triggers toast: "Added to cart!")
- Product details tabs (Description, Reviews)

### 4. Cart (Slide-out Drawer)

- Cart items with quantity controls, remove button
- Price summary (subtotal, discount, total)
- "Proceed to Checkout" button

### 5. Checkout Page

- Customer info form: Name, Email, Phone, Address (all fields needed for Shiprocket)
- Order summary sidebar
- Razorpay payment button (test key: `rzp_test_SaCviik1qz5ZZp`)
- On payment success:
  - Toast popup: "Payment successful! Your order has been placed."
  - SMS via Twilio: Order confirmation with tracking ID
  - Order saved to Supabase with status "confirmed"

### 6. Order Confirmation Page

- Order ID, tracking ID, payment status
- Estimated delivery info
- "Continue Shopping" button

### 7. Blog Page

- Blog listing with featured image, title, excerpt, date
- Individual blog post page with rich content
- SEO-friendly with meta tags, clean URLs
- Sample blog posts about skincare/haircare tips

### 8. About Us Page

- Brand story (from existing content — startup pitch competition origin)
- Mission & values

---

## Products Data (hardcoded initially, then Supabase)


| Product                   | Original Price | Sale Price | Discount |
| ------------------------- | -------------- | ---------- | -------- |
| Solura Bright-X Face Wash | ₹249           | ₹200       | 20% off  |
| Solura Glow'e Night Cream | ₹699           | ₹455       | 35% off  |
| Solura Hibiglow Shampoo   | ₹425           | ₹425       | —        |


## Backend (Supabase via Lovable Cloud)

### Database Tables

- **products** — id, name, slug, description, price, sale_price, images, category, specs
- **orders** — id, customer_name, email, phone, address, city, state, pincode, total, payment_id, razorpay_order_id, status, tracking_id, created_at
- **order_items** — id, order_id, product_id, quantity, price
- **blog_posts** — id, title, slug, excerpt, content, featured_image, published_at, author

### Edge Functions

1. **create-razorpay-order** — Creates Razorpay order on the server side
2. **verify-payment** — Verifies Razorpay payment signature, saves order to DB
3. **send-sms** — Sends order confirmation SMS via Twilio connector gateway
4. **create-shipment** — Creates shipment on Shiprocket, returns tracking ID

## Integrations

- **Razorpay** (test mode) — Payment gateway
- **Twilio** (connector) — SMS notifications
- **Shiprocket** — Delivery tracking & shipment creation

## Flow: Add to Cart → Payment

1. User browses products → clicks "Add to Cart" → **toast: "Item added to cart! 🛒"**
2. Opens cart drawer → adjusts quantities → clicks "Checkout"
3. Fills shipping details (name, phone, address, pincode)
4. Clicks "Pay Now" → Razorpay checkout opens
5. Payment success → **toast: "Payment received! Order confirmed ✅"**
6. Order saved to Supabase → Shiprocket shipment created → tracking ID generated
7. **SMS sent**: "Hi {name}, your Solura order #{id} is confirmed! Track: {tracking_id}"
8. Redirected to order confirmation page with all details