-- ============================================================
-- EtopiaMart - Seed Data (Demo Categories & Products)
-- Run AFTER schema.sql
-- ============================================================

-- Categories
INSERT INTO public.categories (name, slug, description, image, active) VALUES
  ('Gadgets', 'gadgets', 'Latest tech gadgets and electronic accessories', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', true),
  ('Home & Kitchen', 'home-products', 'Useful products for your home and kitchen', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80', true),
  ('Lifestyle', 'lifestyle', 'Products to enhance your everyday lifestyle', 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=800&q=80', true),
  ('Fashion Accessories', 'fashion', 'Stylish accessories to complete your look', 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80', true),
  ('Everyday Essentials', 'useful-products', 'Useful everyday products for better living', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80', true)
ON CONFLICT (slug) DO NOTHING;
