import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Package } from 'lucide-react';
import ProductForm from '../components/ProductForm';
import api from '../services/api';
import toast from 'react-hot-toast';

const CreateProduct = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (payload) => {
    setIsLoading(true);
    try {
      await api.post('/admin/products', payload);
      toast.success('Product published successfully');
      navigate('/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/products')}
          className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-slate-900 transition-all shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Package className="w-5 h-5 text-primary-400" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Create New Product</h1>
          </div>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 ml-1">Publish a new master product to your catalog</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-8 lg:p-12">
        <ProductForm 
          isLoading={isLoading} 
          onSubmit={handleCreate} 
        />
      </div>
    </div>
  );
};

export default CreateProduct;
