import React, { useContext } from "react";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductDataContext } from "../../Context/ProductDataContext";
import ProductCard from '../../components/ProductCards/ProductCards'


const RelatedProducts = () => {

  const {productData} = useContext(ProductDataContext)

  return (
    <section className="bg-black text-white py-20 px-6 lg:px-12 related-products-section">

      <div className="max-w-[1400px] mx-auto">

        {/* SECTION HEADER */}
        <div className="mb-12 text-center">
          <h2 className="text-sm font-semibold tracking-[0.25em] text-red-600 uppercase">Related offerings</h2>
          <h3 className="text-2xl mt-2 font-bold tracking-wider uppercase">You May Also Worship</h3>
        </div>

        {/* PRODUCTS GRID */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 justify-center">

          {productData.length === 0 ? (

          <p>No Products Available</p>

        ) : (

          productData.slice(0, 4).map((product) => (

            <ProductCard
              key={product.id}
              product={product}
            />

          ))

        )}
        

        </div>

      </div>

    </section>
  );
};

export default RelatedProducts;
