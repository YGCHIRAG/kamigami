import React, { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <CartContext.Provider
      value={{ cartItems, setCartItems, isCartOpen, setIsCartOpen }}
    >
      {children}
    </CartContext.Provider>
  );
};