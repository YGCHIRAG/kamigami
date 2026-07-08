import React, { useState, useEffect } from "react";
import PageMeta from "../../components/PageMeta";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import api from "../../services/api";
import "./contact.css";

const DEFAULT_CONTACT_DETAILS = {
  coordinates: "104, Cyber-Bazaar, Gods Realm, Sector-90, Gurgaon, Haryana, India",
  supportEmail: "support@kamigami.co",
  ritualsEmail: "rituals@kamigami.co",
  phone: "+91 98765 43210",
  timings: "Mon - Sat // 10:00 AM - 7:00 PM"
};

const ContactUs = () => {
  const [contactInfo, setContactInfo] = useState(DEFAULT_CONTACT_DETAILS);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchContactDetails = async () => {
      try {
        const res = await api.get('/settings/contact_details_cms');
        if (res.data?.data?.value) {
          setContactInfo(res.data.data.value);
        }
      } catch (err) {
        console.log('[CMS-Contact] Fetch failed or settings unseeded, using default contact details.');
      }
    };
    fetchContactDetails();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Order Manifestation",
    message: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendManifest = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill all required channels.");
      return;
    }

    try {
      setIsSubmitting(true);
      // Simulate sending ritual message to backend server
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
      setFormData({
        name: "",
        email: "",
        subject: "Order Manifestation",
        message: ""
      });
    } catch (err) {
      console.error(err);
      alert("Failed to send manifestation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="main" className="contact-main-container">
      <PageMeta 
        title="Contact the Temple" 
        description="Initiate communication with the Kamigami support sanctuary. Send custom orders, delivery, or collaboration messages." 
      />

      <div className="contact-header">
        <div className="contact-glow-halo"></div>
        <h1 className="contact-title">CONTACT THE TEMPLE</h1>
        <p className="contact-subtitle">Channel your queries directly into our digital archives.</p>
      </div>

      <div className="contact-split-layout">
        {/* LEFT: Contact form */}
        <div className="contact-left-card">
          {isSuccess ? (
            <div className="contact-success-state animate-fade">
              <CheckCircle2 className="success-icon text-green-500 animate-bounce" size={48} />
              <h2>MESSAGE SEALED</h2>
              <p>Your manifestation has been logged in our databases. The wardens of the sanctuary will reply within 24 hours.</p>
              <button 
                type="button" 
                onClick={() => setIsSuccess(false)}
                className="new-message-btn"
              >
                CHANNEL NEW INQUIRY
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendManifest} className="contact-form">
              <h3>SECURE COMMUNICATION INITIATION</h3>
              
              <div className="contact-input-group">
                <label>YOUR NAME / IDENTIFIER *</label>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="E.G. CHIRAG SHARMA" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="contact-input-group">
                <label>EMAIL VAULT ADDRESS *</label>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="E.G. SOUL@KAMIGAMI.CO" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="contact-input-group">
                <label>SUBJECT MANIFESTATION</label>
                <select 
                  name="subject" 
                  value={formData.subject}
                  onChange={handleInputChange}
                >
                  <option value="Order Manifestation">Order Manifestation / Delivery</option>
                  <option value="Garment Swap">Garment Exchange / Return</option>
                  <option value="Collaborations">Sacred Collaboration Pact</option>
                  <option value="Tech Defect">Temple Portal Bug Report</option>
                </select>
              </div>

              <div className="contact-input-group">
                <label>RITUAL MESSAGE / DESCRIPTION *</label>
                <textarea 
                  name="message" 
                  rows="5"
                  placeholder="STATE YOUR MESSAGE CLEARLY..." 
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="send-ritual-btn"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    TRANSMITTING MESSAGE SIGIL...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    TRANSMIT MESSAGE
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* RIGHT: Contact Information */}
        <div className="contact-right-panel">
          <div className="info-block">
            <h3>THE PHYSICAL SANCTUM</h3>
            <div className="info-item">
              <MapPin className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <p className="title">Temples Coordinate</p>
                <p className="desc">{contactInfo.coordinates}</p>
              </div>
            </div>
          </div>

          <div className="info-block">
            <h3>DIRECT TELEMETRY</h3>
            <div className="info-item">
              <Mail className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <p className="title">Electronic Mail</p>
                <p className="desc">{contactInfo.supportEmail}</p>
                {contactInfo.ritualsEmail && <p className="desc">{contactInfo.ritualsEmail}</p>}
              </div>
            </div>
            
            <div className="info-item mt-4">
              <Phone className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <p className="title">Vocal Telephony</p>
                <p className="desc">{contactInfo.phone}</p>
                <p className="desc">{contactInfo.timings}</p>
              </div>
            </div>
          </div>

          <div className="info-block security-assurance">
            <h4>GUILD PACT ASSURANCE</h4>
            <p>Every message transmitted is logged in a secure database cluster. Our response wardens analyze each sigil and respond directly to your vault email.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
