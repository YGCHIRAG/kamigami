import React, { useContext } from "react";
import ProductCard from "../../components/ProductCards/ProductCards";
import CartSidebar from "../../components/CartSidebar/CartSidebar";
import { Link } from "react-router-dom";
import "../ProductPages/Module.css";

import { ProductDataContext } from "../../Context/ProductDataContext";

const ProductSection = () => {
  const { productData } = useContext(ProductDataContext);

  // Limit homepage showcase to the first 6 products for a premium grid presentation
  const featuredProducts = productData ? productData.slice(0, 6) : [];

  return (
    <section className="homepage-product-section">
      <div className="homepage-product-container">
        
        {/* Title Header */}
        <div className="homepage-product-header">
          <h2>NEW RELEASES</h2>
          <div className="gothic-divider" />
          <p>EXPLORE THE EXCLUSIVE DEBUT DROPS FROM KAMIGAMI</p>
        </div>

        {/* Dynamic Showcase Grid */}
        <div className="product-grid">
          {featuredProducts.length === 0 ? (
            <p className="no-products-msg">NO APPAREL CURRENTLY RELEASING</p>
          ) : (
            featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>

        {/* Discovery Action CTA */}
        <div className="homepage-product-footer">
          <Link to="/all-products" className="discover-all-btn">
            DISCOVER ALL GEAR
          </Link>
        </div>

      </div>

      <CartSidebar />
    </section>
  );
};

export default ProductSection;