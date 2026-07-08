import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Loader2, 
  Zap, 
  Image as ImageIcon, 
  Video as VideoIcon,
  Type,
  Link2,
  Clock,
  ChevronRight,
  AlertCircle,
  Trash2
} from 'lucide-react';
import MediaGalleryModal from './MediaGalleryModal';

const DropForm = ({ onSubmit, isLoading, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    media: initialData?.media?.map(m => m.media) || [],
    startTime: initialData?.startTime ? new Date(initialData.startTime).toISOString().slice(0, 16) : '',
    endTime: initialData?.endTime ? new Date(initialData.endTime).toISOString().slice(0, 16) : '',
    status: initialData?.status || 'SCHEDULED'
  });

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const [previewMedia, setPreviewMedia] = useState('image'); // 'image' or 'video'

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'title' && !initialData) {
      const generatedSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, title: value, slug: generatedSlug }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.startTime || !formData.endTime) return;
    onSubmit({
      ...formData,
      mediaIds: formData.media.map(m => m.id)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Media & Visuals */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <div>
               <h3 className="text-sm font-black text-slate-900">Event Media</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Images & Promos</p>
            </div>
            <button
              type="button"
              onClick={() => setIsGalleryOpen(true)}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
            >
              Select Media
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {formData.media.map(item => (
              <div key={item.id} className="relative aspect-[4/5] bg-slate-100 rounded-3xl overflow-hidden border-2 border-slate-200 group shadow-sm">
                {item.type === 'video' ? (
                  <video src={item.url} className="w-full h-full object-cover" />
                ) : (
                  <img src={item.url} alt="Media" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button
                     type="button"
                     onClick={() => setFormData(prev => ({ ...prev, media: prev.media.filter(m => m.id !== item.id) }))}
                     className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                   >
                     <Trash2 className="w-5 h-5" />
                   </button>
                </div>
              </div>
            ))}
            {formData.media.length === 0 && (
              <div className="col-span-2 aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 p-8 text-center cursor-pointer hover:bg-slate-100" onClick={() => setIsGalleryOpen(true)}>
                <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-xs font-bold text-slate-500">No media selected</p>
                <p className="text-[10px] uppercase tracking-widest mt-1">Click to open gallery</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Event Identity</label>
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative">
                    <Type className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="title"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 transition-all font-bold text-lg"
                      placeholder="Drop Name"
                      value={formData.title}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl w-fit">
                    <span className="text-[10px] font-bold text-slate-400">URL:</span>
                    <span className="text-[10px] font-mono font-bold text-slate-600">/drops/{formData.slug || '...'}</span>
                  </div>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Brief Description</label>
                <textarea
                  name="description"
                  rows="4"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-slate-100 transition-all text-sm font-medium leading-relaxed"
                  placeholder="Tell the story of this collection..."
                  value={formData.description}
                  onChange={handleChange}
                />
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Event Start
                   </label>
                   <input
                     type="datetime-local"
                     name="startTime"
                     required
                     className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-50 transition-all font-bold text-slate-700"
                     value={formData.startTime}
                     onChange={handleChange}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Event Close
                   </label>
                   <input
                     type="datetime-local"
                     name="endTime"
                     required
                     className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-red-50 transition-all font-bold text-slate-700"
                     value={formData.endTime}
                     onChange={handleChange}
                   />
                </div>
             </div>

             {initialData && (
               <div className="space-y-2 p-6 bg-slate-50 rounded-3xl border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lifecycle Status</label>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                      <AlertCircle className="w-3 h-3" /> Overriding state affects live site
                    </span>
                  </div>
                  <select 
                    name="status"
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-50 transition-all font-black text-slate-900"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="SCHEDULED">Scheduled (Ready)</option>
                    <option value="ACTIVE">Force Active (Live Now)</option>
                    <option value="ENDED">Mark as Ended</option>
                    <option value="CANCELLED">Cancel Event</option>
                  </select>
               </div>
             )}
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full overflow-hidden py-5 bg-slate-900 text-white font-black rounded-3xl shadow-2xl shadow-slate-300 transition-all hover:bg-slate-800 disabled:opacity-50"
            >
              <div className="relative flex items-center justify-center gap-3">
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400 group-hover:scale-125 transition-transform" />
                    <span className="tracking-widest uppercase text-xs font-black">
                      {initialData ? 'Finalize Event Changes' : 'Launch New Event'}
                    </span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-all" />
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
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

export default DropForm;
