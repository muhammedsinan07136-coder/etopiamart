# 🚀 EtopiaMart — Netlify Production Deployment Guide

This guide details how to deploy **EtopiaMart** to **Netlify** with continuous deployment from **GitHub** and **Supabase** backend.

---

## Architecture Overview

- **Frontend Hosting:** Netlify (Global CDN, Instant Cache Invalidation, Automatic SSL)
- **Repository:** GitHub (`main` branch)
- **Backend & Database:** Supabase (PostgreSQL with RLS)
- **Storage:** Supabase Storage (`product-images` bucket)
- **Auth:** Supabase Auth (Admin-only authentication)
- **Routing:** React Router v6 with Netlify Single Page Application (SPA) redirects (`_redirects` & `netlify.toml`)

---

## Step 1: Push Project to GitHub

Make sure all changes are committed and pushed to your GitHub repository:

```bash
git add .
git commit -m "feat: complete production ready setup for Netlify and Supabase"
git branch -M main
git push -u origin main
```

> ⚠️ **Security Check:** Confirm that `.env` is **NOT** committed. The repository includes `.gitignore` and `.env.example` templates.

---

## Step 2: Open Netlify

1. Go to **[netlify.com](https://www.netlify.com)**.
2. Sign in (or sign up) using your **GitHub account**.

---

## Step 3: Create New Site from Git

1. From the Netlify Team Overview dashboard, click **"Add new site"** button.
2. Select **"Import an existing project"**.

---

## Step 4: Select GitHub Repository

1. Choose **GitHub** as your Git provider.
2. Authorize Netlify if prompted.
3. Search for and select your repository: **`muhammedsinan07136-coder/etopiamart`** (or your repo name).

---

## Step 5: Configure Build Settings

Netlify will automatically detect configuration from `netlify.toml`, but verify these exact settings:

| Setting | Value |
|---------|-------|
| **Base directory** | *(leave blank / root)* |
| **Build command** | `npm run build` |
| **Publish directory** | `dist` |
| **Node Version** | `18` (or `20`) |

---

## Step 6: Add Environment Variables

Before clicking Deploy, click **"Add environment variables"** (or go to **Site configuration** → **Environment variables** after creating):

Add the following keys from your Supabase project:

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `VITE_SUPABASE_URL` | Supabase Project API URL | `https://abcdefghijkl.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anon Public Key | `eyJhbGciOiJIUzI1NiIsInR5...` |

> 💡 **Tip:** In Netlify, you can choose "Same value for all deploy contexts" (Production, Deploy Previews, Branch deploys).

---

## Step 7: Deploy the Site

1. Click **"Deploy etopiamart"**.
2. Netlify will clone the repository, run `npm install`, execute `npm run build`, and publish the `dist` directory.
3. The build log will show:
   ```text
   ✓ 2006 modules transformed.
   dist/index.html
   dist/assets/...
   Site deploy was successful!
   ```
4. Netlify will assign a live URL, for example: `https://etopiamart.netlify.app`.

---

## Step 8: Open Production URL & Optional Custom Domain

1. Click on the generated Netlify URL (e.g. `https://etopiamart.netlify.app`).
2. Optional custom domain:
   - Go to **Domain management** → **Add custom domain**.
   - Enter your domain (e.g. `www.etopiamart.com`).
   - Configure DNS records (CNAME or ALIAS) per Netlify instructions.
   - Netlify will automatically provision a free Let's Encrypt SSL certificate.

---

## Step 9: Production Acceptance Checklist

Test the complete flow on the live Netlify site:

### 🛍️ Customer Flow
- [ ] **Home Page:** Banner, categories, featured products, trust pillars load cleanly.
- [ ] **Shop Page:** Filtering by category, search by keyword, price sorting, availability filters.
- [ ] **Product Detail:** Image gallery thumbnails, zoom, stock badge, quantity counter.
- [ ] **Cart & Slide Drawer:** Add to cart, quantity change, delete item, cart persistence.
- [ ] **Checkout Page:** Indian phone (10 digits), 6-digit pincode, address validation. Payment mode: strictly **Cash on Delivery (COD)**, Delivery: **₹0 Free**.
- [ ] **Order Confirmation:** Order number generated (`ETP-2026-XXXXXX`), order details display.
- [ ] **Track Order:** Lookup by phone number or order number, live status timeline.
- [ ] **Direct Page Refresh (SPA Routing):** Refreshing `/shop`, `/track-order`, or `/checkout` does NOT return 404 (handled by `_redirects` and `netlify.toml`).

### 🔐 Admin Flow
- [ ] **Admin Route Guard:** Attempting to visit `/admin/dashboard` while logged out redirects to `/admin/login`.
- [ ] **Admin Login:** Log in with authorized credentials via Supabase Auth.
- [ ] **Dashboard:** KPI summary (Total revenue, orders count, product count).
- [ ] **Product CRUD:**
  - Add product with title, description, category, price, discount, stock.
  - Multi-image upload to Supabase storage `product-images` bucket.
  - Edit existing product details.
  - Delete product.
- [ ] **Order Management:**
  - View incoming customer COD orders with full addresses.
  - Change status: `Pending` → `Confirmed` → `Packed` → `Shipping` → `Out for Delivery` → `Delivered`.
  - Cancel order (verifies automated stock restoration).
- [ ] **Mobile & Tablet Responsiveness:** Header hamburger drawer, sticky nav, mobile search overlay, responsive checkout.
