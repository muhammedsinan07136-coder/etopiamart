export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  product_count?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  original_price: number;
  discount_percentage: number;
  stock: number;
  category_id: string;
  category_name?: string;
  images: string[];
  featured: boolean;
  bestseller: boolean;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Packed'
  | 'Shipping'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  original_price?: number;
  discount?: number;
  final_price?: number;
  subtotal: number;
  // legacy alias kept for backward compat
  price?: number;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  previous_status: string | null;
  new_status: string;
  changed_at: string;
  changed_by: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  house_name: string;
  building_name?: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
  payment_method: 'COD';
  subtotal: number;
  delivery_charge: number;
  total: number;
  status: OrderStatus;
  notes?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
  status_history?: OrderStatusHistory[];
}

export interface CheckoutFormData {
  customer_name: string;
  phone: string;
  house_name: string;
  building_name?: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
}

export interface FilterState {
  searchQuery: string;
  categoryId: string;
  minPrice: number;
  maxPrice: number;
  inStockOnly: boolean;
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'popular';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
  created_at: string;
}
