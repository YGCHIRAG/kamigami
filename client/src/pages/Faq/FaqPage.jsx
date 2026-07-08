import React, { useEffect, useState } from "react";
import PageMeta from "../../components/PageMeta";
import { HelpCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import api from "../../services/api";
import "./faqpage.css";

const FaqPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const res = await api.get("/faqs");
        const faqList = res.data?.data || res.data || [];
        setFaqs(faqList);
      } catch (err) {
        console.error("Failed to load FAQs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const categories = ["All", ...new Set(faqs.map(faq => faq.category || "General"))];

  const filteredFaqs = faqs.filter(faq => {
    if (activeCategory === "All") return true;
    return (faq.category || "General") === activeCategory;
  });

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="faq-page">
      <PageMeta 
        title="Frequently Asked Questions — FAQ" 
        description="Find answers to common questions about Kamigami drops, payment packaging, shipping rates, and refund policies." 
      />
      <div className="faq-container">
        <header className="faq-header">
          <HelpCircle size={36} className="text-red-500 animate-pulse" />
          <h1 className="faq-title">TEMPLE FAQS</h1>
          <p className="faq-subtitle">Decrypting common inquiries from the Kamigami archives</p>
        </header>

        {loading ? (
          <div className="faq-loading">
            <Loader2 className="animate-spin text-red-600" size={36} />
            <p>RECALLING SCROLL INFORMATION...</p>
          </div>
        ) : faqs.length === 0 ? (
          <div className="faq-empty">
            <p>No questions have been logged in the archives yet. Check back soon.</p>
          </div>
        ) : (
          <>
            {/* Category tabs */}
            <div className="faq-tabs-bar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setExpandedId(null);
                  }}
                  className={`faq-tab-btn ${activeCategory === cat ? 'active' : ''}`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Accordion list */}
            <div className="faq-accordion-list">
              {filteredFaqs.map(faq => {
                const isExpanded = expandedId === faq.id;
                return (
                  <div key={faq.id} className={`faq-card ${isExpanded ? 'open' : ''}`}>
                    <div className="faq-question-row" onClick={() => toggleExpand(faq.id)}>
                      <h3>{faq.question}</h3>
                      <button className="faq-toggle-arrow">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="faq-answer-row animate-fade">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FaqPage;
