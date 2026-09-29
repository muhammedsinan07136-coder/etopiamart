import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, CreditCard, Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { createOrder } from '../services/storeService';
import { INDIAN_STATES } from '../data/mockData';
import { CheckoutFormData } from '../types';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const CheckoutPage: React.FC = () => {
  const { cart, subtotal, deliveryCharge, totalAmount, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CheckoutFormData>({
    customer_name: '',
    phone: '',
    house_name: '',
    building_name: '',
    address: '',
    pincode: '',
    city: '',
    state: 'Karnataka',
  });

  const handleChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      errs.customer_name = 'Full name is required';
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      errs.phone = 'Please enter a valid 10-digit Indian mobile number';
    }

    if (!formData.house_name.trim()) {
      errs.house_name = 'House / Flat number is required';
    }

    if (!formData.address.trim()) {
      errs.address = 'Street / Area address is required';
    }

    const cleanPincode = formData.pincode.replace(/\D/g, '');
    if (!cleanPincode || cleanPincode.length !== 6) {
      errs.pincode = 'Please enter a valid 6-digit Indian Pincode';
    }

    if (!formData.city.trim()) {
      errs.city = 'City name is required';
    }

    if (!formData.state) {
      errs.state = 'Please select a state';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      showToast('Cart Empty', 'Your shopping cart is empty.', 'error');
      navigate('/shop');
      return;
    }

    if (!validateForm()) {
      showToast('Validation Error', 'Please correct the highlighted form errors.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const createdOrder = await createOrder(formData, cart, subtotal, deliveryCharge);
      clearCart();
      showToast('Order Placed Successfully!', `Order ${createdOrder.order_number} has been recorded.`, 'success');
      navigate(`/order-success/${createdOrder.order_number}`, { state: { order: createdOrder } });
    } catch (error: any) {
      showToast('Order Failed', error.message || 'Failed to place order. Please try again.', 'error');
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-extrabold text-dark-950">Your Cart is Empty</h2>
        <p className="text-xs text-dark-500">Add products to your cart before proceeding to checkout.</p>
        <Button variant="primary" onClick={() => navigate('/shop')}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-dark-100 pb-4">
        <Link to="/shop" className="flex items-center gap-2 text-xs font-bold text-dark-700 hover:text-dark-950">
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <Lock className="w-3.5 h-3.5" />
          <span>Account-Free 100% Cash on Delivery</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Delivery Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-dark-100 shadow-subtle space-y-6">
          
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600 bg-brand-100 px-2.5 py-0.5 rounded-full">
              No Account Required
            </span>
            <h1 className="text-2xl font-extrabold text-dark-950 mt-1">Delivery Address & Customer Info</h1>
            <p className="text-xs text-dark-500">Please enter your shipping address to confirm your COD order.</p>
          </div>

          <form onSubmit={handleSubmitOrder} className="space-y-6">
            
            {/* Customer Contact */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-dark-900 uppercase tracking-wide border-b border-dark-100 pb-2">
                1. Contact Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="e.g. Aarav Sharma"
                  required
                  value={formData.customer_name}
                  onChange={(e) => handleChange('customer_name', e.target.value)}
                  error={errors.customer_name}
                />

                <Input
                  label="10-Digit Mobile Number"
                  placeholder="e.g. 9876543210"
                  type="tel"
                  maxLength={10}
                  required
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  error={errors.phone}
                />
              </div>
            </div>

            {/* Address Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-dark-900 uppercase tracking-wide border-b border-dark-100 pb-2">
                2. Delivery Address (All India)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="House / Flat / Door No."
                  placeholder="e.g. Flat 402, Building A"
                  required
                  value={formData.house_name}
                  onChange={(e) => handleChange('house_name', e.target.value)}
                  error={errors.house_name}
                />

                <Input
                  label="Apartment / Building Name (Optional)"
                  placeholder="e.g. Green Valley Towers"
                  value={formData.building_name}
                  onChange={(e) => handleChange('building_name', e.target.value)}
                />
              </div>

              <Input
                label="Street / Area / Landmark"
                placeholder="e.g. 10th Main Road, Near Central Bank, Indiranagar"
                required
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                error={errors.address}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="6-Digit Pincode"
                  placeholder="e.g. 560038"
                  maxLength={6}
                  required
                  value={formData.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  error={errors.pincode}
                />

                <Input
                  label="City / Town"
                  placeholder="e.g. Bengaluru"
                  required
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  error={errors.city}
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-dark-800 tracking-wide uppercase">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full bg-white border border-dark-200 rounded-xl px-4 py-2.5 text-sm text-dark-900 focus:outline-none focus:border-dark-900"
                  >
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Method Section (COD ONLY) */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-dark-900 uppercase tracking-wide border-b border-dark-100 pb-2">
                3. Payment Selection
              </h3>

              <div className="p-4 rounded-2xl border-2 border-brand-500 bg-brand-50/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-brand-500 text-dark-950 rounded-xl font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-dark-950">Cash on Delivery (COD)</h4>
                      <span className="bg-amber-100 text-amber-900 font-black text-[10px] uppercase px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    </div>
                    <p className="text-xs text-dark-600 mt-0.5">Pay in cash directly to the delivery executive when package arrives.</p>
                  </div>
                </div>
                <CheckCircle2 className="w-6 h-6 text-brand-600 shrink-0" />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="gold"
              size="lg"
              isLoading={isSubmitting}
              className="w-full text-base font-extrabold shadow-md py-4 mt-6"
            >
              Place Cash on Delivery Order (₹{totalAmount})
            </Button>
          </form>

        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6 sticky top-24">
          <div className="bg-white rounded-3xl p-6 border border-dark-100 shadow-subtle space-y-4">
            <h3 className="font-extrabold text-lg text-dark-950 border-b border-dark-100 pb-3">
              Order Summary ({cart.reduce((sum, i) => sum + i.quantity, 0)} Items)
            </h3>

            {/* Cart Items List */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 divide-y divide-dark-100">
              {cart.map(item => (
                <div key={item.product.id} className="pt-3 first:pt-0 flex items-center gap-3">
                  <img
                    src={item.product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80'}
                    alt={item.product.name}
                    className="w-14 h-14 object-cover rounded-xl border border-dark-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs text-dark-900 truncate">{item.product.name}</h5>
                    <p className="text-xs text-dark-500 mt-0.5">Qty: {item.quantity} × ₹{item.product.price}</p>
                  </div>
                  <span className="font-extrabold text-xs text-dark-950">₹{item.product.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-dark-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-dark-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-dark-900">₹{subtotal}</span>
              </div>

              <div className="flex justify-between text-dark-600">
                <span>Delivery Charge</span>
                <span>
                  {deliveryCharge === 0 ? (
                    <strong className="text-emerald-600">FREE</strong>
                  ) : (
                    <strong className="text-dark-900">₹{deliveryCharge}</strong>
                  )}
                </span>
              </div>

              <div className="flex justify-between text-dark-600">
                <span>Payment Method</span>
                <span className="font-bold text-amber-800">Cash on Delivery</span>
              </div>

              <div className="border-t border-dark-100 pt-3 flex justify-between text-base font-black text-dark-950">
                <span>Total Amount Due</span>
                <span className="text-xl text-brand-600">₹{totalAmount}</span>
              </div>
            </div>

            <div className="bg-dark-50 p-3 rounded-xl flex items-center gap-2 text-[11px] text-dark-600 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Safe & Secure Packaging • Guaranteed COD Dispatch</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
