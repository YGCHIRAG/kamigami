import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Package,
  Layers,
  Tag,
  Loader2,
  AlertCircle,
  Eye,
  CheckCircle2,
  Clock,
  ChevronDown,
  Barcode,
  ImageIcon
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedProducts, setExpandedProducts] = useState(new Set());
  
  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/products?page=${page}&limit=10&search=${searchTerm}`);
      const data = response.data?.data || response.data || response;
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, searchTerm]);

  const toggleExpand = (productId) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };



  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await api.delete(`/admin/products/${productToDelete.id}`);
      toast.success('Product deleted successfully');
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                 <Package className="w-5 h-5 text-primary-400" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Product Catalog</h1>
           </div>
           <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 ml-1">Master Inventory Management</p>
        </div>
        
        <button 
          onClick={() => navigate('/products/create')}
          className="bg-slate-900 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-slate-200 transition-all hover:bg-slate-800 flex items-center gap-3"
        >
          <Plus className="w-5 h-5 text-primary-400" />
          <span className="text-xs uppercase tracking-widest">New Product</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search catalog by name, SKU or slug..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-primary-500 transition-all font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
           <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-slate-50 rounded-2xl text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100">
              <Filter className="w-4 h-4" /> Filters
           </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="w-12 px-8 py-6"></th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Details</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Base Price</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading && products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-32 text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary-500" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Accessing Catalog</p>
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <React.Fragment key={product.id}>
                    {/* Master Product Row */}
                    <tr 
                      className={`group cursor-pointer hover:bg-slate-50/80 transition-all ${expandedProducts.has(product.id) ? 'bg-slate-50/50' : ''}`}
                      onClick={() => toggleExpand(product.id)}
                    >
                      <td className="px-8 py-6">
                        {expandedProducts.has(product.id) ? (
                          <ChevronDown className="w-5 h-5 text-primary-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden shadow-sm group-hover:shadow-md transition-all">
                              {product.imageUrls?.[0] ? (
                                <img src={product.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-6 h-6 text-slate-300" />
                              )}
                           </div>
                           <div>
                              <p className="font-black text-slate-900 tracking-tight leading-none text-base">{product.name}</p>
                              <div className="flex items-center gap-3 mt-2">
                                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
                                   {product.sku}
                                 </span>
                                 <span className="text-[9px] font-bold text-primary-500 uppercase tracking-widest flex items-center gap-1">
                                    <Layers className="w-3 h-3" /> {product.variants?.length || 0} Variants
                                 </span>
                              </div>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-tight bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-black text-slate-900 tracking-tighter">₹{product.basePrice}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                          product.status === 'PUBLISHED' ? 'bg-green-50 text-green-600' :
                          product.status === 'DRAFT' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                        }`}>
                           <div className={`w-1.5 h-1.5 rounded-full ${
                             product.status === 'PUBLISHED' ? 'bg-green-600' :
                             product.status === 'DRAFT' ? 'bg-orange-600' : 'bg-red-600'
                           }`} />
                           {product.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               navigate(`/products/edit/${product.id}`);
                             }}
                             className="p-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                           >
                              <Edit2 className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               setProductToDelete(product);
                               setIsDeleteModalOpen(true);
                             }}
                             className="p-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      </td>
                    </tr>

                    {/* Variant Details Expansion */}
                    {expandedProducts.has(product.id) && (
                      <tr className="bg-slate-50/30 border-l-4 border-primary-500/20">
                        <td colSpan="6" className="px-8 py-0">
                           <div className="py-6 pl-12 space-y-4">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Layers className="w-3 h-3" /> SKU Breakdown
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                 {product.variants?.map((variant) => (
                                   <div key={variant.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between group/var hover:border-primary-300 transition-all hover:shadow-lg hover:shadow-slate-200/40">
                                      <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden flex items-center justify-center">
                                            {variant.imageUrls?.[0] ? (
                                              <img src={variant.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                              <ImageIcon className="w-4 h-4 text-slate-200" />
                                            )}
                                         </div>
                                         <div>
                                            <div className="flex items-center gap-2">
                                               {Object.entries(variant.attributes || {}).map(([k, v]) => (
                                                 <span key={k} className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                                   {k}: <span className="text-slate-900">{v}</span>
                                                 </span>
                                               ))}
                                            </div>
                                            <p className="text-[10px] font-mono font-bold text-slate-400 mt-1">{variant.sku}</p>
                                         </div>
                                      </div>
                                      <div className="text-right">
                                         <p className="text-xs font-black text-slate-900 tracking-tight">₹{variant.price}</p>
                                         <p className="text-[9px] font-bold text-primary-500 uppercase mt-0.5">{variant.inventory?.stockTotal || 0} In Stock</p>
                                      </div>
                                   </div>
                                 ))}
                              </div>
                           </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                     <Package className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No products found in catalog</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-8 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>



      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Product?"
        size="small"
      >
        <div className="space-y-6">
           <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-4">
              <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
              <p className="text-xs font-bold text-red-700 uppercase leading-relaxed">
                 You are about to delete <span className="font-black underline">{productToDelete?.name}</span>. This action will permanently remove all variants and inventory logs.
              </p>
           </div>
           <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-900 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                 Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 py-4 bg-red-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-100"
              >
                 Delete Product
              </button>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default Products;
