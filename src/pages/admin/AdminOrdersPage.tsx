import React, { useState, useEffect } from 'react';
import { Search, Eye, Filter, CheckCircle2, Clock, Truck, Copy, AlertTriangle } from 'lucide-react';
import { fetchAllOrders, updateOrderStatus } from '../../services/storeService';
import { Order, OrderStatus } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Order Detail Modal
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { showToast } = useToast();

  const loadOrders = async () => {
    setIsLoading(true);
    const data = await fetchAllOrders();
    setOrders(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (activeOrder && activeOrder.id === orderId) {
        setActiveOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
      showToast('Status Updated', `Order status changed to ${newStatus}.`, 'success');
    } catch (err: any) {
      showToast('Update Failed', err.message || 'Could not update order status.', 'error');
    }
  };

  const openDetailModal = (order: Order) => {
    setActiveOrder(order);
    setIsDetailOpen(true);
  };

  const copyCustomerAddress = (order: Order) => {
    const fullText = `Order: ${order.order_number}\nCustomer: ${order.customer_name}\nPhone: ${order.phone}\nAddress: ${order.house_name}, ${order.building_name || ''} ${order.address}, ${order.city}, ${order.state} - ${order.pincode}\nTotal COD Amount: ₹${order.total}`;
    navigator.clipboard.writeText(fullText);
    showToast('Copied Address', 'Customer dispatch address copied to clipboard.', 'info');
  };

  const filteredOrders = orders.filter(o => {
    const query = searchQuery.toLowerCase();
    const matchesNumber = o.order_number.toLowerCase().includes(query);
    const matchesName = o.customer_name.toLowerCase().includes(query);
    const matchesPhone = o.phone.includes(query);
    const matchesCity = o.city.toLowerCase().includes(query);
    const matchesStatus = selectedStatus ? o.status === selectedStatus : true;

    return (matchesNumber || matchesName || matchesPhone || matchesCity) && matchesStatus;
  });

  const ALL_STATUSES: OrderStatus[] = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dark-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Order Management</h1>
          <p className="text-xs text-dark-400 mt-1">Track customer Cash on Delivery orders, view addresses, and update fulfillment status.</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Input
            placeholder="Search order ID, name, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-dark-400" />}
            className="bg-dark-950 border-dark-800 text-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-dark-950 border border-dark-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none w-full sm:w-auto"
          >
            <option value="">All Statuses</option>
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="bg-dark-900 border border-dark-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-dark-950 text-dark-400 uppercase tracking-wider border-b border-dark-800">
                <th className="p-4 font-bold">Order ID</th>
                <th className="p-4 font-bold">Customer & Contact</th>
                <th className="p-4 font-bold">Delivery Location</th>
                <th className="p-4 font-bold">Total (COD)</th>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Status Update</th>
                <th className="p-4 font-bold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800/60 text-dark-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-dark-400">Loading orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-dark-400">No customer orders found matching your search.</td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-dark-800/40">
                    {/* Order ID */}
                    <td className="p-4 font-mono font-bold text-brand-400">
                      {order.order_number}
                    </td>

                    {/* Customer */}
                    <td className="p-4">
                      <p className="font-bold text-white">{order.customer_name}</p>
                      <p className="text-[10px] text-dark-400 font-mono">+91 {order.phone}</p>
                    </td>

                    {/* Location */}
                    <td className="p-4 text-dark-300 max-w-xs truncate">
                      <p className="font-semibold text-white truncate">{order.city}, {order.state}</p>
                      <p className="text-[10px] text-dark-400">PIN: {order.pincode}</p>
                    </td>

                    {/* Total */}
                    <td className="p-4">
                      <p className="font-extrabold text-white">₹{order.total}</p>
                      <span className="bg-amber-500/10 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        COD
                      </span>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-dark-400 text-[11px]">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Status Dropdown */}
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className={`text-xs font-bold rounded-xl px-2.5 py-1 focus:outline-none cursor-pointer border ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : order.status === 'Cancelled'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            : order.status === 'Pending'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {ALL_STATUSES.map(st => (
                          <option key={st} value={st} className="bg-dark-900 text-white">{st}</option>
                        ))}
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openDetailModal(order)}
                        className="p-1.5 bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white rounded-lg transition-colors"
                        title="View Order Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={activeOrder ? `Order Details: ${activeOrder.order_number}` : 'Order Detail'}
        maxWidth="xl"
      >
        {activeOrder && (
          <div className="space-y-6 text-dark-900 text-xs">
            
            {/* Customer & Address Card */}
            <div className="bg-dark-50 p-4 rounded-2xl border border-dark-200 space-y-2">
              <div className="flex items-center justify-between border-b border-dark-200 pb-2">
                <span className="font-extrabold uppercase text-dark-900">Customer Dispatch Address</span>
                <button
                  onClick={() => copyCustomerAddress(activeOrder)}
                  className="text-brand-600 hover:text-brand-800 font-bold flex items-center gap-1 text-[11px]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Address</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-dark-700 pt-1">
                <p><strong className="text-dark-950">Name:</strong> {activeOrder.customer_name}</p>
                <p><strong className="text-dark-950">Phone:</strong> +91 {activeOrder.phone}</p>
                <p className="sm:col-span-2">
                  <strong className="text-dark-950">Address:</strong> {activeOrder.house_name} {activeOrder.building_name ? `, ${activeOrder.building_name}` : ''}, {activeOrder.address}
                </p>
                <p><strong className="text-dark-950">City:</strong> {activeOrder.city}</p>
                <p><strong className="text-dark-950">State & Pincode:</strong> {activeOrder.state} - <strong>{activeOrder.pincode}</strong></p>
              </div>
            </div>

            {/* Itemized Products */}
            <div className="space-y-3">
              <h4 className="font-extrabold uppercase text-dark-900 border-b border-dark-100 pb-2">
                Ordered Products ({activeOrder.items?.length || 0})
              </h4>

              <div className="space-y-2 divide-y divide-dark-100">
                {activeOrder.items?.map((item, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={item.product_image} alt={item.product_name} className="w-10 h-10 object-cover rounded-lg border border-dark-200" />
                      <div>
                        <p className="font-bold text-dark-900">{item.product_name}</p>
                        <p className="text-[11px] text-dark-500">Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-dark-950">₹{item.subtotal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-dark-900 text-white p-4 rounded-2xl space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{activeOrder.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge:</span>
                <span>₹{activeOrder.delivery_charge}</span>
              </div>
              <div className="border-t border-dark-800 pt-2 flex justify-between font-extrabold text-sm">
                <span>Total Amount Due (COD):</span>
                <span className="text-brand-400 text-base">₹{activeOrder.total}</span>
              </div>
            </div>

            {/* Close */}
            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>Close</Button>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
};
