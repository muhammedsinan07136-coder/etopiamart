import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Category, Product, Order, OrderStatus, CheckoutFormData } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_ORDERS } from '../data/mockData';

const LOCAL_PRODUCTS_KEY = 'etopiamart_products';
const LOCAL_CATEGORIES_KEY = 'etopiamart_categories';
const LOCAL_ORDERS_KEY = 'etopiamart_orders';
const LOCAL_MY_ORDERS_KEY = 'etopiamart_my_order_numbers';

// Helper for Local Storage Fallback initialization
const getLocalProducts = (): Product[] => {
  const data = localStorage.getItem(LOCAL_PRODUCTS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  return JSON.parse(data);
};

const saveLocalProducts = (products: Product[]) => {
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
};

const getLocalCategories = (): Category[] => {
  const data = localStorage.getItem(LOCAL_CATEGORIES_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(INITIAL_CATEGORIES));
    return INITIAL_CATEGORIES;
  }
  return JSON.parse(data);
};

const saveLocalCategories = (categories: Category[]) => {
  localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(categories));
};

const getLocalOrders = (): Order[] => {
  const data = localStorage.getItem(LOCAL_ORDERS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  }
  return JSON.parse(data);
};

const saveLocalOrders = (orders: Order[]) => {
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
};

// Customer saved order numbers on this device
export const getMyOrderNumbers = (): string[] => {
  try {
    const data = localStorage.getItem(LOCAL_MY_ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveMyOrderNumber = (orderNumber: string) => {
  try {
    const current = getMyOrderNumbers();
    if (!current.includes(orderNumber)) {
      localStorage.setItem(LOCAL_MY_ORDERS_KEY, JSON.stringify([orderNumber, ...current]));
    }
  } catch (e) {
    console.error('Failed to save my order number', e);
  }
};

// ==================== CATEGORIES SERVICE ====================
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
      console.warn('Supabase fetchCategories failed, using local storage fallback', e);
    }
  }
  return getLocalCategories();
};

export const saveCategory = async (categoryData: Partial<Category>): Promise<Category> => {
  if (isSupabaseConfigured) {
    try {
      if (categoryData.id) {
        const { data, error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', categoryData.id)
          .select()
          .single();
        if (error) throw error;
        return data as Category;
      } else {
        const slug = categoryData.slug || categoryData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `cat-${Date.now()}`;
        const newCat = { ...categoryData, slug };
        const { data, error } = await supabase
          .from('categories')
          .insert([newCat])
          .select()
          .single();
        if (error) throw error;
        return data as Category;
      }
    } catch (e) {
      console.warn('Supabase saveCategory failed, using local storage fallback', e);
    }
  }

  const categories = getLocalCategories();
  if (categoryData.id) {
    const updated = categories.map(c => c.id === categoryData.id ? { ...c, ...categoryData } as Category : c);
    saveLocalCategories(updated);
    return updated.find(c => c.id === categoryData.id)!;
  } else {
    const slug = categoryData.slug || categoryData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `cat-${Date.now()}`;
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: categoryData.name || 'New Category',
      slug,
      image: categoryData.image || 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
      description: categoryData.description || '',
      active: categoryData.active !== undefined ? categoryData.active : true,
      created_at: new Date().toISOString()
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
      console.warn('Supabase deleteCategory failed, using local storage fallback', e);
    }
  }

  const categories = getLocalCategories();
  const updated = categories.filter(c => c.id !== id);
  saveLocalCategories(updated);
  return true;
};

// ==================== PRODUCTS SERVICE ====================
export const fetchProducts = async (filters?: {
  categoryId?: string;
  search?: string;
  featured?: boolean;
  bestseller?: boolean;
}): Promise<Product[]> => {
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('products').select('*, categories(name)').eq('active', true);
      if (filters?.categoryId) query = query.eq('category_id', filters.categoryId);
      if (filters?.featured) query = query.eq('featured', true);
      if (filters?.bestseller) query = query.eq('bestseller', true);
      if (filters?.search) query = query.ilike('name', `%${filters.search}%`);

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((p: any) => ({
          ...p,
          category_name: p.categories?.name || ''
        }));
      }
    } catch (e) {
      console.warn('Supabase fetchProducts failed, using local storage fallback', e);
    }
  }

  let products = getLocalProducts().filter(p => p.active);
  const categories = getLocalCategories();
  
  products = products.map(p => ({
    ...p,
    category_name: categories.find(c => c.id === p.category_id)?.name || p.category_name
  }));

  if (filters?.categoryId) products = products.filter(p => p.category_id === filters.categoryId);
  if (filters?.featured) products = products.filter(p => p.featured);
  if (filters?.bestseller) products = products.filter(p => p.bestseller);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
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
        return data.map((p: any) => ({
          ...p,
          category_name: p.categories?.name || ''
        }));
      }
    } catch (e) {
      console.warn('Supabase fetchAllAdminProducts failed, using local storage fallback', e);
    }
  }

  const products = getLocalProducts();
  const categories = getLocalCategories();
  return products.map(p => ({
    ...p,
    category_name: categories.find(c => c.id === p.category_id)?.name || p.category_name
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
          category_name: data.categories?.name || ''
        };
      }
    } catch (e) {
      console.warn('Supabase fetchProductBySlugOrId failed, using local fallback', e);
    }
  }

  const products = getLocalProducts();
  const found = products.find(p => p.slug === identifier || p.id === identifier);
  if (!found) return null;
  const categories = getLocalCategories();
  return {
    ...found,
    category_name: categories.find(c => c.id === found.category_id)?.name || found.category_name
  };
};

export const saveProduct = async (productData: Partial<Product>): Promise<Product> => {
  const price = Number(productData.price || 0);
  const original_price = Number(productData.original_price || price);
  const discount_percentage = original_price > price 
    ? Math.round(((original_price - price) / original_price) * 100)
    : 0;

  const slug = productData.slug || productData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `prod-${Date.now()}`;

  const payload = {
    ...productData,
    price,
    original_price,
    discount_percentage,
    slug,
    updated_at: new Date().toISOString()
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
      console.warn('Supabase saveProduct failed, using local storage fallback', e);
    }
  }

  const products = getLocalProducts();
  if (productData.id) {
    const updated = products.map(p => p.id === productData.id ? { ...p, ...payload } as Product : p);
    saveLocalProducts(updated);
    return updated.find(p => p.id === productData.id)!;
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
      images: productData.images || ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80'],
      featured: Boolean(productData.featured),
      bestseller: Boolean(productData.bestseller),
      active: productData.active !== undefined ? productData.active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
      console.warn('Supabase deleteProduct failed, using local storage fallback', e);
    }
  }

  const products = getLocalProducts();
  const updated = products.filter(p => p.id !== id);
  saveLocalProducts(updated);
  return true;
};

// ==================== IMAGE UPLOAD SERVICE ====================
export const uploadProductImage = async (file: File): Promise<string> => {
  if (isSupabaseConfigured) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (e) {
      console.warn('Supabase image upload failed, converting image to local Data URL preview', e);
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

// ==================== ORDERS & CHECKOUT SERVICE ====================
export const createOrder = async (
  customer: CheckoutFormData,
  cartItems: Array<{ product: Product; quantity: number }>,
  subtotal: number,
  deliveryCharge: number = 0
): Promise<Order> => {
  const orderNumber = `ETP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const total = subtotal + deliveryCharge;

  const orderPayload = {
    order_number: orderNumber,
    customer_name: customer.customer_name,
    phone: customer.phone,
    house_name: customer.house_name,
    building_name: customer.building_name || '',
    address: customer.address,
    pincode: customer.pincode,
    city: customer.city,
    state: customer.state,
    payment_method: 'COD' as const,
    subtotal,
    delivery_charge: deliveryCharge,
    total,
    status: 'Pending' as OrderStatus,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select()
        .single();
      if (orderError) throw orderError;

      const itemsPayload = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.images[0] || '',
        quantity: item.quantity,
        price: item.product.price,
        subtotal: item.product.price * item.quantity
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(itemsPayload);
      if (itemsError) throw itemsError;

      for (const item of cartItems) {
        const newStock = Math.max(0, item.product.stock - item.quantity);
        await supabase.from('products').update({ stock: newStock }).eq('id', item.product.id);
      }

      saveMyOrderNumber(orderNumber);

      return {
        ...orderData,
        items: itemsPayload
      } as Order;
    } catch (e) {
      console.warn('Supabase createOrder failed, using local storage fallback', e);
    }
  }

  const orders = getLocalOrders();
  const newOrderId = `ord-${Date.now()}`;
  
  const orderItems = cartItems.map((item, idx) => ({
    id: `item-${Date.now()}-${idx}`,
    order_id: newOrderId,
    product_id: item.product.id,
    product_name: item.product.name,
    product_image: item.product.images[0] || '',
    quantity: item.quantity,
    price: item.product.price,
    subtotal: item.product.price * item.quantity
  }));

  const newOrder: Order = {
    id: newOrderId,
    ...orderPayload,
    items: orderItems
  };

  saveLocalOrders([newOrder, ...orders]);
  saveMyOrderNumber(orderNumber);

  const products = getLocalProducts();
  const updatedProducts = products.map(p => {
    const itemInCart = cartItems.find(c => c.product.id === p.id);
    if (itemInCart) {
      return { ...p, stock: Math.max(0, p.stock - itemInCart.quantity) };
    }
    return p;
  });
  saveLocalProducts(updatedProducts);

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
        return data.map((o: any) => ({
          ...o,
          items: o.order_items || []
        }));
      }
    } catch (e) {
      console.warn('Supabase fetchAllOrders failed, using local storage fallback', e);
    }
  }

  return getLocalOrders();
};

// Customer lookup for order history / status tracking
export const fetchCustomerOrders = async (query: string): Promise<Order[]> => {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .or(`phone.eq.${cleanQuery},order_number.ilike.%${cleanQuery}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((o: any) => ({
          ...o,
          items: o.order_items || []
        }));
      }
    } catch (e) {
      console.warn('Supabase fetchCustomerOrders failed, checking local fallback', e);
    }
  }

  const allOrders = getLocalOrders();
  const cleanPhone = cleanQuery.replace(/\D/g, '');
  
  return allOrders.filter(o => 
    o.order_number.toLowerCase().includes(cleanQuery.toLowerCase()) || 
    (cleanPhone && o.phone.includes(cleanPhone)) ||
    o.phone === cleanQuery
  );
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (error) throw error;
      return true;
    } catch (e) {
      console.warn('Supabase updateOrderStatus failed, using local storage fallback', e);
    }
  }

  const orders = getLocalOrders();
  const updated = orders.map(o => o.id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o);
  saveLocalOrders(updated);
  return true;
};
