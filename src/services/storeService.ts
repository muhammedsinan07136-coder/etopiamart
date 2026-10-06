import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Category,
  Product,
  Order,
  OrderStatus,
  OrderItem,
  CheckoutFormData,
} from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_ORDERS } from '../data/mockData';

// ============================================================
// LOCAL STORAGE KEYS (fallback when Supabase is not configured)
// ============================================================
const LOCAL_PRODUCTS_KEY = 'etopiamart_products';
const LOCAL_CATEGORIES_KEY = 'etopiamart_categories';
const LOCAL_ORDERS_KEY = 'etopiamart_orders';
const LOCAL_MY_ORDERS_KEY = 'etopiamart_my_order_numbers';

// ============================================================
// LOCAL STORAGE HELPERS
// ============================================================
const getLocalProducts = (): Product[] => {
  try {
    const data = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (!data) {
      localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_PRODUCTS;
  }
};

const saveLocalProducts = (products: Product[]) => {
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
};

const getLocalCategories = (): Category[] => {
  try {
    const data = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    if (!data) {
      localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_CATEGORIES;
  }
};

const saveLocalCategories = (categories: Category[]) => {
  localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(categories));
};

const getLocalOrders = (): Order[] => {
  try {
    const data = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (!data) {
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_ORDERS;
  }
};

const saveLocalOrders = (orders: Order[]) => {
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
};

// ============================================================
// CUSTOMER ORDER NUMBER PERSISTENCE
// ============================================================
export const getMyOrderNumbers = (): string[] => {
  try {
    const data = localStorage.getItem(LOCAL_MY_ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveMyOrderNumber = (orderNumber: string) => {
  try {
    const current = getMyOrderNumbers();
    if (!current.includes(orderNumber)) {
      localStorage.setItem(
        LOCAL_MY_ORDERS_KEY,
        JSON.stringify([orderNumber, ...current])
      );
    }
  } catch (e) {
    console.error('Failed to save order number', e);
  }
};

// ============================================================
// ERROR HANDLING HELPER
// ============================================================
const handleError = (context: string, error: unknown): void => {
  if (import.meta.env.DEV) {
    console.warn(`[EtopiaMart] ${context}:`, error);
  }
};

// ============================================================
// CATEGORIES SERVICE
// ============================================================
export const fetchCategories = async (): Promise<Category[]> => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      if (data && data.length > 0) return data as Category[];
    } catch (e) {
      handleError('fetchCategories', e);
    }
  }
  return getLocalCategories();
};

export const saveCategory = async (categoryData: Partial<Category>): Promise<Category> => {
  if (isSupabaseConfigured) {
    try {
      const slug =
        categoryData.slug ||
        categoryData.name
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') ||
        `cat-${Date.now()}`;

      if (categoryData.id) {
        const { data, error } = await supabase
          .from('categories')
          .update({ ...categoryData, updated_at: new Date().toISOString() })
          .eq('id', categoryData.id)
          .select()
          .single();
        if (error) throw error;
        return data as Category;
      } else {
        const { data, error } = await supabase
          .from('categories')
          .insert([{ ...categoryData, slug }])
          .select()
          .single();
        if (error) throw error;
        return data as Category;
      }
    } catch (e) {
      handleError('saveCategory', e);
      throw new Error('Failed to save category. Please try again.');
    }
  }

  const categories = getLocalCategories();
  if (categoryData.id) {
    const updated = categories.map((c) =>
      c.id === categoryData.id ? ({ ...c, ...categoryData } as Category) : c
    );
    saveLocalCategories(updated);
    return updated.find((c) => c.id === categoryData.id)!;
  } else {
    const slug =
      categoryData.slug ||
      categoryData.name
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') ||
      `cat-${Date.now()}`;
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: categoryData.name || 'New Category',
      slug,
      image: categoryData.image || '',
      description: categoryData.description || '',
      active: categoryData.active !== undefined ? categoryData.active : true,
      created_at: new Date().toISOString(),
    };
    saveLocalCategories([newCategory, ...categories]);
    return newCategory;
  }
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      handleError('deleteCategory', e);
      throw new Error('Failed to delete category. Please try again.');
    }
  }

  const categories = getLocalCategories();
  saveLocalCategories(categories.filter((c) => c.id !== id));
  return true;
};

// ============================================================
// PRODUCTS SERVICE
// ============================================================
export const fetchProducts = async (filters?: {
  categoryId?: string;
  search?: string;
  featured?: boolean;
  bestseller?: boolean;
}): Promise<Product[]> => {
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('products')
        .select('*, categories(name)')
        .eq('active', true);
      if (filters?.categoryId) query = query.eq('category_id', filters.categoryId);
      if (filters?.featured) query = query.eq('featured', true);
      if (filters?.bestseller) query = query.eq('bestseller', true);
      if (filters?.search) query = query.ilike('name', `%${filters.search}%`);

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        return data.map((p: Record<string, unknown>) => ({
          ...p,
          category_name: (p.categories as { name?: string } | null)?.name || '',
        })) as Product[];
      }
    } catch (e) {
      handleError('fetchProducts', e);
    }
  }

  let products = getLocalProducts().filter((p) => p.active);
  const categories = getLocalCategories();
  products = products.map((p) => ({
    ...p,
    category_name: categories.find((c) => c.id === p.category_id)?.name || p.category_name,
  }));

  if (filters?.categoryId)
    products = products.filter((p) => p.category_id === filters.categoryId);
  if (filters?.featured) products = products.filter((p) => p.featured);
  if (filters?.bestseller) products = products.filter((p) => p.bestseller);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  return products;
};

export const fetchAllAdminProducts = async (): Promise<Product[]> => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        return data.map((p: Record<string, unknown>) => ({
          ...p,
          category_name: (p.categories as { name?: string } | null)?.name || '',
        })) as Product[];
      }
    } catch (e) {
      handleError('fetchAllAdminProducts', e);
    }
  }

  const products = getLocalProducts();
  const categories = getLocalCategories();
  return products.map((p) => ({
    ...p,
    category_name: categories.find((c) => c.id === p.category_id)?.name || p.category_name,
  }));
};

export const fetchProductBySlugOrId = async (identifier: string): Promise<Product | null> => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .or(`slug.eq.${identifier},id.eq.${identifier}`)
        .single();
      if (error) throw error;
      if (data) {
        return {
          ...data,
          category_name: (data.categories as { name?: string } | null)?.name || '',
        } as Product;
      }
    } catch (e) {
      handleError('fetchProductBySlugOrId', e);
    }
  }

  const products = getLocalProducts();
  const found = products.find((p) => p.slug === identifier || p.id === identifier);
  if (!found) return null;
  const categories = getLocalCategories();
  return {
    ...found,
    category_name:
      categories.find((c) => c.id === found.category_id)?.name || found.category_name,
  };
};

export const saveProduct = async (productData: Partial<Product>): Promise<Product> => {
  const price = Number(productData.price || 0);
  const original_price = Number(productData.original_price || price);
  const discount_percentage =
    original_price > price
      ? Math.round(((original_price - price) / original_price) * 100)
      : 0;

  const slug =
    productData.slug ||
    productData.name
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') ||
    `prod-${Date.now()}`;

  const payload = {
    ...productData,
    price,
    original_price,
    discount_percentage,
    slug,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      if (productData.id) {
        const { data, error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', productData.id)
          .select()
          .single();
        if (error) throw error;
        return data as Product;
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([{ ...payload, created_at: new Date().toISOString() }])
          .select()
          .single();
        if (error) throw error;
        return data as Product;
      }
    } catch (e) {
      handleError('saveProduct', e);
      throw new Error('Failed to save product. Please try again.');
    }
  }

  const products = getLocalProducts();
  if (productData.id) {
    const updated = products.map((p) =>
      p.id === productData.id ? ({ ...p, ...payload } as Product) : p
    );
    saveLocalProducts(updated);
    return updated.find((p) => p.id === productData.id)!;
  } else {
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: productData.name || 'New Product',
      slug,
      description: productData.description || '',
      short_description: productData.short_description || '',
      price,
      original_price,
      discount_percentage,
      stock: Number(productData.stock || 0),
      category_id: productData.category_id || '',
      images: productData.images || [],
      featured: Boolean(productData.featured),
      bestseller: Boolean(productData.bestseller),
      active: productData.active !== undefined ? productData.active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveLocalProducts([newProduct, ...products]);
    return newProduct;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      handleError('deleteProduct', e);
      throw new Error('Failed to delete product. Please try again.');
    }
  }

  const products = getLocalProducts();
  saveLocalProducts(products.filter((p) => p.id !== id));
  return true;
};

// ============================================================
// IMAGE UPLOAD SERVICE
// ============================================================
export const uploadProductImage = async (file: File): Promise<string> => {
  if (isSupabaseConfigured) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (e) {
      handleError('uploadProductImage', e);
      throw new Error('Failed to upload image. Please check your Supabase storage configuration.');
    }
  }

  // Local fallback: convert to data URL for demo
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const deleteProductImage = async (imageUrl: string): Promise<boolean> => {
  if (isSupabaseConfigured && imageUrl.includes('supabase')) {
    try {
      const urlParts = imageUrl.split('/product-images/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        const { error } = await supabase.storage
          .from('product-images')
          .remove([filePath]);
        if (error) throw error;
      }
      return true;
    } catch (e) {
      handleError('deleteProductImage', e);
    }
  }
  return true;
};

// ============================================================
// ORDERS SERVICE
// ============================================================
export const createOrder = async (
  customer: CheckoutFormData,
  cartItems: Array<{ product: Product; quantity: number }>,
  subtotal: number,
  deliveryCharge: number = 0
): Promise<Order> => {
  // Use secure server-side order creation if Supabase is configured
  if (isSupabaseConfigured) {
    try {
      const items = cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }));

      const { data, error } = await supabase.rpc('create_order_secure', {
        p_customer_name: customer.customer_name,
        p_phone: customer.phone,
        p_house_name: customer.house_name,
        p_building_name: customer.building_name || '',
        p_address: customer.address,
        p_pincode: customer.pincode,
        p_city: customer.city,
        p_state: customer.state,
        p_items: items,
      });

      if (error) throw error;

      const result = data as { order_id: string; order_number: string; total: number };

      saveMyOrderNumber(result.order_number);

      // Fetch the created order
      const { data: orderData, error: fetchError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', result.order_id)
        .single();

      if (fetchError) throw fetchError;

      return {
        ...orderData,
        items: orderData.order_items || [],
      } as Order;
    } catch (e) {
      handleError('createOrder (Supabase)', e);
      throw new Error('Failed to place order. Please try again.');
    }
  }

  // Local storage fallback
  const orderNumber = `ETP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const total = subtotal + deliveryCharge;
  const newOrderId = `ord-${Date.now()}`;

  const orderItems: OrderItem[] = cartItems.map((item, idx) => ({
    id: `item-${Date.now()}-${idx}`,
    order_id: newOrderId,
    product_id: item.product.id,
    product_name: item.product.name,
    product_image: item.product.images[0] || '',
    quantity: item.quantity,
    original_price: item.product.original_price || item.product.price,
    final_price: item.product.price,
    subtotal: item.product.price * item.quantity,
    price: item.product.price,
  }));

  const newOrder: Order = {
    id: newOrderId,
    order_number: orderNumber,
    customer_name: customer.customer_name,
    phone: customer.phone,
    house_name: customer.house_name,
    building_name: customer.building_name || '',
    address: customer.address,
    pincode: customer.pincode,
    city: customer.city,
    state: customer.state,
    payment_method: 'COD',
    subtotal,
    delivery_charge: deliveryCharge,
    total,
    status: 'Pending',
    created_at: new Date().toISOString(),
    items: orderItems,
  };

  const orders = getLocalOrders();
  saveLocalOrders([newOrder, ...orders]);
  saveMyOrderNumber(orderNumber);

  // Decrease local stock
  const products = getLocalProducts();
  saveLocalProducts(
    products.map((p) => {
      const cartItem = cartItems.find((c) => c.product.id === p.id);
      return cartItem ? { ...p, stock: Math.max(0, p.stock - cartItem.quantity) } : p;
    })
  );

  return newOrder;
};

export const fetchAllOrders = async (): Promise<Order[]> => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        return data.map((o: Record<string, unknown>) => ({
          ...o,
          items: (o.order_items as OrderItem[]) || [],
        })) as Order[];
      }
    } catch (e) {
      handleError('fetchAllOrders', e);
      throw new Error('Failed to fetch orders. Please try again.');
    }
  }
  return getLocalOrders();
};

export const fetchOrderById = async (orderId: string): Promise<Order | null> => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*), order_status_history(*)')
        .eq('id', orderId)
        .single();
      if (error) throw error;
      if (data) {
        return {
          ...data,
          items: data.order_items || [],
          status_history: data.order_status_history || [],
        } as Order;
      }
    } catch (e) {
      handleError('fetchOrderById', e);
    }
  }

  const orders = getLocalOrders();
  return orders.find((o) => o.id === orderId) || null;
};

// Secure customer order lookup via RPC (doesn't expose all orders)
export const fetchCustomerOrders = async (query: string): Promise<Order[]> => {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('get_customer_orders', {
        p_query: cleanQuery,
      });

      if (error) throw error;
      if (data && data.length > 0) {
        // Fetch items for each order
        const ordersWithItems = await Promise.all(
          (data as Order[]).map(async (order) => {
            const { data: items } = await supabase
              .from('order_items')
              .select('*')
              .eq('order_id', order.id);
            return { ...order, items: items || [] };
          })
        );
        return ordersWithItems;
      }
      return [];
    } catch (e) {
      handleError('fetchCustomerOrders', e);
    }
  }

  const allOrders = getLocalOrders();
  const cleanPhone = cleanQuery.replace(/\D/g, '');

  return allOrders.filter(
    (o) =>
      o.order_number.toLowerCase().includes(cleanQuery.toLowerCase()) ||
      (cleanPhone && o.phone.includes(cleanPhone)) ||
      o.phone === cleanQuery
  );
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<boolean> => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (error) throw error;
      return true;
    } catch (e) {
      handleError('updateOrderStatus', e);
      throw new Error('Failed to update order status. Please try again.');
    }
  }

  const orders = getLocalOrders();
  saveLocalOrders(
    orders.map((o) =>
      o.id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o
    )
  );
  return true;
};

// ============================================================
// ADMIN AUTH CHECK
// ============================================================
export const checkIsAdmin = async (): Promise<boolean> => {
  if (!isSupabaseConfigured) return true; // allow in demo mode

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (error) return false;
    return Boolean(data);
  } catch {
    return false;
  }
};
