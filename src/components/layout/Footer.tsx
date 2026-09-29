import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, Clock, Headphones, CreditCard, Lock, PackageCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-950 text-white pt-16 pb-8 border-t border-dark-900 mt-auto">
      {/* Top Value Indicators */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 pb-12 border-b border-dark-900 grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-dark-900 rounded-xl text-brand-500 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">FREE All India Delivery</h4>
            <p className="text-xs text-dark-400 mt-0.5">Fast doorstep shipping across all pin codes</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-3 bg-dark-900 rounded-xl text-emerald-400 shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Cash on Delivery</h4>
            <p className="text-xs text-dark-400 mt-0.5">Pay in cash when your parcel arrives</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-3 bg-dark-900 rounded-xl text-amber-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Quality Guarantee</h4>
            <p className="text-xs text-dark-400 mt-0.5">Tested & verified everyday useful products</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-3 bg-dark-900 rounded-xl text-blue-400 shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Easy Support</h4>
            <p className="text-xs text-dark-400 mt-0.5">Helpful customer assistance & order tracking</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
        {/* Brand Bio */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="EtopiaMart" className="h-8 w-auto" />
            <span className="font-extrabold text-2xl tracking-tight">Etopia<span className="text-brand-500">Mart</span></span>
          </div>
          <p className="text-xs text-dark-400 leading-relaxed max-w-sm">
            EtopiaMart curates useful everyday problem-solving products, smart home gadgets, lifestyle items, and fashion accessories across India. Quality tested, transparent pricing, and 100% Cash on Delivery.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <span className="bg-dark-900 border border-dark-800 text-brand-400 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              100% Secure Checkout
            </span>
          </div>
        </div>

        {/* Quick Shop Links */}
        <div>
          <h4 className="font-bold text-sm tracking-wider uppercase text-dark-200 mb-4">Shop Categories</h4>
          <ul className="space-y-2.5 text-xs text-dark-400">
            <li><Link to="/shop?category=gadgets" className="hover:text-white transition-colors">Gadgets & Tech</Link></li>
            <li><Link to="/shop?category=home-products" className="hover:text-white transition-colors">Home & Kitchen</Link></li>
            <li><Link to="/shop?category=lifestyle" className="hover:text-white transition-colors">Lifestyle Essentials</Link></li>
            <li><Link to="/shop?category=fashion-accessories" className="hover:text-white transition-colors">Fashion Accessories</Link></li>
            <li><Link to="/shop?category=useful-products" className="hover:text-white transition-colors">Useful Everyday Finds</Link></li>
          </ul>
        </div>

        {/* Customer Help */}
        <div>
          <h4 className="font-bold text-sm tracking-wider uppercase text-dark-200 mb-4">Customer Care</h4>
          <ul className="space-y-2.5 text-xs text-dark-400">
            <li>
              <Link to="/track-order" className="hover:text-brand-400 font-bold text-brand-400 flex items-center gap-1">
                <PackageCheck className="w-3.5 h-3.5" />
                Track Order Status
              </Link>
            </li>
            <li><Link to="/shop" className="hover:text-white transition-colors">Browse Catalog</Link></li>
            <li><a href="#shipping" className="hover:text-white transition-colors">All India Delivery Policy</a></li>
            <li><a href="#cod" className="hover:text-white transition-colors">Cash on Delivery Terms</a></li>
            <li><a href="#support" className="hover:text-white transition-colors">Contact Support</a></li>
          </ul>
        </div>

        {/* Legal Policies */}
        <div>
          <h4 className="font-bold text-sm tracking-wider uppercase text-dark-200 mb-4">Policies</h4>
          <ul className="space-y-2.5 text-xs text-dark-400">
            <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#terms" className="hover:text-white transition-colors">Terms & Conditions</a></li>
            <li><a href="#returns" className="hover:text-white transition-colors">Refund & Return Policy</a></li>
            <li><a href="#shipping-terms" className="hover:text-white transition-colors">Shipping & Delivery Info</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar & Discreet Admin Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-dark-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-dark-500">
        <p>© {new Date().getFullYear()} EtopiaMart. All rights reserved. Smart Finds. Better Living.</p>
        <div className="flex items-center gap-4">
          <span className="text-dark-600">All India FREE Doorstep Shipping</span>
          <span className="text-dark-700">•</span>
          <Link
            to="/admin/login"
            className="text-dark-600 hover:text-dark-300 transition-colors text-[11px]"
            title="Admin Portal Access"
          >
            Admin Access
          </Link>
        </div>
      </div>
    </footer>
  );
};
