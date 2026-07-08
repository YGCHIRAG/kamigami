import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Flame, Loader2, Trash2 } from 'lucide-react';
import DropForm from '../components/DropForm';
import DropProductManager from '../components/DropProductManager';
import api from '../services/api';
import toast from 'react-hot-toast';

const EditDrop = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drop, setDrop] = useState(null);
  const [activeTab, setActiveTab] = useState('products');

  const fetchDropDetails = async () => {
    try {
      // First get the drop to get the slug if ID is used, or use ID directly if it's the slug
      // The admin route usually takes ID
      const response = await api.get(`/admin/drops`); // Need to find the specific drop
      const allDrops = response.data?.data?.drops || response.data?.drops || response.drops || [];
      const foundDrop = allDrops.find(d => d.id === id || d.slug === id);
      
      if (!foundDrop) throw new Error('Drop not found');
      
      // Get full details
      const detailResponse = await api.get(`/drops/${foundDrop.slug}`);
      setDrop(detailResponse.data?.data?.drop || detailResponse.data?.drop || detailResponse);
    } catch (err) {
      toast.error('Failed to load drop details');
      navigate('/drops');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDropDetails();
  }, [id, navigate]);

  const handleUpdate = async (payload) => {
    setIsSubmitting(true);
    try {
      await api.put(`/admin/drops/${drop.id}`, payload);
      toast.success('Drop updated successfully');
      fetchDropDetails(); // Refresh
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update drop');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${drop.title}"? This action is permanent.`)) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/admin/drops/${drop.id}`);
      toast.success('Drop deleted successfully');
      navigate('/drops');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete drop');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Event Registry</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/drops')}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-slate-900 transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Flame className="w-5 h-5 text-primary-400" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Manage Drop</h1>
            </div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 ml-1">Control Event: {drop?.title}</p>
          </div>
        </div>

        <div className="flex p-1 bg-slate-100 rounded-2xl">
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Lineup
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Settings
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-8 lg:p-12">
        {activeTab === 'products' ? (
          <DropProductManager 
            drop={drop} 
            onUpdate={fetchDropDetails} 
          />
        ) : (
          <div className="space-y-12">
            <DropForm 
              initialData={drop} 
              onSubmit={handleUpdate} 
              isLoading={isSubmitting} 
            />
            
            <div className="pt-12 border-t border-slate-100">
               <div className="bg-red-50 rounded-[2.5rem] p-10 border border-red-100 flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div>
                    <h4 className="text-xl font-black text-red-600 tracking-tight">Danger Zone</h4>
                    <p className="text-red-500 text-sm font-bold mt-1 max-w-md">
                      Permanently remove this event and all associated inventory allocations. This action cannot be reversed.
                    </p>
                  </div>
                  <button 
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="px-10 py-5 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-red-200 flex items-center gap-3 shrink-0"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span className="text-[10px] uppercase tracking-[0.2em]">Delete Event</span>
                  </button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditDrop;
