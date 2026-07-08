import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Package, Loader2, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import MediaGalleryModal from './MediaGalleryModal';

const CollectionForm = ({ onSubmit, isLoading, initialData = null }) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    media: initialData?.media?.map(m => m.media) || [],
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    sortOrder: initialData?.sortOrder || 0
  });

  const [selectedProducts, setSelectedProducts] = useState(
    initialData?.products?.map(p => p.product || p) || []
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await api.get(`/admin/products?search=${searchTerm}`);
        const list = response.data?.products || response.products || [];
        setSearchResults(list.filter(p => !selectedProducts.find(sp => sp.id === p.id)));
      } catch (err) {
        console.error('Search failed');
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedProducts]);

  const addProduct = (product) => {
    setSelectedProducts([...selectedProducts, product]);
    setSearchTerm('');
    setSearchResults([]);
  };

  const removeProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast.error('Name and Slug are required');
      return;
    }
    onSubmit({
      ...formData,
      mediaIds: formData.media.map(m => m.id),
      productIds: selectedProducts.map(p => p.id)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Collection Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                setFormData({
                  ...formData,
                  name,
                  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                });
              }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Slug</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Description</label>
            <textarea
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all h-24 resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Sort Order</label>
              <input
                type="number"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
              />
            </div>
            <div className="pt-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded-lg text-primary-600 focus:ring-primary-500 border-slate-300"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span className="text-sm font-bold text-slate-700 group-hover:text-primary-600 transition-colors">Active Collection</span>
              </label>
            </div>
          </div>
        </div>

        {/* Media & Selection */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase">Collection Media</label>
              <button type="button" onClick={() => setIsGalleryOpen(true)} className="text-[10px] font-bold text-primary-600 uppercase tracking-widest hover:text-primary-700">
                Select Media
              </button>
            </div>
            
            {formData.media.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {formData.media.map(item => (
                  <div key={item.id} className="relative aspect-video rounded-xl border border-slate-200 overflow-hidden group">
                    {item.type === 'video' ? (
                      <video src={item.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={item.url} alt="Media" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, media: prev.media.filter(m => m.id !== item.id) }))}
                        className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div onClick={() => setIsGalleryOpen(true)} className="aspect-video w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                <span className="text-xs font-bold text-slate-400">Click to add media</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Selection Section */}
      <div className="pt-6 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-primary-500" />
          Manage Collection Products ({selectedProducts.length})
        </h3>
        
        <div className="relative mb-4">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products to add to collection..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            </div>
          )}
          
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
              {searchResults.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addProduct(p)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-900">{p.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase">{p.sku}</p>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-primary-600" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2">
          {selectedProducts.map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-primary-200 transition-all">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-slate-300" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-bold text-slate-900 truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{p.sku}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeProduct(p.id)}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {selectedProducts.length === 0 && (
            <div className="col-span-full py-10 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-sm text-slate-400">Search and add products to this collection.</p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              <Plus className="w-5 h-5" />
              <span>{initialData ? 'Update Collection' : 'Create Collection'}</span>
            </>
          )}
        </button>
      </div>
      <MediaGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelect={(selected) => setFormData(prev => ({
          ...prev, 
          media: [...prev.media, ...selected.filter(s => !prev.media.find(m => m.id === s.id))]
        }))}
        multiple={true}
      />
    </form>
  );
};

export default CollectionForm;
