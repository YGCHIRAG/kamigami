import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Truck, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Loader2,
  ExternalLink,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  
  // Lightbox Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editedAddress, setEditedAddress] = useState({});

  const statusMap = {
    PENDING: { label: 'Pending', icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    PAID: { label: 'Paid', icon: CheckCircle2, color: 'text-green-600 bg-green-50 border-green-100' },
    PROCESSING: { label: 'Processing', icon: RefreshCw, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    SHIPPED: { label: 'Shipped', icon: Truck, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    DELIVERED: { label: 'Delivered', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    CANCELLED: { label: 'Cancelled', icon: XCircle, color: 'text-red-600 bg-red-50 border-red-100' },
    FAILED: { label: 'Failed', icon: XCircle, color: 'text-rose-600 bg-rose-50 border-rose-100' },
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/orders');
      // Fix frontend API data-binding unwrapping status: success layer
      setOrders(response.data?.orders || response.orders || []);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const response = await api.get(`/admin/orders/${orderId}`);
      setSelectedOrder(response.data?.order || response.order);
      setIsDetailsModalOpen(true);
    } catch (err) {
      toast.error('Failed to load order details');
    }
  };

  const filteredOrders = orders.filter(o => filter === 'ALL' || o.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders Fulfillment</h1>
          <p className="text-slate-500 text-sm">Monitor sales and manage the delivery lifecycle.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-primary-200">
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
             {['ALL', 'PENDING', 'PAID', 'SHIPPED', 'DELIVERED'].map(s => (
               <button 
                 key={s}
                 onClick={() => setFilter(s)}
                 className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                   filter === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-400'
                 }`}
               >
                 {s}
               </button>
             ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" />
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const status = statusMap[order.status] || { label: order.status, icon: Clock, color: 'bg-slate-100' };
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">#{order.orderNumber}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{order.id.slice(0, 8)}...</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 font-bold text-xs">
                            {(order.user?.firstName || 'C')[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{order.user?.firstName} {order.user?.lastName}</p>
                            <p className="text-[10px] text-slate-500">{order.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        ₹{parseFloat(order.totalAmount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider w-fit ${status.color}`}>
                          <status.icon className="w-3 h-3" />
                          {status.label}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                           <button 
                             onClick={() => handleViewDetails(order.id)}
                             className="p-2 bg-slate-50 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" 
                             title="View Details"
                           >
                             <Eye className="w-4 h-4" />
                           </button>
                           {order.status === 'PAID' && (
                             <button 
                               onClick={() => handleStatusUpdate(order.id, 'SHIPPED')}
                               className="p-2 bg-indigo-50 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all" 
                               title="Mark as Shipped"
                             >
                               <Truck className="w-4 h-4" />
                             </button>
                           )}
                         </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Lightbox Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOrder(null);
        }}
        title={`Order Details - #${selectedOrder?.orderNumber}`}
      >
        {selectedOrder && (
          <div className="space-y-6 text-slate-800 max-h-[75vh] overflow-y-auto pr-1">
            {/* Status & Date */}
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <p className="text-xs text-slate-500 font-semibold">Ordered On</p>
                <p className="text-sm font-bold text-slate-700">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-semibold">Payment Status</p>
                <select
                  value={selectedOrder.status}
                  onChange={async (e) => {
                    const nextStatus = e.target.value;
                    try {
                      await api.put(`/admin/orders/${selectedOrder.id}/status`, { status: nextStatus });
                      toast.success(`Order status set to ${nextStatus}`);
                      setSelectedOrder({ ...selectedOrder, status: nextStatus });
                      fetchOrders();
                    } catch (err) {
                      toast.error('Failed to change status');
                    }
                  }}
                  className="mt-1 text-xs font-bold px-2 py-1.5 rounded border border-slate-200 outline-none bg-white focus:ring-1 focus:ring-primary-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Customer Details</h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <p className="text-sm font-bold text-slate-900">{selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</p>
                <p className="text-xs text-slate-500">Email: {selectedOrder.user?.email}</p>
                {selectedOrder.user?.phoneNumber && (
                  <p className="text-xs text-slate-500">Phone: {selectedOrder.user?.phoneNumber}</p>
                )}
              </div>
            </div>

            {/* Shipping Address (Editable) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Shipping Address</h3>
                <button
                  onClick={() => {
                    if (!isEditingAddress) {
                      setEditedAddress({
                        street_1: selectedOrder.shippingAddress?.street_1 || selectedOrder.shippingAddress?.street1 || '',
                        street_2: selectedOrder.shippingAddress?.street_2 || selectedOrder.shippingAddress?.street2 || '',
                        city: selectedOrder.shippingAddress?.city || '',
                        state_province: selectedOrder.shippingAddress?.state_province || selectedOrder.shippingAddress?.stateProvince || '',
                        postal_code: selectedOrder.shippingAddress?.postal_code || selectedOrder.shippingAddress?.postalCode || '',
                        country: selectedOrder.shippingAddress?.country || 'India',
                        phoneNumber: selectedOrder.shippingAddress?.phoneNumber || ''
                      });
                    }
                    setIsEditingAddress(!isEditingAddress);
                  }}
                  className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline"
                >
                  {isEditingAddress ? 'Cancel Edit' : 'Edit Address'}
                </button>
              </div>

              {isEditingAddress ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Address Line 1</label>
                      <input 
                        type="text" 
                        value={editedAddress.street_1}
                        onChange={(e) => setEditedAddress({ ...editedAddress, street_1: e.target.value })}
                        className="w-full px-2 py-1.5 rounded border border-slate-200 bg-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Address Line 2 (Optional)</label>
                      <input 
                        type="text" 
                        value={editedAddress.street_2}
                        onChange={(e) => setEditedAddress({ ...editedAddress, street_2: e.target.value })}
                        className="w-full px-2 py-1.5 rounded border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">City</label>
                      <input 
                        type="text" 
                        value={editedAddress.city}
                        onChange={(e) => setEditedAddress({ ...editedAddress, city: e.target.value })}
                        className="w-full px-2 py-1.5 rounded border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">State/Province</label>
                      <input 
                        type="text" 
                        value={editedAddress.state_province}
                        onChange={(e) => setEditedAddress({ ...editedAddress, state_province: e.target.value })}
                        className="w-full px-2 py-1.5 rounded border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Postal / Pincode</label>
                      <input 
                        type="text" 
                        value={editedAddress.postal_code}
                        onChange={(e) => setEditedAddress({ ...editedAddress, postal_code: e.target.value })}
                        className="w-full px-2 py-1.5 rounded border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Country</label>
                      <input 
                        type="text" 
                        value={editedAddress.country}
                        onChange={(e) => setEditedAddress({ ...editedAddress, country: e.target.value })}
                        className="w-full px-2 py-1.5 rounded border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={async () => {
                        try {
                          await api.put(`/admin/orders/${selectedOrder.id}/status`, {
                            status: selectedOrder.status,
                            shippingAddress: editedAddress
                          });
                          toast.success('Shipping address updated successfully!');
                          setSelectedOrder({ ...selectedOrder, shippingAddress: editedAddress });
                          setIsEditingAddress(false);
                          fetchOrders();
                        } catch (err) {
                          toast.error('Failed to save address details');
                        }
                      }}
                      className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold py-1.5 px-4 rounded-lg transition-all"
                    >
                      Save Address
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-800">{selectedOrder.shippingAddress?.firstName || selectedOrder.user?.firstName} {selectedOrder.shippingAddress?.lastName || selectedOrder.user?.lastName}</p>
                  <p>{selectedOrder.shippingAddress?.street_1 || selectedOrder.shippingAddress?.street1 || selectedOrder.shippingAddress?.addressLine1}</p>
                  {(selectedOrder.shippingAddress?.street_2 || selectedOrder.shippingAddress?.street2 || selectedOrder.shippingAddress?.addressLine2) && <p>{selectedOrder.shippingAddress?.street_2 || selectedOrder.shippingAddress?.street2 || selectedOrder.shippingAddress?.addressLine2}</p>}
                  <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state_province || selectedOrder.shippingAddress?.stateProvince || selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postal_code || selectedOrder.shippingAddress?.postalCode || selectedOrder.shippingAddress?.pincode}</p>
                  <p>{selectedOrder.shippingAddress?.country}</p>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Line Items</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="p-4 flex justify-between items-center bg-white hover:bg-slate-50/50 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {item.sku}</p>
                      {item.attributes && Object.keys(item.attributes).length > 0 && (
                        <div className="flex gap-2 mt-1">
                          {Object.entries(item.attributes).map(([k, v]) => (
                            <span key={k} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-500">
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">₹{parseFloat(item.priceAtPurchase).toFixed(2)}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-sm font-medium">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>₹{parseFloat(selectedOrder.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span>₹{parseFloat(selectedOrder.shippingAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax</span>
                <span>₹{parseFloat(selectedOrder.taxAmount || 0).toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900 text-base">
                <span>Total Amount</span>
                <span>₹{parseFloat(selectedOrder.totalAmount).toFixed(2)}</span>
              </div>
            </div>

            {/* Tracking / Logistics Setup */}
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl space-y-3">
              <p className="text-xs text-indigo-700 font-bold uppercase tracking-wider">Logistics & Tracking</p>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">AWB / Tracking Code</label>
                  <input 
                    type="text" 
                    placeholder="Enter AWB Code"
                    value={selectedOrder.awbCode || ''}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, awbCode: e.target.value })}
                    className="w-full text-xs font-semibold px-2 py-1.5 rounded border border-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Courier Partner</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Shiprocket, BlueDart"
                    value={selectedOrder.courierName || ''}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, courierName: e.target.value })}
                    className="w-full text-xs font-semibold px-2 py-1.5 rounded border border-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={async () => {
                    try {
                      await api.put(`/admin/orders/${selectedOrder.id}/status`, {
                        status: selectedOrder.status,
                        awbCode: selectedOrder.awbCode,
                        courierName: selectedOrder.courierName
                      });
                      toast.success('Logistics credentials updated!');
                      fetchOrders();
                    } catch (err) {
                      toast.error('Failed to update tracking details');
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1 px-3 rounded transition-all"
                >
                  Save Tracking Info
                </button>
              </div>

              {selectedOrder.awbCode && (
                <div className="border-t border-indigo-200/50 pt-2 flex items-center justify-between">
                  <span className="text-[10px] text-indigo-600 font-bold">Active Track Link:</span>
                  <a 
                    href={`https://shiprocket.co/tracking/${selectedOrder.awbCode}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-primary-600 font-bold hover:underline cursor-pointer"
                  >
                    <span>Verify Live Page</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
