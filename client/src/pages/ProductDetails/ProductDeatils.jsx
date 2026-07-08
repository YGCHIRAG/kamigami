import React, { useState, useContext, useEffect, useRef } from "react"; // ← add useEffect & useRef
import PageMeta from "../../components/PageMeta";
import api from "../../services/api";
import SoonImage from "../../assets/images/soon.png";

import { Heart, Truck, Calendar, Package, Percent } from "lucide-react";

import { useParams, useNavigate } from "react-router-dom";

import ReviewsSection from "../../components/ReviewsSection/ReviewsSection";
import RelatedProducts from "../../components/RelatedProducts/RelatedProducts";

import { ProductDataContext } from "../../Context/ProductDataContext";
import "./module.css";
import { CartContext } from "../../Context/CartContext";
import { useAuth } from "../../Context/AuthContext";
import toast from "react-hot-toast";

const ProductDetails = () => {
  const { cartItems, setCartItems, setIsCartOpen } = useContext(CartContext);
  const { user } = useAuth();
  const { id } = useParams();
  const { productData } = useContext(ProductDataContext);
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(null);
  const [size, setSize] = useState("M");

  useEffect(() => {
    const contextProduct = productData.find((p) => p.id === id);
    if (contextProduct) {
      setProduct(contextProduct);
      setMainImage(contextProduct.image);
      setSize(contextProduct.size || "M");
      setLoading(false);
    } else {
      setLoading(true);
    }

    const fetchProductDetails = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        const p = response.data.data.product;

        if (p) {
          let image = SoonImage;
          if (p.media && p.media.length > 0) {
            const firstImage = p.media.find(m => m?.media && m?.media?.type !== 'video');
            if (firstImage?.media?.url) {
              image = firstImage.media.url;
            } else if (p.media[0]?.media?.url) {
              image = p.media[0].media.url;
            }
          }
          const price = p.basePrice ? Number(p.basePrice) : 0;
          let discount = 0;
          if (p.compareAtPrice && Number(p.compareAtPrice) > price) {
            const comparePrice = Number(p.compareAtPrice);
            discount = Math.round(((comparePrice - price) / comparePrice) * 100);
          }
          const category = p.category?.name?.toLowerCase() || 'unassigned';
          let sizeVal = 'M';
          if (p.variants && p.variants.length > 0) {
            const sizeAttr = p.variants[0].attributes?.size || p.variants[0].attributes?.Size;
            if (sizeAttr) sizeVal = sizeAttr;
          }

          const formatted = {
            id: p.id,
            title: p.name,
            description: p.description || "",
            price,
            image,
            media: p.media,
            category,
            size: sizeVal,
            discount,
            slug: p.slug,
            variants: p.variants,
            metadata: p.metadata || {},
          };
          setProduct(formatted);
          setMainImage(image);
        }
      } catch (error) {
        console.error("Error fetching product details directly:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, productData]);
  // Extract all variants
  const variants = product?.variants || [];

  // Helper to extract JSON attributes in a case-insensitive manner
  const getAttr = (attributes, key) => {
    if (!attributes) return "";
    const foundKey = Object.keys(attributes).find(k => k.toLowerCase() === key.toLowerCase());
    return foundKey ? attributes[foundKey] : "";
  };

  // Get unique sizes and colors from variants (deduplicated)
  const uniqueSizes = [...new Set(variants.map(v => getAttr(v.attributes, 'size')).filter(Boolean))];
  const uniqueColors = [...new Set(variants.map(v => getAttr(v.attributes, 'color')).filter(Boolean))];

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const mainImageRef = useRef(null);

  // Set default selection on load (first in-stock variant)
  useEffect(() => {
    if (product && variants.length > 0) {
      const defaultVariant = variants.find(v => (v.inventory?.stockAvailable || 0) > 0) || variants[0];
      const initialSize = getAttr(defaultVariant.attributes, 'size') || "";
      const initialColor = getAttr(defaultVariant.attributes, 'color') || "";

      setSelectedSize(initialSize);
      setSelectedColor(initialColor);
    } else if (product && (!variants || variants.length === 0) && product.size) {
      // No variants – use product size as default
      setSelectedSize(product.size);
      setSelectedColor("");
    }
  }, [product, variants]);

  // ← KEY FIX: jab bhi id change ho, scroll top + image reset
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (product) {
      setMainImage(product.image);
    }
  }, [id, product?.image]); // ← id change hone pe re-run

  // Get all images from media attachments or fallback
  const getProductImages = () => {
    if (!product) return [];
    if (!product.media || product.media.length === 0) {
      return [product.image, product.image, product.image];
    }

    const allMedia = product.media.map(m => m?.media || m).filter(m => m && m.url);

    if (selectedColor && product.metadata?.colorMedia?.[selectedColor]) {
      const colorMediaIds = product.metadata.colorMedia[selectedColor] || [];
      const colorSpecific = allMedia.filter(m => colorMediaIds.includes(m.id)).map(m => m.url);

      if (colorSpecific.length > 0) {
        // Collect general media items that are NOT mapped to any specific color
        const allMappedIds = Object.values(product.metadata.colorMedia || {}).flat();
        const general = allMedia.filter(m => !allMappedIds.includes(m.id)).map(m => m.url);
        return [...colorSpecific, ...general];
      }
    }

    const urls = allMedia.map(m => m.url).filter(Boolean);
    return urls.length > 0 ? urls : [product.image, product.image, product.image];
  };

  const images = getProductImages();

  // Preload all gallery images in the background to ensure instant switching
  useEffect(() => {
    if (images && images.length > 0) {
      images.forEach((url) => {
        const img = new Image();
        img.src = url;
      });
    }
  }, [images]);

  // Auto-switch main image when selectedColor changes
  useEffect(() => {
    if (product && selectedColor) {
      const colorImages = getProductImages();
      if (colorImages && colorImages.length > 0) {
        setMainImage(colorImages[0]);
      }
    }
  }, [selectedColor, product]);

  const getProductMetaDescription = () => {
    if (!product) return "";
    const rawDesc = product.description || "";
    const fallback = `Buy ${product.title} at Kamigami. Experience the ultimate in premium Japanese streetwear, featuring exclusive graphic designs, oversized fits, and luxury comfort.`;

    let desc = rawDesc ? `${product.title} — ${rawDesc}` : fallback;

    if (desc.length >= 140 && desc.length <= 160) {
      return desc;
    }

    if (desc.length > 160) {
      return desc.substring(0, 157) + "...";
    }

    const suffix = " | Discover premium Japanese streetwear, oversized graphic hoodies, and high-fashion luxury apparel at the official Kamigami store.";
    const padded = desc + suffix;
    return padded.substring(0, 157) + "...";
  };

  if (loading) {
    return (
      <div className="bg-black text-white min-h-screen pt-40 flex items-center justify-center">
        <h2 className="text-xl">Loading product...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <>
        <PageMeta
          title="Product Not Found"
          description="We couldn't find the product you're looking for. Browse the Kamigami store to explore our exclusive range of graphic hoodies, tees, and premium streetwear."
        />
        <h2 className="text-white text-center mt-40">Product Not Found</h2>
      </>
    );
  }

  // Get active variant based on current selections
  const activeVariant = variants.find(v => {
    const sizeVal = getAttr(v.attributes, 'size');
    const colorVal = getAttr(v.attributes, 'color');
    const sizeMatch = !selectedSize || sizeVal.toString().toLowerCase() === selectedSize.toString().toLowerCase();
    const colorMatch = !selectedColor || colorVal.toString().toLowerCase() === selectedColor.toString().toLowerCase();
    return sizeMatch && colorMatch;
  });

  const activePrice = activeVariant?.price ? Number(activeVariant.price) : product.price;

  const isOutOfStock = activeVariant
    ? (activeVariant.inventory?.stockAvailable ?? 0) <= 0
    : (product.totalStockAvailable !== undefined ? product.totalStockAvailable <= 0 : false);

  const isSizeDisabled = (sizeOption) => {
    // If no colors, check if the variant matching this size has stock
    if (uniqueColors.length === 0) {
      const match = variants.find(v => {
        const sizeVal = getAttr(v.attributes, 'size');
        return sizeVal.toString().toLowerCase() === sizeOption.toString().toLowerCase();
      });
      return !match || (match.inventory?.stockAvailable ?? 0) <= 0;
    }
    // If color selected, check if the specific combination variant has stock
    if (selectedColor) {
      const match = variants.find(v => {
        const sizeVal = getAttr(v.attributes, 'size');
        const colorVal = getAttr(v.attributes, 'color');
        return sizeVal.toString().toLowerCase() === sizeOption.toString().toLowerCase() &&
          colorVal.toString().toLowerCase() === selectedColor.toString().toLowerCase();
      });
      return !match || (match.inventory?.stockAvailable ?? 0) <= 0;
    }
    return false;
  };

  const isColorDisabled = (colorOption) => {
    // If no sizes, check if the variant matching this color has stock
    if (uniqueSizes.length === 0) {
      const match = variants.find(v => {
        const colorVal = getAttr(v.attributes, 'color');
        return colorVal.toString().toLowerCase() === colorOption.toString().toLowerCase();
      });
      return !match || (match.inventory?.stockAvailable ?? 0) <= 0;
    }
    // If size selected, check if the specific combination variant has stock
    if (selectedSize) {
      const match = variants.find(v => {
        const sizeVal = getAttr(v.attributes, 'size');
        const colorVal = getAttr(v.attributes, 'color');
        return sizeVal.toString().toLowerCase() === selectedSize.toString().toLowerCase() &&
          colorVal.toString().toLowerCase() === colorOption.toString().toLowerCase();
      });
      return !match || (match.inventory?.stockAvailable ?? 0) <= 0;
    }
    return false;
  };



  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }
    if (isOutOfStock) return;

    // Create cart item with selected variant metadata
    const cartItem = {
      ...product,
      price: activePrice,
      size: selectedSize || "M",
      color: selectedColor || "Default",
      variantId: activeVariant?.id || product.id,
      sku: activeVariant?.sku || product.sku || product.id,
    };

    const existing = cartItems.find((item) =>
      item.id === cartItem.id &&
      item.size === cartItem.size &&
      item.color === cartItem.color
    );

    if (existing) {
      const updated = cartItems.map((item) =>
        item.id === cartItem.id &&
          item.size === cartItem.size &&
          item.color === cartItem.color
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );
      setCartItems(updated);
    } else {
      setCartItems([...cartItems, { ...cartItem, quantity: 1 }]);
    }
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.error("Please login to check out");
      return;
    }
    if (isOutOfStock) return;

    const cartItem = {
      ...product,
      price: activePrice,
      size: selectedSize || "M",
      color: selectedColor || "Default",
      variantId: activeVariant?.id || product.id,
      sku: activeVariant?.sku || product.sku || product.id,
      quantity: 1,
    };

    navigate("/checkout", { state: { buyNowItem: cartItem } });
  };

  return (
    <>
      <PageMeta
        title={product.title}
        description={getProductMetaDescription()}
        image={product.image}
      />
      <div className="bg-black text-white min-h-screen pt-36">
        <div className="breadcrumb max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-6 text-gray-400 text-sm">
          Home • {product.title}
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 grid lg:grid-cols-2 gap-12">
          <div>
            <div className="relative w-full h-[420px] sm:h-[720px] lg:h-[750px] rounded-xl overflow-hidden bg-neutral-900/40">
              {imageLoading && (
                <div className="absolute inset-0 shimmer-pulse" />
              )}
              <img
                ref={mainImageRef}
                src={mainImage || product.image}
                onLoad={() => setImageLoading(false)}
                className="w-full h-full object-cover"
                alt={product.title}
              />
            </div>

            <div className="flex gap-3 sm:gap-5 mt-5 overflow-x-auto">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="thumb"
                  onClick={() => {
                    setMainImage(img);
                  }}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg cursor-pointer border border-neutral-800 hover:border-red-600 flex-shrink-0"
                />
              ))}
            </div>
          </div>

          <div>
            <h1 className="product-title text-2xl sm:text-3xl font-semibold">
              {product.title}
            </h1>

            <p className="product-price text-red-600 text-xl sm:text-2xl mt-2">
              ₹{activePrice}
            </p>

            {isOutOfStock ? (
              <span className="inline-block bg-red-600/20 text-red-500 text-xs px-3 py-1 rounded-full border border-red-500/30 mt-2 font-medium">
                Out of Stock
              </span>
            ) : (
              activeVariant && (
                <p className="text-gray-400 text-xs mt-1">
                  SKU: {activeVariant.sku}
                </p>
              )
            )}

            {/* Dynamic Size Selector */}
            {uniqueSizes.length > 0 && (
              <div className="mt-8">
                <p className="select-size text-gray-400 mb-3">Select Size</p>
                <div className="flex flex-wrap gap-3">
                  {uniqueSizes.map((s) => {
                    const disabled = isSizeDisabled(s);
                    return (
                      <button
                        key={s}
                        disabled={disabled}
                        onClick={() => setSelectedSize(s)}
                        className={`size-text px-5 py-2 rounded-full border text-sm transition ${disabled
                          ? "border-neutral-800 text-neutral-600 cursor-not-allowed opacity-40 line-through"
                          : selectedSize === s
                            ? "bg-red-600 border-red-600 text-white font-medium"
                            : "border-neutral-700 text-neutral-300 hover:border-red-600"
                          }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fallback Size Selector for products without variants */}
            {uniqueSizes.length === 0 && product?.size && (
              <div className="mt-8">
                <p className="select-size text-gray-400 mb-3">Select Size</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    key={product.size}
                    onClick={() => setSelectedSize(product.size)}
                    className={`size-text px-5 py-2 rounded-full border text-sm transition ${selectedSize === product.size ? "bg-red-600 border-red-600 text-white font-medium" : "border-neutral-700 text-neutral-300 hover:border-red-600"}`}
                  >
                    {product.size}
                  </button>
                </div>
              </div>
            )}

            {/* Dynamic Color Selector */}
            {uniqueColors.length > 0 && (
              <div className="mt-6">
                <p className="select-size text-gray-400 mb-3">Select Color</p>
                <div className="flex flex-wrap gap-3">
                  {uniqueColors.map((c) => {
                    const disabled = isColorDisabled(c);
                    return (
                      <button
                        key={c}
                        disabled={disabled}
                        onClick={() => setSelectedColor(c)}
                        className={`size-text px-5 py-2 rounded-full border text-sm transition ${disabled
                          ? "border-neutral-800 text-neutral-600 cursor-not-allowed opacity-40 line-through"
                          : selectedColor === c
                            ? "bg-red-600 border-red-600 text-white font-medium"
                            : "border-neutral-700 text-neutral-300 hover:border-red-600"
                          }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-8">
              <button
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`addToCart px-10 py-3 rounded-full transition ${isOutOfStock
                  ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50"
                  : "bg-red-600 text-white hover:bg-red-700"
                  }`}
              >
                {isOutOfStock ? "Sold Out" : "Add To Cart"}
              </button>

              <button
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className={`buyNow px-10 py-3 rounded-full transition ${isOutOfStock
                  ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50"
                  : "bg-red-600 text-white hover:bg-red-700"
                  }`}
              >
                {isOutOfStock ? "Out of Stock" : "Buy Now"}
              </button>

              <button className="border border-neutral-700 p-3 rounded-full w-fit">
                <Heart size={18} />
              </button>
            </div>

            <div className="mt-10">
              <h2 className="product-description text-xl font-semibold mb-3">
                Description & Fit
              </h2>

              <p className="product-detail text-red-400 leading-relaxed text-sm sm:text-base mb-6">
                {product.description}
              </p>
            </div>

            {(() => {
              const rawSpecs = product.metadata?.specifications;
              let specs = [];
              if (Array.isArray(rawSpecs)) {
                specs = rawSpecs;
              } else if (rawSpecs && typeof rawSpecs === 'object') {
                // Backward compatibility mapping for old products using object format
                specs = [
                  { label: "FIT TYPE", value: rawSpecs.fit || '' },
                  { label: "FABRIC TYPE", value: rawSpecs.fabric || '' },
                  { label: "PRINT TECHNIQUE", value: rawSpecs.print || '' },
                  { label: "COLLECTION ORIGIN", value: rawSpecs.origin || '' },
                  { label: "CARE INSTRUCTION", value: rawSpecs.care || '' }
                ].filter(item => item.value);
              }

              // Default fallback if no specifications are saved in DB
              if (specs.length === 0) {
                specs = [
                  { label: "FIT TYPE", value: "Modern Relaxed / Oversized Silhouette" },
                  { label: "FABRIC TYPE", value: "240+ GSM Heavyweight Combed Cotton" },
                  { label: "PRINT TECHNIQUE", value: "High-Fidelity Screen Print / Deity Graphic" },
                  { label: "COLLECTION ORIGIN", value: "Kamigami Official Sanctum Archives" },
                  { label: "CARE INSTRUCTION", value: "Machine Wash Cold, Reverse Side Ironing" }
                ];
              }

              return (
                <div className="mt-8">
                  <h2 className="product-description text-xl font-semibold mb-4">
                    Garment Specifications
                  </h2>
                  <table className="w-full text-sm border-collapse border border-neutral-800 text-left rounded-lg overflow-hidden">
                    <tbody>
                      <tr className="border-b border-neutral-800">
                        <th className="py-3 px-4 bg-neutral-950/60 text-red-500 font-semibold w-1/3">SPECIFICATION</th>
                        <th className="py-3 px-4 bg-neutral-950/60 text-red-500 font-semibold w-2/3">DETAILS</th>
                      </tr>
                      {specs.map((item, index) => (
                        <tr key={index} className="border-b border-neutral-800">
                          <td className="py-3 px-4 text-gray-400 font-medium uppercase">{item.label}</td>
                          <td className="py-3 px-4 text-white font-mono">{item.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}


          </div>
        </div>
      </div>

      {/* <ReviewsSection /> */}

      <RelatedProducts />
    </>
  );
};

export default ProductDetails;
