import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, BookOpen, Save } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({ title: '', summary: '', content: '' });

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/blogs');
      setBlogs(res.data || res || []);
    } catch (err) {
      toast.error('Failed to load blog posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      toast.error('Title and content are required.');
      return;
    }
    try {
      setIsSubmitting(true);
      await api.post('/blogs', form);
      toast.success('Blog post published successfully!');
      setForm({ title: '', summary: '', content: '' });
      fetchBlogs();
    } catch (err) {
      toast.error(err?.message || 'Failed to publish blog post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    try {
      await api.delete(`/blogs/${id}`);
      toast.success('Blog post deleted');
      fetchBlogs();
    } catch (err) {
      toast.error('Failed to delete blog post');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Blog Management</h1>
        <p className="text-slate-500 text-sm mt-1">Publish and manage articles and brand manifestos.</p>
      </div>

      {/* Compose Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary-600" /> Publish New Article
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Article Title *"
            value={form.title}
            onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            required
          />
          <input
            type="text"
            placeholder="Short Summary (optional)"
            value={form.summary}
            onChange={(e) => setForm(p => ({ ...p, summary: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
          <textarea
            placeholder="Article content / body text *"
            value={form.content}
            onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))}
            rows={8}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
            required
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-200 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Publish Article
            </button>
          </div>
        </form>
      </div>

      {/* Published Articles List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-800">Published Articles ({blogs.length})</h2>
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No articles published yet.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Summary</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Published</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {blogs.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-6 py-4 font-bold text-slate-900 max-w-xs">
                    {post.title}
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">/blogs/{post.slug}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 max-w-sm">
                    {post.summary || post.content?.substring(0, 80) + '...'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete Post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Blogs;
