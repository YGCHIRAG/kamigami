import React from "react";
import "./module.css";

const Cards = ({ image, title, description, price }) => {
  return (
    <div className="card">
      <img src={image} alt={title} />

      <div className="bottom">
        <div className="bottom-content">
          <h1>{title}</h1>

          <p>{description}</p>

          <div className="price-cart">
            <span className="price">{price}</span>
            <button className="cart-btn">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default Cards;