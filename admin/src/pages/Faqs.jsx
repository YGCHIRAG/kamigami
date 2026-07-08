import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, HelpCircle, Save } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['General', 'Shipping', 'Refunds', 'Drops', 'Products', 'Returns'];

const Faqs = () => {
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  
  const [form, setForm] = useState({ question: '', answer: '', category: 'General' });

  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/faqs');
      setFaqs(res.data || res || []);
    } catch (err) {
      toast.error('Failed to load FAQs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.question || !form.answer) {
      toast.error('Question and answer are required.');
      return;
    }
    try {
      setIsSubmitting(true);
      await api.post('/faqs', form);
      toast.success('FAQ logged successfully!');
      setForm({ question: '', answer: '', category: 'General' });
      fetchFaqs();
    } catch (err) {
      toast.error(err?.message || 'Failed to add FAQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      await api.delete(`/faqs/${id}`);
      toast.success('FAQ deleted');
      fetchFaqs();
    } catch (err) {
      toast.error('Failed to delete FAQ');
    }
  };

  const allCategories = ['All', ...new Set(faqs.map(f => f.category || 'General'))];
  const filtered = activeCategory === 'All' ? faqs : faqs.filter(f => f.category === activeCategory);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">FAQ Management</h1>
        <p className="text-slate-500 text-sm mt-1">Manage frequently asked questions shown on the public FAQ page.</p>
      </div>

      {/* Add FAQ Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary-600" /> Add New FAQ
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Question *"
            value={form.question}
            onChange={(e) => setForm(p => ({ ...p, question: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            required
          />
          <textarea
            placeholder="Answer *"
            value={form.answer}
            onChange={(e) => setForm(p => ({ ...p, answer: e.target.value }))}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
            required
          />
          <div className="flex gap-4 items-center">
            <select
              value={form.category}
              onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
              className="px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-200 disabled:opacity-50 ml-auto"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save FAQ
            </button>
          </div>
        </form>
      </div>

      {/* FAQ List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-800">Published FAQs ({faqs.length})</h2>
          </div>
          {/* Category filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                  activeCategory === cat
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No FAQs found in this category.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((faq) => (
              <div key={faq.id} className="p-5 hover:bg-slate-50/50 transition-all flex gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {faq.category || 'General'}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 mb-1">{faq.question}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{faq.answer}</p>
                </div>
                <button
                  onClick={() => handleDelete(faq.id)}
                  className="self-start p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                  title="Delete FAQ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Faqs;
