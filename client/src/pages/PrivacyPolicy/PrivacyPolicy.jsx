import React, { useState, useEffect } from "react";
import PageMeta from "../../components/PageMeta";
import api from "../../services/api";
import "./privacy.css";

const DEFAULT_PRIVACY = {
  title: "PRIVACY COVENANT",
  subtitle: "Last Manifested: May 2026",
  sections: [
    {
      id: 1,
      title: "1. The Sacred Seal",
      body: "At KAMIGAMI, we honor the sanctuary of your identity. Your personal data is treated with the utmost reverence. This Privacy Covenant governs the collection, transmission, and preservation of data nodes generated when you enter our realm and acquire our sacred vestments."
    },
    {
      id: 2,
      title: "2. The Offerings Gathered",
      body: "When you initiate a pact with our temple, we collect specific telemetry necessary to manifest your garments in the physical plane: Soul Credentials (Name, secure login credentials, and telemetry keys when signing in), Delivery Coordinates (Shipping addresses, geographical coordinates, and postal nodes), and Offerings Data (Transaction details processed securely via our cryptographic payment partners - Razorpay. We do not store raw credit vault keys or payment credentials directly)."
    },
    {
      id: 3,
      title: "3. Manifestation Sigils (Cookies)",
      body: "We deploy tracking sigils (cookies) to observe how visitors navigate the temple. These sigils allow us to maintain session integrity and preserve items within your cart sidebar portal, optimize canvas rendering, including draggable video frames and interactive timelines, and track temple metrics to improve delivery, layouts, and interactive loading screens."
    },
    {
      id: 4,
      title: "4. Dynamic Third-Party Portals",
      body: "To complete the manifestation of your order, your details are shared exclusively with highly trusted logistics and security partners: Shiprocket Premium Network (Your delivery coordinates are shared to enable dispatch, tracking, and AWB activation) and Razorpay Encrypted Sandbox (Offerings are captured via highly secure cryptographic gateways)."
    },
    {
      id: 5,
      title: "5. The Vault Security",
      body: "All gathered data is encrypted in transit using cryptographic TLS tunnels and stored behind firewalled database matrices. You retain the right to query the archive, request complete database deletion of your coordinates, or revoke your profile access credentials at any time by contacting our support wardens."
    }
  ]
};

const PrivacyPolicy = () => {
  const [policy, setPolicy] = useState(DEFAULT_PRIVACY);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    const fetchPrivacyCms = async () => {
      try {
        const res = await api.get('/settings/privacy_policy_cms');
        if (res.data?.data?.value) {
          setPolicy(res.data.data.value);
        }
      } catch (err) {
        console.log('[CMS-Privacy] Fetch failed or settings unseeded, using default storefront policy scroll.');
      }
    };
    fetchPrivacyCms();
  }, []);

  return (
    <div id="main" className="policy-page-container privacy-page">
      <PageMeta 
        title={policy.title} 
        description="The covenant of data and soul protection. Read the official privacy policy of Kamigami." 
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

export default PrivacyPolicy;
