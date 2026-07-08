import { useRef, useEffect, useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProductDataContext } from "../../Context/ProductDataContext";
import SoonImage from "../../assets/images/soon.png";
import "./module.css";

const SearchOverlay = ({ isOpen, setIsOpen }) => {
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { productData } = useContext(ProductDataContext);
  const [query, setQuery] = useState("");

  const productsList = productData || [];

  // Filter products based on search query
  const filteredProducts = query.trim() === "" 
    ? [] 
    : productsList.filter(
        (p) =>
          (p.title && p.title.toLowerCase().includes(query.toLowerCase())) ||
          (p.name && p.name.toLowerCase().includes(query.toLowerCase())) ||
          (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
      );

  // Auto-focus the input when the overlay opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 350);
      return () => clearTimeout(timer);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, setIsOpen]);

  const handleItemClick = (productId) => {
    setIsOpen(false);
    navigate(`/all-products/${productId}`);
  };

  const getProductImage = (p) => {
    if (p.image) return p.image;
    if (p.media && p.media.length > 0) {
      const firstImg = p.media.find(m => m.media && m.media.type === 'image');
      if (firstImg?.media?.url) return firstImg.media.url;
      if (p.media[0]?.media?.url) return p.media[0].media.url;
    }
    return SoonImage;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="search-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={() => setIsOpen(false)}
        >
          {/* Expanding search panel */}
          <motion.div
            className="search-panel"
            initial={{ width: 90, height: 48, borderRadius: 24 }}
            animate={{ width: 600, height: 520, borderRadius: 14 }}
            exit={{ width: 90, height: 48, borderRadius: 24, opacity: 0 }}
            transition={{
              width: { duration: 0.3, ease: [0.25, 1, 0.5, 1] },
              height: { duration: 0.3, delay: 0.12, ease: [0.25, 1, 0.5, 1] },
              borderRadius: { duration: 0.25 },
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Inner content fades in after the panel expands */}
            <motion.div
              className="search-inner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.2 }}
            >
              <div className="search-header-row">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search products..."
                  className="search-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button className="search-back-btn" onClick={() => setIsOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="search-results">
                {query.trim() === "" ? (
                  <div className="search-placeholder-box">
                    <Search size={32} className="search-icon-hint" />
                    <p className="search-results-placeholder">
                      Type to begin searching the archives...
                    </p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <p className="search-results-placeholder">
                    No products found matching "{query}"
                  </p>
                ) : (
                  filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      className="search-result-item"
                      onClick={() => handleItemClick(product.id)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: index * 0.03,
                        duration: 0.2,
                        ease: "easeOut",
                      }}
                    >
                      <div className="result-thumb">
                        <img
                          src={getProductImage(product)}
                          alt={product.title || product.name}
                          loading="lazy"
                        />
                      </div>
                      <div className="result-info">
                        <span className="result-title">{product.title || product.name}</span>
                        <span className="result-desc">
                          {product.description || "Premium apparel drop artifact"}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;