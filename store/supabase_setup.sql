-- ==========================================
-- ETOPIAMART SUPABASE DATABASE SETUP SCRIPT
-- Copy and paste this script into your Supabase SQL Editor
-- ==========================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    image TEXT,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    short_description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(10, 2) CHECK (original_price >= price),
    discount_percentage INTEGER DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    images TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT false,
    bestseller BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    house_name VARCHAR(255) NOT NULL,
    building_name VARCHAR(255),
    address TEXT NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'COD',
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    delivery_charge NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREATE ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    product_image TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0)
);

-- 6. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- 7. AUTO-UPDATE UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS tr_products_updated_at ON public.products;
CREATE TRIGGER tr_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS tr_orders_updated_at ON public.orders;
CREATE TRIGGER tr_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 8. AUTOMATIC STOCK REDUCTION TRIGGER ON ORDER CREATION
CREATE OR REPLACE FUNCTION decrease_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products
    SET stock = GREATEST(0, stock - NEW.quantity)
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_order_item_stock ON public.order_items;
CREATE TRIGGER tr_order_item_stock
    AFTER INSERT ON public.order_items
    FOR EACH ROW EXECUTE FUNCTION decrease_product_stock();

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Category RLS: Anyone can read active categories, only logged-in admin can insert/update/delete
CREATE POLICY "Public categories read" ON public.categories FOR SELECT USING (active = true OR auth.role() = 'authenticated');
CREATE POLICY "Admin categories insert" ON public.categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin categories update" ON public.categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin categories delete" ON public.categories FOR DELETE USING (auth.role() = 'authenticated');

-- Product RLS: Anyone can read active products, only logged-in admin can insert/update/delete
CREATE POLICY "Public products read" ON public.products FOR SELECT USING (active = true OR auth.role() = 'authenticated');
CREATE POLICY "Admin products insert" ON public.products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin products update" ON public.products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin products delete" ON public.products FOR DELETE USING (auth.role() = 'authenticated');

-- Orders RLS: Anyone can create orders (checkout), only logged-in admin can view/update/delete all orders
CREATE POLICY "Public order creation" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin orders view" ON public.orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin orders update" ON public.orders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin orders delete" ON public.orders FOR DELETE USING (auth.role() = 'authenticated');

-- Order Items RLS: Anyone can create order items during checkout, only logged-in admin can view/update
CREATE POLICY "Public order_items creation" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin order_items view" ON public.order_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin order_items update" ON public.order_items FOR UPDATE USING (auth.role() = 'authenticated');

-- 10. STORAGE BUCKET CREATION FOR PRODUCT IMAGES
-- Run this block to create public bucket named 'product-images'
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Anyone can read images, logged in admins can upload/delete
CREATE POLICY "Public Storage Read" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admin Storage Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Storage Delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- 11. SAMPLE DEMO SEED DATA
-- Insert Categories
INSERT INTO public.categories (id, name, slug, image, description, active) VALUES
('c1111111-1111-1111-1111-111111111111', 'Gadgets', 'gadgets', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80', 'Smart devices, audio accessories, and tech solutions.', true),
('c2222222-2222-2222-2222-222222222222', 'Home Products', 'home-products', 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80', 'Smart home organizers, kitchen essentials, and room decor.', true),
('c3333333-3333-3333-3333-333333333333', 'Lifestyle', 'lifestyle', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80', 'Personal care, wellness items, and everyday carry products.', true),
('c4444444-4444-4444-4444-444444444444', 'Fashion Accessories', 'fashion-accessories', 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80', 'Premium watches, sunglasses, wallets, and wearable style.', true),
('c5555555-5555-5555-5555-555555555555', 'Useful Products', 'useful-products', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80', 'Ingenious daily problem solvers designed for modern living.', true)
ON CONFLICT (id) DO NOTHING;

-- Insert Products
INSERT INTO public.products (id, name, slug, description, short_description, price, original_price, discount_percentage, stock, category_id, images, featured, bestseller, active) VALUES
(
  'p1111111-1111-1111-1111-111111111111',
  'UltraSync Wireless Noise-Cancelling Earbuds',
  'ultrasync-wireless-noise-cancelling-earbuds',
  'Experience crystal clear sound audio with active noise isolation, dynamic 13mm bass drivers, 36 hours of battery playback with fast charging case, and IPX5 water resistance for workouts and rain.',
  'Pro active noise cancelling earbuds with 36H playtime and deep bass.',
  1899.00,
  3499.00,
  46,
  45,
  'c1111111-1111-1111-1111-111111111111',
  ARRAY[
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=1000&q=80'
  ],
  true,
  true,
  true
),
(
  'p2222222-2222-2222-2222-222222222222',
  'AeroCharge 4-in-1 Magnetic Wireless Charging Stand',
  'aerocharge-4-in-1-magnetic-wireless-charging-stand',
  'Streamline your desk setup with our premium aluminum magnetic wireless charging dock. Simultaneously fast-charge your Smartphone, Smartwatch, Wireless Earbuds, and an additional USB-C port.',
  'Sleek 15W fast magnetic charging dock for all your smart gear.',
  2499.00,
  4999.00,
  50,
  28,
  'c1111111-1111-1111-1111-111111111111',
  ARRAY[
    'https://images.unsplash.com/photo-1622445268465-8438165a0463?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1586816879360-e036d217705c?auto=format&fit=crop&w=1000&q=80'
  ],
  true,
  true,
  true
),
(
  'p3333333-3333-3333-3333-333333333333',
  'Minimalist Automatic Motion Sensor LED Night Light',
  'minimalist-automatic-motion-sensor-led-night-light',
  'Warm ambient glow for hallways, stairs, and bedrooms. Magnetic mountable design with rechargeable battery lasting up to 90 days on auto motion-sensor mode.',
  'Rechargeable warm LED night light with intelligent motion detection.',
  799.00,
  1499.00,
  47,
  60,
  'c2222222-2222-2222-2222-222222222222',
  ARRAY[
    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80'
  ],
  true,
  false,
  true
),
(
  'p4444444-4444-4444-4444-444444444444',
  'Precision Electric Coffee Grinder & Frother Wand',
  'precision-electric-coffee-grinder-frother-wand',
  'Enjoy barista-level espresso and latte at home. Features ceramic burr grinding mechanism with 15 adjustable coarseness levels and a USB-C rechargeable high-speed frother whisk.',
  'Barista quality rechargeable coffee grinder and high-speed frother combo.',
  1599.00,
  2999.00,
  47,
  18,
  'c2222222-2222-2222-2222-222222222222',
  ARRAY[
    'https://images.unsplash.com/photo-1517668808822-9ebe02f2a6e8?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80'
  ],
  false,
  true,
  true
),
(
  'p5555555-5555-5555-5555-555555555555',
  'UrbanGlide Anti-Theft Water-Resistant Smart Backpack',
  'urbanglide-anti-theft-water-resistant-smart-backpack',
  'Engineered for daily commuting and modern travel. Made from cut-resistant hydrophobic oxford fabric, features hidden TSA locks, built-in USB charging port, and 15.6-inch cushioned laptop compartment.',
  'Sleek anti-theft laptop backpack with USB port and ergonomic support.',
  1999.00,
  3999.00,
  50,
  35,
  'c3333333-3333-3333-3333-333333333333',
  ARRAY[
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1000&q=80'
  ],
  true,
  true,
  true
),
(
  'p6666666-6666-6666-6666-666666666666',
  'Apex Chrono Stainless Steel Quartz Watch',
  'apex-chrono-stainless-steel-quartz-watch',
  'Classic luxury chronograph watch crafted with 316L surgical grade stainless steel, scratch-resistant sapphire crystal glass, and 50m water resistance.',
  'Luxury matte black stainless steel chronograph watch with sapphire glass.',
  2999.00,
  5999.00,
  50,
  12,
  'c4444444-4444-4444-4444-444444444444',
  ARRAY[
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80'
  ],
  true,
  false,
  true
),
(
  'p7777777-7777-7777-7777-777777777777',
  'Smart Thermal Vacuum Insulated Flask (500ml)',
  'smart-thermal-vacuum-insulated-flask-500ml',
  'Keep beverages hot for up to 12 hours or ice-cold for 24 hours. Features a real-time touch LED temperature indicator cap and food-grade 304 stainless steel lining.',
  'Insulated thermal bottle with intelligent LED temperature touch lid.',
  899.00,
  1799.00,
  50,
  50,
  'c5555555-5555-5555-5555-555555555555',
  ARRAY[
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80'
  ],
  false,
  true,
  true
),
(
  'p8888888-8888-8888-8888-888888888888',
  'Portable Electric Mini Juicer & Smoothie Blender',
  'portable-electric-mini-juicer-smoothie-blender',
  'Fresh smoothies anywhere. 6-blade stainless steel cutter powered by a 2000mAh USB rechargeable battery. Compact 400ml BPA-free bottle for travel, gym, and office.',
  '6-blade USB rechargeable portable blender bottle for fresh smoothies on the go.',
  1199.00,
  2199.00,
  45,
  22,
  'c5555555-5555-5555-5555-555555555555',
  ARRAY[
    'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=1000&q=80'
  ],
  true,
  false,
  true
)
ON CONFLICT (id) DO NOTHING;
