// src/components/CartSidebar/CartSidebar.jsx
import React, { useState, useEffect, useContext } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../CartSidebar/Module.css";
import { CartContext } from "../../Context/CartContext";

const CartSidebar = () => {
  const { cartItems, setCartItems, isCartOpen, setIsCartOpen } = useContext(CartContext);
  const navigate = useNavigate();

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (cartItems.length > 0) setIsCartOpen(true);
  }, [cartItems]);

  const getPrice = (price) => (typeof price === "number" ? price : parseInt(price.replace(/[^0-9]/g, "")));

  const increase = (id) => setCartItems(cartItems.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item));
  const decrease = (id) => setCartItems(cartItems.map(item => item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item));

  
  const removeItem = (id) => {
    const updated = cartItems.filter(item => item.id !== id);
    setCartItems(updated);
  };

  const subtotal = cartItems.reduce((total, item) => total + getPrice(item.price) * item.quantity, 0);

  const applyCoupon = (value) => {
    setCoupon(value);
    if (value === "SAVE10") setDiscount(subtotal * 0.1);
    else setDiscount(0);
  };

  const total = subtotal - discount;

  return (
    <>
     
      <div
        onClick={() => setIsCartOpen(false)}
        className={`cart-overlay ${isCartOpen ? "show" : ""}`}
      ></div>

      <div className={`cart-sidebar ${isCartOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h2>Your Cart ({cartItems.length})</h2>
          <button onClick={() => setIsCartOpen(false)} className="close-btn">
            <X size={26} />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <h3>Your cart is empty</h3>
            <p>Add some products to continue shopping.</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.title} />
                  <div className="item-info">
                    <h3>{item.title}</h3>
                    <p className="price">₹{getPrice(item.price)}</p>
                    <div className="item-actions">
                      <div className="quantity">
                        <button onClick={() => decrease(item.id)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => increase(item.id)}>+</button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="remove-btn">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="coupon-section">
              <label>COUPON CODE</label>
              <input
                type="text"
                placeholder="Enter coupon (SAVE10)"
                value={coupon}
                onChange={(e) => applyCoupon(e.target.value)}
              />
            </div>

            <div className="cart-footer">
              <div className="subtotal">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              {discount > 0 && (
                <div className="subtotal discount">
                  <span>Discount</span>
                  <span>- ₹{discount.toFixed(0)}</span>
                </div>
              )}

              <div className="total">
                <span>Total</span>
                <span>₹{total.toFixed(0)}</span>
              </div>

              <button 
                onClick={() => {
                  setIsCartOpen(false);
                  navigate("/checkout");
                }} 
                className="checkout-btn"
              >
                Check Out
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartSidebar;