import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  Save, 
  Layers, 
  ImageIcon, 
  Quote, 
  Info, 
  Plus, 
  Trash2, 
  Link as LinkIcon,
  FileText,
  HelpCircle,
  BookOpen,
  PhoneCall
} from 'lucide-react';
import MediaGalleryModal from '../components/MediaGalleryModal';

const cleanUrl = (url) => {
  if (typeof url !== 'string') return '';
  return url.split('?')[0];
};

const DEFAULT_SETTINGS = {
  slider: [
    {
      id: 1,
      title: "Hoodies",
      subtitle: "Shop Now",
      image: "https://i.pinimg.com/736x/81/cf/0a/81cf0ae5207c5af67de47a418b1fe6ef.jpg",
      imageMobile: "https://i.pinimg.com/736x/81/cf/0a/81cf0ae5207c5af67de47a418b1fe6ef.jpg",
      redirectUrl: "/collections/hoodies"
    },
    {
      id: 2,
      title: "New Collection",
      subtitle: "Discover",
      image: "https://i.pinimg.com/736x/b0/df/44/b0df44b19351f3e5ea54f6d82c7e0f21.jpg",
      imageMobile: "https://i.pinimg.com/736x/b0/df/44/b0df44b19351f3e5ea54f6d82c7e0f21.jpg",
      redirectUrl: "/collections"
    },
    {
      id: 3,
      title: "Street Wear",
      subtitle: "Shop Now",
      image: "https://i.pinimg.com/1200x/77/07/c7/7707c7bc64430185043adc06d26a09b7.jpg",
      imageMobile: "https://i.pinimg.com/1200x/77/07/c7/7707c7bc64430185043adc06d26a09b7.jpg",
      redirectUrl: "/drops"
    }
  ],
  about: {
    heroTitle: "Forge Your \n Sacred Identity",
    heroText: "Step into a world of high-quality, dark streetwear and shadow-infused aesthetics. From daily statement wear to exclusive drops, find your place in the Kamigami bloodline.",
    rightImage: "https://i5.walmartimages.com/seo/Cute-Hoodies-for-Teen-Girls-Trendy-Waffle-Hooded-Sweatshirts-Oversized-Long-Sleeve-Sweater-Tween-Girl-Clothes-With-Pocket_f5eaaedd-a0b2-4298-ad86-ecb4e60e4665.3f912967cc120203881ec023922d10b1.jpeg",
    cards: [
      {
        img: "https://images.unsplash.com/photo-1520975661595-6453be3f7070",
        title: "SIGNATURE",
        sub: "STAPLES",
      },
      {
        img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c",
        title: "TRENDSETTER",
        sub: "COLLECTION",
      },
      {
        img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
        title: "VINCE",
        sub: "EXCLUSIVE",
      }
    ]
  },
  backgroundVideo: "",
  backgroundVideoMobile: "",
  testimonials: [
    {
      id: 1,
      name: "Arjun Mehta",
      avatar: "https://i.pravatar.cc/150?img=11",
      rating: 5,
      text: "Absolutely love the quality. The fabric feels premium and the fit is spot on. KamiGami is my new go-to brand for streetwear.",
    },
    {
      id: 2,
      name: "Priya Sharma",
      avatar: "https://i.pravatar.cc/150?img=5",
      rating: 5,
      text: "Ordered the oversized tee — it's exactly what I wanted. The design is clean, minimal, and the packaging was super nice.",
    },
    {
      id: 3,
      name: "Rohan Verma",
      avatar: "https://i.pravatar.cc/150?img=12",
      rating: 4,
      text: "Great attention to detail. The stitching, the tags, the overall vibe — everything screams quality. Will definitely order again.",
    }
  ],
  backgroundVideo: ""
};

const DEFAULT_POLICY = {
  title: "SCROLL TITLE",
  subtitle: "Last Manifested: May 2026",
  sections: [
    {
      id: 1,
      title: "1. The Sacred Clause",
      body: "Write your policy contents cleanly in this field..."
    }
  ]
};

const DEFAULT_ABOUT_PAGE = {
  heroTitle: "reawaken",
  heroText: "Enter the Realm of Shadows \n Unleash Your Dark Identity",
  heroBtnText: "EXPLORE COLLECTION",
  heroVideoCount: 4,
  heroVideo1: "videos/hero-1.mp4",
  heroVideo2: "videos/hero-2.mp4",
  heroVideo3: "videos/hero-3.mp4",
  heroVideo4: "videos/hero-4.mp4",
  featureVideo1: "videos/feature-1.mp4",
  featureVideo2: "videos/feature-2.mp4",
  featureVideo3: "videos/feature-3.mp4",
  featureVideo4: "videos/feature-4.mp4",
  featureVideo5: "videos/feature-5.mp4",
  storySub: "the divine shadow world",
  storyTitle: "the bl<b>o</b>od of <br /> a sacred real<b>m</b>",
  storyImage: "/img/entrance.webp",
  storyText: "Where shadows converge, rises KAMIGAMI and the eternal gateway. Uncover its secrets and forge your identity within infinite darkness.",
  storyBtnText: "UNLOCK THE ORIGIN"
};

const DEFAULT_CONTACT_DETAILS = {
  coordinates: "104, Cyber-Bazaar, Gods Realm, Sector-90, Gurgaon, Haryana, India",
  supportEmail: "support@kamigami.co",
  ritualsEmail: "rituals@kamigami.co",
  phone: "+91 98765 43210",
  timings: "Mon - Sat // 10:00 AM - 7:00 PM"
};

const CmsSettings = () => {
  const [activeTab, setActiveTab] = useState('slider');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Policy Scrolls specific states
  const [selectedPolicyKey, setSelectedPolicyKey] = useState('privacy_policy_cms');
  const [policyData, setPolicyData] = useState(DEFAULT_POLICY);
  const [fetchingPolicy, setFetchingPolicy] = useState(false);

  // About Page CMS state
  const [aboutPageData, setAboutPageData] = useState(DEFAULT_ABOUT_PAGE);
  const [fetchingAboutPage, setFetchingAboutPage] = useState(false);

  // Contact Details CMS state
  const [contactDetails, setContactDetails] = useState(DEFAULT_CONTACT_DETAILS);
  const [fetchingContactDetails, setFetchingContactDetails] = useState(false);

  // Media Gallery integration
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryTarget, setGalleryTarget] = useState({ type: '', index: null, field: '' });

  const openGalleryFor = (type, index, field) => {
    setGalleryTarget({ type, index, field });
    setIsGalleryOpen(true);
  };

  const handleGallerySelect = (selectedItem) => {
    if (!selectedItem) return;
    const { url } = selectedItem;
    const { type, index, field } = galleryTarget;

    if (type === 'slider') {
      updateSliderField(index, field, url);
    } else if (type === 'about') {
      updateAboutField(field, url);
    } else if (type === 'aboutCard') {
      updateAboutCardField(index, field, url);
    } else if (type === 'testimonial') {
      updateTestimonialField(index, field, url);
    } else if (type === 'aboutStory') {
      updateAboutPageField(field, url);
    } else if (type === 'homepageBg') {
      setSettings(prev => ({
        ...prev,
        backgroundVideo: url
      }));
    } else if (type === 'homepageBgMobile') {
      setSettings(prev => ({
        ...prev,
        backgroundVideoMobile: url
      }));
    }
  };

  // Fetch Homepage CMS Settings on load
  useEffect(() => {
    const fetchCmsSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/settings/homepage_cms');
        if (res.data?.value) {
          const sliderWithUrls = (res.data.value.slider || []).map((slide, idx) => ({
            ...DEFAULT_SETTINGS.slider[idx],
            ...slide
          }));
          
          setSettings({
            ...DEFAULT_SETTINGS,
            ...res.data.value,
            slider: sliderWithUrls
          });
        }
      } catch (err) {
        console.warn('[CMS] Homepage settings unseeded, using defaults.', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCmsSettings();
  }, []);

  // Fetch Policy Scroll data when key changes
  useEffect(() => {
    if (activeTab !== 'policies') return;
    const fetchPolicyCms = async () => {
      try {
        setFetchingPolicy(true);
        const res = await api.get(`/settings/${selectedPolicyKey}`);
        if (res.data?.value) {
          setPolicyData(res.data.value);
        } else {
          let title = "PRIVACY COVENANT";
          if (selectedPolicyKey === 'terms_conditions_cms') title = "TERMS OF THE COVENANT";
          else if (selectedPolicyKey === 'refund_policy_cms') title = "SACRED EXCHANGES";

          setPolicyData({
            title,
            subtitle: "Last Manifested: May 2026",
            sections: [
              { id: 1, title: "1. Section Heading", body: "Write the covenants here..." }
            ]
          });
        }
      } catch (err) {
        console.warn('[CMS-Policy] Failed to fetch policy settings:', err);
      } finally {
        setFetchingPolicy(false);
      }
    };
    fetchPolicyCms();
  }, [selectedPolicyKey, activeTab]);

  // Fetch About Page CMS data
  useEffect(() => {
    if (activeTab !== 'aboutPage') return;
    const fetchAboutPageCms = async () => {
      try {
        setFetchingAboutPage(true);
        const res = await api.get('/settings/about_page_cms');
        if (res.data?.value) {
          setAboutPageData(res.data.value);
        }
      } catch (err) {
        console.warn('[CMS-AboutPage] Settings not seeded yet, using default parameters.', err);
      } finally {
        setFetchingAboutPage(false);
      }
    };
    fetchAboutPageCms();
  }, [activeTab]);

  // Fetch Contact Details CMS data
  useEffect(() => {
    if (activeTab !== 'contactDetails') return;
    const fetchContactDetailsCms = async () => {
      try {
        setFetchingContactDetails(true);
        const res = await api.get('/settings/contact_details_cms');
        if (res.data?.value) {
          setContactDetails(res.data.value);
        }
      } catch (err) {
        console.warn('[CMS-ContactDetails] Settings not seeded yet, using default parameters.', err);
      } finally {
        setFetchingContactDetails(false);
      }
    };
    fetchContactDetailsCms();
  }, [activeTab]);

  const handleSaveHomepageSettings = async () => {
    try {
      setSaving(true);
      await api.post('/settings/homepage_cms', { value: settings });
      toast.success('Homepage CMS Content Manifested Successfully!');
    } catch (err) {
      console.error('[CMS] Save failure:', err);
      toast.error(err.message || 'Failed to manifest CMS settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePolicyScroll = async () => {
    try {
      setSaving(true);
      await api.post(`/settings/${selectedPolicyKey}`, { value: policyData });
      toast.success('Policy Scroll Content Manifested Successfully!');
    } catch (err) {
      console.error('[CMS-Policy] Save failure:', err);
      toast.error(err.message || 'Failed to manifest Policy settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAboutPageCms = async () => {
    try {
      setSaving(true);
      await api.post('/settings/about_page_cms', { value: aboutPageData });
      toast.success('About Page CMS Content Manifested Successfully!');
    } catch (err) {
      console.error('[CMS-AboutPage] Save failure:', err);
      toast.error(err.message || 'Failed to manifest About Page settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContactDetailsCms = async () => {
    try {
      setSaving(true);
      await api.post('/settings/contact_details_cms', { value: contactDetails });
      toast.success('Contact Details CMS Content Manifested Successfully!');
    } catch (err) {
      console.error('[CMS-ContactDetails] Save failure:', err);
      toast.error(err.message || 'Failed to manifest Contact Details.');
    } finally {
      setSaving(false);
    }
  };

  // Slider Mutators
  const updateSliderField = (index, field, value) => {
    const updated = [...settings.slider];
    updated[index] = { ...updated[index], [field]: value };
    setSettings(prev => ({ ...prev, slider: updated }));
  };

  // About Mutators
  const updateAboutField = (field, value) => {
    setSettings(prev => ({
      ...prev,
      about: { ...prev.about, [field]: value }
    }));
  };

  const updateAboutCardField = (index, field, value) => {
    const updated = [...settings.about.cards];
    updated[index] = { ...updated[index], [field]: value };
    setSettings(prev => ({
      ...prev,
      about: { ...prev.about, cards: updated }
    }));
  };

  // Testimonials Mutators
  const updateTestimonialField = (index, field, value) => {
    const updated = [...settings.testimonials];
    updated[index] = { ...updated[index], [field]: value };
    setSettings(prev => ({ ...prev, testimonials: updated }));
  };

  const addTestimonial = () => {
    if (settings.testimonials.length >= 6) {
      toast.error('Maximum of 6 testimonials reached.');
      return;
    }
    const newTest = {
      id: Date.now(),
      name: "New Critic",
      avatar: "https://i.pravatar.cc/150?img=3",
      rating: 5,
      text: "Outstanding design details and unmatched streetwear fits."
    };
    setSettings(prev => ({
      ...prev,
      testimonials: [...prev.testimonials, newTest]
    }));
  };

  const removeTestimonial = (id) => {
    if (settings.testimonials.length <= 1) {
      toast.error('Must keep at least 1 testimonial.');
      return;
    }
    setSettings(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter(t => t.id !== id)
    }));
  };

  // Policies Mutators
  const updatePolicyField = (field, value) => {
    setPolicyData(prev => ({ ...prev, [field]: value }));
  };

  const updatePolicySectionField = (index, field, value) => {
    const updated = [...policyData.sections];
    updated[index] = { ...updated[index], [field]: value };
    setPolicyData(prev => ({ ...prev, sections: updated }));
  };

  const addPolicySection = () => {
    const newSec = {
      id: Date.now(),
      title: `${policyData.sections.length + 1}. New Clause`,
      body: "Write details here..."
    };
    setPolicyData(prev => ({
      ...prev,
      sections: [...prev.sections, newSec]
    }));
  };

  const removePolicySection = (id) => {
    if (policyData.sections.length <= 1) {
      toast.error('Must keep at least 1 section.');
      return;
    }
    setPolicyData(prev => ({
      ...prev,
      sections: prev.sections.filter(sec => sec.id !== id)
    }));
  };

  // About Page Mutators
  const updateAboutPageField = (field, value) => {
    setAboutPageData(prev => ({ ...prev, [field]: value }));
  };

  // Contact Details Mutators
  const updateContactDetailsField = (field, value) => {
    setContactDetails(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-slate-500 font-medium">Unraveling CMS matrix...</span>
      </div>
    );
  }

  const getSaveHandler = () => {
    switch (activeTab) {
      case 'policies': return handleSavePolicyScroll;
      case 'aboutPage': return handleSaveAboutPageCms;
      case 'contactDetails': return handleSaveContactDetailsCms;
      default: return handleSaveHomepageSettings;
    }
  };

  const getSaveButtonLabel = () => {
    switch (activeTab) {
      case 'policies': return "Manifest Policy Scroll";
      case 'aboutPage': return "Manifest About Page";
      case 'contactDetails': return "Manifest Contact Details";
      default: return "Manifest Homepage Changes";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Homepage & Site CMS Panel</h1>
          <p className="text-sm text-slate-500 mt-1">Manage banner images, click redirection links, reviews, policies, contact details, and the immersive About Us page contents.</p>
        </div>
        <button
          onClick={getSaveHandler()}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg shadow font-medium transition"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{getSaveButtonLabel()}</span>
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex flex-wrap border-b border-slate-200 bg-white rounded-t-xl px-4 pt-3 gap-y-2">
        <button
          onClick={() => setActiveTab('slider')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all duration-200 ${
            activeTab === 'slider'
              ? 'border-primary-600 text-primary-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Hero Slider</span>
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all duration-200 ${
            activeTab === 'about'
              ? 'border-primary-600 text-primary-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Home About</span>
        </button>
        <button
          onClick={() => setActiveTab('testimonials')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all duration-200 ${
            activeTab === 'testimonials'
              ? 'border-primary-600 text-primary-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Quote className="w-4 h-4" />
          <span>Testimonials</span>
        </button>
        <button
          onClick={() => setActiveTab('aboutPage')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all duration-200 ${
            activeTab === 'aboutPage'
              ? 'border-primary-600 text-primary-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>About Page (GSAP)</span>
        </button>
        <button
          onClick={() => setActiveTab('contactDetails')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all duration-200 ${
            activeTab === 'contactDetails'
              ? 'border-primary-600 text-primary-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Contact Details</span>
        </button>
        <button
          onClick={() => setActiveTab('policies')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all duration-200 ${
            activeTab === 'policies'
              ? 'border-primary-600 text-primary-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Policy Scrolls</span>
        </button>
      </div>

      <div className="bg-white rounded-b-xl border border-slate-200 p-8 shadow-sm">
        {/* ====================================================
            TAB 1: HERO SLIDER
            ==================================================== */}
        {activeTab === 'slider' && (
          <div className="space-y-8">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 flex gap-2.5">
              <Info className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
              <span>Modify the carousel sliders mapped below. You can now add a **Redirection Link** for each slide banner. When a customer clicks on the slide banner image in your storefront, they will be redirected to that specified link dynamically (e.g. <code>/collections/hoodies</code> or <code>/drops</code>).</span>
            </div>

            {/* Immersive Video Background Card */}
            <div className="p-6 border border-slate-200 rounded-xl bg-slate-50 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">IMMERSIVE VIDEO BACKGROUND</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Set the global ambient video background for your homepage storefront</p>
                </div>
              </div>

              <div className="space-y-1.5 max-w-2xl mt-4">
                <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Background Video URL / Asset (Desktop)</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none font-mono"
                    value={settings.backgroundVideo || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, backgroundVideo: e.target.value }))}
                    placeholder="e.g. https://domain.com/path/to/video.mp4 (Leave empty for default)"
                  />
                  <button
                    type="button"
                    onClick={() => openGalleryFor('homepageBg', null, 'backgroundVideo')}
                    className="px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-bold transition-colors"
                  >
                    Select Video
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">Specify any direct MP4 video link or upload one to your media library and select it. If empty, the default storefront video asset will be played.</p>
              </div>

              <div className="space-y-1.5 max-w-2xl mt-4">
                <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Background Video URL / Asset (Mobile)</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none font-mono"
                    value={settings.backgroundVideoMobile || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, backgroundVideoMobile: e.target.value }))}
                    placeholder="e.g. https://domain.com/path/to/mobile-video.mp4 (Leave empty for default)"
                  />
                  <button
                    type="button"
                    onClick={() => openGalleryFor('homepageBgMobile', null, 'backgroundVideoMobile')}
                    className="px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-bold transition-colors"
                  >
                    Select Video
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">Optional: Specify a different vertical video for mobile devices. If empty, it will fall back to the Desktop video.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {settings.slider.map((slide, i) => (
                <div key={slide.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col">
                  <div className="h-44 w-full bg-slate-200 relative overflow-hidden">
                    <img 
                      src={slide.image || 'https://via.placeholder.com/400x200'} 
                      alt={`Slide ${i + 1}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1520975661595-6453be3f7070';
                      }}
                    />
                    <div className="absolute top-3 left-3 bg-primary-600 text-white font-bold text-xxs px-2.5 py-1 rounded">
                      SLIDE {i + 1}
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Slide Image Link (Desktop)</label>
                      <div className="flex gap-2">
                        <input 
                          type="url"
                          className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none font-medium"
                          value={cleanUrl(slide.image)}
                          onChange={(e) => updateSliderField(i, 'image', e.target.value)}
                          placeholder="Image URL"
                        />
                        <button
                          type="button"
                          onClick={() => openGalleryFor('slider', i, 'image')}
                          className="px-3 bg-slate-900 text-white rounded-md text-xs font-bold hover:bg-slate-800 transition-colors"
                        >
                          Choose
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Slide Image Link (Mobile Portrait)</label>
                      <div className="flex gap-2">
                        <input 
                          type="url"
                          className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none font-medium"
                          value={cleanUrl(slide.imageMobile || '')}
                          onChange={(e) => updateSliderField(i, 'imageMobile', e.target.value)}
                          placeholder="Mobile Image URL"
                        />
                        <button
                          type="button"
                          onClick={() => openGalleryFor('slider', i, 'imageMobile')}
                          className="px-3 bg-slate-900 text-white rounded-md text-xs font-bold hover:bg-slate-800 transition-colors"
                        >
                          Choose
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Title Manifest</label>
                      <input 
                        type="text"
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none font-semibold"
                        value={slide.title}
                        onChange={(e) => updateSliderField(i, 'title', e.target.value)}
                        placeholder="Slide Title"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Subtitle Link Text</label>
                      <input 
                        type="text"
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none"
                        value={slide.subtitle}
                        onChange={(e) => updateSliderField(i, 'subtitle', e.target.value)}
                        placeholder="Slide Subtitle"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <LinkIcon className="w-3 h-3 text-slate-400" /> Banner Redirection Link
                      </label>
                      <input 
                        type="text"
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none font-mono"
                        value={slide.redirectUrl || ''}
                        onChange={(e) => updateSliderField(i, 'redirectUrl', e.target.value)}
                        placeholder="e.g. /collections/hoodies or /drops"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====================================================
            TAB 2: ABOUT SECTION
            ==================================================== */}
        {activeTab === 'about' && (
          <div className="space-y-8 animate-fade">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 flex gap-2.5">
              <Info className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
              <span>Modify the primary copywriting, background media panels, and signature sub-grids in the storefront's About Section. Use `\n` to insert explicit line breaks in titles.</span>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-slate-900 border-b pb-2 tracking-wider">PRIMARY COPY MANIFEST</h3>
                
                <div className="space-y-1.5">
                  <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Section Heading Title</label>
                  <textarea 
                    rows="2"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none font-semibold"
                    value={settings.about.heroTitle}
                    onChange={(e) => updateAboutField('heroTitle', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Philosophical Description Copy</label>
                  <textarea 
                    rows="4"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none leading-relaxed text-slate-600"
                    value={settings.about.heroText}
                    onChange={(e) => updateAboutField('heroText', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Right Aspect Banner Image</label>
                  <div className="flex gap-2">
                    <input 
                      type="url"
                      className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none"
                      value={cleanUrl(settings.about.rightImage)}
                      onChange={(e) => updateAboutField('rightImage', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => openGalleryFor('about', null, 'rightImage')}
                      className="px-3 bg-slate-900 text-white rounded-md text-xs font-bold hover:bg-slate-800 transition-colors"
                    >
                      Choose
                    </button>
                  </div>
                  <div className="h-44 w-full bg-slate-200 rounded-lg overflow-hidden border border-slate-200 mt-2">
                    <img 
                      src={settings.about.rightImage} 
                      alt="Right banner preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c';
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <h3 className="text-sm font-bold text-slate-900 border-b pb-2 tracking-wider">SIGNATURE TRIPLE CARD GRID</h3>
                
                <div className="space-y-6">
                  {settings.about.cards.map((card, i) => (
                    <div key={i} className="flex gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
                      <div className="w-20 h-20 bg-slate-200 border rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={card.img} 
                          alt={`Card ${i + 1}`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1520975661595-6453be3f7070';
                          }}
                        />
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 gap-2.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Primary Title</label>
                            <input 
                              type="text"
                              className="w-full text-xxs px-2 py-1.5 border border-slate-200 rounded focus:border-primary-500 outline-none font-bold"
                              value={card.title}
                              onChange={(e) => updateAboutCardField(i, 'title', e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Subtitle</label>
                            <input 
                              type="text"
                              className="w-full text-xxs px-2 py-1.5 border border-slate-200 rounded focus:border-primary-500 outline-none"
                              value={card.sub}
                              onChange={(e) => updateAboutCardField(i, 'sub', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Card Background URL</label>
                          <div className="flex gap-2">
                            <input 
                              type="url"
                              className="flex-1 text-xxs px-2 py-1.5 border border-slate-200 rounded focus:border-primary-500 outline-none"
                              value={cleanUrl(card.img)}
                              onChange={(e) => updateAboutCardField(i, 'img', e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => openGalleryFor('aboutCard', i, 'img')}
                              className="px-2 bg-slate-900 text-white rounded text-[10px] font-bold hover:bg-slate-800 transition-colors"
                            >
                              Choose
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            TAB 3: TESTIMONIALS
            ==================================================== */}
        {activeTab === 'testimonials' && (
          <div className="space-y-8 animate-fade">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="p-0 text-xs text-slate-500 flex gap-2.5 items-center">
                <Quote className="w-4 h-4 text-primary-600 flex-shrink-0" />
                <span>Configure consumer reviews, ratings, and avatar profiles rendered inside the active storefront scrolltrigger timeline.</span>
              </div>
              <button 
                type="button"
                onClick={addTestimonial}
                className="flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-md transition"
              >
                <Plus className="w-3.5 h-3.5" /> ADD TESTIMONIAL
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {settings.testimonials.map((t, i) => (
                <div key={t.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50 space-y-4 relative">
                  <button 
                    type="button"
                    onClick={() => removeTestimonial(t.id)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition"
                    title="Remove Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex gap-4 items-center">
                    <img 
                      src={t.avatar} 
                      alt={t.name} 
                      className="w-12 h-12 rounded-full border border-slate-200 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://i.pravatar.cc/150?img=11';
                      }}
                    />
                    
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Reviewer Name</label>
                        <input 
                          type="text"
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:border-primary-500 outline-none font-semibold"
                          value={t.name}
                          onChange={(e) => updateTestimonialField(i, 'name', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Rating Stars (1-5)</label>
                        <select 
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:border-primary-500 outline-none bg-white font-medium"
                          value={t.rating}
                          onChange={(e) => updateTestimonialField(i, 'rating', Number(e.target.value))}
                        >
                          <option value="1">1 Star ★</option>
                          <option value="2">2 Stars ★★</option>
                          <option value="3">3 Stars ★★★</option>
                          <option value="4">4 Stars ★★★★</option>
                          <option value="5">5 Stars ★★★★★</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Avatar Image URL</label>
                    <div className="flex gap-2">
                      <input 
                        type="url"
                        className="flex-1 text-xs px-3 py-1.5 border border-slate-200 rounded-md focus:border-primary-500 outline-none text-slate-500 font-mono"
                        value={cleanUrl(t.avatar)}
                        onChange={(e) => updateTestimonialField(i, 'avatar', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => openGalleryFor('testimonial', i, 'avatar')}
                        className="px-3 bg-slate-900 text-white rounded-md text-xs font-bold hover:bg-slate-800 transition-colors"
                      >
                        Choose
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Critique / Testimonial Statement</label>
                    <textarea 
                      rows="3"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none leading-relaxed text-slate-600"
                      value={t.text}
                      onChange={(e) => updateTestimonialField(i, 'text', e.target.value)}
                      placeholder="Enter the community statement..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====================================================
            TAB 4: ABOUT PAGE CMS (NEW)
            ==================================================== */}
        {activeTab === 'aboutPage' && (
          <div className="space-y-8 animate-fade">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 flex gap-2.5">
              <BookOpen className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
              <span>Modify the primary copywriting, background media panels, and signature story settings of your standalone <strong>About Us (/about-us)</strong> page. Use HTML tags like <code>&lt;b&gt;</code> or <code>&lt;br /&gt;</code> inside titles to preserve the premium typography animations.</span>
            </div>

            {fetchingAboutPage ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-xs text-slate-500 font-medium">Unrolling about page settings...</span>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-8">
                {/* Left Side: About Hero CMS */}
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-slate-900 border-b pb-2 tracking-wider">ABOUT HERO SECTION</h3>

                  <div className="space-y-1.5">
                    <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Hero Giant Title</label>
                    <input 
                      type="text"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none font-bold"
                      value={aboutPageData.heroTitle || ''}
                      onChange={(e) => updateAboutPageField('heroTitle', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Hero Description Text</label>
                    <textarea 
                      rows="3"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none leading-relaxed text-slate-600"
                      value={aboutPageData.heroText || ''}
                      onChange={(e) => updateAboutPageField('heroText', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Hero Action Button Text</label>
                    <input 
                      type="text"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none font-semibold"
                      value={aboutPageData.heroBtnText || ''}
                      onChange={(e) => updateAboutPageField('heroBtnText', e.target.value)}
                    />
                  </div>
                </div>

                {/* Right Side: About Story CMS */}
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-slate-900 border-b pb-2 tracking-wider">ABOUT STORY SECTION</h3>

                  <div className="space-y-1.5">
                    <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Story Small Subtitle</label>
                    <input 
                      type="text"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none"
                      value={aboutPageData.storySub || ''}
                      onChange={(e) => updateAboutPageField('storySub', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Story Animated Title</label>
                    <input 
                      type="text"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none font-bold"
                      value={aboutPageData.storyTitle || ''}
                      onChange={(e) => updateAboutPageField('storyTitle', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Story Floating Image URL</label>
                    <div className="flex gap-2">
                      <input 
                        type="url"
                        className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none text-slate-500 font-mono"
                        value={cleanUrl(aboutPageData.storyImage)}
                        onChange={(e) => updateAboutPageField('storyImage', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => openGalleryFor('aboutStory', null, 'storyImage')}
                        className="px-3 bg-slate-900 text-white rounded-md text-xs font-bold hover:bg-slate-800 transition-colors"
                      >
                        Choose
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Story Detailed Description</label>
                    <textarea 
                      rows="3"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none leading-relaxed text-slate-600"
                      value={aboutPageData.storyText || ''}
                      onChange={(e) => updateAboutPageField('storyText', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Story Action Button Text</label>
                    <input 
                      type="text"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none font-semibold"
                      value={aboutPageData.storyBtnText || ''}
                      onChange={(e) => updateAboutPageField('storyBtnText', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Video Rotator & Bento Cards Video Settings */}
              <div className="mt-12 border-t border-slate-200 pt-8 space-y-8">
                <h3 className="text-sm font-bold text-slate-900 tracking-wider flex items-center gap-2 uppercase">
                  <BookOpen className="w-5 h-5 text-primary-600" />
                  <span>Dynamic Video Channels (Hero & Bento Grid)</span>
                </h3>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Hero Videos Settings */}
                  <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide border-b pb-2">Hero Video Rotator</h4>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Number of Hero Videos</label>
                      <select 
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none bg-white font-medium text-slate-700"
                        value={aboutPageData.heroVideoCount || 4}
                        onChange={(e) => updateAboutPageField('heroVideoCount', Number(e.target.value))}
                      >
                        <option value="1">1 Video</option>
                        <option value="2">2 Videos</option>
                        <option value="3">3 Videos</option>
                        <option value="4">4 Videos</option>
                      </select>
                    </div>

                    {Array.from({ length: aboutPageData.heroVideoCount || 4 }, (_, i) => i + 1).map(idx => (
                      <div key={idx} className="space-y-1.5 mt-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hero Video {idx}</label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none text-slate-600 font-mono"
                            value={cleanUrl(aboutPageData[`heroVideo${idx}`])}
                            onChange={(e) => updateAboutPageField(`heroVideo${idx}`, e.target.value)}
                            placeholder={`e.g. videos/hero-${idx}.mp4`}
                          />
                          <button
                            type="button"
                            onClick={() => openGalleryFor('aboutStory', null, `heroVideo${idx}`)}
                            className="px-3 bg-slate-900 text-white rounded-md text-xs font-bold hover:bg-slate-800 transition"
                          >
                            Choose
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bento Grid Videos Settings */}
                  <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide border-b pb-2">Bento Cards Video Grid (5 Videos)</h4>
                    
                    {[1, 2, 3, 4, 5].map(idx => (
                      <div key={idx} className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bento Card Feature Video {idx}</label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none text-slate-600 font-mono"
                            value={cleanUrl(aboutPageData[`featureVideo${idx}`])}
                            onChange={(e) => updateAboutPageField(`featureVideo${idx}`, e.target.value)}
                            placeholder={`e.g. videos/feature-${idx}.mp4`}
                          />
                          <button
                            type="button"
                            onClick={() => openGalleryFor('aboutStory', null, `featureVideo${idx}`)}
                            className="px-3 bg-slate-900 text-white rounded-md text-xs font-bold hover:bg-slate-800 transition"
                          >
                            Choose
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
          </div>
        )}

        {/* ====================================================
            TAB 5: CONTACT DETAILS CMS (NEW)
            ==================================================== */}
        {activeTab === 'contactDetails' && (
          <div className="space-y-8 animate-fade">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 flex gap-2.5">
              <PhoneCall className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
              <span>Modify the contact parameters displayed on your storefront's <strong>Contact Us (/contact-us)</strong> page scroll cards.</span>
            </div>

            {fetchingContactDetails ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-xs text-slate-500 font-medium">Loading contact nodes...</span>
              </div>
            ) : (
              <div className="max-w-2xl space-y-6">
                <h3 className="text-sm font-bold text-slate-900 border-b pb-2 tracking-wider">TELEMETRY CHANNELS</h3>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Sanctum Physical Coordinates Address</label>
                    <textarea 
                      rows="2"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-md focus:border-primary-500 outline-none leading-relaxed text-slate-700"
                      value={contactDetails.coordinates || ''}
                      onChange={(e) => updateContactDetailsField('coordinates', e.target.value)}
                      placeholder="Temple Address..."
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Primary Support Email</label>
                      <input 
                        type="email"
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none font-semibold text-slate-700"
                        value={contactDetails.supportEmail || ''}
                        onChange={(e) => updateContactDetailsField('supportEmail', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Alternate / Rituals Email</label>
                      <input 
                        type="email"
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none font-semibold text-slate-700"
                        value={contactDetails.ritualsEmail || ''}
                        onChange={(e) => updateContactDetailsField('ritualsEmail', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Telephony Support Number</label>
                      <input 
                        type="text"
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none font-semibold text-slate-700"
                        value={contactDetails.phone || ''}
                        onChange={(e) => updateContactDetailsField('phone', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Availability Timings Label</label>
                      <input 
                        type="text"
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none text-slate-700"
                        value={contactDetails.timings || ''}
                        onChange={(e) => updateContactDetailsField('timings', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====================================================
            TAB 6: POLICY SCROLLS
            ==================================================== */}
        {activeTab === 'policies' && (
          <div className="space-y-8 animate-fade">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 flex gap-2.5 items-start">
              <Info className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
              <div>
                <span>Select one of your policy scroll pages below to edit its contents dynamically. You can change titles, subtitles, and add/remove specific policy clause blocks. Remember to click **"Manifest Policy Scroll"** at the top right to save the active scroll.</span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4 border rounded-xl max-w-md">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex-shrink-0">Selected Page Scroll:</label>
              <select 
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none bg-white font-bold"
                value={selectedPolicyKey}
                onChange={(e) => setSelectedPolicyKey(e.target.value)}
              >
                <option value="privacy_policy_cms">Privacy Covenant (/privacy-policy)</option>
                <option value="terms_conditions_cms">Terms of the Covenant (/terms-and-conditions)</option>
                <option value="refund_policy_cms">Sacred Exchanges & Refunds (/refund-policy)</option>
              </select>
            </div>

            {fetchingPolicy ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-xs text-slate-500 font-medium">Unrolling parchment...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-900 border-b pb-2 tracking-wider uppercase">
                  {selectedPolicyKey.replace(/_/g, ' ')} HEADER CONFIG
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Page Header Title</label>
                    <input 
                      type="text"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none font-bold"
                      value={policyData.title || ''}
                      onChange={(e) => updatePolicyField('title', e.target.value)}
                      placeholder="e.g. PRIVACY COVENANT"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Page Header Subtitle</label>
                    <input 
                      type="text"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:border-primary-500 outline-none"
                      value={policyData.subtitle || ''}
                      onChange={(e) => updatePolicyField('subtitle', e.target.value)}
                      placeholder="e.g. Last Manifested: May 2026"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-b pb-2 pt-6">
                  <h3 className="text-sm font-bold text-slate-900 tracking-wider">COVENANT CLAUSES / SECTIONS</h3>
                  <button 
                    type="button"
                    onClick={addPolicySection}
                    className="flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-md transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> ADD NEW CLAUSE
                  </button>
                </div>

                <div className="space-y-6">
                  {policyData.sections?.map((sec, idx) => (
                    <div key={sec.id || idx} className="p-5 border border-slate-200 rounded-xl bg-slate-50 relative space-y-4">
                      <button 
                        type="button"
                        onClick={() => removePolicySection(sec.id)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-red-600 transition"
                        title="Remove Section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="space-y-1.5 max-w-md">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Clause Header Title</label>
                        <input 
                          type="text"
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:border-primary-500 outline-none font-semibold"
                          value={sec.title || ''}
                          onChange={(e) => updatePolicySectionField(idx, 'title', e.target.value)}
                          placeholder="e.g. 1. The Sacred Seal"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Clause Description Body</label>
                        <textarea 
                          rows="4"
                          className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-md focus:border-primary-500 outline-none leading-relaxed text-slate-600"
                          value={sec.body || ''}
                          onChange={(e) => updatePolicySectionField(idx, 'body', e.target.value)}
                          placeholder="Write section contents here..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <MediaGalleryModal 
          isOpen={isGalleryOpen} 
          onClose={() => setIsGalleryOpen(false)} 
          onSelect={handleGallerySelect} 
          allowedTypes={galleryTarget.type === 'homepageBg' ? ['video'] : ['image', 'video']}
        />
      </div>
    </div>
  );
};

export default CmsSettings;
