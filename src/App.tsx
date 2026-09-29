import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Layouts
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { AdminLayout } from './components/admin/AdminLayout';

// Customer Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { TrackOrderPage } from './pages/TrackOrderPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';

// Main Customer Layout Wrapper
const CustomerLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

// 404 Page
const NotFoundPage: React.FC = () => (
  <div className="max-w-md mx-auto my-20 p-8 text-center bg-white rounded-3xl border border-dark-100 shadow-subtle space-y-4">
    <h2 className="text-3xl font-black text-dark-950">404</h2>
    <p className="text-xs text-dark-500">The page you are looking for does not exist.</p>
    <a href="/" className="inline-block bg-dark-900 text-white font-bold text-xs px-6 py-3 rounded-xl shadow">
      Return to Storefront
    </a>
  </div>
);

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <CartProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Customer Routes */}
              <Route path="/" element={<CustomerLayout />}>
                <Route index element={<HomePage />} />
                <Route path="shop" element={<ShopPage />} />
                <Route path="product/:slug" element={<ProductDetailPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="order-success/:orderNumber" element={<OrderSuccessPage />} />
                <Route path="track-order" element={<TrackOrderPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Admin Auth Route */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </CartProvider>
    </ToastProvider>
  );
};

export default App;
