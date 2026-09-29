import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Clock, CheckCircle2, Truck, AlertTriangle, IndianRupee, ArrowRight, XCircle } from 'lucide-react';
import { fetchAllAdminProducts, fetchAllOrders } from '../../services/storeService';
import { Product, Order } from '../../types';
import { Badge } from '../../components/ui/Badge';

export const AdminDashboardPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      const [prods, ords] = await Promise.all([
        fetchAllAdminProducts(),
        fetchAllOrders(),
      ]);
      setProducts(prods);
      setOrders(ords);
      setIsLoading(false);
    };

    loadDashboard();
  }, []);

  // Calculate KPIs
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.active).length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const confirmedOrders = orders.filter(o => o.status === 'Confirmed').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;

  const totalCodValue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="space-y-8">
      
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dark-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Dashboard Overview</h1>
          <p className="text-xs text-dark-400 mt-1">Real-time metrics, product status, and order performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="bg-brand-500 hover:bg-brand-600 text-dark-950 font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-all"
          >
            + Manage Products
          </Link>
          <Link
            to="/admin/orders"
            className="bg-dark-800 hover:bg-dark-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all"
          >
            View All Orders
          </Link>
        </div>
      </div>

      {/* Out of Stock Warning Banner */}
      {outOfStockCount > 0 && (
        <div className="bg-rose-950/60 border border-rose-800/80 rounded-2xl p-4 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>
              <strong>Inventory Warning:</strong> {outOfStockCount} {outOfStockCount === 1 ? 'product is' : 'products are'} currently out of stock.
            </span>
          </div>
          <Link to="/admin/products" className="font-bold underline text-white hover:text-rose-300">
            Update Stock →
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total COD Sales Value */}
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-dark-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total COD Value</span>
            <div className="p-2 bg-brand-500/10 text-brand-400 rounded-xl">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-brand-400">₹{totalCodValue.toLocaleString()}</p>
          <p className="text-[11px] text-dark-400">From active non-cancelled orders</p>
        </div>

        {/* Total Orders */}
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-dark-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{totalOrders}</p>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-amber-400 font-bold">{pendingOrders} Pending</span>
            <span className="text-dark-600">•</span>
            <span className="text-emerald-400 font-bold">{deliveredOrders} Delivered</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-dark-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Catalog</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{totalProducts}</p>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-emerald-400 font-bold">{activeProducts} Active</span>
            <span className="text-dark-600">•</span>
            <span className="text-rose-400 font-bold">{outOfStockCount} Out of Stock</span>
          </div>
        </div>

        {/* Pending Action Required */}
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-dark-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Orders</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400">{pendingOrders}</p>
          <p className="text-[11px] text-dark-400">Awaiting dispatch confirmation</p>
        </div>

      </div>

      {/* Recent Orders Section */}
      <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-dark-800 pb-4">
          <h3 className="font-extrabold text-lg text-white">Recent Customer Orders</h3>
          <Link to="/admin/orders" className="text-xs font-bold text-brand-400 hover:underline flex items-center gap-1">
            <span>Manage All Orders</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-dark-400 py-8 text-center">No customer orders recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-dark-400 uppercase tracking-wider border-b border-dark-800">
                  <th className="pb-3 font-bold">Order ID</th>
                  <th className="pb-3 font-bold">Customer Name</th>
                  <th className="pb-3 font-bold">Phone</th>
                  <th className="pb-3 font-bold">City & State</th>
                  <th className="pb-3 font-bold">Total</th>
                  <th className="pb-3 font-bold">Payment</th>
                  <th className="pb-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800/60 text-dark-200">
                {orders.slice(0, 6).map(order => (
                  <tr key={order.id} className="hover:bg-dark-800/40">
                    <td className="py-3.5 font-mono font-bold text-brand-400">{order.order_number}</td>
                    <td className="py-3.5 font-bold text-white">{order.customer_name}</td>
                    <td className="py-3.5 font-mono">+91 {order.phone}</td>
                    <td className="py-3.5">{order.city}, {order.state}</td>
                    <td className="py-3.5 font-bold text-white">₹{order.total}</td>
                    <td className="py-3.5">
                      <span className="bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        COD
                      </span>
                    </td>
                    <td className="py-3.5">
                      <Badge
                        variant={
                          order.status === 'Delivered' ? 'delivered' :
                          order.status === 'Pending' ? 'pending' :
                          order.status === 'Cancelled' ? 'cancelled' : 'confirmed'
                        }
                      >
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
