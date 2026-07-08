import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2,
  Loader2,
  Layers,
  ArrowRight,
  ExternalLink,
  Eye
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import CollectionForm from '../components/CollectionForm';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCollections = async () => {
    setIsLoading(true);
    try {
      // For admin we might want to see all including inactive
      const response = await api.get('/collections'); // In a real app we'd have /admin/collections
      setCollections(response.data?.collections || response.collections || []);
    } catch (err) {
      toast.error('Failed to load collections');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCreateCollection = async (collectionData) => {
    setIsSubmitting(true);
    try {
      await api.post('/admin/collections', collectionData);
      toast.success('Collection created successfully');
      setIsCreateModalOpen(false);
      fetchCollections();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCollection = async (collectionData) => {
    setIsSubmitting(true);
    try {
      await api.put(`/admin/collections/${editingCollection.id}`, collectionData);
      
      // Update products separately if needed by the backend
      // But our CollectionForm sends productIds which we should handle in backend update
      if (collectionData.productIds) {
         await api.post(`/admin/collections/${editingCollection.id}/products`, {
           productIds: collectionData.productIds
         });
      }

      toast.success('Collection updated successfully');
      setIsEditModalOpen(false);
      setEditingCollection(null);
      fetchCollections();
    } catch (err) {
      toast.error('Failed to update collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this collection?')) return;
    try {
      await api.delete(`/admin/collections/${id}`);
      toast.success('Collection deleted successfully');
      fetchCollections();
    } catch (err) {
      toast.error('Failed to delete collection');
    }
  };

  const filteredCollections = collections.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Collections</h1>
          <p className="text-slate-500 text-sm">Curate product groups for your homepage and campaigns.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-primary-200"
        >
          <Plus className="w-5 h-5" />
          <span>New Collection</span>
        </button>
      </div>

      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Collection"
      >
        <CollectionForm onSubmit={handleCreateCollection} isLoading={isSubmitting} />
      </Modal>

      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCollection(null);
        }}
        title="Edit Collection"
      >
        {editingCollection && (
          <CollectionForm 
            onSubmit={handleUpdateCollection} 
            isLoading={isSubmitting} 
            initialData={editingCollection} 
          />
        )}
      </Modal>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search collections..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={fetchCollections}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all border border-slate-200"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Collection</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" />
                  </td>
                </tr>
              ) : filteredCollections.length > 0 ? (
                filteredCollections.map((col) => (
                  <tr key={col.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                          {col.bannerImage ? (
                            <img src={col.bannerImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Layers className="w-5 h-5 text-slate-300" /></div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{col.name}</p>
                          <p className="text-xs text-slate-500 line-clamp-1 max-w-[200px]">{col.description || 'No description'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{col.slug}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                        col.isActive ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {col.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={async () => {
                            setIsLoading(true);
                            try {
                              const response = await api.get(`/collections/${col.slug}`);
                              const data = response.data?.collection || response.collection || response;
                              setEditingCollection(data);
                              setIsEditModalOpen(true);
                            } catch (err) {
                              toast.error('Failed to fetch collection details');
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-primary-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(col.id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    No collections found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Collections;
