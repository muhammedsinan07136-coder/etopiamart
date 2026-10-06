# 🚀 EtopiaMart — Supabase Backend & Database Setup Guide

This guide walks you through setting up Supabase as the production backend for **EtopiaMart** with PostgreSQL database, Row-Level Security (RLS), image storage, and admin authentication.

---

## Step 1: Create a Free Supabase Project

1. Go to **[supabase.com](https://supabase.com)** and sign in or create an account.
2. Click **"New Project"**.
3. Choose an organization, enter project name: `etopiamart`.
4. Set a strong database password (save this securely).
5. Choose the closest region (e.g. `South Asia (Mumbai)` for India).
6. Click **"Create new project"** and wait 1–2 minutes for provisioning.

---

## Step 2: Open the SQL Editor

1. In the Supabase left navigation sidebar, click on **SQL Editor** (icon `>_`).
2. Click **"New query"**.

---

## Step 3: Run Database Schema

1. Open the file `supabase/schema.sql` from your project repository.
2. Copy the entire contents and paste into the Supabase SQL Editor.
3. Click **"Run"** (or press `Ctrl + Enter`).
4. Confirm success message: `"Success. No rows returned"`.

This creates:
- `categories` table with indexes
- `products` table with stock constraints & indexes
- `orders` table with status constraint & timestamps
- `order_items` table with foreign keys
- `order_status_history` table for tracking timeline
- `admin_users` table for role verification
- Auto-updating `updated_at` triggers
- `restore_stock_on_cancel()` trigger (auto restores inventory when order is cancelled)
- `create_order_secure()` RPC function (server-side price & stock verification)
- `get_customer_orders()` RPC function (privacy-protected tracking)
- Row Level Security (RLS) policies on all tables

*(Optional: Run `supabase/seed.sql` to populate default categories).*

---

## Step 4: Create Storage Bucket for Product Images

1. In the Supabase sidebar, click **Storage**.
2. Click **"New bucket"**.
3. Bucket name: **`product-images`** (exact match, lowercase).
4. Toggle **"Public bucket"** to **ON** (so product image URLs can be displayed to shoppers).
5. Leave other settings at default and click **"Save"**.

---

## Step 5: Configure Storage Policies

In **Storage** → click on **`product-images`** bucket → click **"Configuration"** or **"Policies"**:

Run this SQL query in the **SQL Editor** to configure storage access:

```sql
-- Allow public to view product images
CREATE POLICY "product_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated admin users to upload images
CREATE POLICY "product_images_admin_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated admin users to delete images
CREATE POLICY "product_images_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );
```

---

## Step 6: Configure Authentication

1. In the Supabase sidebar, click **Authentication** → **Providers**.
2. Make sure **Email** provider is **Enabled**.
3. Under **Authentication** → **URL Configuration**:
   - Site URL: Enter your Netlify URL (e.g. `https://your-site.netlify.app`) or `http://localhost:3000` for testing.
   - Redirect URLs: Add `https://your-site.netlify.app/admin/dashboard` and `http://localhost:3000/admin/dashboard`.
4. Under **Authentication** → **Email Templates**: Disable email confirmation if you want immediate admin access:
   - Go to **Auth Settings** → turn **OFF** "Confirm email" (optional, recommended for first admin setup).

---

## Step 7: Create Admin User

1. In the Supabase sidebar, click **Authentication** → **Users**.
2. Click **"Add user"** → **"Create user"**.
3. Email: `admin@etopiamart.com` (or your preferred admin email).
4. Password: Enter a secure password (e.g. at least 8 characters).
5. Toggle **"Auto Confirm User?"** to **ON**.
6. Click **"Create user"**.
7. Copy the generated **User UID** (UUID string like `a1b2c3d4-...`).

---

## Step 8: Configure Admin Role Permissions

Run this in the Supabase **SQL Editor** to register your user as an authorized admin (replace `'PASTE_USER_UID_HERE'` and email):

```sql
INSERT INTO public.admin_users (id, email, role)
VALUES (
  'PASTE_USER_UID_HERE', -- UUID from Authentication -> Users
  'admin@etopiamart.com',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

> 🔒 **Security Notice:** The app verifies the user's UID in the `admin_users` table before granting access to `/admin/*` and Supabase RLS enforces that only users in `admin_users` can mutate products, categories, and manage orders.

---

## Step 9 & 10: Copy Supabase API Keys

1. In Supabase sidebar, go to **Project Settings** (gear icon) → **API**.
2. Find and copy:
   - **Project URL** (e.g., `https://abcdefghijkl.supabase.co`)
   - **`anon` `public` Key** (starts with `eyJh...`)
   - ⚠️ **NEVER** expose the `service_role` secret key in the frontend!

---

## Step 11: Add Environment Variables

Create or update your local `.env` file (and later Netlify environment variables):

```env
VITE_SUPABASE_URL=https://abcdefghijkl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 12: Test Database Connection

1. Start your local dev server: `npm run dev`.
2. Open `http://localhost:3000/shop`.
3. Check browser DevTools console — there should be no database connection errors.

---

## Step 13: Test Admin Login & Authentication

1. Go to `http://localhost:3000/admin/login`.
2. Enter your admin email and password.
3. Click **"Sign In as Admin"**.
4. You should be securely redirected to `/admin/dashboard`.

---

## Step 14: Test Product Image Upload

1. From `/admin/products`, click **"Add New Product"**.
2. Fill product name, price, stock.
3. Upload product images via file picker.
4. Verify the images upload to Supabase `product-images` bucket and display in the form.
5. Click **"Save Product"**.
6. Verify the product appears in the store list.

---

## Step 15: Test Customer Order Creation (COD)

1. Open an incognito browser window (as a regular guest customer).
2. Go to `/` → Add a product to Cart.
3. Go to `/checkout`.
4. Enter Name, Phone, Address, Pincode, City, State.
5. Notice payment is strictly **Cash on Delivery (COD)** with **₹0 Free Delivery**.
6. Click **"Place Cash on Delivery Order"**.
7. Confirm order success page with `ETP-2026-XXXXXX` order number.
8. Go to `/track-order`, search by your 10-digit mobile number, and confirm order status shows **Pending**.
9. In admin panel (`/admin/orders`), verify the new order is present and test updating status to **Confirmed** → **Packed** → **Shipping** → **Delivered**.
