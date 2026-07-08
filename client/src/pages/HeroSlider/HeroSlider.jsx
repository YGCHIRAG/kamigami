import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../HeroSlider/Module.css";
import api from "../../services/api";

const DEFAULT_SLIDES = [
  {
    id: 1,
    title: "Hoodies",
    subtitle: "Shop Now",
    image: "/images/website1.png",
    imageMobile: "/images/slider1.png",
    redirectUrl: "/collections/hoodies"
  },
  {
    id: 2,
    title: "New Collection",
    subtitle: "Discover",
    image: "/images/website2.jpeg",
    imageMobile: "/images/slider2.png",
    redirectUrl: "/collections"
  },
  {
    id: 3,
    title: "Street Wear",
    subtitle: "Shop Now",
    image: "/images/website3.png",
    imageMobile: "/images/slider3.png",
    redirectUrl: "/drops"
  },
];

const HeroSlider = () => {
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [current, setCurrent] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchSliderCms = async () => {
      try {
        const res = await api.get('/settings/homepage_cms');
        if (res.data?.data?.value?.slider) {
          setSlides(res.data.data.value.slider);
        }
      } catch (err) {
        console.log('[CMS-Slider] Fetch failed or settings unseeded, using default storefront sliders.');
      }
    };
    fetchSliderCms();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [slides.length]);
 
  return (
    <section className="hero-slider">

      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`slide ${index === current ? "active" : ""}`}
          onClick={() => slide.redirectUrl && navigate(slide.redirectUrl)}
          style={{ cursor: slide.redirectUrl ? 'pointer' : 'default' }}
        >

          <img src={(isMobile && slide.imageMobile) ? slide.imageMobile : slide.image} alt="slider" className="slide-image" />

          <div className="overlay"></div>

          <div className="slide-content">

            <h1>{slide.title}</h1>

            <p>{slide.subtitle}</p>

          </div>

        </div>
      ))}

      {/* Dots */}
      <div className="slider-dots">

        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`dot ${index === current ? "active-dot" : ""}`}
          ></button>
        ))}

      </div>

    </section>
  );
};

export default HeroSlider;