import React, { useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "./Module.css";

const DEFAULT_ABOUT = {
  heroTitle: "Forge Your \n Sacred Identity",
  heroText: "Step into a world of high-quality, dark streetwear and shadow-infused aesthetics. From daily statement wear to exclusive drops, find your place in the Kamigami bloodline.",
  rightImage: "img/blooded.jpg",
  cards: [
    {
      img: "img/blood.jpg",
      title: "SIGNATURE",
      sub: "STAPLES",
    },
    {
      img: "img/realm.jpg",
      title: "TRENDSETTER",
      sub: "COLLECTION",
    },
    {
      img: "img/armr.jpg",
      title: "VINCE",
      sub: "EXCLUSIVE",
    },
  ]
};

const AboutSection = () => {
  const [aboutData, setAboutData] = useState(DEFAULT_ABOUT);

  useEffect(() => {
    const fetchAboutCms = async () => {
      try {
        const res = await api.get('/settings/homepage_cms');
        if (res.data?.data?.value?.about) {
          setAboutData(res.data.data.value.about);
        }
      } catch (err) {
        console.log('[CMS-About] Fetch failed or settings unseeded, using default storefront about content.');
      }
    };
    fetchAboutCms();
  }, []);

  const renderTitle = (titleText) => {
    if (!titleText) return "";
    return titleText.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < titleText.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <section className="about-section">
      <div className="about-container">
        {/* LEFT SIDE */}
        <div className="left-section">
          {/* HERO CARD */}
          <div className="hero-card">
            <div className="hero-overlay"></div>

            <div>
              <h2 className="hero-title">
                {renderTitle(aboutData.heroTitle)}
              </h2>

              <p className="hero-text">
                {aboutData.heroText}
              </p>
            </div>

            <div className="shop-btn">
              <Link to="/about-us" style={{ textAlign: "center", textDecoration: "none", color: "inherit" }}>
                ABOUT <br /> US
              </Link>
            </div>
          </div>

          {/* BOTTOM CARDS */}
          <div className="card-grid">
            {aboutData.cards.map((card, i) => (
              <div key={i} className="card">
                <img src={card.img} alt="" />
                <div className="card-overlay"></div>

                <div className="card-text">
                  <p>{card.title}</p>
                  <span>{card.sub}</span>
                </div>

                <ArrowUpRight className="card-icon" />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="right-section">
          <img
            src={aboutData.rightImage}
            alt=""
          />

          <div className="image-overlay"></div>

         
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
