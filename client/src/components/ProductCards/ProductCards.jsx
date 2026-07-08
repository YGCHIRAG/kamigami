import React, { useContext, useState } from "react";
import { ShoppingCart } from "lucide-react";
import "../ProductCards/Module.css";
import { CartContext } from "../../Context/CartContext";
import { Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import toast from "react-hot-toast";

const ProductCard = ({ product }) => {
  const { cartItems, setCartItems, setIsCartOpen } = useContext(CartContext);
  const [imgLoading, setImgLoading] = useState(true);
  const { user } = useAuth();

  if (!product) return null;

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }
    const existing = cartItems.find((item) => item.id === product.id);
    if (existing) {
      const updated = cartItems.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCartItems(updated);
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
    setIsCartOpen(true); 
  };

  return (

  <Link
  to={`/all-products/${product.id}`}
  className="product-link"
>

  <div className="card relative bg-neutral-900">

    {/* Product Image Loading Skeleton */}
    {imgLoading && (
      <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
    )}

    {/* Product Image */}
    <img
      src={product.image}
      alt={product.title}
      onLoad={() => setImgLoading(false)}
      className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoading ? 'opacity-0' : 'opacity-100'}`}
    />

    {/* Bottom Content */}
    <div className="bottom">

      <div className="bottom-content">

        {/* Product Title */}
        <h1>
          {product.title}
        </h1>

        {/* Price/Category + Button Row */}
        <div className="price-cart">

          <p className="product-card-category">
            {product.category}
          </p>

          <button
            className="add-cart-btn"
            onClick={(e) => {
              e.preventDefault(); // important: link navigation stop karega
              e.stopPropagation();
              handleAddToCart();
              // yaha addToCart(product) call kar sakte ho
            }}
          >
            <span className="add-cart-text">Add To Cart</span>
            <span className="add-cart-icon-mobile">
              <ShoppingCart size={14} style={{ display: "inline-block", verticalAlign: "middle", marginLeft: "2px" }} />
            </span>
          </button>

        </div>

      </div>

    </div>

  </div>

</Link>

);
};

export default ProductCard;