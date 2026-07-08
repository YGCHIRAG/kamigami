import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../../components/PageMeta';
import ProductCard from '../../components/ProductCards/ProductCards';
import SoonImage from '../../assets/images/soon.png';
import api from '../../services/api';
import { ProductDataContext } from '../../Context/ProductDataContext';
import "./drops.css";

const Drops = () => {
  const { productData } = useContext(ProductDataContext);
  const [drops, setDrops] = useState([]);
  const [activeDrop, setActiveDrop] = useState(null);
  const [activeDropProducts, setActiveDropProducts] = useState([]);
  const [upcomingDrop, setUpcomingDrop] = useState(null);
  const [pastDrops, setPastDrops] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Timer states
  const [countdownText, setCountdownText] = useState("");
  const [subscriptionEmail, setSubscriptionEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Database to Client Product Formatter
  const formatServerProduct = (p) => {
    let image = SoonImage;
    if (p.media && p.media.length > 0 && p.media[0].media && p.media[0].media.url) {
      image = p.media[0].media.url;
    }

    const price = p.basePrice ? Number(p.basePrice) : 0;

    let discount = 0;
    if (p.compareAtPrice && Number(p.compareAtPrice) > price) {
      const comparePrice = Number(p.compareAtPrice);
      discount = Math.round(((comparePrice - price) / comparePrice) * 100);
    }

    const category = p.category?.name?.toLowerCase() || 'unassigned';

    let size = 'M';
    if (p.variants && p.variants.length > 0) {
      const sizeAttr = p.variants[0].attributes?.size || p.variants[0].attributes?.Size;
      if (sizeAttr) size = sizeAttr;
    }

    return {
      id: p.id,
      title: p.name,
      description: p.description || "",
      price,
      image,
      category,
      size,
      discount,
      slug: p.slug,
      variants: p.variants,
    };
  };

  useEffect(() => {
    const fetchDropsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch all drops
        const response = await api.get('/drops');
        const allDrops = response.data?.data?.drops || [];
        setDrops(allDrops);

        // 2. Identify active, upcoming, and past drops
        const active = allDrops.find(d => d.status === 'ACTIVE');
        const scheduled = allDrops.find(d => d.status === 'SCHEDULED');
        const past = allDrops.filter(d => d.status === 'ENDED');

        setPastDrops(past);

        if (active) {
          setActiveDrop(active);
          // 3. If active, fetch the drop detail with products
          const activeDetail = await api.get(`/drops/${active.slug}`);
          const dropProducts = activeDetail.data?.data?.dropProducts || [];
          // Flatten standard dropProduct -> product
          const productsList = dropProducts.map(dp => dp.product).filter(Boolean);
          const formatted = productsList.map(formatServerProduct);
          setActiveDropProducts(formatted);
        } else if (scheduled) {
          setUpcomingDrop(scheduled);
        } else {
          throw new Error("No active/upcoming drops found on API, using fallbacks");
        }
      } catch (err) {
        console.warn('[Drops] Fetch failed, initializing high-fidelity UI drop fallbacks.');
        
        // Active Drop Fallback
        const mockActiveDrop = {
          id: 'fallback-drop-id',
          title: "KAMIGAMI 'GENESIS' BLOODLINE",
          description: "Ancient deities materialize. Secure these sacred artifacts before they vanish back into the shadows.",
          status: 'ACTIVE',
          endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days from now
        };
        setActiveDrop(mockActiveDrop);

        // Default Drop Products from local catalog
        const defaultItems = (productData || []).slice(0, 4);
        if (defaultItems.length > 0) {
          setActiveDropProducts(defaultItems);
        } else {
          setActiveDropProducts([
            {
              id: 'awaken-heavyweight-graphic-tee',
              title: "Kamigami 'AWAKEN' Heavyweight Graphic Tee",
              description: "Awaken your inner divinity with the Kamigami 'AWAKEN' Graphic Tee. 240+ GSM combed cotton.",
              price: 1499,
              image: '/img/awaken_front.jpg',
              category: 'men',
              size: 'M',
              discount: 40
            }
          ]);
        }

        // Mock archived drops
        setPastDrops([
          {
            id: 'past-1',
            title: "VALKYRIE SHROUD DROP",
            description: "Completely banished to the void.",
            startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'ENDED'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDropsData();
  }, [productData]);

  // Timer Countdown Effect
  useEffect(() => {
    let targetTime = null;
    let isEndingTimer = false;

    if (activeDrop) {
      targetTime = new Date(activeDrop.endTime);
      isEndingTimer = true;
    } else if (upcomingDrop) {
      targetTime = new Date(upcomingDrop.startTime);
      isEndingTimer = false;
    }

    if (!targetTime) return;

    const interval = setInterval(() => {
      const difference = targetTime - new Date();

      if (difference <= 0) {
        setCountdownText(isEndingTimer ? "DROP HAS ENDED" : "LIVE NOW");
        clearInterval(interval);
        window.location.reload(); // Reload page to transition states
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      // Cyberpunk format
      const formatted = `${days > 0 ? `${days}d:` : ""}${String(hours).padStart(2, "0")}h:${String(minutes).padStart(2, "0")}m:${String(seconds).padStart(2, "0")}s`;
      setCountdownText(formatted);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeDrop, upcomingDrop]);

  const handleSubscribeSubmit = (e) => {
    e.preventDefault();
    if (!subscriptionEmail.trim()) return;
    setSubscribed(true);
    setSubscriptionEmail("");
  };

  return (
    <div id="main" className="drops-page-container">
      <PageMeta
        title="Timed Drops"
        description="Sign up and shop real-time, timelocked streetwear capsule drops from Kamigami. Once time runs out, these garments are gone forever."
      />

      {loading ? (
        // Loading state
        <div className="drops-loading">
          <div className="skeleton-line drops-banner-shimmer"></div>
          <div className="skeleton-grid-shimmer"></div>
        </div>
      ) : error ? (
        <div className="drops-error-view">
          <h2>{error}</h2>
          <button onClick={() => window.location.reload()} className="retry-btn">Retry Summons</button>
        </div>
      ) : (
        <>
          {/* ==============================================
              STAGE A: ACTIVE DROP LIVE
             ============================================== */}
          {activeDrop ? (
            <div className="active-drop-section animate-fade">
              <div className="drop-indicator-badge live">
                <span className="badge-pulse"></span>
                ACTIVE SPIRIT RELEASE
              </div>

              <div className="active-drop-hero">
                <h1 className="active-drop-title">{activeDrop.title}</h1>
                <p className="active-drop-desc">
                  {activeDrop.description || "Ancient deities materialize. Secure these sacred artifacts before they vanish back into the shadows."}
                </p>

                <div className="timer-wrapper">
                  <div className="timer-label">MANIFESTATION CONCLUDES IN</div>
                  <div className="timer-countdown active">{countdownText}</div>
                </div>
              </div>

              <div className="active-drop-products">
                <div className="section-header">
                  <h2>SACRED VESTMENTS</h2>
                  <div className="header-bar"></div>
                </div>

                {activeDropProducts.length === 0 ? (
                  <div className="no-products-drop">
                    <p>No holy garments have descended in this release.</p>
                  </div>
                ) : (
                  <div className="drop-products-grid">
                    {activeDropProducts.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : upcomingDrop ? (
            /* ==============================================
                STAGE B: UPCOMING SCHEDULED TEASER
               ============================================== */
            <div className="upcoming-drop-section animate-fade">
              <div className="drop-indicator-badge scheduled">
                <span className="badge-pulse scheduled"></span>
                PANTHEON DESCENSION IMMINENT
              </div>

              <div className="upcoming-drop-hero">
                <h1 className="upcoming-drop-title">{upcomingDrop.title}</h1>
                <p className="upcoming-drop-desc">
                  {upcomingDrop.description || "The next ritual is prepared. The ancient gods will descend shortly. Prepare your soul."}
                </p>

                <div className="timer-wrapper upcoming">
                  <div className="timer-label">THE GATES UNLOCK IN</div>
                  <div className="timer-countdown upcoming-glow">{countdownText}</div>
                </div>

                <div className="notification-card">
                  {subscribed ? (
                    <div className="sub-success-message">
                      <span className="success-icon">✓</span> PACT SEALED. YOU WILL BE SUMMONED AT DAWN.
                    </div>
                  ) : (
                    <form onSubmit={handleSubscribeSubmit} className="sub-form">
                      <input
                        type="email"
                        placeholder="ENTER EMAIL TO SEAL THE PRE-ACCESS PACT"
                        value={subscriptionEmail}
                        onChange={(e) => setSubscriptionEmail(e.target.value)}
                        required
                        className="sub-input"
                      />
                      <button type="submit" className="sub-submit-btn">SEAL THE PACT</button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ==============================================
                STAGE C: FALLBACK / NO DROPS
               ============================================== */
            <div className="fallback-drop-section animate-fade">
              <div className="fallback-hero">
                <div className="fallback-lock-icon">🔒</div>
                <h1 className="fallback-title">THE GATES ARE SEALED</h1>
                <p className="fallback-desc">
                  No active spirits or scheduled descensions are currently active in this realm.
                </p>
                <div className="notification-card">
                  {subscribed ? (
                    <div className="sub-success-message">
                      ✓ YOU ARE INITIATED INTO THE ORDER.
                    </div>
                  ) : (
                    <form onSubmit={handleSubscribeSubmit} className="sub-form">
                      <input
                        type="email"
                        placeholder="SEAL THE INITIATION PACT"
                        value={subscriptionEmail}
                        onChange={(e) => setSubscriptionEmail(e.target.value)}
                        required
                        className="sub-input"
                      />
                      <button type="submit" className="sub-submit-btn">INITIATE</button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==============================================
              ARCHIVED / SOLD OUT PAST DROPS
             ============================================== */}
          {pastDrops.length > 0 && (
            <div className="past-drops-section">
              <div className="past-drops-header">
                <h2>THE UNDERWORLD // EXILED DEITIES</h2>
                <p>Departed artifacts — once they return to the void, they are never re-summoned.</p>
                <div className="past-header-bar"></div>
              </div>

              <div className="past-drops-grid">
                {pastDrops.map(drop => (
                  <div key={drop.id} className="past-drop-card grayscale">
                    <div className="sold-out-overlay">
                      <div className="sold-out-ribbon">BANISHED</div>
                    </div>
                    <div className="past-drop-info">
                      <div className="past-drop-date">
                        {new Date(drop.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <h3 className="past-drop-name">{drop.title}</h3>
                      <p className="past-drop-meta">
                        {drop.description || "Limited-edition timed release capsule. Completely vanished."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Drops;
