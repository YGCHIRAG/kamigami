import React, { useState, useEffect } from 'react';
import PageMeta from '../../components/PageMeta';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import "./module.css";

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const response = await api.get('/collections');
        // Extract from response.data.data.collections
        const fetchedCollections = response.data?.data?.collections || [];
        setCollections(fetchedCollections);
      } catch (err) {
        console.error('Error fetching collections:', err);
        setError('Failed to load collections. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  return (
    <div id="main" className="collections-container">
      <PageMeta 
        title="Collections" 
        description="Explore our full catalog of premium Kamigami collections. Discover exclusive limited-edition graphic hoodies, oversized t-shirts, and luxury street fashion." 
      />

      <div className="collections-header">
        <h1 className="collections-title">THE CAPSULES</h1>
        <p className="collections-subtitle">Curated drops and limited streetwear releases</p>
        <div className="header-divider"></div>
      </div>

      <div className="collections-content">
        {loading ? (
          // Loading skeleton state
          <div className="collections-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="collection-card skeleton">
                <div className="skeleton-image"></div>
                <div className="skeleton-content">
                  <div className="skeleton-line title"></div>
                  <div className="skeleton-line desc"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="collections-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
          </div>
        ) : collections.length === 0 ? (
          <div className="collections-empty">
            <p>No collections are currently active.</p>
            <p className="empty-subtext">Check back soon for new drops and seasonal apparel capsules.</p>
          </div>
        ) : (
          <div className="collections-grid">
            {collections.map((collection) => {
              // Extract media if available
              let imageUrl = null;
              if (collection.media && collection.media.length > 0 && collection.media[0].media && collection.media[0].media.url) {
                imageUrl = collection.media[0].media.url;
              }

              return (
                <Link 
                  to={`/collections/${collection.slug}`} 
                  key={collection.id} 
                  className="collection-card"
                >
                  <div className="collection-image-wrapper">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={collection.name} 
                        className="collection-image"
                        loading="lazy"
                      />
                    ) : (
                      <div className="collection-image-fallback">
                        {/* Elegant dynamic abstract gradients */}
                        <div className="fallback-gradient-bg"></div>
                        <span className="fallback-initial">{collection.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="collection-overlay"></div>
                  </div>

                  <div className="collection-info">
                    <div className="collection-tag">Capsule</div>
                    <h3 className="collection-name">{collection.name}</h3>
                    <p className="collection-desc">
                      {collection.description || "Premium streetwear items crafted with extreme precision and custom fits."}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Collections;
