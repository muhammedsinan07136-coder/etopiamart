import React from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, PackageCheck, Truck, Copy, ShoppingBag, ArrowRight } from 'lucide-react';
import { Order } from '../types';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';

export const OrderSuccessPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const order = (location.state as { order?: Order })?.order;

  const handleCopyOrderNumber = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber);
      showToast('Copied to Clipboard', `Order ID ${orderNumber} copied.`, 'info');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Animated Success Header Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl p-8 sm:p-12 border border-dark-100 shadow-elevated text-center space-y-4 relative overflow-hidden"
      >
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
          <CheckCircle2 className="w-10 h-10 animate-bounce" />
        </div>

        <span className="bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded-full">
          Order Placed Successfully!
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-dark-950 tracking-tight">
          Thank You For Your Order!
        </h1>

        <p className="text-xs sm:text-sm text-dark-600 max-w-lg mx-auto leading-relaxed">
          Your order has been recorded. Our fulfillment team is preparing your package for Cash on Delivery dispatch.
        </p>

        {/* Order Number Box */}
        <div className="inline-flex items-center gap-3 bg-dark-50 border border-dark-200 px-5 py-2.5 rounded-2xl text-xs font-bold text-dark-900 mt-2">
          <span>Order ID: <strong className="text-brand-600 font-extrabold">{orderNumber || 'ETP-ORDER'}</strong></span>
          <button
            onClick={handleCopyOrderNumber}
            className="p-1 text-dark-500 hover:text-dark-950 transition-colors"
            title="Copy Order ID"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Order Breakdown */}
      {order && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-dark-100 shadow-subtle grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Customer & Address Details */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm uppercase text-dark-900 border-b border-dark-100 pb-2">
              Delivery Details
            </h3>

            <div className="text-xs space-y-1.5 text-dark-700">
              <p><strong className="text-dark-950">Customer:</strong> {order.customer_name}</p>
              <p><strong className="text-dark-950">Phone:</strong> +91 {order.phone}</p>
              <p><strong className="text-dark-950">Address:</strong> {order.house_name} {order.building_name ? `, ${order.building_name}` : ''}</p>
              <p className="pl-16">{order.address}</p>
              <p className="pl-16">{order.city}, {order.state} - <strong>{order.pincode}</strong></p>
            </div>

            <div className="pt-2">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 font-semibold space-y-1">
                <p className="font-extrabold">💵 Cash on Delivery (COD)</p>
                <p className="text-[11px] text-amber-800">Please keep <strong>₹{order.total}</strong> exact cash ready for payment upon delivery.</p>
              </div>
            </div>
          </div>

          {/* Ordered Products Item List */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm uppercase text-dark-900 border-b border-dark-100 pb-2">
              Ordered Items
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-dark-100">
              {order.items?.map((item, idx) => (
                <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={item.product_image} alt={item.product_name} className="w-10 h-10 object-cover rounded-lg border border-dark-100 shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-dark-900 truncate">{item.product_name}</p>
                      <p className="text-dark-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-dark-950 shrink-0">₹{item.subtotal}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dark-100 pt-3 flex justify-between text-sm font-black text-dark-950">
              <span>Grand Total</span>
              <span className="text-brand-600">₹{order.total}</span>
            </div>
          </div>

        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Button
          variant="gold"
          size="lg"
          rightIcon={<ArrowRight className="w-5 h-5" />}
          onClick={() => navigate('/shop')}
          className="w-full sm:w-auto font-extrabold"
        >
          Continue Shopping
        </Button>
      </div>

    </div>
  );
};
