import React, { useState, useEffect } from 'react';
import PageMeta from '../PageMeta';
import Hero from "../Hero/Hero";
import Product from "../../pages/ProductPages/Product";
import HeroSlider from '../../pages/HeroSlider/HeroSlider';
import AboutSection from '../../pages/AboutSection/AboutSection';
import TestimonialSection from '../../pages/TestimonialSection/TestimonialSection';
import ComingSoon from '../Coming Soon/ComingSoon';
import videoSrc from "../../assets/videos/LandingPage_compressed.mp4";
import api from "../../services/api";
import "./MainContainer.css";
import MainHeroMobile from '../../pages/MainHero/MainHeroMobile';
import SEO from '../SEO/Seo';

const MainContainer = () => {
  const [bgVideo, setBgVideo] = useState("");

  useEffect(() => {
    const fetchCmsSettings = async () => {
      try {
        const res = await api.get('/settings/homepage_cms');
        if (res.data?.data?.value?.backgroundVideo) {
          setBgVideo(res.data.data.value.backgroundVideo);
        }
      } catch (err) {
        console.warn('[CMS-BgVideo] Failed to fetch homepage settings, using local fallback video.');
      }
    };
    fetchCmsSettings();
  }, []);

  return (
    <div className="relative min-h-screen text-white">
      <SEO
        title="KAMIGAMI | Premium Anime Clothing"
        description="Shop premium anime oversized t-shirts, hoodies and exclusive streetwear inspired by your favourite anime."
        keywords="anime clothing, anime t shirts, oversized tshirts, anime merch"
        url="https://kamigami.in/"
      />
      

      {/* Dynamic fixed video background */}
      <div className="homepage-bg-video-container">
        <video
          key={bgVideo}
          src={bgVideo || videoSrc}
          autoPlay
          muted
          loop
          playsInline
          className="homepage-bg-video"
        />
        <div className="homepage-bg-overlay" />
      </div>

      {/* Mobile-specific hero section */}
      <div className="block md:hidden">
        <MainHeroMobile />
      </div>

      {/* Desktop hero section */}
      <div className="hidden md:block">
        <Hero />
      </div>
      <HeroSlider />
      {/* <Product /> */}
      <ComingSoon />
      <TestimonialSection />
      <AboutSection />
    </div>
  );
};

export default MainContainer;
