import React from "react";
import { Link } from "react-router-dom";

import "./Module.css"

const LINKS = {
  connectWithUs: [
    { label: "Call", href: "tel:+917383240089" },
    { label: "Text (WhatsApp)", href: "https://wa.me/917383240089" },
    { label: "Instagram", href: "https://www.instagram.com/kamigami.in?igsh=MTczdDMwZndsam9rcA%3D%3D&utm_source=qr" },
    { label: "Youtube", href: "https://www.youtube.com/@joinkamigami?si=9VEG_MUp4ImJc83_" },
  ],
  orderSupport: [
    { label: "Make a return/Exchange", href: "/returns" },
    { label: "Refund/Exchange policy", href: "/refund-policy" },
    { label: "Track your order", href: "/userprofile" },
    { label: "Shipping policy", href: "/shipping-policy" },
    { label: "FAQ's", href: "/faq" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ],
  weAreKAMIGAMI: [
    { label: "Our Story", href: "/about-us" },
    { label: "Contact Us", href: "/contact-us" },
    { label: "Blogs", href: "/blogs" },
  ],
};
// ────────────────────────────────────────────────────────────────────

function LinkColumn({ title, links }) {
  return (
    <div className="footer-col">
      <h4>{title}</h4>
      <ul>
        {links.map((link) => (
          <li key={link.label}>
            {link.href.startsWith("/") ? (
              <Link to={link.href}>{link.label}</Link>
            ) : (
              <a href={link.href}>{link.label}</a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function KamigamiFooter() {
  return (
    <>
      <footer className="footer-root">

        {/* Top bar */}
        

        {/* Links grid */}
        <div className="footer-links-grid">
          <LinkColumn title="Connect with us" links={LINKS.connectWithUs} />
          <LinkColumn title="Order Support" links={LINKS.orderSupport} />
          <LinkColumn title="We are KAMIGAMI" links={LINKS.weAreKAMIGAMI} />
        </div>

        {/* Faded divider */}
        <div className="faded-divider" />

        {/* Giant brand name */}
        <div className="footer-brand-bar">
          <span className="brand-text">KAMIGAMI</span>
        </div>

        <div className="footer-bottom-note">
          © 2025 KAMIGAMI. ALL RIGHTS RESERVED.
        </div>

      </footer>
    </>
  );
}