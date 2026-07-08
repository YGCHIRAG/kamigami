import React, { useState, useEffect } from 'react';
import { Loader2, Layers } from 'lucide-react';

const CategoryForm = ({ onSubmit, isLoading, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true
  });

  // Sync state if initialData changes (e.g., when switching between edit items)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        slug: initialData.slug || '',
        description: initialData.description || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true
      });
    }
  }, [initialData]);

  const slugify = (text) => {
    if (!text) return '';
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // Auto-generate slug from name in real-time
      if (name === 'name') {
        const expectedSlug = slugify(prev.name);
        // Only update if slug was empty or matched the slugify of previous name (so we don't overwrite manual edits)
        if (!prev.slug || prev.slug === expectedSlug) {
          updated.slug = slugify(value);
        }
      }
      
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Category Name</label>
          <input
            type="text"
            name="name"
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-800"
            placeholder="e.g. Streetwear"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-slate-700">Slug</label>
            <span className="text-xs text-slate-400 font-semibold">(Auto-generated if left blank)</span>
          </div>
          <input
            type="text"
            name="slug"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-600"
            placeholder="e.g. streetwear"
            value={formData.slug}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700">Description</label>
        <textarea
          name="description"
          rows="3"
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-800"
          placeholder="What kind of products belong here?"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 cursor-pointer"
          checked={formData.isActive}
          onChange={handleChange}
        />
        <label htmlFor="isActive" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
          Make this category active immediately
        </label>
      </div>

      <div className="pt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Layers className="w-5 h-5" />
              <span>{initialData ? 'Save Changes' : 'Create Category'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
