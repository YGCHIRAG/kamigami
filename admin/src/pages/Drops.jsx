import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Flame, 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  Tag, 
  ChevronRight,
  Loader2,
  AlertCircle,
  Trash2,
  ArrowUpRight,
  Settings,
  Package,
  LayoutGrid
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const DropCard = ({ drop, onDelete }) => {
  const navigate = useNavigate();
  const statusConfig = {
    SCHEDULED: { color: 'bg-blue-500', label: 'Upcoming', icon: Calendar },
    ACTIVE: { color: 'bg-green-500', label: 'Live Now', icon: Flame },
    ENDED: { color: 'bg-slate-400', label: 'Ended', icon: Clock },
    CANCELLED: { color: 'bg-red-500', label: 'Cancelled', icon: AlertCircle }
  };

  const config = statusConfig[drop.status] || statusConfig.SCHEDULED;

  return (
    <div className="group relative bg-white rounded-[2.5rem] border border-slate-200 p-6 transition-all duration-500 hover:border-primary-300 hover:shadow-2xl hover:shadow-primary-100/50">
      <div className="relative h-48 bg-slate-100 rounded-[1.5rem] overflow-hidden mb-6 shadow-inner">
        {drop.bannerImageUrl ? (
          <img src={drop.bannerImageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900">
            <Flame className="w-12 h-12 text-white/10" />
          </div>
        )}
        
        <div className="absolute top-4 left-4">
           <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.color} text-white shadow-xl`}>
              <config.icon className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">{config.label}</span>
           </div>
        </div>

        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
           <button 
             onClick={() => navigate(`/drops/edit/${drop.id}`)}
             className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl hover:scale-110 transition-transform"
           >
              <Settings className="w-5 h-5" />
           </button>
           <button 
             onClick={(e) => {
               e.stopPropagation();
               onDelete(drop);
             }}
             className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-xl hover:scale-110 transition-transform"
           >
              <Trash2 className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="space-y-4">
         <div className="flex items-start justify-between">
            <div className="flex-1 overflow-hidden">
               <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none group-hover:text-primary-600 transition-colors truncate">
                 {drop.title}
               </h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                 <Tag className="w-3 h-3" /> {drop.dropProducts?.length || 0} Products Allocated
               </p>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Starts</span>
               <span className="text-xs font-black text-slate-900">
                 {drop.startTime ? new Date(drop.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBA'}
               </span>
            </div>
         </div>

         <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button 
              onClick={() => navigate(`/drops/edit/${drop.id}`)}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900 hover:text-primary-600 transition-all"
            >
               Manage Lineup <ArrowUpRight className="w-3 h-3" />
            </button>
            <div className="flex -space-x-2">
               {[1,2,3].map(i => (
                 <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
               ))}
               <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-[8px] font-bold text-white">
                 +{drop.dropProducts?.length || 0}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

const Drops = () => {
  const navigate = useNavigate();
  const [drops, setDrops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDrops = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/drops');
      setDrops(response.data?.data?.drops || response.data?.drops || response.drops || []);
    } catch (err) {
      toast.error('Failed to load drops');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrops();
  }, []);

  const handleDeleteDrop = async (drop) => {
    if (!window.confirm(`Are you sure you want to delete "${drop.title}"? This action is permanent.`)) return;
    try {
      await api.delete(`/admin/drops/${drop.id}`);
      toast.success('Drop deleted successfully');
      fetchDrops();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete drop');
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="relative">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl opacity-50 -z-10" />
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-slate-200">
                   <Flame className="w-6 h-6 text-primary-400" />
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">Limited Drops</h1>
             </div>
             <p className="text-slate-500 font-bold max-w-md leading-relaxed">
                Design and manage high-velocity release events. Orchestrate inventory and curate exclusive collection lineups.
             </p>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
               onClick={fetchDrops}
               className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm"
             >
                <LayoutGrid className="w-5 h-5" />
             </button>
             <button 
               onClick={() => navigate('/drops/create')}
               className="group relative bg-slate-900 text-white font-black px-8 py-4 rounded-2xl shadow-2xl shadow-slate-200 transition-all hover:bg-slate-800 flex items-center gap-3"
             >
               <Plus className="w-5 h-5 text-primary-400 group-hover:rotate-90 transition-transform" />
               <span className="text-xs uppercase tracking-[0.2em]">Create New Event</span>
             </button>
          </div>
        </div>
      </div>

      {isLoading && drops.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Event Registry</p>
        </div>
      ) : drops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-10">
          {drops.map(drop => (
            <DropCard 
              key={drop.id} 
              drop={drop} 
              onDelete={handleDeleteDrop}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-40 bg-white border border-slate-200 rounded-[4rem] shadow-2xl shadow-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-primary-200" />
          <Flame className="w-20 h-20 text-slate-100 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">No Events Found</h2>
          <p className="text-slate-500 font-bold mt-2">Your event registry is currently empty.</p>
          <button 
            onClick={() => navigate('/drops/create')}
            className="mt-8 px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl transition-all hover:scale-105"
          >
            Launch First Drop
          </button>
        </div>
      )}
    </div>
  );
};

export default Drops;
