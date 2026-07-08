import React, { useState, useEffect } from "react";
import PageMeta from "../../components/PageMeta";
import "./shipping.css";

const DEFAULT_SHIPPING = {
  title: "SHIPPING & DISPATCH COVENANTS",
  subtitle: "Last Manifested: May 2026",
  sections: [
    {
      id: 1,
      title: "1. The Gathering & Packaging Rituals",
      body: "All garments are prepared and packaged inside custom-designed Kamigami protective containers. Dispatch rituals take 24 to 48 hours from the capture of your offering, excluding periods when the stars align on public holidays and Sundays."
    },
    {
      id: 2,
      title: "2. Transit Coordinates (Delivery Areas)",
      body: "We ship nationwide across India utilizing premium logistics providers mapped dynamically via our Shiprocket network. Standard delivery takes 3 to 5 business days after tracking manifest activation, depending on the remoteness of your coordinates."
    },
    {
      id: 3,
      title: "3. Tracking Sigils (AWB Tracking)",
      body: "Once your package crosses the threshold of our temple, a tracking sigil (Air Waybill number) is auto-dispatched via SMS and email telemetry. You can use this telemetry key to monitor your parcel in transit."
    },
    {
      id: 4,
      title: "4. Sacred Deliveries & Signatures",
      body: "To ensure your vestments are received securely, all shipments require direct physical signature verification upon arrival. Delivery wardens will attempt delivery up to 3 times before returning the package to our temple."
    }
  ]
};

const ShippingPolicy = () => {
  const [policy] = useState(DEFAULT_SHIPPING);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div id="main" className="policy-page-container shipping-page">
      <PageMeta 
        title={policy.title} 
        description="Read the shipping guidelines, dispatch rituals, and transit coordinates for Kamigami orders." 
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

export default ShippingPolicy;
