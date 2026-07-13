import { useState, useContext, useEffect } from "react";
import "./navbar.css";
import {
  MapPin,
  Search,
  User,
  ShoppingCart,
  ShoppingBag,
  Home
} from "lucide-react";

import { Sling as Hamburger } from 'hamburger-react';
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/Logo.png";
import StoryIcon from "../../elements/StoryIcon";
import CartSidebar from "../CartSidebar/CartSidebar";
import SearchOverlay from "../Search/SearchBox";
import { CartContext } from "../../Context/CartContext";
import { useAuth } from "../../Context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cartItems, setCartItems, isCartOpen, setIsCartOpen } = useContext(CartContext);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleLogout = () => {
    logout();
    setCartItems([]);
    navigate("/");
  };

  // High-performance vanilla scroll listener (GSAP-free)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY <= 80) {
        setIsNavVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down: hide navbar
        setIsNavVisible(false);
      } else {
        // Scrolling up: reveal navbar
        setIsNavVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <div className={`navbar-container ${isNavVisible ? "visible" : "hidden"}`}>
        <nav className="navbar">
          <div className="nav-left">
            <Link to="/drops">Drops</Link>
            <Link to="/collections">Collections</Link>
            <Link to="/all-products">Shop</Link>
          </div>

          <div className="nav-center">
            <Link to="/">
              <img src={logo} alt="Kamigami logo" className="logo" />
            </Link>
          </div>

          <div className="nav-right">
            <Link to="/about-us">
              <StoryIcon />
            </Link>
            <button onClick={() => setSearchOpen(true)}>
              <Search size={18} />
            </button>
            
            {user ? (
              <div className="user-nav-group">
                <Link to="/userprofile">
                  <User size={18} />
                </Link>
              </div>
            ) : (
              <Link to="/sign-up" className="login-link-nav">
                <User size={18} />
                <span className="nav-label">Login</span>
              </Link>
            )}

            <button onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={18} />
            </button>
          </div>

          {/* Mobile: hamburger OR close icon */}
          <div className="mobile-menu">
            <Hamburger
              toggled={open}
              toggle={setOpen}
              size={24}
              color="#E71E22"
              duration={0.4}
            />
          </div>
        </nav>
      </div>

      {/* Full-page mobile overlay */}
      <div className={`mobile-overlay ${open ? "active" : ""}`}>
        <div className="mobile-overlay-inner">
          {/* Top section — primary nav links matching PC navbar */}
          <div className="mobile-overlay-top">
            <Link
              to="/drops"
              className="overlay-link"
              onClick={() => setOpen(false)}
            >
              Drops
            </Link>

            <Link
              to="/collections"
              className="overlay-link"
              onClick={() => setOpen(false)}
            >
              Collections
            </Link>

            <Link
              to="/all-products"
              className="overlay-link"
              onClick={() => setOpen(false)}
            >
              Shop
            </Link>

            <Link
              to="/about-us"
              className="overlay-link"
              onClick={() => setOpen(false)}
            >
              About Us
            </Link>
          </div>

          {/* Divider */}
          <div className="mobile-overlay-divider" />

          {/* Secondary links / User group */}
          <div className="mobile-overlay-secondary">
            {user ? (
              <>
                <Link to="/userprofile" className="overlay-link-secondary" onClick={() => setOpen(false)}>
                  My Account ({user.email})
                </Link>
              </>
            ) : (
              <Link to="/sign-up" className="overlay-link-secondary" onClick={() => setOpen(false)}>
                Login / Register
              </Link>
            )}
          </div>

          {/* Bottom actions row */}
          <div className="mobile-overlay-icons">
            <button
              onClick={() => {
                setSearchOpen(true);
                setOpen(false);
              }}
              className="mobile-action-btn"
            >
              <Search size={18} style={{ marginRight: '8px' }} />
              Search
            </button>
            <button
              onClick={() => {
                setIsCartOpen(true);
                setOpen(false);
              }}
              className="mobile-action-btn"
            >
              <ShoppingCart size={18} style={{ marginRight: '8px' }} />
              Cart
            </button>
          </div>

          {/* Close label */}
          <button
            className="mobile-overlay-close"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>
      </div>

      <CartSidebar
        cartItems={cartItems}
        setCartItems={setCartItems}
        isOpen={isCartOpen}
        setIsOpen={setIsCartOpen}
      />
      <SearchOverlay isOpen={searchOpen} setIsOpen={setSearchOpen} />

      {/* Bottom Navigation — Mobile Only */}
      <div className={`bottom-nav ${isNavVisible ? "visible" : "hidden"}`}>
        <div className="bottom-nav-pill">
          <Link to="/" className="bottom-nav-item">
            <Home size={22} />
          </Link>
          <Link to="/all-products" className="bottom-nav-item">
            <ShoppingBag size={22} />
          </Link>
          <Link className="bottom-nav-item" onClick={() => setSearchOpen(true)}>
            <Search size={22} />
          </Link>
          <button
            className="bottom-nav-item"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart size={22} />
          </button>
        </div>
      </div>
    </>
  );
}
