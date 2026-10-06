import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Truck, ShieldCheck, ChevronRight, PackageCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { totalItems, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-dark-950 text-white text-xs py-2 px-4 border-b border-dark-800 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <Truck className="w-3.5 h-3.5 text-brand-500 animate-pulse" />
            <span>FREE Doorstep Shipping Across All India | Cash on Delivery Available</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-dark-300">
            <Link to="/track-order" className="hover:text-brand-400 flex items-center gap-1 font-bold">
              <PackageCheck className="w-3.5 h-3.5 text-brand-500" />
              Track Your Order Status
            </Link>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Quality Checked
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-md shadow-subtle py-3 border-b border-dark-100'
            : 'bg-white py-4 border-b border-dark-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Left: Mobile Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-dark-800 hover:bg-dark-100 transition-colors"
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="EtopiaMart Logo"
                className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-dark-900 leading-tight">
                  Etopia<span className="text-brand-600 font-black">Mart</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-dark-500 -mt-0.5">
                  Smart Finds. Better Living.
                </span>
              </div>
            </Link>
          </div>

          {/* Center Desktop Links */}
          <nav className="hidden lg:flex items-center gap-7 font-semibold text-sm text-dark-700">
            <LayoutGroup>
              <Link
                to="/"
                className={`hover:text-dark-900 transition-colors relative py-1 ${
                  location.pathname === '/' ? 'text-dark-900 font-bold' : ''
                }`}
              >
                Home
                {location.pathname === '/' && (
                  <motion.div layoutId="nav-underline-home" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
                )}
              </Link>
              <Link
                to="/shop"
                className={`hover:text-dark-900 transition-colors relative py-1 ${
                  location.pathname === '/shop' ? 'text-dark-900 font-bold' : ''
                }`}
              >
                Shop All
                {location.pathname === '/shop' && (
                  <motion.div layoutId="nav-underline-shop" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
                )}
              </Link>
              <Link
                to="/shop?category=gadgets"
                className="hover:text-dark-900 transition-colors py-1"
              >
                Gadgets
              </Link>
              <Link
                to="/shop?category=home-products"
                className="hover:text-dark-900 transition-colors py-1"
              >
                Home & Kitchen
              </Link>
              <Link
                to="/track-order"
                className={`hover:text-dark-900 transition-colors py-1 flex items-center gap-1 font-bold ${
                  location.pathname === '/track-order' ? 'text-brand-600 font-extrabold' : 'text-dark-900'
                }`}
              >
                <PackageCheck className="w-4 h-4 text-brand-600" />
                <span>Track Order</span>
                {location.pathname === '/track-order' && (
                  <motion.div layoutId="nav-underline-track" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
                )}
              </Link>
            </LayoutGroup>
          </nav>

          {/* Right Actions: Search & Cart */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Input on Desktop */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
              <input
                type="text"
                placeholder="Search gadgets, home..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 lg:w-60 bg-dark-50 border border-dark-200 rounded-full pl-9 pr-4 py-1.5 text-xs text-dark-900 focus:outline-none focus:border-dark-900 focus:bg-white focus:w-64 transition-all duration-300"
              />
              <Search className="w-3.5 h-3.5 text-dark-400 absolute left-3 pointer-events-none" />
            </form>

            {/* Mobile Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-2 rounded-xl text-dark-700 hover:bg-dark-100 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart Button with Counter */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-dark-900 hover:bg-black text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all duration-200 active:scale-95"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-brand-400" />
              <span className="hidden sm:inline">Cart</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  className="bg-brand-500 text-dark-950 text-[11px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                >
                  {totalItems}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Search Bar Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white p-4 shadow-elevated border-b border-dark-200"
          >
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-dark-50 border border-dark-300 rounded-xl pl-10 pr-4 py-2 text-sm text-dark-900 focus:outline-none focus:border-dark-900"
                />
                <Search className="w-4 h-4 text-dark-400 absolute left-3.5 top-3" />
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-2 text-dark-500 hover:text-dark-900"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-4/5 max-w-sm h-full bg-white shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="p-5 border-b border-dark-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                    <span className="font-extrabold text-lg">Etopia<span className="text-brand-600">Mart</span></span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-dark-400 hover:text-dark-900 hover:bg-dark-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 space-y-1">
                  <Link
                    to="/track-order"
                    className="flex items-center justify-between py-3 px-3 rounded-xl font-extrabold text-brand-900 bg-brand-50 border border-brand-200 mb-3"
                  >
                    <div className="flex items-center gap-2">
                      <PackageCheck className="w-5 h-5 text-brand-600" />
                      <span>Track Order Status</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-brand-600" />
                  </Link>

                  <Link
                    to="/"
                    className="flex items-center justify-between py-3 px-3 rounded-xl font-semibold text-dark-900 hover:bg-dark-50"
                  >
                    <span>Home</span>
                    <ChevronRight className="w-4 h-4 text-dark-400" />
                  </Link>
                  <Link
                    to="/shop"
                    className="flex items-center justify-between py-3 px-3 rounded-xl font-semibold text-dark-900 hover:bg-dark-50"
                  >
                    <span>Shop All Products</span>
                    <ChevronRight className="w-4 h-4 text-dark-400" />
                  </Link>
                  <Link
                    to="/shop?category=gadgets"
                    className="flex items-center justify-between py-3 px-3 rounded-xl font-medium text-dark-700 hover:bg-dark-50"
                  >
                    <span>Gadgets</span>
                    <ChevronRight className="w-4 h-4 text-dark-400" />
                  </Link>
                  <Link
                    to="/shop?category=home-products"
                    className="flex items-center justify-between py-3 px-3 rounded-xl font-medium text-dark-700 hover:bg-dark-50"
                  >
                    <span>Home Products</span>
                    <ChevronRight className="w-4 h-4 text-dark-400" />
                  </Link>
                  <Link
                    to="/shop?category=useful-products"
                    className="flex items-center justify-between py-3 px-3 rounded-xl font-medium text-dark-700 hover:bg-dark-50"
                  >
                    <span>Useful Everyday Products</span>
                    <ChevronRight className="w-4 h-4 text-dark-400" />
                  </Link>
                </div>
              </div>

              <div className="p-5 border-t border-dark-100 bg-dark-50/50">
                <div className="text-xs text-dark-500 space-y-2">
                  <p className="font-semibold text-dark-800">🚚 All India FREE Delivery</p>
                  <p>Cash on Delivery (COD) available on all orders.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
