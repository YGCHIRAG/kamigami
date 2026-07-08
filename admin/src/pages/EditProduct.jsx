import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Package, Loader2 } from 'lucide-react';
import ProductForm from '../components/ProductForm';
import api from '../services/api';
import toast from 'react-hot-toast';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/admin/products/${id}`);
        const productData = response.data?.data?.product || response.data?.product || response.product;
        setProduct(productData);
      } catch (err) {
        toast.error('Failed to load product details');
        navigate('/products');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleUpdate = async (payload) => {
    setIsSubmitting(true);
    try {
      await api.put(`/admin/products/${id}`, payload);
      toast.success('Product updated successfully');
      navigate('/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Catalog Details</p>
      </div>
    );
  }

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
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Edit Product</h1>
          </div>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 ml-1">Update {product?.name || 'Master Product'}</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-8 lg:p-12">
        <ProductForm 
          isLoading={isSubmitting} 
          initialData={product}
          onSubmit={handleUpdate} 
        />
      </div>
    </div>
  );
};

export default EditProduct;
