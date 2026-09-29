import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, PackageCheck, Truck, Clock, CheckCircle2, XCircle, AlertCircle, Copy, ChevronRight, Phone } from 'lucide-react';
import { fetchCustomerOrders, getMyOrderNumbers } from '../services/storeService';
import { Order, OrderStatus } from '../types';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const TrackOrderPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('order') || searchParams.get('phone') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { showToast } = useToast();
  const mySavedOrderNumbers = getMyOrderNumbers();

  const handleSearch = async (queryToSearch: string) => {
    const q = queryToSearch.trim();
    if (!q) {
      showToast('Input Required', 'Please enter your Order ID or 10-digit Phone Number.', 'info');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setSearchQuery(q);

    try {
      const results = await fetchCustomerOrders(q);
      setOrders(results);
      if (results.length === 0) {
        showToast('No Orders Found', 'No orders matching your search were found.', 'info');
      }
    } catch (e: any) {
      showToast('Search Error', e.message || 'Error fetching order details.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialSearch) {
      handleSearch(initialSearch);
    } else if (mySavedOrderNumbers.length > 0) {
      // Auto search for saved orders on current device
      handleSearch(mySavedOrderNumbers[0]);
    }
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied', `"${text}" copied to clipboard.`, 'info');
  };

  // Timeline status steps calculator
  const getTimelineSteps = (status: OrderStatus) => {
    const stages: { label: string; done: boolean; isCurrent: boolean }[] = [
      { label: 'Order Placed (Pending)', done: true, isCurrent: status === 'Pending' },
      { label: 'Confirmed', done: ['Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(status), isCurrent: status === 'Confirmed' },
      { label: 'Packed & Ready', done: ['Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(status), isCurrent: status === 'Packed' },
      { label: 'Shipped', done: ['Shipped', 'Out for Delivery', 'Delivered'].includes(status), isCurrent: status === 'Shipped' },
      { label: 'Out for Delivery', done: ['Out for Delivery', 'Delivered'].includes(status), isCurrent: status === 'Out for Delivery' },
      { label: 'Delivered', done: status === 'Delivered', isCurrent: status === 'Delivered' },
    ];

    return stages;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Title Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-dark-100 shadow-subtle text-center max-w-3xl mx-auto space-y-4">
        <div className="w-16 h-16 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center mx-auto mb-2">
          <Truck className="w-8 h-8" />
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-brand-700 bg-brand-100/80 px-3 py-1 rounded-full">
          Customer Self-Service Order Tracking
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-dark-950 tracking-tight">
          Track Your Order Details & Status
        </h1>
        <p className="text-xs sm:text-sm text-dark-500 max-w-lg mx-auto leading-relaxed">
          Enter your <strong>10-Digit Mobile Number</strong> or <strong>Order ID</strong> (e.g. <code>ETP-2026-94812</code>) to check live status updates (Pending, Confirmed, Shipped, Delivered, Cancelled).
        </p>

        {/* Search Input Form */}
        <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
          <Input
            placeholder="Enter Order ID or Mobile Number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-dark-400" />}
            className="flex-1"
          />
          <Button
            type="submit"
            variant="gold"
            isLoading={isLoading}
            className="font-extrabold shadow-sm shrink-0"
          >
            Track Order
          </Button>
        </form>

        {/* Recent Device Orders Quick Buttons */}
        {mySavedOrderNumbers.length > 0 && (
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-dark-400 font-bold">Your Recent Orders:</span>
            {mySavedOrderNumbers.slice(0, 3).map(num => (
              <button
                key={num}
                onClick={() => handleSearch(num)}
                className="bg-dark-50 hover:bg-dark-100 border border-dark-200 text-dark-800 font-mono font-bold px-3 py-1 rounded-full transition-colors"
              >
                {num}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Display Area */}
      {isLoading ? (
        <div className="p-12 text-center text-dark-500">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500 mx-auto mb-3" />
          <p className="text-xs font-semibold">Searching order database...</p>
        </div>
      ) : hasSearched && orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dark-100 max-w-md mx-auto shadow-subtle space-y-3">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-lg text-dark-900">No Orders Found</h3>
          <p className="text-xs text-dark-500">
            We couldn't find any orders for "<strong>{searchQuery}</strong>". Please check your mobile number or order ID and try again.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => {
            const steps = getTimelineSteps(order.status);
            const isCancelled = order.status === 'Cancelled';

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-dark-100 shadow-subtle space-y-6"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dark-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-extrabold text-brand-600">
                        {order.order_number}
                      </span>
                      <button
                        onClick={() => copyText(order.order_number)}
                        className="p-1 text-dark-400 hover:text-dark-900"
                        title="Copy Order ID"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-dark-500 mt-0.5">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        order.status === 'Delivered' ? 'delivered' :
                        order.status === 'Cancelled' ? 'cancelled' :
                        order.status === 'Pending' ? 'pending' : 'confirmed'
                      }
                      className="px-3.5 py-1 text-xs"
                    >
                      Status: {order.status}
                    </Badge>
                  </div>
                </div>

                {/* Status Timeline Progress Bar */}
                {!isCancelled && (
                  <div className="bg-dark-50/80 p-5 rounded-2xl border border-dark-100 space-y-3">
                    <h4 className="font-extrabold text-xs text-dark-900 uppercase tracking-wider">
                      Fulfillment Status Tracker
                    </h4>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center pt-2">
                      {steps.map((st, i) => (
                        <div key={i} className="flex flex-col items-center space-y-1.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                              st.isCurrent
                                ? 'bg-brand-500 text-dark-950 ring-4 ring-brand-500/20 shadow-md font-extrabold'
                                : st.done
                                ? 'bg-emerald-600 text-white'
                                : 'bg-dark-200 text-dark-500'
                            }`}
                          >
                            {st.done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                          </div>
                          <span className={`text-[10px] font-bold ${st.isCurrent ? 'text-brand-900 font-extrabold' : st.done ? 'text-dark-900' : 'text-dark-400'}`}>
                            {st.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isCancelled && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-rose-900 font-medium">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <div>
                      <p className="font-bold">This order has been cancelled.</p>
                      <p className="text-[11px] text-rose-700">If you have any questions, please contact our customer support team.</p>
                    </div>
                  </div>
                )}

                {/* Order Details & Items Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                  
                  {/* Delivery Info */}
                  <div className="space-y-3 text-xs">
                    <h4 className="font-bold text-dark-900 uppercase border-b border-dark-100 pb-1.5">
                      Delivery Address
                    </h4>
                    <p><strong className="text-dark-950">Name:</strong> {order.customer_name}</p>
                    <p><strong className="text-dark-950">Mobile:</strong> +91 {order.phone}</p>
                    <p><strong className="text-dark-950">Address:</strong> {order.house_name} {order.building_name ? `, ${order.building_name}` : ''}, {order.address}, {order.city}, {order.state} - <strong>{order.pincode}</strong></p>
                    
                    <div className="pt-2">
                      <span className="bg-amber-100 text-amber-900 font-extrabold text-[11px] px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                        💵 Payment Method: Cash on Delivery (COD)
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3 text-xs">
                    <h4 className="font-bold text-dark-900 uppercase border-b border-dark-100 pb-1.5">
                      Items Ordered
                    </h4>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 divide-y divide-dark-100">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img src={item.product_image} alt={item.product_name} className="w-10 h-10 object-cover rounded-lg border border-dark-100 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-dark-900 truncate">{item.product_name}</p>
                              <p className="text-dark-500">Qty: {item.quantity} × ₹{item.price}</p>
                            </div>
                          </div>
                          <span className="font-extrabold text-dark-950">₹{item.subtotal}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-dark-100 pt-3 flex justify-between font-black text-sm text-dark-950">
                      <span>Total COD Payable</span>
                      <span className="text-brand-600 text-base">₹{order.total}</span>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
