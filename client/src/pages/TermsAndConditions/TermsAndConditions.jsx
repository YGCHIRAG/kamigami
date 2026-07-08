import React, { useState, useEffect } from "react";
import PageMeta from "../../components/PageMeta";
import api from "../../services/api";
import "./terms.css";

const DEFAULT_TERMS = {
  title: "TERMS OF THE COVENANT",
  subtitle: "Last Manifested: May 2026",
  sections: [
    {
      id: 1,
      title: "1. The Pact Initiations",
      body: "By entering the KAMIGAMI virtual sanctum and viewing our collections, capsules, or timed-release drops, you explicitly bind yourself to these Terms of the Covenant. If you do not accept these spiritual and legal bindings, you must exit this portal immediately."
    },
    {
      id: 2,
      title: "2. Ritual Registrations & Accounts",
      body: "To acquire sacred streetwear vestments, you may be required to register credentials and establish shipping coordinates. You are solely responsible for maintaining absolute secrecy of your covenant passwords and tokens, providing 100% accurate physical delivery coordinates to ensure Shiprocket dispatch mapping succeeds, and all activities performed under your registered credentials."
    },
    {
      id: 3,
      title: "3. Garment Summoning (Orders & Inventory)",
      body: "Our products are manufactured in limited-edition capsules. Placing items in your cart portal does not reserve them. Special timed Drops are subject to extremely strict stock constraints and real-time reservation timers. Stock allocations occur dynamically during the payment intent and capture phases. All price manifests are shown in Indian Rupees (₹) and are final at the moment of payment commencement."
    },
    {
      id: 4,
      title: "4. Payments & Webhooks Sandbox",
      body: "Spiritual offerings are processed via custom payment gateways (Razorpay). Under sandbox configurations, clicking payment simulation buttons simulates capture events. Successful mock capture immediately commits transaction logs, deducts database inventory counts, and starts logistics packaging."
    },
    {
      id: 5,
      title: "5. The Covenant Code of Conduct",
      body: "You represent and covenant that you will not deploy automated crawling sigils, perform scraping attacks, abuse cart checkout API nodes, or act in any way that degrades temple loading velocities or disrupts other users."
    }
  ]
};

const TermsAndConditions = () => {
  const [policy, setPolicy] = useState(DEFAULT_TERMS);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    const fetchTermsCms = async () => {
      try {
        const res = await api.get('/settings/terms_conditions_cms');
        if (res.data?.data?.value) {
          setPolicy(res.data.data.value);
        }
      } catch (err) {
        console.log('[CMS-Terms] Fetch failed or settings unseeded, using default storefront terms scroll.');
      }
    };
    fetchTermsCms();
  }, []);

  return (
    <div id="main" className="policy-page-container terms-page">
      <PageMeta 
        title={policy.title} 
        description="The formal covenants and terms of order processing, ritual access, and garment summoning in the Kamigami realm." 
      />
      <div className="policy-header">
        <div className="policy-glow-halo"></div>
        <h1 className="policy-title">{policy.title}</h1>
        <p className="policy-subtitle">{policy.subtitle}</p>
      </div>

      <div className="policy-content-wrapper animate-fade">
        {policy.sections?.map((sec, i) => (
          <section key={sec.id || i} className="policy-section">
            <h2>{sec.title}</h2>
            <p>{sec.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
};

export default TermsAndConditions;
