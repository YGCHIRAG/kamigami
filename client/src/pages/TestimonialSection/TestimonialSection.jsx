import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import api from "../../services/api";
import "./testimonialSection.css";

gsap.registerPlugin(ScrollTrigger);

/* ── Default Sample Data ─────────────────────────── */
const DEFAULT_TESTIMONIALS = [
  {
    id: 1,
    name: "Arjun Mehta",
    avatar: "https://i.pravatar.cc/150?img=11",
    rating: 5,
    text: "Absolutely love the quality. The fabric feels premium and the fit is spot on. KamiGami is my new go-to brand for streetwear.",
  },
  {
    id: 2,
    name: "Priya Sharma",
    avatar: "https://i.pravatar.cc/150?img=5",
    rating: 5,
    text: "Ordered the oversized tee — it's exactly what I wanted. The design is clean, minimal, and the packaging was super nice.",
  },
  {
    id: 3,
    name: "Rohan Verma",
    avatar: "https://i.pravatar.cc/150?img=12",
    rating: 4,
    text: "Great attention to detail. The stitching, the tags, the overall vibe — everything screams quality. Will definitely order again.",
  },
  {
    id: 4,
    name: "Sneha Kapoor",
    avatar: "https://i.pravatar.cc/150?img=9",
    rating: 5,
    text: "This brand understands aesthetics. Every piece feels like it was designed with purpose. The hoodie is insanely comfortable.",
  },
  {
    id: 5,
    name: "Karan Singh",
    avatar: "https://i.pravatar.cc/150?img=59",
    rating: 5,
    text: "Best streetwear I've bought in India. The drop shoulder fit is perfect and the material is thick and breathable.",
  },
];

/* ── Stars helper ────────────────────────────────── */
const Stars = ({ count }) => (
  <div className="testimonial-stars">
    {Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`testimonial-star ${i < count ? "" : "empty"}`}>
        ★
      </span>
    ))}
  </div>
);

/* ── Component ───────────────────────────────────── */
const TestimonialSection = () => {
  const [testimonials, setTestimonials] = useState(DEFAULT_TESTIMONIALS);
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

  // Fetch testimonies on mount
  useEffect(() => {
    const fetchTestimonialsCms = async () => {
      try {
        const res = await api.get('/settings/homepage_cms');
        if (res.data?.data?.value?.testimonials) {
          setTestimonials(res.data.data.value.testimonials);
        }
      } catch (err) {
        console.log('[CMS-Testimonials] Fetch failed or settings unseeded, using default reviews.');
      }
    };
    fetchTestimonialsCms();
  }, []);

  // Reset refs array on each render to avoid stale entries
  cardRefs.current = [];

  const addCardRef = (el) => {
    if (el && !cardRefs.current.includes(el)) {
      cardRefs.current.push(el);
    }
  };

  useEffect(() => {
    let ctx;

    const initTimeout = setTimeout(() => {
      ctx = gsap.context(() => {
        const cards = cardRefs.current;
        const total = cards.length;
        if (!total) return;

        // Ensure initial offset is applied by GSAP
        cards.forEach((card, i) => {
          gsap.set(card, {
            y: i * 30,
            scale: 1 - i * 0.05,
            zIndex: total - i,
            opacity: 1,
          });
        });

        // Build scroll-linked timeline
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: `+=${total * 500}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Animate each card (skip the first)
        for (let i = 1; i < total; i++) {
          const card = cards[i];
          const timelinePos = (i - 1) * 1;

          // Push previous cards slightly down
          for (let j = 0; j < i; j++) {
            tl.to(
              cards[j],
              {
                y: (i - j) * 30,
                scale: 1 - (i - j) * 0.05,
                duration: 1,
                ease: "power2.inOut",
              },
              timelinePos
            );
          }

          // Active card moves to top position
          tl.to(
            card,
            {
              y: 0,
              scale: 1,
              zIndex: total + i,
              duration: 1,
              ease: "power2.inOut",
            },
            timelinePos
          );
        }

        ScrollTrigger.refresh();
      }, sectionRef);
    }, 100);

    return () => {
      clearTimeout(initTimeout);
      if (ctx) ctx.revert();
    };
  }, [testimonials]);

  return (
    <section className="testimonial-section" ref={sectionRef}>
      <div className="testimonial-pin">
        {/* Background glow */}
        <div className="testimonial-glow" />

        {/* Heading */}
        <div className="testimonial-heading">
          <p className="section-label">What People Say</p>
          <h2>Loved by Our Community</h2>
        </div>

        {/* Card Stack */}
        <div className="testimonial-stack">
          {testimonials.map((t, i) => {
            const initialY = i * 30;
            const initialScale = 1 - i * 0.05;
            const initialZIndex = testimonials.length - i;
            return (
              <div
                key={t.id}
                ref={addCardRef}
                className="testimonial-card"
                style={{
                  transform: `translate3d(0px, ${initialY}px, 0px) scale(${initialScale})`,
                  zIndex: initialZIndex,
                }}
              >
                <div className="testimonial-card-header">
                  <img
                    className="testimonial-avatar"
                    src={t.avatar}
                    alt={t.name}
                    loading="lazy"
                  />
                  <div className="testimonial-user-info">
                    <p className="testimonial-user-name">{t.name}</p>
                    <Stars count={t.rating} />
                  </div>
                </div>
                <p className="testimonial-text">{t.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
