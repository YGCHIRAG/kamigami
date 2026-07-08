import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  Package, 
  Layers, 
  Loader2, 
  Zap,
  ArrowRight,
  ChevronLeft,
  X,
  PlusCircle,
  Import,
  Box
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const DropProductManager = ({ drop, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('single'); // 'single' or 'collection'
  const [collections, setCollections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [defaultStock, setDefaultStock] = useState(50);
  
  // Current allocations in the drop
  const [allocations, setAllocations] = useState(
    drop.dropProducts?.map(dp => ({
      productId: dp.productId,
      name: dp.product?.name || 'Unknown Product',
      sku: dp.product?.sku || 'NO-SKU',
      variants: dp.product?.variants || [],
      variantAllocations: dp.variantAllocations || {}
    })) || []
  );

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await api.get('/collections');
        // Handle different possible response structures
        const list = response.data?.data?.collections || response.data?.collections || response.collections || [];
        setCollections(list);
      } catch (err) {
        console.error('Failed to fetch collections');
      }
    };
    fetchCollections();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await api.get(`/admin/products?search=${searchTerm}`);
        const list = response.data?.data?.products || response.data?.products || response.products || [];
        // Filter out already allocated
        setSearchResults(list.filter(p => !allocations.find(a => a.productId === p.id)));
      } catch (err) {
        console.error('Search failed');
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, allocations]);

  const addProduct = (product) => {
    if (allocations.find(a => a.productId === product.id)) return;
    
    // Default allocations: match inventory but cap at 50 if it's too high? 
    // Actually, user wants "automatic match" so let's start with 0 or empty and let them click match.
    const initialAllocations = {};
    product.variants?.forEach(v => {
      initialAllocations[v.id] = 0;
    });

    setAllocations(prev => [...prev, {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      variants: product.variants || [],
      variantAllocations: initialAllocations
    }]);
    setSearchTerm('');
    setSearchResults([]);
  };

  const removeProduct = (productId) => {
    setAllocations(prev => prev.filter(a => a.productId !== productId));
  };

  const updateVariantStock = (productId, variantId, stock, max) => {
    const val = parseInt(stock) || 0;
    if (val > max) {
       toast.error(`Cannot exceed warehouse stock (${max})`);
       return;
    }
    
    setAllocations(prev => prev.map(a => 
      a.productId === productId ? { 
        ...a, 
        variantAllocations: { ...a.variantAllocations, [variantId]: val } 
      } : a
    ));
  };

  const autoMatchInventory = (productId) => {
    setAllocations(prev => prev.map(a => {
      if (a.productId !== productId) return a;
      
      const matched = {};
      a.variants.forEach(v => {
        matched[v.id] = v.inventory?.stockAvailable || 0;
      });
      
      return { ...a, variantAllocations: matched };
    }));
    toast.success('Allocations matched to warehouse stock');
  };

  const fetchCollectionDetails = async (slug) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/collections/${slug}`);
      const collection = response.data?.data?.collection || response.data?.collection || response.collection;
      setSelectedCollection(collection);
    } catch (err) {
      toast.error('Failed to load collection details');
    } finally {
      setIsLoading(false);
    }
  };

  const importCollection = async () => {
    if (!selectedCollection) return;
    setIsLoading(true);
    try {
      await api.post(`/admin/drops/${drop.id}/attach-collection`, { 
        collectionId: selectedCollection.id,
        defaultStock: parseInt(defaultStock) || 50
      });
      toast.success('Collection imported successfully');
      setSelectedCollection(null);
      onUpdate();
    } catch (err) {
      toast.error('Failed to import collection');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await api.post(`/admin/drops/${drop.id}/products`, {
        productAllocations: allocations.map(a => ({
          productId: a.productId,
          variantAllocations: a.variantAllocations
        }))
      });
      toast.success('Drop inventory updated');
      onUpdate();
    } catch (err) {
      toast.error('Failed to update drop products');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 min-h-[400px]">
      {/* Tab Header */}
      <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => { setActiveTab('single'); setSelectedCollection(null); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'single' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Box className="w-4 h-4" />
          Individual Add
        </button>
        <button 
          onClick={() => setActiveTab('collection')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'collection' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Layers className="w-4 h-4" />
          Bulk Collection
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Interface Area */}
        <div className="lg:col-span-7">
          {activeTab === 'single' ? (
            <div className="space-y-6">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products to add to lineup..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 transition-all font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                  </div>
                )}
                
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-200 rounded-3xl shadow-2xl z-50 max-h-80 overflow-y-auto p-2 animate-in slide-in-from-top-2 duration-300">
                    {searchResults.map(p => (
                      <button
                        key={p.id}
                        onClick={() => addProduct(p)}
                        className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition-colors group"
                      >
                        <div className="flex items-center gap-4 text-left">
                          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors">
                            <Package className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{p.name}</p>
                            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter mt-1">{p.sku}</p>
                          </div>
                        </div>
                        <PlusCircle className="w-6 h-6 text-slate-300 group-hover:text-primary-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selection Placeholder */}
              {allocations.length === 0 && (
                <div className="py-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem]">
                   <Box className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                   <p className="text-slate-500 font-bold">Start building your event lineup</p>
                   <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-2">Search for items above</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {!selectedCollection ? (
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex items-center gap-6 mb-2">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                       <Import className="w-8 h-8 text-primary-400" />
                    </div>
                    <div>
                      <h4 className="font-black tracking-tight text-lg">Smart Importer</h4>
                      <p className="text-white/60 text-xs mt-1">Populate this drop instantly with a pre-curated collection.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {collections.length > 0 ? collections.map(col => (
                      <button
                        key={col.id}
                        onClick={() => fetchCollectionDetails(col.slug)}
                        className="group w-full p-5 bg-white border border-slate-200 rounded-3xl flex items-center justify-between hover:border-primary-500 hover:shadow-xl hover:shadow-primary-50/50 transition-all"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-slate-100 rounded-2xl overflow-hidden shadow-inner">
                            {col.bannerImage ? (
                              <img src={col.bannerImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300"><Layers className="w-6 h-6" /></div>
                            )}
                          </div>
                          <div className="text-left">
                            <p className="font-black text-slate-900 tracking-tight">{col.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                                 {col._count?.products || 0} Items
                               </span>
                               <span className="text-[9px] font-mono text-slate-400">/{col.slug}</span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-6 h-6 text-slate-200 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                      </button>
                    )) : (
                      <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                        <Layers className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">No collections available</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white border-2 border-primary-500 rounded-[2.5rem] p-8 space-y-8 animate-in zoom-in-95 duration-300 shadow-2xl shadow-primary-100/50">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setSelectedCollection(null)}
                      className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back to Collections
                    </button>
                    
                    <div className="flex items-center gap-4 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Default Stock:</span>
                       <input 
                         type="number" 
                         value={defaultStock}
                         onChange={(e) => setDefaultStock(e.target.value)}
                         className="w-16 bg-transparent border-none outline-none font-black text-primary-600 text-sm p-0"
                       />
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-slate-100 rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200 shrink-0">
                      <img src={selectedCollection.bannerImage} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{selectedCollection.name}</h3>
                      <p className="text-sm font-medium text-slate-500 mt-2">Ready to inject {selectedCollection.products?.length || 0} items into this lineup.</p>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 pr-4 custom-scrollbar">
                    {selectedCollection.products?.map((cp, idx) => (
                      <div key={cp.id || idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-primary-100 transition-all">
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black text-slate-300">#{(idx + 1).toString().padStart(2, '0')}</span>
                          <span className="text-xs font-black text-slate-700 uppercase tracking-tight group-hover:text-primary-600 transition-colors">
                            {cp.product?.name || cp.name || 'Unknown Item'}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-slate-400 bg-white px-2 py-1 rounded-lg">
                          {cp.product?.sku || cp.sku || 'SKU-000'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={importCollection}
                    disabled={isLoading}
                    className="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-3xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary-200"
                  >
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                      <>
                        <Import className="w-5 h-5" />
                        <span className="text-xs uppercase tracking-[0.2em]">Confirm & Import Lineup</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar: Active Lineup */}
        <div className="lg:col-span-5">
           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white min-h-[400px] flex flex-col shadow-2xl shadow-slate-300">
              <div className="flex items-center justify-between mb-8">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                    <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    Drop Lineup
                 </h4>
                 <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black tracking-widest">{allocations.length} ITEMS</span>
              </div>

              <div className="flex-1 space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar-white">
                 {allocations.map(a => (
                   <div key={a.productId} className="group relative bg-white/5 hover:bg-white/10 rounded-[2rem] p-6 border border-white/5 transition-all">
                      <div className="flex items-center justify-between mb-4">
                         <div className="overflow-hidden">
                            <p className="font-black text-base text-white truncate leading-tight pr-8">{a.name}</p>
                            <p className="text-[10px] font-mono text-white/40 uppercase tracking-tighter mt-1">{a.sku}</p>
                         </div>
                         <button 
                           onClick={() => removeProduct(a.productId)}
                           className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all absolute top-4 right-4"
                         >
                           <X className="w-5 h-5" />
                         </button>
                      </div>

                      {/* Variant Stock Grid */}
                      <div className="space-y-3 mb-6">
                         <div className="flex items-center justify-between px-1">
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Size / Stock</span>
                            <button 
                              onClick={() => autoMatchInventory(a.productId)}
                              className="text-[8px] font-black text-primary-400 hover:text-primary-300 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                            >
                               <Zap className="w-3 h-3" /> Auto-Match Warehouse
                            </button>
                         </div>
                         
                         <div className="grid grid-cols-1 gap-2">
                            {a.variants?.map(v => (
                               <div key={v.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group/row hover:border-white/20 transition-all">
                                  <div className="flex items-center gap-3">
                                     <span className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg text-[10px] font-black text-white group-hover/row:bg-primary-500/20 group-hover/row:text-primary-400 transition-all">
                                        {v.attributes?.size || 'M'}
                                     </span>
                                     <div>
                                        <p className="text-[9px] font-bold text-white/60">{v.attributes?.color || 'Default'}</p>
                                        <p className="text-[8px] font-black text-white/20 uppercase tracking-tighter">WH: {v.inventory?.stockAvailable || 0}</p>
                                     </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                     <input
                                       type="number"
                                       className="w-16 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-right text-xs font-black text-white outline-none focus:border-primary-500/50 transition-all"
                                       value={a.variantAllocations[v.id] || 0}
                                       onChange={(e) => updateVariantStock(a.productId, v.id, e.target.value, v.inventory?.stockAvailable || 0)}
                                     />
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                         <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.1em]">Total Allocated</span>
                         <span className="text-xs font-black text-primary-400">
                            {Object.values(a.variantAllocations).reduce((sum, val) => sum + (parseInt(val) || 0), 0)} Units
                         </span>
                      </div>
                   </div>
                 ))}
                 
                 {allocations.length === 0 && (
                   <div className="flex-1 flex flex-col items-center justify-center py-20 text-white/20">
                      <Layers className="w-12 h-12 mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Lineup is empty</p>
                   </div>
                 )}
              </div>

              <div className="pt-8 mt-4 border-t border-white/10">
                 <button
                   onClick={handleSave}
                   disabled={isLoading || allocations.length === 0}
                   className="group relative w-full py-4 bg-white text-slate-900 font-black rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                 >
                   <div className="flex items-center justify-center gap-3">
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                          <span className="text-[10px] uppercase tracking-[0.2em]">Sync Inventory</span>
                          <Zap className="w-4 h-4 text-primary-600 fill-primary-600 group-hover:scale-125 transition-transform" />
                        </>
                      )}
                   </div>
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DropProductManager;
