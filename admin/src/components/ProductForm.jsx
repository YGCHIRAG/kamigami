import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Loader2,
  Package,
  Layers,
  Image as ImageIcon,
  ChevronDown,
  DollarSign,
  Barcode,
  Hash,
  X,
  PlusCircle,
  Tag,
  Eye,
  Settings,
  Palette,
  Maximize2,
  Zap,
  Flame,
  Video
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import MediaGalleryModal from './MediaGalleryModal';

const Type = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const COMMON_COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#000000' },
  { name: 'Red', hex: '#e71e22' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Neutrals', hex: '#71717a' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Brown', hex: '#78350f' }
];

const BulkGenerator = ({ onGenerate, baseSku, basePrice }) => {
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

  const toggleSize = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color) => {
    setSelectedColors(prev =>
      prev.find(c => c.name === color.name)
        ? prev.filter(c => c.name !== color.name)
        : [...prev, color]
    );
  };

  const handleGenerate = () => {
    if (selectedSizes.length === 0) {
      toast.error('Select at least one size');
      return;
    }

    let colorsToUse = [...selectedColors];

    if (colorsToUse.length === 0) {
      toast.error('Select at least one color');
      return;
    }

    onGenerate(selectedSizes, colorsToUse);
    setSelectedSizes([]);
    setSelectedColors([]);
  };

  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-8 shadow-2xl shadow-slate-300">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xl font-black tracking-tight">Bulk SKU Generator</h4>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Generate all combinations instantly</p>
        </div>
        <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">1. Select Sizes</label>
          <div className="flex flex-wrap gap-2">
            {STANDARD_SIZES.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSize(s)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border-2 ${selectedSizes.includes(s) ? 'bg-white text-slate-900 border-white' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">2. Select Colors</label>
          <div className="flex flex-wrap gap-2">
            {COMMON_COLORS.map(c => (
              <button
                key={c.name}
                type="button"
                onClick={() => toggleColor(c)}
                className={`group flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all border-2 ${selectedColors.find(sc => sc.name === c.name) ? 'bg-white text-slate-900 border-white' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'}`}
              >
                <div className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Definition block removed to restrict colors to standard list */}
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        Generate {selectedSizes.length * selectedColors.length || 0} Variations
      </button>
    </div>
  );
};
const parseVariantsToColorGroups = (variants, metadata, productMedia) => {
  if (!variants || variants.length === 0) {
    return [
      {
        color: 'Ebony',
        colorHex: '#28282B',
        media: [],
        sizes: [
          { size: 'S', price: '', initialStock: 0, enabled: true },
          { size: 'M', price: '', initialStock: 0, enabled: true },
          { size: 'L', price: '', initialStock: 0, enabled: true },
          { size: 'XL', price: '', initialStock: 0, enabled: true },
          { size: 'XXL', price: '', initialStock: 0, enabled: true }
        ]
      }
    ];
  }

  const groups = {};
  const allMedia = (productMedia || []).map(pm => pm.media || pm).filter(Boolean);

  variants.forEach(v => {
    const color = v.attributes?.color || 'Default';
    const colorHex = v.attributes?.colorHex || '#000000';
    const size = v.attributes?.size || 'M';

    if (!groups[color]) {
      const colorMediaIds = metadata?.colorMedia?.[color] || [];
      const colorMedia = allMedia.filter(m => colorMediaIds.includes(m.id));

      groups[color] = {
        color,
        colorHex,
        media: colorMedia,
        sizes: []
      };
    }

    groups[color].sizes.push({
      id: v.id,
      size,
      price: v.price || '',
      initialStock: v.inventory?.stockTotal || 0,
      enabled: true
    });
  });

  const defaultSizes = ['S', 'M', 'L', 'XL', 'XXL'];
  
  Object.values(groups).forEach(g => {
    defaultSizes.forEach(ds => {
      const exists = g.sizes.find(sz => sz.size === ds);
      if (!exists) {
        g.sizes.push({
          size: ds,
          price: '',
          initialStock: 0,
          enabled: false
        });
      }
    });
    g.sizes.sort((a, b) => defaultSizes.indexOf(a.size) - defaultSizes.indexOf(b.size));
  });

  return Object.values(groups);
};

const ProductForm = ({ onSubmit, isLoading, initialData }) => {
  const [categories, setCategories] = useState([]);
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    sku: initialData?.sku || '',
    description: initialData?.description || '',
    basePrice: initialData?.basePrice || '',
    categoryId: initialData?.categoryId || '',
    status: initialData?.status || 'PUBLISHED',
    isDrop: initialData?.isDrop || false,
    media: initialData?.media?.map(m => m.media).filter(m => m && m.type !== 'video') || [],
    video: initialData?.media?.map(m => m.media).find(m => m && m.type === 'video') || null,
    metadata: initialData?.metadata || { gender: 'UNISEX' }
  });

  const [colorGroups, setColorGroups] = useState([
    {
      color: 'Black',
      colorHex: '#000000',
      media: [],
      sizes: [
        { size: 'S', price: '', initialStock: 0, enabled: true },
        { size: 'M', price: '', initialStock: 0, enabled: true },
        { size: 'L', price: '', initialStock: 0, enabled: true },
        { size: 'XL', price: '', initialStock: 0, enabled: true },
        { size: 'XXL', price: '', initialStock: 0, enabled: true }
      ]
    }
  ]);

  const [errors, setErrors] = useState({});
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryColorIndex, setGalleryColorIndex] = useState(null);
  const [gallerySelectTarget, setGallerySelectTarget] = useState('images'); // 'images', 'video'
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  const [specsList, setSpecsList] = useState(() => {
    const raw = initialData?.metadata?.specifications;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object') {
      return [
        { label: 'FIT TYPE', value: raw.fit || '' },
        { label: 'FABRIC TYPE', value: raw.fabric || '' },
        { label: 'PRINT TECHNIQUE', value: raw.print || '' },
        { label: 'COLLECTION ORIGIN', value: raw.origin || '' },
        { label: 'CARE INSTRUCTION', value: raw.care || '' }
      ].filter(item => item.value);
    }
    return [
      { label: '', value: '' },
      { label: '', value: '' }
    ];
  });

  useEffect(() => {
    if (initialData) {
      const allMedia = initialData.media?.map(m => m.media).filter(Boolean) || [];
      const imagesOnly = allMedia.filter(m => m.type !== 'video');
      const videoOnly = allMedia.find(m => m.type === 'video') || null;

      setFormData({
        name: initialData.name || '',
        slug: initialData.slug || '',
        sku: initialData.sku || '',
        description: initialData.description || '',
        basePrice: initialData.basePrice || '',
        categoryId: initialData.categoryId || '',
        status: initialData.status || 'PUBLISHED',
        isDrop: initialData.isDrop || false,
        media: imagesOnly,
        video: videoOnly,
        metadata: initialData.metadata || { gender: 'UNISEX' }
      });

      const parsedGroups = parseVariantsToColorGroups(
        initialData.variants,
        initialData.metadata,
        initialData.media
      );
      setColorGroups(parsedGroups);

      const raw = initialData.metadata?.specifications;
      let parsedSpecs = [
        { label: '', value: '' },
        { label: '', value: '' }
      ];
      if (Array.isArray(raw)) {
        parsedSpecs = raw;
      } else if (raw && typeof raw === 'object') {
        parsedSpecs = [
          { label: 'FIT TYPE', value: raw.fit || '' },
          { label: 'FABRIC TYPE', value: raw.fabric || '' },
          { label: 'PRINT TECHNIQUE', value: raw.print || '' },
          { label: 'COLLECTION ORIGIN', value: raw.origin || '' },
          { label: 'CARE INSTRUCTION', value: raw.care || '' }
        ].filter(item => item.value);
      }
      setSpecsList(parsedSpecs);
    }
  }, [initialData]);

  const handleSpecChange = (index, field, value) => {
    setSpecsList(prev => prev.map((spec, i) => i === index ? { ...spec, [field]: value } : spec));
  };

  const addSpecRow = () => {
    if (specsList.length < 10) {
      setSpecsList(prev => [...prev, { label: '', value: '' }]);
    }
  };

  const removeSpecRow = (index) => {
    setSpecsList(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const fetchCategories = async () => {
      setIsFetchingCategories(true);
      try {
        const response = await api.get('/admin/categories');
        setCategories(response.data?.data?.categories || response.data?.categories || response.categories || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setIsFetchingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const formatSlug = (val) => val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const formatSKU = (val) => val.toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9-]/g, '');

  const generateVariantSKU = (baseSku, size, color) => {
    if (!baseSku) return '';
    const cleanSize = (size || '').toUpperCase();
    const colorPrefix = (color || '').toUpperCase().substring(0, 3).replace(/[^A-Z0-9]/g, '');
    return `${formatSKU(baseSku)}-${cleanSize}-${colorPrefix}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'slug') finalValue = formatSlug(value);
    if (name === 'sku') {
      finalValue = formatSKU(value);
    }

    if (name === 'name' && !initialData) {
      const slug = formatSlug(value);
      setFormData(prev => ({
        ...prev,
        name: value,
        slug: slug
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: finalValue }));
    }

    if (errors[name]) setErrors(prev => {
      const newErrs = { ...prev };
      delete newErrs[name];
      return newErrs;
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.slug.trim()) newErrors.slug = 'URL slug is required';
    if (!formData.sku.trim()) newErrors.sku = 'Base SKU is required';
    if (!formData.basePrice || isNaN(formData.basePrice)) {
      newErrors.basePrice = 'Valid price required';
    } else if (parseFloat(formData.basePrice) < 0) {
      newErrors.basePrice = 'Price cannot be negative';
    }
    if (!formData.categoryId) newErrors.categoryId = 'Select a category';

    let hasEnabledVariant = false;
    let variantErrors = false;
    colorGroups.forEach(g => {
      g.sizes.forEach(sz => {
        if (sz.enabled) {
          hasEnabledVariant = true;
          if (sz.price !== '' && parseFloat(sz.price) < 0) {
            toast.error(`Variant price cannot be negative (${g.color} - ${sz.size})`);
            variantErrors = true;
          }
          if (parseInt(sz.initialStock) < 0) {
            toast.error(`Stock cannot be negative (${g.color} - ${sz.size})`);
            variantErrors = true;
          }
        }
      });
    });

    if (!hasEnabledVariant) {
      toast.error('You must enable at least one size variant');
      return false;
    }

    if (variantErrors) return false;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMediaSelect = (selectedMedia) => {
    const selectedList = Array.isArray(selectedMedia) ? selectedMedia : [selectedMedia];
    
    if (galleryColorIndex !== null) {
      setColorGroups(prev => {
        const next = [...prev];
        const currentMedia = next[galleryColorIndex].media || [];
        const existingIds = currentMedia.map(m => m.id);
        const newMedia = selectedList.filter(m => !existingIds.includes(m.id));
        next[galleryColorIndex] = {
          ...next[galleryColorIndex],
          media: [...currentMedia, ...newMedia]
        };
        return next;
      });
      setGalleryColorIndex(null);
    } else if (gallerySelectTarget === 'video') {
      setFormData(prev => ({ ...prev, video: selectedList[0] || null }));
    } else {
      setFormData(prev => {
        const existingIds = prev.media.map(m => m.id);
        const newMedia = selectedList.filter(m => !existingIds.includes(m.id));
        return { ...prev, media: [...prev.media, ...newMedia] };
      });
    }
  };

  const removeMedia = (id) => {
    setFormData(prev => ({ ...prev, media: prev.media.filter(m => m.id !== id) }));
  };

  const removeColorMedia = (colorIndex, mediaId) => {
    setColorGroups(prev => {
      const next = [...prev];
      next[colorIndex] = {
        ...next[colorIndex],
        media: next[colorIndex].media.filter(m => m.id !== mediaId)
      };
      return next;
    });
  };

  const addColorGroup = () => {
    // Default to the first color in standard list that isn't already created if possible, or fallback to White
    const existingColors = new Set(colorGroups.map(g => g.color.toLowerCase()));
    const nextAvailableColor = COMMON_COLORS.find(c => !existingColors.has(c.name.toLowerCase())) || COMMON_COLORS[0];
    
    setColorGroups(prev => [
      ...prev,
      {
        color: nextAvailableColor.name,
        colorHex: nextAvailableColor.hex,
        media: [],
        sizes: [
          { size: 'S', price: '', initialStock: 0, enabled: true },
          { size: 'M', price: '', initialStock: 0, enabled: true },
          { size: 'L', price: '', initialStock: 0, enabled: true },
          { size: 'XL', price: '', initialStock: 0, enabled: true },
          { size: 'XXL', price: '', initialStock: 0, enabled: true }
        ]
      }
    ]);
  };

  const removeColorGroup = (index) => {
    setColorGroups(prev => prev.filter((_, i) => i !== index));
  };

  const updateColorGroupField = (index, field, value) => {
    setColorGroups(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const updateSizeField = (colorIndex, sizeIndex, field, value) => {
    setColorGroups(prev => {
      const next = [...prev];
      const sizes = [...next[colorIndex].sizes];
      sizes[sizeIndex] = { ...sizes[sizeIndex], [field]: value };
      next[colorIndex] = { ...next[colorIndex], sizes };
      return next;
    });
  };

  const generateBulkVariants = (sizes, colors) => {
    setColorGroups(prev => {
      const next = [...prev];

      colors.forEach(color => {
        let group = next.find(g => g.color.toLowerCase() === color.name.toLowerCase());

        if (!group) {
          group = {
            color: color.name,
            colorHex: color.hex,
            media: [],
            sizes: ['S', 'M', 'L', 'XL', 'XXL'].map(sz => ({
              size: sz,
              price: '',
              initialStock: 0,
              enabled: false
            }))
          };
          next.push(group);
        } else {
          group.colorHex = color.hex;
        }

        sizes.forEach(sz => {
          const sizeItem = group.sizes.find(s => s.size === sz);
          if (sizeItem) {
            sizeItem.enabled = true;
          } else {
            group.sizes.push({
              size: sz,
              price: '',
              initialStock: 0,
              enabled: true
            });
          }
        });

        const defaultSizes = ['S', 'M', 'L', 'XL', 'XXL'];
        group.sizes.sort((a, b) => defaultSizes.indexOf(a.size) - defaultSizes.indexOf(b.size));
      });

      toast.success(`Generated/updated ${colors.length} color groups`);
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please check required fields');
      return;
    }

    const flatVariants = [];
    const colorMedia = {};
    const allMediaMap = new Map();

    formData.media.forEach(m => allMediaMap.set(m.id, m));
    if (formData.video) {
      allMediaMap.set(formData.video.id, formData.video);
    }

    colorGroups.forEach(group => {
      const mediaIds = group.media.map(m => m.id);
      colorMedia[group.color] = mediaIds;

      group.media.forEach(m => allMediaMap.set(m.id, m));

      group.sizes.forEach(sz => {
        if (sz.enabled) {
          flatVariants.push({
            id: sz.id,
            sku: generateVariantSKU(formData.sku, sz.size, group.color),
            price: sz.price ? parseFloat(sz.price) : parseFloat(formData.basePrice),
            initialStock: parseInt(sz.initialStock) || 0,
            attributes: {
              size: sz.size,
              color: group.color,
              colorHex: group.colorHex
            }
          });
        }
      });
    });

    const { video, ...sanitizedFormData } = formData;
    const sanitizedSpecs = specsList.filter(s => s.label.trim() || s.value.trim());

    const payload = {
      ...sanitizedFormData,
      basePrice: parseFloat(formData.basePrice),
      mediaIds: Array.from(allMediaMap.keys()),
      variants: flatVariants,
      metadata: {
        ...(formData.metadata || {}),
        specifications: sanitizedSpecs,
        colorMedia
      }
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* 1. Core Identity */}
      <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Product Details</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">General information and identity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Product Name</label>
            <input
              type="text"
              name="name"
              className={`w-full px-6 py-4 bg-slate-50 border-2 ${errors.name ? 'border-red-200' : 'border-slate-100'} rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-lg`}
              placeholder="e.g. Premium Cotton Oversized Tee"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <p className="text-[10px] text-red-500 font-bold uppercase ml-2">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">URL Slug</label>
            <input
              type="text"
              name="slug"
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-primary-500 font-bold text-sm"
              value={formData.slug}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Drop Only Product?</label>
            <div className="flex items-center gap-3 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isDrop: !prev.isDrop }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.isDrop ? 'bg-primary-500' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isDrop ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className={`text-xs font-black uppercase tracking-widest ${formData.isDrop ? 'text-primary-600' : 'text-slate-400'}`}>
                {formData.isDrop ? 'Active' : 'Disabled'}
              </span>
              {formData.isDrop && <Flame className="w-4 h-4 text-primary-500 animate-pulse ml-auto" />}
            </div>
            <p className="text-[8px] text-slate-400 font-bold uppercase ml-1">Hidden from main store catalog</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Base SKU</label>
            <input
              type="text"
              name="sku"
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-primary-500 font-bold text-sm uppercase"
              value={formData.sku}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Category</label>
            <select
              name="categoryId"
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-primary-500 font-bold text-sm"
              value={formData.categoryId}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Target Gender / Demographic</label>
            <select
              name="gender"
              className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-primary-500 font-bold text-sm"
              value={formData.metadata?.gender || 'UNISEX'}
              onChange={(e) => {
                const val = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  metadata: {
                    ...(prev.metadata || {}),
                    gender: val
                  }
                }));
              }}
            >
              <option value="MEN">Men</option>
              <option value="WOMEN">Women</option>
              <option value="KIDS">Kids</option>
              <option value="UNISEX">Unisex</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Base Price</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                name="basePrice"
                min="0"
                step="0.01"
                className={`w-full pl-10 pr-5 py-3 bg-slate-50 border-2 ${errors.basePrice ? 'border-red-200' : 'border-slate-100'} rounded-xl outline-none focus:border-primary-500 font-bold text-sm`}
                value={formData.basePrice}
                onChange={handleChange}
              />
            </div>
            {errors.basePrice && <p className="text-[10px] text-red-500 font-bold uppercase ml-2">{errors.basePrice}</p>}
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Description</label>
          <textarea
            name="description"
            rows="5"
            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-primary-500 font-medium text-sm leading-relaxed"
            placeholder="Product story..."
            value={formData.description}
            onChange={handleChange}
          />
        </div>
      </section>

      {/* 1.5 Garment Specifications */}
      <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Garment Specifications</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Garment fit, fabric, print type, and care details</p>
          </div>
        </div>

        <div className="space-y-4">
          {specsList.map((spec, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-4 items-end md:items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100 md:border-none md:p-0 md:bg-transparent">
              <div className="w-full md:w-1/3 space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-1 md:hidden">Specification Label</label>
                <input
                  type="text"
                  placeholder="e.g. FIT TYPE"
                  className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-primary-500 font-bold text-sm uppercase placeholder:normal-case"
                  value={spec.label}
                  onChange={(e) => handleSpecChange(index, 'label', e.target.value)}
                />
              </div>
              <div className="w-full md:flex-1 space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-1 md:hidden">Details</label>
                <input
                  type="text"
                  placeholder="e.g. Modern Relaxed / Oversized Silhouette"
                  className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-primary-500 font-bold text-sm"
                  value={spec.value}
                  onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                />
              </div>
              {specsList.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSpecRow(index)}
                  className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors self-end md:self-auto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {specsList.length < 10 && (
            <button
              type="button"
              onClick={addSpecRow}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 font-black text-xs uppercase rounded-xl hover:bg-slate-200 transition-all mt-4"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Specification Row ({specsList.length}/10)
            </button>
          )}
        </div>
      </section>
      
      {/* 2. Media Section */}
      <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center justify-between border-b pb-4 border-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Media Assets</h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Global product media catalog</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2/3): Image Gallery Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Product Gallery Images</h4>
              <button
                type="button"
                onClick={() => {
                  setGallerySelectTarget('images');
                  setGalleryColorIndex(null);
                  setIsGalleryOpen(true);
                }}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Add Images
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {formData.media.map((item, idx) => (
                <div key={item.id || idx} className="relative aspect-square rounded-2xl border-2 border-slate-100 overflow-hidden group">
                  <img src={item.url} alt="Product media" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeMedia(item.id)}
                      className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {formData.media.length === 0 && (
                <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                  <ImageIcon className="w-8 h-8 text-slate-300 mb-1" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase">No images selected</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (1/3): Dedicated Showcase Video Slot */}
          <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-8">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Product Showcase Video</h4>
              {!formData.video && (
                <button
                  type="button"
                  onClick={() => {
                    setGallerySelectTarget('video');
                    setGalleryColorIndex(null);
                    setIsGalleryOpen(true);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                >
                  <Video className="w-4 h-4 text-primary-400" />
                  Select Video
                </button>
              )}
            </div>

            {formData.video ? (
              <div className="relative aspect-video rounded-2xl border border-slate-200 overflow-hidden group bg-slate-950">
                <video src={formData.video.url} controls className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, video: null }))}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 text-slate-400 p-6 text-center">
                <Video className="w-8 h-8 text-slate-300 mb-2 animate-bounce-subtle" />
                <p className="text-[10px] font-bold uppercase text-slate-400">No Showcase Video</p>
                <p className="text-[8px] text-slate-400 mt-1 max-w-xs leading-normal">
                  Add an optional video to display as the main feature element in storefront carousels.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Variants & Inventory */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Inventory Variations</h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                {colorGroups.reduce((acc, g) => acc + g.sizes.filter(s => s.enabled).length, 0)} SKU Lineup ({colorGroups.length} Colors)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBulkOpen(!isBulkOpen)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isBulkOpen ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {isBulkOpen ? 'Hide Bulk Tool' : 'Bulk Generator'}
            </button>
            <button type="button" onClick={addColorGroup} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-100">
              Add Color Group
            </button>
          </div>
        </div>

        {isBulkOpen && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <BulkGenerator onGenerate={generateBulkVariants} baseSku={formData.sku} basePrice={formData.basePrice} />
          </div>
        )}

        <div className="space-y-6">
          {colorGroups.map((group, colorIdx) => (
            <div key={colorIdx} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:border-primary-100 transition-all relative space-y-6">
              {/* Header section with Color Name and Hex and Delete button */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-4 flex-1 min-w-[240px]">
                  <div className="space-y-1.5 flex-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Color Name</label>
                    <select
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-primary-500 font-bold text-sm"
                      value={group.color}
                      onChange={(e) => {
                        const val = e.target.value;
                        const matching = COMMON_COLORS.find(cc => cc.name.toLowerCase() === val.toLowerCase());
                        updateColorGroupField(colorIdx, 'color', val);
                        if (matching) {
                          updateColorGroupField(colorIdx, 'colorHex', matching.hex);
                        }
                      }}
                    >
                      {COMMON_COLORS.map(cc => (
                        <option key={cc.name} value={cc.name}>{cc.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1.5 w-32">
                    <label className="text-[10px] font-black uppercase text-slate-400">Visual Hex</label>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full border border-slate-200 shrink-0" style={{ backgroundColor: group.colorHex }} />
                      <input
                        type="text"
                        disabled
                        className="w-full px-2 py-2 bg-slate-100 border border-slate-100 rounded-lg text-[10px] font-mono font-bold text-slate-400 cursor-not-allowed"
                        value={group.colorHex}
                        onChange={(e) => updateColorGroupField(colorIdx, 'colorHex', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGalleryColorIndex(colorIdx);
                      setIsGalleryOpen(true);
                    }}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4 text-primary-400" />
                    <span>Choose Color Images</span>
                  </button>
                  
                  {colorGroups.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeColorGroup(colorIdx)}
                      className="p-2.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Color Specific Images Display */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Color-Specific Images ({group.media?.length || 0})</label>
                <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {group.media?.map((item, mIdx) => (
                    <div key={item.id || mIdx} className="relative aspect-square rounded-xl border border-slate-100 overflow-hidden group">
                      <img src={item.url} alt="Color variant media" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeColorMedia(colorIdx, item.id)}
                          className="p-1 bg-red-500 text-white rounded-md hover:bg-red-600 shadow-sm"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!group.media || group.media.length === 0) && (
                    <div className="col-span-full py-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/55 text-[10px] font-bold text-slate-400">
                      No color-specific images selected. (Will fallback to general lookup/default images)
                    </div>
                  )}
                </div>
              </div>

              {/* Sizes Matrices: Grid representing XS, S, M, L, XL, XXL */}
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Sizes & Warehouse Inventory</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.sizes.map((sz, szIdx) => (
                    <div key={szIdx} className={`border rounded-2xl p-4 transition-all flex items-center justify-between gap-4 ${sz.enabled ? 'border-primary-100 bg-primary-50/10' : 'border-slate-100 bg-slate-50/30'}`}>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateSizeField(colorIdx, szIdx, 'enabled', !sz.enabled)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${sz.enabled ? 'bg-primary-500' : 'bg-slate-200'}`}
                        >
                          <span className={`relative inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${sz.enabled ? 'translate-x-4.5' : 'translate-x-1'}`} />
                        </button>
                        <div>
                          <span className="text-xs font-black text-slate-900">{sz.size}</span>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{sz.enabled ? 'Enabled' : 'Disabled'}</p>
                        </div>
                      </div>

                      {sz.enabled && (
                        <div className="flex items-center gap-2 flex-1 max-w-[180px]">
                          <div className="space-y-0.5 flex-1">
                            <label className="text-[7px] font-black uppercase text-slate-400">Stock</label>
                            <input
                              type="number"
                              min="0"
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xxs font-bold outline-none text-primary-600 focus:border-primary-500"
                              placeholder="0"
                              value={sz.initialStock}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val < 0) return; // block negative
                                updateSizeField(colorIdx, szIdx, 'initialStock', e.target.value);
                              }}
                            />
                          </div>
                          <div className="space-y-0.5 flex-1">
                            <label className="text-[7px] font-black uppercase text-slate-400">Price (₹)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xxs font-bold outline-none focus:border-primary-500"
                              placeholder={formData.basePrice || "0.00"}
                              value={sz.price}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val) && val < 0) return; // block negative
                                updateSizeField(colorIdx, szIdx, 'price', e.target.value);
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sticky Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white/80 backdrop-blur-md border-t border-slate-100 p-6 z-50 flex justify-center">
        <button
          type="submit"
          disabled={onSubmit === undefined || isLoading}
          className="w-full max-w-lg py-5 bg-slate-900 text-white font-black rounded-2xl shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Package className="w-5 h-5 text-primary-400" />}
          <span className="uppercase tracking-widest text-xs">{initialData ? 'Update Product Catalog' : 'Publish Product to Catalog'}</span>
        </button>
      </div>
      {/* Media Gallery Modal */}
      <MediaGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => {
          setIsGalleryOpen(false);
          setGalleryColorIndex(null);
        }}
        onSelect={handleMediaSelect}
        multiple={galleryColorIndex === null && gallerySelectTarget === 'video' ? false : true}
        allowedTypes={galleryColorIndex === null && gallerySelectTarget === 'video' ? ['video'] : ['image']}
      />
    </form>
  );
};

export default ProductForm;