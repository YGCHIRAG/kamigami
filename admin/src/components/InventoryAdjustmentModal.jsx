import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  AlertCircle, 
  Loader2, 
  Zap,
  ArrowRight,
  Hash,
  MessageSquare
} from 'lucide-react';

const InventoryAdjustmentModal = ({ variant, onAdjust, isLoading }) => {
  const [adjustment, setAdjustment] = useState(10);
  const [reason, setReason] = useState('restock');
  const [mode, setMode] = useState('add'); // 'add' or 'subtract' or 'set'

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = parseInt(adjustment);

    if (isNaN(qty) || qty < 0) {
      alert('Quantity cannot be negative');
      return;
    }

    if (mode === 'set' && qty < 0) {
      alert('Cannot set stock to a negative value');
      return;
    }

    if (mode === 'subtract' && qty > variant.stockTotal) {
      alert(`Cannot deduct ${qty} units — only ${variant.stockTotal} in stock`);
      return;
    }

    const amount = mode === 'subtract' ? -Math.abs(qty) : qty;
    onAdjust({
      variantId: variant.id,
      amount,
      reason,
      isAbsolute: mode === 'set'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      {/* Variant Context */}
      <div className="bg-slate-900 rounded-[2rem] p-6 text-white flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
               <Zap className="w-6 h-6 text-primary-400 fill-primary-400" />
            </div>
            <div>
               <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Adjusting SKU</p>
               <h4 className="text-lg font-black tracking-tighter leading-none">{variant.sku}</h4>
               <p className="text-xs text-white/60 mt-1">{variant.productName}</p>
            </div>
         </div>
         <div className="text-right">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Current Stock</p>
            <p className="text-2xl font-black text-primary-400">{variant.stockTotal}</p>
         </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
         {/* Mode Selector */}
         <div className="flex p-1.5 bg-slate-100 rounded-2xl">
            <button 
              type="button"
              onClick={() => setMode('add')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'add' ? 'bg-green-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
            >
               <Plus className="w-4 h-4" /> Add Stock
            </button>
            <button 
              type="button"
              onClick={() => setMode('subtract')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'subtract' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
            >
               <Minus className="w-4 h-4" /> Deduct
            </button>
            <button 
              type="button"
              onClick={() => setMode('set')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'set' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
            >
               <Hash className="w-4 h-4" /> Set Absolute
            </button>
         </div>

         <div className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adjustment Quantity</label>
               <div className="relative">
                  <Hash className="w-5 h-5 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary-500 transition-all font-black text-lg"
                    placeholder="0"
                    value={adjustment}
                    onChange={(e) => {
                       const val = parseInt(e.target.value);
                       if (!isNaN(val) && val < 0) return; // block negative
                       setAdjustment(e.target.value);
                    }}
                  />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adjustment Reason</label>
               <div className="relative">
                  <MessageSquare className="w-5 h-5 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2" />
                  <select
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-slate-700 appearance-none"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  >
                    <option value="restock">Inventory Restock</option>
                    <option value="return">Customer Return</option>
                    <option value="adjustment">Internal Adjustment</option>
                    <option value="damage">Damaged Goods</option>
                    <option value="correction">Correction / Audit</option>
                  </select>
               </div>
            </div>
         </div>

         <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4">
            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-tight leading-relaxed">
               Inventory changes are logged permanently for auditing.
               New expected total: <span className="text-blue-900 font-black">
                 {mode === 'add' ? variant.stockTotal + parseInt(adjustment || 0) : 
                  mode === 'subtract' ? variant.stockTotal - parseInt(adjustment || 0) : 
                  parseInt(adjustment || 0)}
               </span>
            </p>
         </div>

         <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading || !adjustment}
              className="group relative w-full overflow-hidden py-5 bg-slate-900 text-white font-black rounded-3xl shadow-2xl transition-all hover:bg-slate-800 disabled:opacity-50"
            >
              <div className="relative flex items-center justify-center gap-3">
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-primary-400 group-hover:scale-125 transition-transform" />
                    <span className="tracking-widest uppercase text-xs font-black">Commit Stock Change</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-all" />
                  </>
                )}
              </div>
            </button>
         </div>
      </form>
    </div>
  );
};

export default InventoryAdjustmentModal;
