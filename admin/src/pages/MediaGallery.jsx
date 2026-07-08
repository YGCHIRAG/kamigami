import React, { useState, useEffect, useRef } from 'react';
import { Upload, Search, Loader2, Image as ImageIcon, Video, Trash2, Copy, Eye, Plus, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const MediaGallery = () => {
  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const [editOriginalName, setEditOriginalName] = useState('');
  const [editAltText, setEditAltText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'image', 'video'

  useEffect(() => {
    if (previewImage) {
      setEditOriginalName(previewImage.originalName || '');
      setEditAltText(previewImage.altText || '');
    }
  }, [previewImage]);


  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const isFirstMount = useRef(true);

  const fetchMedia = async (pageNumber = 1, append = false) => {
    if (pageNumber === 1) {
      setIsLoading(true);
    } else {
      setIsFetchingMore(true);
    }
    try {
      const res = await api.get('/admin/media', {
        params: { 
          limit: 30, 
          page: pageNumber, 
          search: searchTerm,
          type: activeTab === 'all' ? undefined : activeTab
        }
      });
      const newItems = res.data || [];
      setMedia(prev => append ? [...prev, ...newItems] : newItems);
      
      if (res.meta) {
        setTotalPages(res.meta.totalPages || 1);
      }
      setPage(pageNumber);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load media assets');
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchMedia(1, false);
  }, [activeTab]);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      fetchMedia(1, false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadMore = () => {
    if (page < totalPages && !isFetchingMore) {
      fetchMedia(page + 1, true);
    }
  };

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let videosCount = 0;
    let imagesCount = 0;

    try {
      // Process files: Upload videos to the compression endpoint individually; upload images in batch
      const imageFiles = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('video/')) {
          videosCount++;
          const videoToast = toast.loading(`Compressing & Uploading Video: "${file.name}"... This may take a moment.`);
          
          const formData = new FormData();
          formData.append('file', file);
          formData.append('folder', 'gallery');

          try {
            await api.post('/admin/media/upload/video', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success(`Video "${file.name}" compressed and uploaded!`, { id: videoToast });
          } catch (err) {
            console.error(err);
            toast.error(`Failed to upload video "${file.name}": ${err.message || 'Error'}`, { id: videoToast });
          }
        } else {
          imageFiles.push(file);
        }
      }

      if (imageFiles.length > 0) {
        imagesCount = imageFiles.length;
        const formData = new FormData();
        for (let i = 0; i < imageFiles.length; i++) {
          formData.append('files', imageFiles[i]);
        }
        formData.append('folder', 'gallery');
        await api.post('/admin/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success(`Uploaded ${imagesCount} image(s) successfully`);
      }

      fetchMedia();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Failed to upload media assets');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this media asset? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/media/${id}`);
      toast.success('Media asset deleted');
      fetchMedia();
    } catch (err) {
      toast.error('Failed to delete media asset');
    }
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      const res = await api.put(`/admin/media/${previewImage.id}`, {
        originalName: editOriginalName,
        altText: editAltText
      });
      toast.success('Media details updated successfully');
      // Update local state to reflect changes instantly without full reload
      setMedia(prev => prev.map(item => item.id === previewImage.id ? res.data : item));
      setPreviewImage(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update media details');
    } finally {
      setIsSaving(false);
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('Asset URL copied to clipboard');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Media & Asset Sanctum</h1>
          <p className="text-sm text-slate-500 mt-1">Upload, search, copy URLs, and organize all digital assets for the storefront and drops.</p>
        </div>
        
        <div>
          <input
            type="file"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={handleUpload}
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full sm:w-auto px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 active:scale-[0.98]"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload Assets</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Toolbar / Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search assets by file name or alternative tags..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 gap-6 pt-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 text-xs font-black uppercase tracking-wider transition-all relative ${activeTab === 'all' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            All Assets
            {activeTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full animate-in fade-in" />}
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`pb-3 text-xs font-black uppercase tracking-wider transition-all relative ${activeTab === 'image' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Images
            {activeTab === 'image' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full animate-in fade-in" />}
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`pb-3 text-xs font-black uppercase tracking-wider transition-all relative ${activeTab === 'video' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Videos
            {activeTab === 'video' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full animate-in fade-in" />}
          </button>
        </div>
      </div>

      {/* Grid Display */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-200 min-h-[40vh] flex items-center justify-center shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Unlocking asset vaults...</span>
          </div>
        </div>
      ) : media.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 min-h-[40vh] flex flex-col items-center justify-center text-slate-400 space-y-4 shadow-sm p-6">
          {activeTab === 'video' ? (
            <Video className="w-16 h-16 opacity-20 text-slate-500 animate-pulse" />
          ) : (
            <ImageIcon className="w-16 h-16 opacity-20 text-slate-500" />
          )}
          <div className="text-center space-y-1">
            <p className="text-base font-bold text-slate-700">
              No {activeTab === 'all' ? 'media' : activeTab === 'image' ? 'images' : 'videos'} found
            </p>
            <p className="text-xs text-slate-400 max-w-xs">
              {activeTab === 'video' 
                ? 'Upload new MP4 or WEBM files to showcase motion assets on your product and banner collections.'
                : 'Upload new JPG, PNG, WEBP, or GIF files to start building your digital storefront archives.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {media.map((item) => (
              <div
                key={item.id}
                onClick={() => setPreviewImage(item)}
                className="group relative aspect-square rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm hover:shadow-md hover:border-slate-300 cursor-pointer transition-all duration-200"
              >
                {item.type === 'video' ? (
                  <div className="relative w-full h-full bg-slate-950">
                    <video src={item.url} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 bg-slate-900/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/20 shadow-lg">
                        <Video className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img src={item.url} alt={item.altText || item.fileName} loading="lazy" className="w-full h-full object-cover" />
                )}

                {/* Hover Actions Panel */}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col justify-between p-3">
                  {/* Top: Metadata */}
                  <div className="flex items-start justify-between">
                    <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-black uppercase rounded-md tracking-wider flex items-center gap-1">
                      {item.type === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                      {item.type}
                    </span>
                  </div>

                  {/* Bottom: Action Buttons */}
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreviewImage(item); }}
                      className="p-2 bg-slate-900/85 hover:bg-slate-800 text-white rounded-lg transition-all"
                      title="Preview Media"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); copyUrl(item.url); }}
                      className="p-2 bg-slate-900/85 hover:bg-slate-800 text-white rounded-lg transition-all"
                      title="Copy URL Address"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      className="p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg transition-all"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {page < totalPages && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={isFetchingMore}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
              >
                {isFetchingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                    <span>Loading more assets...</span>
                  </>
                ) : (
                  <span>Load More Assets</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Side-by-side Preview & Edit Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm" onClick={() => setPreviewImage(null)} />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-5xl h-[85vh] md:h-[75vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-200 z-10">
            {/* General Close Button (for mobile/all) */}
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 md:right-auto md:left-4 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition z-20 shadow-md animate-bounce-subtle"
            >
              <ArrowLeft className="w-4 h-4 transform md:rotate-0 rotate-180" />
            </button>

            {/* Left Column: Media Preview */}
            <div className="flex-1 bg-slate-950 flex items-center justify-center p-6 relative min-h-[45vh] md:min-h-0">
              {previewImage.type === 'video' ? (
                <video src={previewImage.url} controls className="max-w-full max-h-[65vh] object-contain rounded-xl" autoPlay />
              ) : (
                <img src={previewImage.url} alt="Preview" className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-lg" />
              )}
            </div>

            {/* Right Column: Details & Rename Edit Panel */}
            <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col h-full bg-white p-6 overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Asset Settings</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Edit information & metadata</p>
              </div>

              {/* Form fields */}
              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    File Name (Searchable)
                  </label>
                  <input
                    type="text"
                    value={editOriginalName}
                    onChange={(e) => setEditOriginalName(e.target.value)}
                    placeholder="Enter file name..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Alternative Text (Alt Tags)
                  </label>
                  <textarea
                    rows={3}
                    value={editAltText}
                    onChange={(e) => setEditAltText(e.target.value)}
                    placeholder="Describe this asset for accessibility and SEO..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-slate-800 resize-none font-semibold"
                  />
                </div>

                {/* Read-only asset details */}
                <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 text-xs font-semibold">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">S3 Object Key</span>
                    <span className="font-mono text-slate-600 truncate max-w-[180px]" title={previewImage.storageKey}>
                      {previewImage.storageKey}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">MIME Type</span>
                    <span className="font-medium text-slate-600">{previewImage.mimeType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">File Size</span>
                    <span className="font-medium text-slate-600">
                      {(previewImage.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Created At</span>
                    <span className="font-medium text-slate-600">
                      {new Date(previewImage.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                <button
                  onClick={handleUpdate}
                  disabled={isSaving}
                  className="w-full py-3 bg-primary-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save Changes
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => copyUrl(previewImage.url)}
                    className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy URL
                  </button>
                  <button
                    onClick={() => {
                      const confirmDel = window.confirm('Are you sure you want to delete this media?');
                      if (confirmDel) {
                        handleDelete(previewImage.id);
                        setPreviewImage(null);
                      }
                    }}
                    className="py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
