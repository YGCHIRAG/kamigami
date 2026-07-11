import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";

import { HelmetProvider } from "react-helmet-async";

import { ProductDataProvider } from "./Context/ProductDataContext";
import { CartProvider } from "./Context/CartContext";
import { AuthProvider } from "./Context/AuthContext";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ProductDataProvider>
          <CartProvider>
            <HelmetProvider>
              <BrowserRouter>
                <Toaster position="top-center" reverseOrder={false} />
                  <App />
              </BrowserRouter>
            </HelmetProvider>
          </CartProvider>
        </ProductDataProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);