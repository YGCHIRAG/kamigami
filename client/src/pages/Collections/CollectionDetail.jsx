import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageMeta from '../../components/PageMeta';
import ProductCard from '../../components/ProductCards/ProductCards';
import slider1 from '../../assets/images/slider1.png';
import slider2 from '../../assets/images/slider2.png';
import slider3 from '../../assets/images/slider3.png';
import SoonImage from '../../assets/images/soon.png';
import api from '../../services/api';
import { ProductDataContext } from '../../Context/ProductDataContext';
import "./module.css";

const CollectionDetail = () => {
  const { slug } = useParams();
  const { productData } = useContext(ProductDataContext);
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    const fetchCollectionData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/collections/${slug}`);
        const collectionData = response.data?.data?.collection;

        if (collectionData) {
          setCollection(collectionData);
          // Format the products that were returned inside the collection
          const serverProducts = collectionData.products || [];
          const formatted = serverProducts.map(formatServerProduct);
          setProducts(formatted);
        } else {
          throw new Error('Fallback to offline demo');
        }
      } catch (err) {
        console.warn('[Collections] Fetch failed, initializing high-fidelity UI fallback layout.');

        // Match standard category slugs
        const fallbackName = slug.charAt(0).toUpperCase() + slug.slice(1);
        const fallbackCollection = {
          name: `${fallbackName} Capsule`,
          description: `Exclusive high-fidelity streetwear artifacts. Summoned from the archives of the ${fallbackName} drop.`,
          media: [
            {
              media: {
                type: 'image',
                url: slider1
              }
            }
          ]
        };

        setCollection(fallbackCollection);

        // Populate with filtered context items if available
        const localProducts = (productData || []).filter(
          p => p.category?.toLowerCase() === slug.toLowerCase()
        );

        if (localProducts.length > 0) {
          setProducts(localProducts);
        } else {
          // General fallbacks if context is empty
          setProducts([
            {
              id: 'fallback-1',
              title: `${fallbackName} Sacred Vestment`,
              description: '240+ GSM ultra-heavyweight premium combed cotton relaxed fit.',
              price: 1499,
              image: slider2,
              category: slug,
              size: 'M',
              discount: 10
            },
            {
              id: 'fallback-2',
              title: `${fallbackName} Hooded Shroud`,
              description: '450+ GSM loopback organic fleece luxury streetwear drop.',
              price: 2499,
              image: slider3,
              category: slug,
              size: 'M',
              discount: 0
            }
          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCollectionData();
  }, [slug]);

  return (
    <div id="main" className="collection-detail-container">
      <PageMeta
        title={collection ? `${collection.name} Capsule` : 'Streetwear Capsule'}
        description={collection?.description || "Shop the latest exclusive street streetwear capsule release from Kamigami."}
      />

      {loading ? (
        // Loading State Header
        <div className="collection-detail-header loading">
          <div className="skeleton-line detail-title"></div>
          <div className="skeleton-line detail-desc"></div>
        </div>
      ) : error ? (
        <div className="collection-detail-error">
          <h2>{error}</h2>
          <Link to="/collections" className="back-btn">Back to Capsules</Link>
        </div>
      ) : (
        (() => {
          // Collection Banner Header
          // Collection Banner Header
          const getBannerImage = () => {
            if (collection?.media && collection.media.length > 0) {
              const bannerMedia = collection.media.find(m => m.media && m.media.type === 'image') || collection.media[0];
              // Support both nested database media object and direct imported string assets
              if (bannerMedia?.media?.url) return bannerMedia.media.url;
              if (bannerMedia?.url) return bannerMedia.url;
              if (typeof bannerMedia === 'string') return bannerMedia;
            }
            return null;
          };
          const bannerUrl = getBannerImage();

          return (
            <div
              className="collection-detail-header"
              style={bannerUrl ? {
                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.9)), url(${bannerUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '260px',
                justifyContent: 'center',
                borderRadius: '12px',
                padding: '40px 24px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              } : {}}
            >
              <Link to="/collections" className="back-link">← All Capsules</Link>
              <div className="header-badge">Exclusive Release</div>
              <h1 className="detail-title-text">{collection.name}</h1>
              <p className="detail-desc-text">
                {collection.description || "Limited-quantity capsule with premium fits, custom graphics, and refined tailoring."}
              </p>
              <div className="collection-product-count">
                {products.length} {products.length === 1 ? 'Product Available' : 'Products Available'}
              </div>
              <div className="detail-header-divider"></div>
            </div>
          );
        })()
      )}

      <div className="collection-products-content">
        {loading ? (
          // Skeletons for products grid
          <div className="products-grid">
            {[1, 2, 4].map((n) => (
              <div key={n} className="product-skeleton-card">
                <div className="skeleton-card-image shimmer"></div>
                <div className="skeleton-card-info">
                  <div className="skeleton-card-line w-80 mb-2"></div>
                  <div className="skeleton-card-line w-40"></div>
                </div>
              </div>
            ))}
          </div>
        ) : !error && products.length === 0 ? (
          <div className="collection-products-empty">
            <p>No products are currently cataloged in this collection.</p>
            <p className="empty-subtext">Sign up to our mailing list to be notified when items drop.</p>
            <Link to="/collections" className="back-btn-secondary">Browse Other Capsules</Link>
          </div>
        ) : (
          // Renders the real product grid using premium ProductCard components
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionDetail;
