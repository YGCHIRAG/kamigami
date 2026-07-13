import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import PageMeta from "../../components/PageMeta";
import { CartContext } from "../../Context/CartContext";
import { useAuth } from "../../Context/AuthContext";
import api from "../../services/api";
import {
  MapPin,
  Plus,
  CreditCard,
  Loader2,
  CheckCircle2,
  Truck,
  AlertCircle,
  ShieldCheck,
  ShoppingBag,
  ArrowLeft
} from "lucide-react";
import "./checkout.css";

const Checkout = () => {
  const { cartItems, setCartItems } = useContext(CartContext);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const buyNowItem = location.state?.buyNowItem || null;
  const checkoutItems = buyNowItem ? [buyNowItem] : cartItems;

  // Authentication & Loading States
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [loading, setLoading] = useState(true);

  // Addresses States
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street1: "",
    street2: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    country: "India",
    phoneNumber: ""
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Checkout Status States
  const [placingOrder, setPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // ETA States
  const [addressETA, setAddressETA] = useState("");
  const [fetchingETA, setFetchingETA] = useState(false);

  // Order & Payment Gate States
  const [createdOrder, setCreatedOrder] = useState(null);
  const [showPaymentGate, setShowPaymentGate] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paidOrderDetails, setPaidOrderDetails] = useState(null);

  // Check auth and fetch user addresses on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const res = await api.get("/users/me/addresses");
        const addressList = res.data?.data?.addresses || res.data?.addresses || [];
        setAddresses(addressList);

        // Auto-select default address
        const defaultAddr = addressList.find(addr => addr.isDefault) || addressList[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        }
      } catch (err) {
        console.error("Failed to fetch addresses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  // Fetch estimated delivery time on address selection
  useEffect(() => {
    if (!selectedAddressId) {
      setAddressETA("");
      return;
    }
    const activeAddress = addresses.find(addr => addr.id === selectedAddressId);
    if (!activeAddress) return;

    const fetchETA = async () => {
      try {
        setFetchingETA(true);
        const res = await api.get(`/logistics/serviceability/eta?delivery_postcode=${activeAddress.postalCode}`);
        if (res.data?.data?.etaString) {
          setAddressETA(res.data.data.etaString);
        } else {
          setAddressETA("");
        }
      } catch (err) {
        console.error("Failed to fetch delivery ETA:", err);
        setAddressETA("Expected delivery: 3 to 5 business days");
      } finally {
        setFetchingETA(false);
      }
    };

    fetchETA();
  }, [selectedAddressId, addresses]);

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setAddressForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.street1 || !addressForm.city || !addressForm.stateProvince || !addressForm.postalCode || !addressForm.phoneNumber) {
      alert("Please fill all required shipping fields, including a contact phone number.");
      return;
    }

    try {
      setSavingAddress(true);
      const payload = {
        type: "SHIPPING",
        street1: addressForm.street1,
        street2: addressForm.street2,
        city: addressForm.city,
        stateProvince: addressForm.stateProvince,
        postalCode: addressForm.postalCode,
        country: addressForm.country,
        phoneNumber: addressForm.phoneNumber,
        isDefault: addresses.length === 0 // Make default if it's the first
      };
     console.log(payload);
      const res = await api.post("/users/me/addresses", payload);
      console.log(res);
      const newAddress = res.data?.data?.address || res.data?.address;

      if (newAddress) {
        setAddresses(prev => [...prev, newAddress]);
        setSelectedAddressId(newAddress.id);
        setShowAddressForm(false);
        setAddressForm({
          street1: "",
          street2: "",
          city: "",
          stateProvince: "",
          postalCode: "",
          country: "India",
          phoneNumber: ""
        });
      }
    } catch (err) {
      console.error("Failed to add shipping address:", err);
      alert("Failed to save shipping address. Please retry.");
    } finally {
      setSavingAddress(false);
    }
  };

  // Load Razorpay Script dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const openRazorpayCheckout = (orderData) => {
    const activeAddress = addresses.find(addr => addr.id === selectedAddressId);
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || (import.meta.env.DEV ? "rzp_test_T9u6UGx0oTRl3W" : ""),
      amount: Math.round(orderData.totalAmount * 100),
      currency: orderData.currency || "INR",
      name: "KAMIGAMI",
      description: `Purchase offering for Order #${orderData.orderNumber}`,
      image: "/logo.png",
      order_id: orderData.paymentIntentId,
      handler: async function (response) {
        try {
          setPaymentProcessing(true);
          setCheckoutError("");

          // Call backend verification endpoint
          const res = await api.post("/payments/verify", {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          });

          const result = res.data?.data?.order;
          console.log("[Verification] Order result loaded:", result);
          if (result) {
            setPaidOrderDetails(result);
            setPaymentSuccess(true);
            if (!buyNowItem) {
              setCartItems([]);
            }
          } else {
            setCheckoutError("Signature verification failed. Payment was captured but not verified.");
          }
        } catch (err) {
          console.error("Signature verification error:", err);
          setCheckoutError(err.response?.data?.message || "Payment verification failed. Please contact support.");
        } finally {
          setPaymentProcessing(false);
        }
      },
      prefill: {
        name: activeAddress ? `${activeAddress.street1}` : "",
        email: user?.email || ""
      },
      theme: {
        color: "#DC2626"
      },
      modal: {
        ondismiss: function () {
          setCheckoutError("Payment checkout cancelled by user.");
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (resp) {
      setCheckoutError(`Payment Failed: ${resp.error.description}`);
    });
    rzp.open();
  };

  // 1. Initiate Order placement (POST /checkout/intent)
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setCheckoutError("Select or add a shipping address first.");
      return;
    }
    const activeAddress = addresses.find(addr => addr.id === selectedAddressId);
    const addressPhone = activeAddress?.phoneNumber || "";
    const cleanedPhone = addressPhone.replace(/\D/g, "");
    if (cleanedPhone.length < 10) {
      setCheckoutError("The selected address is missing a valid 10-digit contact number for delivery. Please add new coordinates containing a phone number.");
      return;
    }
    if (checkoutItems.length === 0) {
      setCheckoutError("Your checkout list is empty.");
      return;
    }

    try {
      setPlacingOrder(true);
      setCheckoutError("");

      const payload = {
        shippingAddressId: selectedAddressId,
        billingAddressId: selectedAddressId,
        phoneNumber: cleanedPhone,
        items: checkoutItems.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity
        }))
      };

      // Call backend checkout endpoint
      const res = await api.post("/checkout/intent", payload);
      const orderResult = res.data?.data;

      if (orderResult) {
        setCreatedOrder(orderResult);
        openRazorpayCheckout(orderResult);
      } else {
        setCheckoutError("Failed to initiate order. Try again.");
      }
    } catch (err) {
      console.error("Checkout intent failure:", err);
      setCheckoutError(err.response?.data?.message || "Checkout failed. A selected item may be out of stock.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const getPrice = (price) => (typeof price === "number" ? price : parseInt(price.replace(/[^0-9]/g, "")));
  const subtotal = checkoutItems.reduce((total, item) => total + getPrice(item.price) * item.quantity, 0);
  const discount = checkoutItems.reduce((total, item) => total + (item.discount ? (getPrice(item.price) * (item.discount / 100)) * item.quantity : 0), 0);
  const total = subtotal - discount;

  // Render Access Initiation state if user not authenticated
  if (!isLoggedIn) {
    return (
      <div id="main" className="checkout-auth-gate">
        <PageMeta title="Checkout Access" description="Initiate access pact to proceed." />
        <div className="auth-gate-box">
          <div className="auth-icon">🔒</div>
          <h2>ACCESS DENIED</h2>
          <p>You must seal your login credentials pact in the sanctum to purchase sacred vestments.</p>
          <Link to="/sign-up" className="auth-redirect-btn">INITIATE PROFILE ACCESS</Link>
        </div>
      </div>
    );
  }

  // Render Successful Order Manifestation Renders
  if (paymentSuccess && paidOrderDetails) {
    return (
      <div id="main" className="checkout-success-view animate-fade">
        <PageMeta title="Ritual Sealed" description="Your Shinto vestments manifest. Checkout successful." />
        <div className="success-card">
          <div className="glowing-success-icon">✓</div>
          <h1 className="success-title">PACT SEALED & MANIFESTED</h1>
          <p className="success-subtitle">The deities have received your offering. Order successfully captured.</p>

          <div className="success-details-box">
            <div className="detail-row">
              <span className="label">Order Code:</span>
              <span className="value glow">{paidOrderDetails.orderNumber}</span>
            </div>
            <div className="detail-row">
              <span className="label">Offering Amount:</span>
              <span className="value text-red-500">₹{Number(paidOrderDetails.totalAmount).toFixed(0)}</span>
            </div>
            <div className="detail-row">
              <span className="label">Billing Status:</span>
              <span className="value status-paid">PAID / SECURED</span>
            </div>
            <div className="detail-row">
              <span className="label">Shipment Status:</span>
              <span className="value status-shipped">DISPATCHED / SHIPPED</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '32px' }}>
            <Link 
              to={`/orders/${paidOrderDetails.id}`} 
              className="home-action-btn" 
              style={{ background: '#ef4444', color: '#fff', border: 'none', display: 'block', textAlign: 'center' }}
            >
              VIEW ORDER & TRACKING DETAILS
            </Link>
            
            <Link to="/" className="home-action-btn">RETURN TO REALM</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="main" className="checkout-main-container">
      <PageMeta title="Checkout Manifest" description="Select shipping and commence billing offering." />

      <div className="checkout-back-nav">
        <Link to="/" className="back-link-btn">
          <ArrowLeft size={16} />
          Return to Temple
        </Link>
      </div>

      <h1 className="checkout-page-title">THE MANIFESTATION</h1>
      <p className="checkout-page-subtitle">Configure your physical drop delivery coordinates and complete the offering.</p>

      {loading ? (
        <div className="checkout-loading-screen">
          <Loader2 className="animate-spin text-red-600" size={40} />
          <p>Unraveling scroll addresses...</p>
        </div>
      ) : (
        <>
          <div className="checkout-split-layout">
            {/* LEFT: Shipping details */}
            <div className="checkout-left-panel">
              <section className="checkout-section select-address-sec">
                <div className="section-title-wrap">
                  <MapPin className="sec-icon text-red-600" size={20} />
                  <h2>SHIPPING COORDINATES</h2>
                </div>

                <div className="address-selections-list">
                  {addresses.map(addr => (
                    <label
                      key={addr.id}
                      className={`address-card ${selectedAddressId === addr.id ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="selected_address"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="hidden-radio"
                      />
                      <div className="card-selector-dot"></div>
                      <div className="address-content-meta">
                        <span className="addr-tag">{addr.isDefault ? "Primary Vault" : "Alternate Coordinates"}</span>
                        <p className="street-line">{addr.street1}</p>
                        {addr.street2 && <p className="street-line-2">{addr.street2}</p>}
                        <p className="city-zip-line">{addr.city}, {addr.stateProvince} - {addr.postalCode}</p>
                        <p className="country-line">{addr.country}</p>
                        {addr.phoneNumber && <p className="phone-line" style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '4px', fontWeight: 'bold' }}>📞 {addr.phoneNumber}</p>}
                        {selectedAddressId === addr.id && (
                          <div className="address-eta-badge animate-fade" style={{ marginTop: '10px', fontSize: '11px', color: '#3b82f6', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                            🚚 {fetchingETA ? "Calculating transit pact..." : (addressETA || "Expected delivery: 3 to 5 business days")}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}

                  {addresses.length === 0 && !showAddressForm && (
                    <div className="no-addresses-card">
                      <AlertCircle className="text-yellow-600" size={24} />
                      <p>No delivery coordinates are currently logged for this profile.</p>
                    </div>
                  )}
                </div>

                {!showAddressForm ? (
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(true)}
                    className="add-coordinates-btn"
                  >
                    <Plus size={16} /> ADD DELIVERY COORDINATES
                  </button>
                ) : (
                  <form onSubmit={handleSaveAddress} className="address-inline-form animate-fade">
                    <h3>ADD NEW COORDINATES</h3>
                    <div className="form-grid">
                      <input
                        type="text"
                        name="street1"
                        placeholder="STREET ADDRESS 1 *"
                        value={addressForm.street1}
                        onChange={handleAddressInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="street2"
                        placeholder="STREET ADDRESS 2 (APARTMENT, SUITE, ETC.)"
                        value={addressForm.street2}
                        onChange={handleAddressInputChange}
                      />
                      <input
                        type="text"
                        name="city"
                        placeholder="CITY *"
                        value={addressForm.city}
                        onChange={handleAddressInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="stateProvince"
                        placeholder="STATE / PROVINCE *"
                        value={addressForm.stateProvince}
                        onChange={handleAddressInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="postalCode"
                        placeholder="PINCODE / POSTAL CODE *"
                        value={addressForm.postalCode}
                        onChange={handleAddressInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="country"
                        placeholder="COUNTRY *"
                        value={addressForm.country}
                        onChange={handleAddressInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="phoneNumber"
                        placeholder="CONTACT PHONE NUMBER *"
                        value={addressForm.phoneNumber}
                        onChange={handleAddressInputChange}
                        required
                      />
                    </div>
                    <div className="form-action-btns">
                      <button type="submit" disabled={savingAddress} className="save-btn">
                        {savingAddress ? <Loader2 className="animate-spin" size={14} /> : "LOG COORDINATES"}
                      </button>
                      <button type="button" onClick={() => setShowAddressForm(false)} className="cancel-btn">CANCEL</button>
                    </div>
                  </form>
                )}
              </section>

              <section className="checkout-section security-credentials-sec">
                <div className="security-banner">
                  <ShieldCheck className="sec-icon text-green-500" size={22} />
                  <div>
                    <h4>OCCULT ENCRYPTED BILLING</h4>
                    <p>All spiritual offerings and transactional data are bound securely via custom cryptographic tokens.</p>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT: Order summary */}
            <div className="checkout-right-panel">
              <div className="checkout-sticky-summary">
                <div className="section-title-wrap">
                  <ShoppingBag className="sec-icon text-red-600" size={20} />
                  <h2>SACRED ITEMS</h2>
                </div>

                <div className="summary-items-list">
                  {checkoutItems.map(item => (
                    <div key={`${item.id}-${item.size}-${item.color}`} className="summary-item">
                      <img src={item.image} alt={item.title} className="item-thumbnail" />
                      <div className="summary-item-meta">
                        <h3>{item.title}</h3>
                        <p className="options">SIZE: {item.size} • COLOR: {item.color}</p>
                        <div className="qty-price">
                          <span>QTY: {item.quantity}</span>
                          <strong className="text-white">₹{getPrice(item.price) * item.quantity}</strong>
                        </div>
                      </div>
                    </div>
                  ))}

                  {checkoutItems.length === 0 && (
                    <div className="summary-empty-state">
                      <p>No sacred items are active in your portal.</p>
                      <Link to="/" className="browse-link">Acquire Vestments</Link>
                    </div>
                  )}
                </div>

                <div className="bill-calculations-box">
                  <div className="calc-row">
                    <span>Offering Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {discount > 0 && (
                    <div className="calc-row discount">
                      <span>Discount Applied</span>
                      <span>- ₹{discount.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="calc-row delivery-shipping">
                    <span>Shipping</span>
                    <span className="text-green-500">FREE / COMPLIMENTARY</span>
                  </div>
                  <div className="calc-divider"></div>
                  <div className="calc-row total">
                    <span>Total Offering Value</span>
                    <span className="glow">₹{total.toFixed(0)}</span>
                  </div>
                </div>

                {checkoutError && (
                  <div className="checkout-error-banner animate-fade">
                    <AlertCircle size={16} />
                    <span>{checkoutError}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={placingOrder || checkoutItems.length === 0 || !selectedAddressId}
                  className="commence-checkout-btn"
                >
                  {placingOrder ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      LOCKING VESTMENTS IN ARCHIVE...
                    </>
                  ) : (
                    "CONFIRM & PLACE ORDER"
                  )}
                </button>
              </div>
            </div>
            {/* ==============================================
          OCCULT PAYMENT GATE (RAZORPAY VERIFICATION OVERLAY)
         ============================================== */}
            {paymentProcessing && (
              <div className="occult-gate-overlay animate-fade">
                <div className="occult-gate-box">
                  <div className="gate-glow-halo"></div>
                  <Loader2 className="gate-header-icon text-red-600 animate-spin" size={48} />
                  <h2 className="gate-title">SEALING THE PACT...</h2>
                  <p className="gate-subtitle">Verifying offering signature with the deities</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Checkout;
