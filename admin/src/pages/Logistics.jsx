import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Search, 
  ExternalLink, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  Settings, 
  Globe, 
  Plus
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';

const Logistics = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'shipped'
  
  // Manual Fulfillment Modal State
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    courierName: '',
    awbCode: '',
    trackingUrl: '',
    status: 'shipped'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data?.orders || response.orders || []);
    } catch (err) {
      toast.error('Failed to load orders for logistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleShiprocketFulfillment = async (orderId) => {
    const loadingToast = toast.loading('Initiating Shiprocket Shipment & AWB generation...');
    try {
      await api.post('/admin/logistics/create-shipment', { order_id: orderId });
      toast.success('Shipment created and AWB assigned successfully!', { id: loadingToast });
      fetchOrders();
    } catch (err) {
      toast.error(err.message || 'Shiprocket API failed. Try manual fulfillment.', { id: loadingToast });
    }
  };

  const handleManualFulfillmentSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.courierName || !manualForm.awbCode) {
      toast.error('Please enter Courier and AWB/Tracking code');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.put(`/admin/logistics/${selectedOrderId}`, {
        courierName: manualForm.courierName,
        awbCode: manualForm.awbCode,
        trackingUrl: manualForm.trackingUrl || `https://track.courier.com/?awb=${manualForm.awbCode}`,
        status: manualForm.status
      });

      toast.success('Order manually fulfilled successfully!');
      setIsManualModalOpen(false);
      setSelectedOrderId(null);
      setManualForm({ courierName: '', awbCode: '', trackingUrl: '', status: 'shipped' });
      fetchOrders();
    } catch (err) {
      toast.error('Failed to manually fulfill order');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter orders
  // Pending shipment: paid/processing and no awbCode
  const pendingOrders = orders.filter(
    o => (o.status === 'PAID' || o.status === 'PROCESSING') && !o.awbCode
  );

  // Shipped: has awbCode or status is SHIPPED/DELIVERED
  const shippedOrders = orders.filter(
    o => o.awbCode || o.status === 'SHIPPED' || o.status === 'DELIVERED'
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-7 h-7 text-primary-600 animate-pulse" />
            <span>Logistics Dispatch</span>
          </h1>
          <p className="text-slate-500 text-sm">Manage API integrations, Shiprocket pick-ups, and parcel tracking.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-4 px-6 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <span>Awaiting Shipment</span>
          <span className="bg-amber-100 text-amber-700 text-xs font-extrabold px-2 py-0.5 rounded-full">
            {pendingOrders.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('shipped')}
          className={`pb-4 px-6 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'shipped'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <span>Shipped & Transit</span>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-extrabold px-2 py-0.5 rounded-full">
            {shippedOrders.length}
          </span>
        </button>
      </div>

      {/* Listings */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" />
            <p className="text-slate-400 text-xs mt-3 font-semibold">Scanning order databases...</p>
          </div>
        ) : (activeTab === 'pending' ? pendingOrders : shippedOrders).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Recipient</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Destination</th>
                  {activeTab === 'shipped' && (
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tracking</th>
                  )}
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(activeTab === 'pending' ? pendingOrders : shippedOrders).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-all font-medium">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">#{order.orderNumber}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{order.id.slice(0, 8)}...</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{order.shippingAddress?.firstName || order.user?.firstName} {order.shippingAddress?.lastName || order.user?.lastName}</p>
                      <p className="text-[10px] text-slate-500">{order.user?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <p className="font-bold">{order.shippingAddress?.city}, {order.shippingAddress?.country}</p>
                      <p className="truncate max-w-xs text-slate-400">{order.shippingAddress?.street_1}</p>
                    </td>
                    {activeTab === 'shipped' && (
                      <td className="px-6 py-4 text-xs">
                        <p className="font-bold text-slate-950 font-mono">{order.awbCode || 'MANUAL-DISPATCH'}</p>
                        <p className="text-indigo-600 font-semibold mt-0.5">{order.courierName || 'Courier Partner'}</p>
                      </td>
                    )}
                    <td className="px-6 py-4 text-right">
                      {activeTab === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleShiprocketFulfillment(order.id)}
                            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-md shadow-primary-100 flex items-center gap-1.5"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            <span>Shiprocket</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setIsManualModalOpen(true);
                            }}
                            className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold py-2 px-4 rounded-xl text-xs transition-all flex items-center gap-1.5"
                          >
                            <Settings className="w-3.5 h-3.5 text-slate-400" />
                            <span>Fulfill Manually</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          {order.trackingUrl ? (
                            <a
                              href={order.trackingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2 px-4 rounded-xl text-xs transition-all flex items-center gap-1.5 border border-indigo-100"
                            >
                              <span>Track Package</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span>Fulfillment Logged</span>
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 space-y-2">
            <ShieldAlert className="w-12 h-12 mx-auto text-slate-300" />
            <p className="font-semibold text-sm">No shipments in this category</p>
            <p className="text-xs text-slate-400">All order deliveries are completely up to date!</p>
          </div>
        )}
      </div>

      {/* Manual Fulfillment Modal */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => {
          setIsManualModalOpen(false);
          setSelectedOrderId(null);
        }}
        title="Manual Shipment Logging"
      >
        <form onSubmit={handleManualFulfillmentSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">Courier Partner</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-medium text-slate-800"
                placeholder="e.g. DHL Express, FedEx, UPS"
                required
                value={manualForm.courierName}
                onChange={e => setManualForm(prev => ({ ...prev, courierName: e.target.value }))}
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">AWB / Tracking Number</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-medium text-slate-800 font-mono"
                placeholder="e.g. 78492048204"
                required
                value={manualForm.awbCode}
                onChange={e => setManualForm(prev => ({ ...prev, awbCode: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">Tracking Link (Optional)</label>
              <input
                type="url"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-medium text-slate-600 text-xs"
                placeholder="e.g. https://fedex.com/track/..."
                value={manualForm.trackingUrl}
                onChange={e => setManualForm(prev => ({ ...prev, trackingUrl: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">Target Status</label>
              <select
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-bold text-slate-800 text-sm"
                value={manualForm.status}
                onChange={e => setManualForm(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="shipped">Shipped (In Transit)</option>
                <option value="delivered">Delivered (Completed)</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Truck className="w-5 h-5" />
                  <span>Log Manual Shipment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Logistics;
