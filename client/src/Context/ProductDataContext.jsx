import { createContext, useState, useEffect } from "react";
import SoonImage from "../assets/images/soon.png";
import api from "../services/api";

export const ProductDataContext = createContext();

export const ProductDataProvider = ({ children }) => {
  const dummyProducts = [
    {
      id: "MN001A12",
      image: SoonImage,
      title: "Men Casual Street T-Shirt",
      description:
        "Stylish slim-fit casual t-shirt perfect for daily wear and street fashion.",
      price: 799,
      category: "men",
      size: "m",
      discount: 10,
    },
    {
      id: "WM002B34",
      image:
        "https://i.pinimg.com/avif/736x/20/76/b5/2076b51059bc6c8ed6f0ad5749977734.avf",
      title: "Women Floral Summer Dress",
      description:
        "Lightweight floral dress ideal for summer outings and casual wear.",
      price: 1499,
      category: "women",
      size: "s",
      discount: 15,
    },
    {
      id: "KD003C56",
      image:
        "https://i.pinimg.com/avif/1200x/3c/73/57/3c7357e36af3751d4d7b289f744f75a4.avf",
      title: "Kids Cotton Graphic T-Shirt",
      description:
        "Soft cotton graphic t-shirt designed for comfort and daily use.",
      price: 499,
      category: "kids",
      size: "l",
      discount: 5,
    },
    {
      id: "MN004D78",
      image:
        "https://i.pinimg.com/736x/88/d2/66/88d266ad8d82b5e3152e8550c988da04.jpg",
      title: "Men Warm Winter Hoodie",
      description:
        "Premium fleece hoodie perfect for winter and outdoor activities.",
      price: 1999,
      category: "men",
      size: "xl",
      discount: 20,
    },
    {
      id: "WM005E90",
      image:
        "https://i.pinimg.com/1200x/92/b4/ce/92b4ced12fb55be974711bee4d9f244e.jpg",
      title: "Women Printed Ethnic Kurti",
      description:
        "Elegant printed kurti suitable for casual and festive occasions.",
      price: 1199,
      category: "women",
      size: "m",
      discount: 12,
    },
    {
      id: "KD006F11",
      image:
        "https://i.pinimg.com/736x/29/e7/09/29e709227fceed8a60bceb7dc5036d82.jpg",
      title: "Kids Winter Jacket",
      description:
        "Warm and lightweight winter jacket designed for kids comfort.",
      price: 1799,
      category: "kids",
      size: "s",
      discount: 18,
    },
    {
      id: "AWAKEN-TEE-01",
      image: "/img/awaken_front.jpg",
      media: [
        { media: { url: "/img/awaken_front.jpg" } },
        { media: { url: "/img/awaken_back.jpg" } },
        { media: { url: "/img/awaken_detail_1.jpg" } },
        { media: { url: "/img/awaken_detail_2.jpg" } }
      ],
      title: "Kamigami 'AWAKEN' Heavyweight Graphic Tee",
      description: "Awaken your inner divinity with the Kamigami 'AWAKEN' Graphic Tee. Crafted from 240+ GSM ultra-heavyweight premium combed cotton, this streetwear staple features a minimalist front-print 'AWAKEN' logo and a high-fidelity white-haired deity graphic screen-printed on the back. Designed with a modern relaxed, drop-shoulder silhouette for ultimate luxury comfort.",
      price: 1499,
      category: "men",
      size: "M",
      discount: 40,
      slug: "awaken-heavyweight-graphic-tee",
      variants: [
        { id: "v-awaken-s", attributes: { size: "S", color: "Black" }, price: 1499, inventory: { stockAvailable: 10 } },
        { id: "v-awaken-m", attributes: { size: "M", color: "Black" }, price: 1499, inventory: { stockAvailable: 15 } },
        { id: "v-awaken-l", attributes: { size: "L", color: "Black" }, price: 1499, inventory: { stockAvailable: 8 } },
        { id: "v-awaken-xl", attributes: { size: "XL", color: "Black" }, price: 1499, inventory: { stockAvailable: 12 } },
        { id: "v-awaken-xxl", attributes: { size: "XXL", color: "Black" }, price: 1499, inventory: { stockAvailable: 5 } }
      ]
    },
  ];

  const [productData, setProductData] = useState(dummyProducts);

  const formatServerProduct = (p) => {
    // 1. Get first image URL or fallback (excluding videos)
    let image = SoonImage;
    if (p.media && p.media.length > 0) {
      const firstImage = p.media.find(m => m.media && m.media.type !== 'video');
      if (firstImage && firstImage.media.url) {
        image = firstImage.media.url;
      } else if (p.media[0].media && p.media[0].media.url) {
        image = p.media[0].media.url;
      }
    }

    // 2. Parse price
    const price = p.basePrice ? Number(p.basePrice) : 0;

    // 3. Compute discount dynamically from retail pricing differences
    let discount = 0;
    if (p.compareAtPrice && Number(p.compareAtPrice) > price) {
      const comparePrice = Number(p.compareAtPrice);
      discount = Math.round(((comparePrice - price) / comparePrice) * 100);
    }

    // 4. Get category string
    const category = p.category?.name?.toLowerCase() || 'unassigned';

    // 5. Get sizing options from variants (fallback to 'M')
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
      media: p.media,
      category,
      size,
      discount,
      slug: p.slug,
      variants: p.variants,
      metadata: p.metadata || {},
    };
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        const serverProducts = response.data.data.products || [];

        if (serverProducts.length > 0) {
          const formatted = serverProducts.map(formatServerProduct);
          setProductData(formatted);
        }
      } catch (error) {
        console.error("Error fetching products from server:", error.message);
      }
    };
    fetchProducts();
  }, []);

  console.log("Context Data:", productData);

  return (
    <ProductDataContext.Provider
      value={{
        productData,
        setProductData,
      }}
    >
      {children}
    </ProductDataContext.Provider>
  );
};
