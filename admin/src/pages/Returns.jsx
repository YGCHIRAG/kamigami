import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw, Check, X, Eye } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';

const statusConfig = {
  PENDING:   { label: 'Pending',   color: 'text-amber-600 bg-amber-50 border-amber-100' },
  APPROVED:  { label: 'Approved',  color: 'text-green-600 bg-green-50 border-green-100' },
  REJECTED:  { label: 'Rejected',  color: 'text-red-600 bg-red-50 border-red-100' },
  COMPLETED: { label: 'Completed', color: 'text-blue-600 bg-blue-50 border-blue-100' },
};

const Returns = () => {
  const [returns, setReturns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReturns = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/returns/admin');
      setReturns(res.data || res || []);
    } catch (err) {
      toast.error('Failed to load return requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/returns/admin/${id}`, { status });
      toast.success(`Return request marked as ${status}`);
      fetchReturns();
      if (isModalOpen) setIsModalOpen(false);
    } catch (err) {
      toast.error('Failed to update return status');
    }
  };

  const filtered = filter === 'ALL' ? returns : returns.filter(r => r.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Return Requests</h1>
          <p className="text-slate-500 text-sm mt-1">Review and process customer return and exchange claims.</p>
        </div>
        <button
          onClick={fetchReturns}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex gap-3 flex-wrap">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  filter === s
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary-400'
                }`}
              >
                {s}
                {s !== 'ALL' && (
                  <span className="ml-1 opacity-70">({returns.filter(r => r.status === s).length})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <RefreshCw className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No return requests in this category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order #</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Items Claimed</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((req) => {
                  const statusInfo = statusConfig[req.status] || statusConfig.PENDING;
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        #{req.order?.orderNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">{req.user?.firstName} {req.user?.lastName}</p>
                        <p className="text-xs text-slate-400">{req.user?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        {Array.isArray(req.items) && req.items.map((item, i) => (
                          <div key={i} className="text-xs text-slate-600 flex gap-2">
                            <span className="font-semibold">{item.name || item.sku}</span>
                            <span className="text-slate-400">×{item.quantity}</span>
                          </div>
                        ))}
                      </td>
                      <td className="px-6 py-4 max-w-[180px]">
                        <p className="text-xs text-slate-500 line-clamp-2">{req.reason}</p>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setSelectedReturn(req); setIsModalOpen(true); }}
                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {req.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                                className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-all"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedReturn(null); }}
        title={`Return Request — Order #${selectedReturn?.order?.orderNumber}`}
      >
        {selectedReturn && (
          <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
            <div className="flex gap-3 items-center">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${statusConfig[selectedReturn.status]?.color}`}>
                {selectedReturn.status}
              </span>
              <span className="text-xs text-slate-500">{new Date(selectedReturn.createdAt).toLocaleString()}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</p>
              <p className="text-sm font-bold text-slate-900">{selectedReturn.user?.firstName} {selectedReturn.user?.lastName}</p>
              <p className="text-xs text-slate-500">{selectedReturn.user?.email}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reason for Return</p>
              <p className="text-sm text-slate-700 leading-relaxed">{selectedReturn.reason}</p>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Requested Items</p>
              </div>
              {Array.isArray(selectedReturn.items) && selectedReturn.items.map((item, i) => (
                <div key={i} className="px-4 py-3 flex justify-between border-t border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.name || 'Item'}</p>
                    <p className="text-xs text-slate-400 font-mono">SKU: {item.sku || 'N/A'}</p>
                  </div>
                  <p className="text-sm font-bold text-slate-600">Qty: {item.quantity}</p>
                </div>
              ))}
            </div>

            {selectedReturn.status === 'PENDING' && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleUpdateStatus(selectedReturn.id, 'APPROVED')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all"
                >
                  <Check className="w-4 h-4" /> Approve Return
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedReturn.id, 'REJECTED')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all"
                >
                  <X className="w-4 h-4" /> Reject Return
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Returns;
