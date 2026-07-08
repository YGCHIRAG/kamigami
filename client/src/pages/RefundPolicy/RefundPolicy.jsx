import React, { useState, useEffect } from "react";
import PageMeta from "../../components/PageMeta";
import api from "../../services/api";
import "./refund.css";

const DEFAULT_REFUND = {
  title: "SACRED EXCHANGES",
  subtitle: "Last Manifested: May 2026",
  sections: [
    {
      id: 1,
      title: "1. The Exchange Covenant",
      body: "Due to the hyper-limited nature of our streetwear drops and capsule collections, each garment summoned represents a unique energetic allocation. As a result, exchanges are only permitted for sizes, subject strictly to real-time warehouse availability. If the requested size variant is out of stock (depleted), we will initiate a vault credit coupon or refund."
    },
    {
      id: 2,
      title: "2. Banishment Terms (7-Day Return Window)",
      body: "You have a window of 7 days from the physical delivery confirmation (logged via our integrated Shiprocket logs) to initiate a return pact. Items must be returned unworn, unwashed, unaltered, and with all original temple tags, seals, and branded boxes completely intact. Special limited release Drops marked with the drop status are final sales and cannot be returned unless they contain visible manufacturer flaws."
    },
    {
      id: 3,
      title: "3. Manifestation Flaws",
      body: "If a vestment manifests with physical defects or printing inconsistencies, please take detailed photos of the flaw immediately and contact our support sanctuary at support@kamigami.co within 48 hours of delivery. We will immediately dispatch a replacement shipment or issue a full refund offering."
    },
    {
      id: 4,
      title: "4. Refund Timelines",
      body: "Once a returned garment is received back at our primary fulfillment temple, it undergoes a meticulous quality ritual. If approved, the refund will be credited back to your original payment vault (Razorpay account) within 5-7 business days."
    }
  ]
};

const RefundPolicy = () => {
  const [policy, setPolicy] = useState(DEFAULT_REFUND);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    const fetchRefundCms = async () => {
      try {
        const res = await api.get('/settings/refund_policy_cms');
        if (res.data?.data?.value) {
          setPolicy(res.data.data.value);
        }
      } catch (err) {
        console.log('[CMS-Refund] Fetch failed or settings unseeded, using default storefront refund scroll.');
      }
    };
    fetchRefundCms();
  }, []);

  return (
    <div id="main" className="policy-page-container refund-page">
      <PageMeta 
        title={policy.title} 
        description="Read the guidelines for returns, exchange covenants, and offering refunds at Kamigami." 
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

export default RefundPolicy;
