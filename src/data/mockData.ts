import { Category, Product, Order } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Gadgets',
    slug: 'gadgets',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
    description: 'Smart tech, audio gear, and innovative electronics.',
    active: true,
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Home Products',
    slug: 'home-products',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80',
    description: 'Smart home organizers, kitchen essentials, and room decor.',
    active: true,
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Lifestyle',
    slug: 'lifestyle',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    description: 'Personal care, wellness items, and everyday travel gear.',
    active: true,
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    name: 'Fashion Accessories',
    slug: 'fashion-accessories',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
    description: 'Premium watches, sunglasses, wallets, and wearable style.',
    active: true,
  },
  {
    id: 'c5555555-5555-5555-5555-555555555555',
    name: 'Useful Products',
    slug: 'useful-products',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    description: 'Ingenious daily problem solvers designed for modern living.',
    active: true,
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1111111-1111-1111-1111-111111111111',
    name: 'UltraSync Wireless Noise-Cancelling Earbuds',
    slug: 'ultrasync-wireless-noise-cancelling-earbuds',
    description: 'Experience studio-grade audio with active hybrid noise cancellation. Features 13mm neodymium bass drivers, ultra-low latency gaming mode, 36 hours total battery life with fast-charging case, touch controls, and IPX5 water resistance. Perfect for travel, workouts, and hands-free clear calling.',
    short_description: 'Pro active noise cancelling earbuds with 36H battery & deep bass.',
    price: 1899,
    original_price: 3499,
    discount_percentage: 46,
    stock: 45,
    category_id: 'c1111111-1111-1111-1111-111111111111',
    category_name: 'Gadgets',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: true,
    bestseller: true,
    active: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'p2222222-2222-2222-2222-222222222222',
    name: 'AeroCharge 4-in-1 Magnetic Wireless Charging Stand',
    slug: 'aerocharge-4-in-1-magnetic-wireless-charging-stand',
    description: 'De-clutter your desk and nightstand. This heavy-duty CNC aluminum wireless charging hub fast charges your smartphone, smartwatch, wireless earbuds, and includes an additional high-speed USB-C output port. Built-in intelligent temperature protection & foreign object detection.',
    short_description: 'Sleek 15W fast magnetic charging station for all your devices.',
    price: 2499,
    original_price: 4999,
    discount_percentage: 50,
    stock: 28,
    category_id: 'c1111111-1111-1111-1111-111111111111',
    category_name: 'Gadgets',
    images: [
      'https://images.unsplash.com/photo-1622445268465-8438165a0463?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1586816879360-e036d217705c?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: true,
    bestseller: true,
    active: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'p3333333-3333-3333-3333-333333333333',
    name: 'Minimalist Motion-Sensor Rechargeable LED Night Light',
    slug: 'minimalist-motion-sensor-rechargeable-led-night-light',
    description: 'Smart ambient illumination for bedrooms, stairs, hallways, and closets. Features magnetic adhesive base, 120-degree motion detection angle up to 3 meters, and a built-in 500mAh lithium battery offering 90 days of normal automatic use per charge.',
    short_description: 'Rechargeable warm LED night light with intelligent motion detection.',
    price: 799,
    original_price: 1499,
    discount_percentage: 47,
    stock: 60,
    category_id: 'c2222222-2222-2222-2222-222222222222',
    category_name: 'Home Products',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: true,
    bestseller: false,
    active: true,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'p4444444-4444-4444-4444-444444444444',
    name: 'Precision Electric Coffee Grinder & Frother Wand',
    slug: 'precision-electric-coffee-grinder-frother-wand',
    description: 'Elevate your daily morning coffee. Ceramic burr grinding mechanism preserves authentic bean oils and flavor profiles with 15 adjustable coarseness settings. Comes bundled with a USB-C high-speed handheld milk frother for rich cappuccinos.',
    short_description: 'Barista quality rechargeable coffee grinder and high-speed frother.',
    price: 1599,
    original_price: 2999,
    discount_percentage: 47,
    stock: 18,
    category_id: 'c2222222-2222-2222-2222-222222222222',
    category_name: 'Home Products',
    images: [
      'https://images.unsplash.com/photo-1517668808822-9ebe02f2a6e8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: false,
    bestseller: true,
    active: true,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  {
    id: 'p5555555-5555-5555-5555-555555555555',
    name: 'UrbanGlide Anti-Theft Water-Resistant Smart Backpack',
    slug: 'urbanglide-anti-theft-water-resistant-smart-backpack',
    description: 'Built for modern commuters and international travelers. Constructed with hydrophobic cut-resistant Oxford canvas, hidden zippers, TSA security combination lock, integrated external USB pass-through charging port, and 15.6" padded laptop protection.',
    short_description: 'Sleek anti-theft laptop backpack with USB charging port & TSA lock.',
    price: 1999,
    original_price: 3999,
    discount_percentage: 50,
    stock: 35,
    category_id: 'c3333333-3333-3333-3333-333333333333',
    category_name: 'Lifestyle',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: true,
    bestseller: true,
    active: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'p6666666-6666-6666-6666-666666666666',
    name: 'Apex Chrono Stainless Steel Quartz Watch',
    slug: 'apex-chrono-stainless-steel-quartz-watch',
    description: 'Timeless luxury meets everyday durability. Premium 316L solid stainless steel casing with matte black finish, scratch-proof sapphire crystal lens, luminous hands, Japanese chronograph movement, and 50M water resistance.',
    short_description: 'Luxury matte black stainless steel chronograph watch with sapphire glass.',
    price: 2999,
    original_price: 5999,
    discount_percentage: 50,
    stock: 12,
    category_id: 'c4444444-4444-4444-4444-444444444444',
    category_name: 'Fashion Accessories',
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: true,
    bestseller: false,
    active: true,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString()
  },
  {
    id: 'p7777777-7777-7777-7777-777777777777',
    name: 'Smart Thermal Vacuum Insulated Flask (500ml)',
    slug: 'smart-thermal-vacuum-insulated-flask-500ml',
    description: 'Keep beverages piping hot for 12 hours or refreshingly ice-cold for 24 hours. Double-wall 304 food-grade stainless steel with smart HD LED touch lid displaying precise internal temperature in real-time.',
    short_description: 'Insulated thermal bottle with intelligent LED temperature touch lid.',
    price: 899,
    original_price: 1799,
    discount_percentage: 50,
    stock: 50,
    category_id: 'c5555555-5555-5555-5555-555555555555',
    category_name: 'Useful Products',
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: false,
    bestseller: true,
    active: true,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'p8888888-8888-8888-8888-888888888888',
    name: 'Portable Electric Mini Juicer & Smoothie Blender',
    slug: 'portable-electric-mini-juicer-smoothie-blender',
    description: 'Whiz up fresh fruit juices and protein shakes anywhere in under 30 seconds. Powerful 3D 6-blade stainless steel assembly with high-capacity 2000mAh USB rechargeable battery. Features leak-proof silicone sealing and easy water flush cleaning.',
    short_description: '6-blade USB rechargeable portable blender bottle for smoothies on the go.',
    price: 1199,
    original_price: 2199,
    discount_percentage: 45,
    stock: 22,
    category_id: 'c5555555-5555-5555-5555-555555555555',
    category_name: 'Useful Products',
    images: [
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: true,
    bestseller: false,
    active: true,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString()
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    order_number: 'ETP-2026-94812',
    customer_name: 'Aarav Sharma',
    phone: '9876543210',
    house_name: 'Flat 402, Green Valley Apartments',
    building_name: 'Block B',
    address: 'MG Road, Indiranagar',
    pincode: '560038',
    city: 'Bengaluru',
    state: 'Karnataka',
    payment_method: 'COD',
    subtotal: 1899,
    delivery_charge: 0,
    total: 1899,
    status: 'Pending',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    items: [
      {
        id: 'item-1',
        product_id: 'p1111111-1111-1111-1111-111111111111',
        product_name: 'UltraSync Wireless Noise-Cancelling Earbuds',
        product_image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80',
        quantity: 1,
        price: 1899,
        subtotal: 1899
      }
    ]
  },
  {
    id: 'ord-1002',
    order_number: 'ETP-2026-83190',
    customer_name: 'Priya Nair',
    phone: '9812345678',
    house_name: 'Villa 14',
    building_name: 'Palm Meadows',
    address: 'Kalyani Nagar',
    pincode: '411006',
    city: 'Pune',
    state: 'Maharashtra',
    payment_method: 'COD',
    subtotal: 3398,
    delivery_charge: 0,
    total: 3398,
    status: 'Confirmed',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    items: [
      {
        id: 'item-2',
        product_id: 'p2222222-2222-2222-2222-222222222222',
        product_name: 'AeroCharge 4-in-1 Magnetic Wireless Charging Stand',
        product_image: 'https://images.unsplash.com/photo-1622445268465-8438165a0463?auto=format&fit=crop&w=1000&q=80',
        quantity: 1,
        price: 2499,
        subtotal: 2499
      },
      {
        id: 'item-3',
        product_id: 'p7777777-7777-7777-7777-777777777777',
        product_name: 'Smart Thermal Vacuum Insulated Flask (500ml)',
        product_image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=80',
        quantity: 1,
        price: 899,
        subtotal: 899
      }
    ]
  }
];

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi NCR', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh'
];
