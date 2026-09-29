import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, Truck, Zap, ThumbsUp, Clock, CheckCircle2, ChevronRight, Award } from 'lucide-react';
import { fetchCategories, fetchProducts } from '../services/storeService';
import { Category, Product } from '../types';
import { ProductGrid } from '../components/product/ProductGrid';
import { Button } from '../components/ui/Button';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [cats, featured, best, all] = await Promise.all([
        fetchCategories(),
        fetchProducts({ featured: true }),
        fetchProducts({ bestseller: true }),
        fetchProducts(),
      ]);

      setCategories(cats);
      setFeaturedProducts(featured.slice(0, 8));
      setBestsellers(best.slice(0, 6));
      setNewArrivals(all.slice(0, 4));
      setIsLoading(false);
    };

    loadData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-dark-50 via-white to-white pt-8 pb-16 lg:py-20 border-b border-dark-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Content Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 flex flex-col items-start space-y-6 text-left"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-brand-100/80 border border-brand-300/60 px-4 py-1.5 rounded-full text-dark-900 text-xs font-extrabold tracking-wide uppercase shadow-xs">
                <Sparkles className="w-4 h-4 text-brand-700" />
                <span>Smart Everyday Products • All India Delivery</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-dark-950 tracking-tight leading-[1.1]">
                Useful Products. <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-amber-600 bg-clip-text text-transparent">
                  Better Everyday.
                </span>
              </h1>

              {/* Subdescription */}
              <p className="text-base sm:text-lg text-dark-600 max-w-2xl leading-relaxed">
                Discover smart gadgets, home essential items, lifestyle upgrades, and premium accessories. High quality, verified products shipped straight to your doorstep with <strong>Cash on Delivery (COD)</strong> across India.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
                <Button
                  variant="gold"
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  onClick={() => navigate('/shop')}
                  className="w-full sm:w-auto text-base font-extrabold shadow-md"
                >
                  Shop Now
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/shop?category=useful-products')}
                  className="w-full sm:w-auto text-base font-semibold"
                >
                  Explore Useful Products
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-dark-200/60 grid grid-cols-3 gap-6 w-full max-w-md text-xs font-semibold text-dark-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% COD Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>No Account Needed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Fast Shipping</span>
                </div>
              </div>
            </motion.div>

            {/* Right Visual Image Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative Background Card Glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-brand-300 via-amber-200 to-brand-400 rounded-3xl blur-2xl opacity-40 animate-pulse-subtle" />

                {/* Main Visual Image Card */}
                <div className="relative bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-dark-100 space-y-4">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-dark-900 group">
                    <img
                      src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1000&q=80"
                      alt="Featured Tech & Gadgets"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                      <span className="bg-brand-500 text-dark-950 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full w-fit mb-1">
                        Featured Collection
                      </span>
                      <h3 className="text-xl font-extrabold">Next-Gen Daily Gadgets</h3>
                      <p className="text-xs text-dark-200 mt-1">Smart, compact, and designed for modern life.</p>
                    </div>
                  </div>

                  {/* Floating Micro Benefit Card */}
                  <div className="bg-dark-950 text-white rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-dark-800 rounded-xl text-brand-400">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">All India Doorstep Shipping</p>
                        <p className="text-[11px] text-dark-400">Pay cash upon delivery</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full">
                      Free over ₹499
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-950 tracking-tight">
              Explore Categories
            </h2>
            <p className="text-xs sm:text-sm text-dark-500 mt-1">
              Find useful products tailored for every area of your daily routine.
            </p>
          </div>
          <Link
            to="/shop"
            className="hidden sm:flex items-center gap-1 text-xs font-bold text-dark-900 hover:text-brand-600 transition-colors"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <Link
                to={`/shop?category=${cat.slug}`}
                className="group block relative rounded-2xl overflow-hidden bg-white border border-dark-100 shadow-subtle hover:shadow-elevated transition-all duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden bg-dark-50 relative">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>
                <div className="p-4 relative">
                  <h3 className="font-extrabold text-sm text-dark-900 group-hover:text-brand-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-dark-500 mt-0.5 line-clamp-1">
                    {cat.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-dark-900 group-hover:text-brand-600">
                    <span>Browse Collection</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-wider mb-1">
              <Zap className="w-3.5 h-3.5 fill-brand-500 text-brand-500" />
              <span>Handpicked For You</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-950 tracking-tight">
              Featured Everyday Essentials
            </h2>
          </div>
          <Link
            to="/shop"
            className="flex items-center gap-1 text-xs font-bold text-dark-900 hover:text-brand-600 transition-colors"
          >
            <span>See All Products</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <ProductGrid products={featuredProducts} isLoading={isLoading} />
      </section>

      {/* 4. PROMOTIONAL BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-dark-950 text-white overflow-hidden p-8 sm:p-12 border border-dark-900 shadow-2xl">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-500/20 via-brand-500/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="bg-brand-500 text-dark-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              Limited Stock Offers
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Smart Products. <br />Better Everyday Living.
            </h2>
            <p className="text-sm text-dark-300 leading-relaxed">
              Every item in our collection is carefully selected for practical utility, long-lasting build quality, and effortless daily convenience.
            </p>
            <div className="pt-2">
              <Button
                variant="gold"
                size="lg"
                onClick={() => navigate('/shop')}
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="font-extrabold shadow-md"
              >
                Shop All Products Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BEST SELLERS SCROLLABLE SECTION */}
      {bestsellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
                <Award className="w-3.5 h-3.5" />
                <span>Customer Favorites</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-950 tracking-tight">
                Top Bestsellers
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-xs font-bold text-dark-900 hover:text-brand-600 transition-colors"
            >
              View Full Catalog →
            </Link>
          </div>

          <ProductGrid products={bestsellers} isLoading={isLoading} />
        </section>
      )}

      {/* 6. WHY SHOP WITH US TRUST SECTION */}
      <section className="bg-white py-16 border-y border-dark-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-950 tracking-tight">
              Why Shop With EtopiaMart?
            </h2>
            <p className="text-xs sm:text-sm text-dark-500 mt-2">
              We make online shopping simple, reliable, and stress-free for customers across India.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-dark-50 border border-dark-100 flex flex-col items-center space-y-3">
              <div className="p-3 bg-brand-100 text-brand-700 rounded-2xl">
                <Truck className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm text-dark-900">All India Delivery</h4>
              <p className="text-xs text-dark-500">Fast doorstep shipping across all metro & rural pin codes.</p>
            </div>

            <div className="p-6 rounded-2xl bg-dark-50 border border-dark-100 flex flex-col items-center space-y-3">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm text-dark-900">Cash on Delivery</h4>
              <p className="text-xs text-dark-500">Pay in cash when your product arrives. No upfront online payment needed.</p>
            </div>

            <div className="p-6 rounded-2xl bg-dark-50 border border-dark-100 flex flex-col items-center space-y-3">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
                <ThumbsUp className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm text-dark-900">Quality Assured</h4>
              <p className="text-xs text-dark-500">Every product undergoes physical quality checks before packaging.</p>
            </div>

            <div className="p-6 rounded-2xl bg-dark-50 border border-dark-100 flex flex-col items-center space-y-3">
              <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm text-dark-900">No Login Required</h4>
              <p className="text-xs text-dark-500">Instant guest checkout in under 30 seconds without creating accounts.</p>
            </div>

            <div className="p-6 rounded-2xl bg-dark-50 border border-dark-100 flex flex-col items-center space-y-3">
              <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm text-dark-900">Easy Support</h4>
              <p className="text-xs text-dark-500">Responsive customer care and order resolution.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
