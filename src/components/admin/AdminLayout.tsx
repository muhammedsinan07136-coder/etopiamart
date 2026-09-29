import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, Tag, ShoppingCart, LogOut, Store, Menu, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { isAdminAuthenticated, adminEmail, logoutAdmin, loading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-500" />
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Tag },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col md:flex-row">
      
      {/* Mobile Top Nav */}
      <div className="md:hidden bg-dark-900 border-b border-dark-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-7 w-auto" />
          <span className="font-extrabold text-base">Admin<span className="text-brand-500">Panel</span></span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 text-dark-300 hover:text-white"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileSidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-dark-900 border-r border-dark-800 flex-col justify-between shrink-0 p-5 space-y-8 z-30`}
      >
        <div>
          {/* Brand Header */}
          <div className="hidden md:flex items-center gap-2.5 pb-6 border-b border-dark-800">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            <div>
              <h2 className="font-extrabold text-lg text-white">Etopia<span className="text-brand-500">Mart</span></h2>
              <p className="text-[10px] text-dark-400 font-bold uppercase tracking-wider">Admin Control Panel</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-6">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-brand-500 text-dark-950 shadow-md'
                      : 'text-dark-400 hover:text-white hover:bg-dark-800'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-4 pt-6 border-t border-dark-800">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-dark-300 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <Store className="w-4 h-4 text-brand-400" />
            <span>Open Customer Storefront</span>
          </Link>

          <div className="p-3 bg-dark-950 rounded-xl border border-dark-800 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-bold text-white truncate">{adminEmail}</p>
              <p className="text-[10px] text-emerald-400 font-bold">Authorized Admin</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-dark-400 hover:text-rose-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-dark-950 p-4 sm:p-8 overflow-y-auto min-h-[calc(100vh-60px)] md:min-h-screen">
        <Outlet />
      </main>

    </div>
  );
};
