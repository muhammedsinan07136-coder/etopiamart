import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/Button';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    isCartOpen,
    setIsCartOpen,
    subtotal,
    deliveryCharge,
    totalAmount,
    freeShippingThreshold,
  } = useCart();

  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-dark-100 flex items-center justify-between bg-dark-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-dark-900 text-brand-400 rounded-xl">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-dark-900">Your Shopping Cart</h3>
                    <p className="text-xs text-dark-500">{cart.length} unique {cart.length === 1 ? 'item' : 'items'}</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-lg text-dark-400 hover:text-dark-900 hover:bg-dark-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Progress Indicator */}
              <div className="bg-brand-50/60 p-3.5 border-b border-brand-100">
                <div className="flex items-center justify-between text-xs font-semibold text-dark-900 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-brand-700" />
                    <span>
                      {amountToFreeShipping === 0 ? (
                        <strong className="text-emerald-700">🎉 You unlocked FREE All India Delivery!</strong>
                      ) : (
                        <>Add <strong className="text-brand-900">₹{amountToFreeShipping}</strong> more for FREE Shipping</>
                      )}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-brand-200/60 h-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    transition={{ duration: 0.5 }}
                    className="bg-brand-500 h-full rounded-full"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-dark-100">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                    <div className="w-20 h-20 bg-dark-50 rounded-full flex items-center justify-center text-dark-300 mb-4">
                      <ShoppingBag className="w-10 h-10" />
                    </div>
                    <h4 className="font-extrabold text-lg text-dark-900">Your cart is currently empty</h4>
                    <p className="text-xs text-dark-500 mt-1 max-w-xs">
                      Explore our high quality gadgets, home products, and everyday useful items.
                    </p>
                    <Button
                      variant="primary"
                      className="mt-6"
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate('/shop');
                      }}
                    >
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.product.id} className="pt-4 first:pt-0 flex gap-4">
                      {/* Image */}
                      <img
                        src={item.product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-xl border border-dark-100 shrink-0 bg-dark-50"
                      />

                      {/* Info & Quantity */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-bold text-xs text-dark-900 line-clamp-2 leading-snug">
                              {item.product.name}
                            </h5>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-dark-400 hover:text-rose-600 transition-colors p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-extrabold text-sm text-dark-950">₹{item.product.price}</span>
                            {item.product.original_price > item.product.price && (
                              <span className="text-xs text-dark-400 line-through">₹{item.product.original_price}</span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-dark-200 rounded-lg overflow-hidden bg-dark-50">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1 hover:bg-dark-200 text-dark-700 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-bold text-dark-900">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="p-1 hover:bg-dark-200 text-dark-700 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="text-xs font-bold text-dark-800">
                            Subtotal: ₹{item.product.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer Checkout Summary */}
              {cart.length > 0 && (
                <div className="p-5 border-t border-dark-100 bg-white space-y-4 shadow-top">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-dark-600">
                      <span>Bag Subtotal</span>
                      <span className="font-semibold text-dark-900">₹{subtotal}</span>
                    </div>

                    <div className="flex items-center justify-between text-dark-600">
                      <span>Delivery Charge</span>
                      <span>
                        {deliveryCharge === 0 ? (
                          <strong className="text-emerald-600">FREE</strong>
                        ) : (
                          <strong className="text-dark-900">₹{deliveryCharge}</strong>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-dark-600">
                      <span>Payment Method</span>
                      <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                        Cash on Delivery (COD)
                      </span>
                    </div>

                    <div className="pt-2 border-t border-dark-100 flex items-center justify-between text-base font-extrabold text-dark-950">
                      <span>Grand Total</span>
                      <span className="text-lg text-brand-600">₹{totalAmount}</span>
                    </div>
                  </div>

                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full shadow-md"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                    onClick={handleCheckoutClick}
                  >
                    Proceed to COD Checkout
                  </Button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-dark-500 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>No Login Required • Cash Payment on Arrival</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
