-- ============================================================
-- EtopiaMart - Complete Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(active);

-- ============================================================
-- PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT DEFAULT '',
  description TEXT DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  original_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_percentage INTEGER DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  featured BOOLEAN DEFAULT false,
  bestseller BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_products_bestseller ON public.products(bestseller);

-- ============================================================
-- ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  house_name TEXT NOT NULL,
  building_name TEXT DEFAULT '',
  address TEXT NOT NULL,
  pincode TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'COD',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_charge NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pending'
    CHECK (status IN ('Pending','Confirmed','Packed','Shipping','Out for Delivery','Delivered','Cancelled')),
  notes TEXT DEFAULT '',
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ============================================================
-- ORDER ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  original_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  final_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- ============================================================
-- ORDER STATUS HISTORY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by TEXT DEFAULT 'admin'
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);

-- ============================================================
-- ADMIN ROLES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- ORDER STATUS HISTORY TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_status_history (order_id, previous_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_order_status_history
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.log_order_status_change();

-- ============================================================
-- STOCK RESTORE ON CANCELLATION FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.restore_stock_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Cancelled' AND OLD.status != 'Cancelled' THEN
    UPDATE public.products p
    SET stock = p.stock + oi.quantity
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id AND oi.product_id = p.id;
    
    NEW.cancelled_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_restore_stock_on_cancel
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.restore_stock_on_cancel();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- CATEGORIES POLICIES
-- ============================================================
-- Anyone can read active categories
CREATE POLICY "categories_public_read" ON public.categories
  FOR SELECT USING (active = true OR public.is_admin());

-- Only admins can manage categories
CREATE POLICY "categories_admin_insert" ON public.categories
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "categories_admin_update" ON public.categories
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "categories_admin_delete" ON public.categories
  FOR DELETE USING (public.is_admin());

-- ============================================================
-- PRODUCTS POLICIES
-- ============================================================
-- Anyone can read active products
CREATE POLICY "products_public_read" ON public.products
  FOR SELECT USING (active = true OR public.is_admin());

-- Only admins can manage products
CREATE POLICY "products_admin_insert" ON public.products
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "products_admin_update" ON public.products
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "products_admin_delete" ON public.products
  FOR DELETE USING (public.is_admin());

-- ============================================================
-- ORDERS POLICIES
-- ============================================================
-- Customers can create orders (anonymous)
CREATE POLICY "orders_public_insert" ON public.orders
  FOR INSERT WITH CHECK (true);

-- Customers can only read their own orders by phone/order_number (done via RPC)
-- Admins can read all orders
CREATE POLICY "orders_admin_read" ON public.orders
  FOR SELECT USING (public.is_admin());

-- Admins can update orders
CREATE POLICY "orders_admin_update" ON public.orders
  FOR UPDATE USING (public.is_admin());

-- ============================================================
-- ORDER ITEMS POLICIES
-- ============================================================
CREATE POLICY "order_items_public_insert" ON public.order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "order_items_admin_read" ON public.order_items
  FOR SELECT USING (public.is_admin());

-- ============================================================
-- ORDER STATUS HISTORY POLICIES
-- ============================================================
CREATE POLICY "order_status_history_admin_read" ON public.order_status_history
  FOR SELECT USING (public.is_admin());

CREATE POLICY "order_status_history_admin_insert" ON public.order_status_history
  FOR INSERT WITH CHECK (public.is_admin());

-- ============================================================
-- ADMIN USERS POLICIES
-- ============================================================
CREATE POLICY "admin_users_self_read" ON public.admin_users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "admin_users_admin_read" ON public.admin_users
  FOR SELECT USING (public.is_admin());

-- ============================================================
-- SECURE CUSTOMER ORDER LOOKUP (RPC)
-- Allows customers to look up their orders by phone or order number
-- without exposing all orders
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_customer_orders(
  p_query TEXT
)
RETURNS TABLE (
  id UUID,
  order_number TEXT,
  customer_name TEXT,
  phone TEXT,
  house_name TEXT,
  building_name TEXT,
  address TEXT,
  pincode TEXT,
  city TEXT,
  state TEXT,
  payment_method TEXT,
  subtotal NUMERIC,
  delivery_charge NUMERIC,
  total NUMERIC,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id, o.order_number, o.customer_name, o.phone,
    o.house_name, o.building_name, o.address, o.pincode,
    o.city, o.state, o.payment_method,
    o.subtotal, o.delivery_charge, o.total,
    o.status, o.created_at, o.updated_at
  FROM public.orders o
  WHERE 
    o.phone = p_query
    OR o.order_number ILIKE '%' || p_query || '%'
  ORDER BY o.created_at DESC
  LIMIT 20;
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.get_customer_orders(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_customer_orders(TEXT) TO authenticated;

-- ============================================================
-- SECURE ORDER CREATION (RPC)
-- Validates product prices server-side before creating order
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_order_secure(
  p_customer_name TEXT,
  p_phone TEXT,
  p_house_name TEXT,
  p_building_name TEXT,
  p_address TEXT,
  p_pincode TEXT,
  p_city TEXT,
  p_state TEXT,
  p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_subtotal NUMERIC := 0;
  v_item JSONB;
  v_product RECORD;
  v_item_subtotal NUMERIC;
BEGIN
  -- Generate order number
  v_order_number := 'ETP-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD((FLOOR(RANDOM() * 900000) + 100000)::TEXT, 6, '0');
  
  -- Validate items and calculate server-side subtotal
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT id, name, price, stock, active, images
    INTO v_product
    FROM public.products
    WHERE id = (v_item->>'product_id')::UUID;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found: %', v_item->>'product_id';
    END IF;
    
    IF NOT v_product.active THEN
      RAISE EXCEPTION 'Product is not available: %', v_product.name;
    END IF;
    
    IF v_product.stock < (v_item->>'quantity')::INTEGER THEN
      RAISE EXCEPTION 'Insufficient stock for: %', v_product.name;
    END IF;
    
    v_item_subtotal := v_product.price * (v_item->>'quantity')::INTEGER;
    v_subtotal := v_subtotal + v_item_subtotal;
  END LOOP;
  
  -- Create order with server-calculated total
  INSERT INTO public.orders (
    order_number, customer_name, phone,
    house_name, building_name, address,
    pincode, city, state, payment_method,
    subtotal, delivery_charge, total, status
  ) VALUES (
    v_order_number, p_customer_name, p_phone,
    p_house_name, p_building_name, p_address,
    p_pincode, p_city, p_state, 'COD',
    v_subtotal, 0, v_subtotal, 'Pending'
  ) RETURNING id INTO v_order_id;
  
  -- Insert order items and decrease stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT id, name, price, images
    INTO v_product
    FROM public.products
    WHERE id = (v_item->>'product_id')::UUID;
    
    INSERT INTO public.order_items (
      order_id, product_id, product_name, product_image,
      quantity, original_price, final_price, subtotal
    ) VALUES (
      v_order_id,
      v_product.id,
      v_product.name,
      COALESCE(v_product.images[1], ''),
      (v_item->>'quantity')::INTEGER,
      v_product.price,
      v_product.price,
      v_product.price * (v_item->>'quantity')::INTEGER
    );
    
    -- Decrease stock
    UPDATE public.products
    SET stock = stock - (v_item->>'quantity')::INTEGER
    WHERE id = v_product.id;
  END LOOP;
  
  -- Insert initial status history
  INSERT INTO public.order_status_history (order_id, previous_status, new_status, changed_by)
  VALUES (v_order_id, NULL, 'Pending', 'customer');
  
  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'total', v_subtotal
  );
END;
$$;

-- Grant execute to anon
GRANT EXECUTE ON FUNCTION public.create_order_secure TO anon;
GRANT EXECUTE ON FUNCTION public.create_order_secure TO authenticated;

-- ============================================================
-- STORAGE BUCKET SETUP (run after enabling storage)
-- ============================================================
-- Run this separately in the SQL editor after enabling Storage:
/*
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "product_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "product_images_admin_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "product_images_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );
*/
