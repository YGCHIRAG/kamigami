import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Search, 
  ArrowRightLeft, 
  AlertCircle,
  History,
  Loader2,
  RefreshCw,
  Package,
  TrendingUp,
  AlertTriangle,
  Zap,
  Filter,
  LayoutGrid,
  FileText,
  Clock,
  X,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Layers,
  Barcode
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import InventoryAdjustmentModal from '../components/InventoryAdjustmentModal';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); 
  const [expandedProducts, setExpandedProducts] = useState(new Set());
  
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/products?limit=100');
      const data = response.data?.data?.products || response.data?.products || response.products || [];
      
      // Process products to include aggregate stats
      const processed = data.map(p => {
        const variants = p.variants || [];
        const totalStock = variants.reduce((sum, v) => sum + (v.inventory?.stockTotal || 0), 0);
        const availableStock = variants.reduce((sum, v) => sum + (v.inventory?.stockAvailable || 0), 0);
        const hasLowStock = variants.some(v => (v.inventory?.stockAvailable || 0) <= 5 && (v.inventory?.stockAvailable || 0) > 0);
        const hasOutStock = variants.some(v => (v.inventory?.stockAvailable || 0) === 0);
        
        return {
          ...p,
          totalStock,
          availableStock,
          hasLowStock,
          hasOutStock,
          variantCount: variants.length
        };
      });
      
      setProducts(processed);
    } catch (err) {
      toast.error('Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async (variantId, variantContext) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/inventory/logs/${variantId}`);
      const logsData = response.data?.data?.logs || response.data?.logs || response.logs || [];
      setLogs(logsData);
      setSelectedVariant({ ...variantContext, id: variantId });
      setIsLogsModalOpen(true);
    } catch (err) {
      toast.error('Failed to load inventory logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjust = async ({ variantId, amount, reason, isAbsolute }) => {
    setIsSubmitting(true);
    try {
      if (isAbsolute) {
        await api.post('/admin/inventory/set', { variantId, stockTotal: amount });
      } else {
        await api.post('/admin/inventory/update', { variantId, changeAmount: amount, reason });
      }
      toast.success('Inventory synced successfully');
      setIsAdjustModalOpen(false);
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleExpand = (productId) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.variants?.some(v => v.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'low') return matchesSearch && product.hasLowStock;
    if (statusFilter === 'out') return matchesSearch && product.hasOutStock;
    if (statusFilter === 'optimal') return matchesSearch && !product.hasLowStock && !product.hasOutStock;
    
    return matchesSearch;
  });

  const stats = {
    totalItems: products.reduce((acc, curr) => acc + curr.totalStock, 0),
    lowStock: products.filter(p => p.hasLowStock).length,
    outOfStock: products.filter(p => p.hasOutStock).length,
    activeSkus: products.reduce((acc, curr) => acc + curr.variantCount, 0)
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-slate-200">
                 <Boxes className="w-6 h-6 text-primary-400" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">Inventory Control</h1>
           </div>
           <p className="text-slate-500 font-bold max-w-md leading-relaxed">
              Consolidated product warehouse. Manage master catalogs and individual variants in one unified view.
           </p>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={fetchInventory}
             className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm"
           >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
           </button>
           <button 
             className="group bg-slate-900 text-white font-black px-8 py-4 rounded-2xl shadow-2xl shadow-slate-200 transition-all hover:bg-slate-800 flex items-center gap-3"
           >
             <FileText className="w-5 h-5 text-primary-400" />
             <span className="text-xs uppercase tracking-[0.2em]">Generate Report</span>
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Total Stock', value: stats.totalItems, icon: Zap, color: 'text-primary-600', bg: 'bg-primary-50', id: 'all' },
           { label: 'Low Stock Products', value: stats.lowStock, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', id: 'low' },
           { label: 'Out of Stock', value: stats.outOfStock, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', id: 'out' },
           { label: 'Active SKUs', value: stats.activeSkus, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50', id: 'all' }
         ].map((stat, i) => (
           <button 
             key={i} 
             onClick={() => setStatusFilter(stat.id)}
             className={`bg-white p-6 rounded-[2rem] border-2 text-left flex items-center gap-5 transition-all ${statusFilter === stat.id ? 'border-primary-500 shadow-xl' : 'border-slate-100 hover:border-slate-200 shadow-sm'}`}
           >
              <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                 <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                 <p className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{stat.value}</p>
              </div>
           </button>
         ))}
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden relative">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="relative flex-1 w-full max-w-lg">
            <Search className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products or SKUs..."
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] outline-none focus:border-primary-500 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="flex p-1 bg-slate-50 rounded-2xl border border-slate-200">
                {['all', 'low', 'out', 'optimal'].map(f => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === f ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {f}
                  </button>
                ))}
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="w-12 px-8 py-6"></th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Master Product</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Base SKU</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Total Stock</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Variants</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Global Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-32 text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary-500" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Syncing Warehouse Data</p>
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <React.Fragment key={product.id}>
                    {/* Master Row */}
                    <tr className={`group cursor-pointer hover:bg-slate-50/80 transition-all ${expandedProducts.has(product.id) ? 'bg-slate-50/50' : ''}`} onClick={() => toggleExpand(product.id)}>
                      <td className="px-8 py-6">
                        {expandedProducts.has(product.id) ? (
                          <ChevronDown className="w-5 h-5 text-primary-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100 overflow-hidden">
                              {product.imageUrls?.[0] ? (
                                <img src={product.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-6 h-6 text-slate-300" />
                              )}
                           </div>
                           <div>
                              <p className="font-black text-slate-900 tracking-tight leading-none">{product.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5">{product.category?.name || 'Uncategorized'}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                          {product.sku}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-lg font-black text-slate-900">{product.totalStock}</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-sm font-bold text-slate-500">{product.variantCount}</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                          product.hasOutStock ? 'bg-red-50 text-red-600' :
                          product.hasLowStock ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                        }`}>
                           <div className={`w-1.5 h-1.5 rounded-full ${
                             product.hasOutStock ? 'bg-red-600' :
                             product.hasLowStock ? 'bg-orange-600' : 'bg-green-600'
                           } animate-pulse`} />
                           {product.hasOutStock ? 'Critical' : product.hasLowStock ? 'Attention' : 'Optimal'}
                        </span>
                      </td>
                    </tr>

                    {/* Variant Rows */}
                    {expandedProducts.has(product.id) && (
                      product.variants?.map((variant) => (
                        <tr key={variant.id} className="bg-slate-50/30 group/var border-l-4 border-primary-500/20">
                          <td className="px-8 py-4"></td>
                          <td className="px-8 py-4 pl-12">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
                                   {variant.imageUrls?.[0] ? (
                                     <img src={variant.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                                   ) : (
                                     <div className="w-2 h-2 rounded-full bg-slate-300" />
                                   )}
                                </div>
                                <div className="flex gap-1.5">
                                   {Object.entries(variant.attributes || {}).map(([k, v]) => (
                                     <span key={k} className="text-[8px] font-black bg-white text-slate-500 px-2 py-0.5 rounded-full border border-slate-100 uppercase tracking-widest">
                                       {k}: {v}
                                     </span>
                                   ))}
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-4">
                             <div className="flex items-center gap-2">
                                <Barcode className="w-3 h-3 text-slate-300" />
                                <span className="text-[10px] font-mono font-bold text-slate-500">{variant.sku}</span>
                             </div>
                          </td>
                          <td className="px-8 py-4 text-center font-bold text-slate-900">
                             {variant.inventory?.stockTotal || 0}
                          </td>
                          <td className="px-8 py-4 text-center">
                             <div className="flex flex-col items-center">
                                <span className={`text-sm font-black ${(variant.inventory?.stockAvailable || 0) === 0 ? 'text-red-500' : (variant.inventory?.stockAvailable || 0) <= 5 ? 'text-orange-500' : 'text-primary-600'}`}>
                                   {variant.inventory?.stockAvailable || 0} Avail
                                </span>
                             </div>
                          </td>
                          <td className="px-8 py-4 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedVariant({
                                      ...variant,
                                      productName: product.name,
                                      stockTotal: variant.inventory?.stockTotal || 0
                                    });
                                    setIsAdjustModalOpen(true);
                                  }}
                                  className="p-2 bg-white border border-slate-200 text-slate-900 rounded-lg hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                  title="Adjust Stock"
                                >
                                  <ArrowRightLeft className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    fetchLogs(variant.id, {
                                      ...variant,
                                      productName: product.name,
                                      stockTotal: variant.inventory?.stockTotal || 0
                                    });
                                  }}
                                  className="p-2 bg-white border border-slate-200 text-slate-900 rounded-lg hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                  title="View History"
                                >
                                  <History className="w-4 h-4" />
                                </button>
                             </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                     <Boxes className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No inventory records match your criteria</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isAdjustModalOpen} 
        onClose={() => setIsAdjustModalOpen(false)}
        title="Sync Warehouse Data"
        size="medium"
      >
        {selectedVariant && (
          <InventoryAdjustmentModal 
            variant={selectedVariant} 
            isLoading={isSubmitting}
            onAdjust={handleAdjust}
          />
        )}
      </Modal>

      <Modal 
        isOpen={isLogsModalOpen} 
        onClose={() => setIsLogsModalOpen(false)}
        title="Inventory Lifecycle Log"
        size="large"
      >
        <div className="space-y-6">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h4 className="text-2xl font-black text-slate-900 tracking-tighter">{selectedVariant?.productName}</h4>
                 <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">{selectedVariant?.sku}</span>
                    <div className="flex gap-1.5">
                       {Object.entries(selectedVariant?.attributes || {}).map(([k, v]) => (
                         <span key={k} className="text-[8px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-widest">
                           {k}: {v}
                         </span>
                       ))}
                    </div>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Balance</p>
                 <p className="text-3xl font-black text-primary-600 tracking-tighter leading-none mt-1">{selectedVariant?.stockTotal}</p>
              </div>
           </div>

           <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {logs.length > 0 ? logs.map((log, idx) => (
                <div key={log.id || idx} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-primary-200 transition-all">
                   <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                        log.changeAmount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                         {log.changeAmount > 0 ? '+' : ''}{log.changeAmount}
                      </div>
                      <div>
                         <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{log.reason || 'General Adjustment'}</p>
                         <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-2">
                           <Clock className="w-3 h-3" /> {new Date(log.createdAt).toLocaleString()}
                         </p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Performed By</p>
                      <p className="text-xs font-bold text-slate-900 mt-1">{log.user?.firstName || 'System'} {log.user?.lastName || ''}</p>
                   </div>
                </div>
              )) : (
                <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                   <History className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No historical data found for this SKU</p>
                </div>
              )}
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;
