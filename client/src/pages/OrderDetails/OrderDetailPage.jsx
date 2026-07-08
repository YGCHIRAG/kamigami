import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Truck, Calendar, MapPin, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import api from "../../services/api";
import PageMeta from "../../components/PageMeta";
import "./orderdetails.css";

const OrderDetailPage = () => {
  const { order_id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // ETA state
  const [etaText, setEtaText] = useState("");
  
  // Collapse/Expand state for the tracker
  const [isTrackerCollapsed, setIsTrackerCollapsed] = useState(false);
  const [showEmbeddedTracker, setShowEmbeddedTracker] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone and will trigger inventory releases/refunds.")) {
      return;
    }
    
    try {
      setIsCancelling(true);
      const res = await api.post(`/orders/${order_id}/cancel`);
      const updatedOrder = res.data?.data || res.data;
      if (updatedOrder) {
        setOrder(updatedOrder);
        alert("Order successfully cancelled.");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to cancel order. Please contact support.");
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/orders/${order_id}`);
        const orderData = res.data?.data || res.data;
        if (orderData) {
          setOrder(orderData);
          
          // Query live expected delivery time for the order postcode
          const postcode = orderData.shippingAddress?.postalCode || orderData.shippingAddress?.postal_code;
          if (postcode) {
            try {
              const etaRes = await api.get(`/logistics/serviceability/eta?delivery_postcode=${postcode}`);
              if (etaRes.data?.data?.etaString) {
                setEtaText(etaRes.data.data.etaString);
              }
            } catch (etaErr) {
              console.warn("Failed to fetch order delivery ETA:", etaErr);
            }
          }
        } else {
          setError("Failed to retrieve order records.");
        }
      } catch (err) {
        console.error("Failed to load order:", err);
        setError(err.response?.data?.message || "Failed to load order. It may not exist or access is unauthorized.");
      } finally {
        setLoading(false);
      }
    };

    if (order_id) {
      fetchOrderDetails();
    }
  }, [order_id]);

  if (loading) {
    return (
      <div className="order-details-loading">
        <Loader2 className="animate-spin text-red-600" size={48} />
        <p>RECALLING MANIFESTATION SCROLL...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-details-error-view">
        <PageMeta title="Pact Missing" description="Order details not found." />
        <div className="error-box">
          <h2>PACT NOT FOUND</h2>
          <p>{error || "This order code does not exist in the temple archives."}</p>
          <Link to="/userprofile" className="back-dashboard-btn">
            <ArrowLeft size={16} /> RETURN TO ACCOUNT DASHBOARD
          </Link>
        </div>
      </div>
    );
  }

  const shippingAddr = order.shippingAddress || {};
  const status = order.status || "PENDING";
  const shipmentStatus = order.shipmentStatus || "pending";

  const steps = [
    { 
      label: "Order Confirmed", 
      desc: "Your payment is verified and secured.", 
      active: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(status) 
    },
    { 
      label: "Dispatched", 
      desc: `Handed over to ${order.courierName || 'Express Dispatch'}. AWB Code: ${order.awbCode || 'Pending Assignment'}`, 
      active: ["SHIPPED", "DELIVERED"].includes(status) 
    },
    { 
      label: "In Transit", 
      desc: "Shipment departed from facility, traveling to your location.", 
      active: ["transit", "out_for_delivery", "delivered"].includes(shipmentStatus.toLowerCase()) 
    },
    { 
      label: "Delivered", 
      desc: "Successfully delivered to your coordinates.", 
      active: ["DELIVERED"].includes(status) 
    }
  ];

  return (
    <div className="order-details-page">
      <PageMeta title={`Order #${order.orderNumber} Details`} description="Inspect and track your manifestation order status." />
      
      <div className="order-details-container">
        {/* Back navigation */}
        <div className="details-back-nav">
          <Link to="/userprofile" className="back-link-btn">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        {/* Header Summary */}
        <header className="details-header flex-header-row">
          <div>
            <span className="order-badge">VESTMENTS MANIFESTATION</span>
            <h1 className="order-id-title">ORDER #{order.orderNumber}</h1>
            <div className="order-meta-info">
              <span><Calendar size={13} /> {new Date(order.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className={`order-status-tag ${status.toLowerCase()}`}>{status}</span>
              {etaText && <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>🚚 {etaText}</span>}
            </div>
          </div>
          {['PENDING', 'PAID', 'PROCESSING'].includes(status) && (
            <div className="header-actions">
              <button 
                onClick={handleCancelOrder} 
                disabled={isCancelling}
                className="cancel-order-button-header"
              >
                {isCancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            </div>
          )}
        </header>

        {/* Tracker Panel / Cancellation Alert */}
        {status === 'CANCELLED' ? (
          <section className="details-section cancellation-alert-section">
            <div className="cancellation-header">
              <span className="alert-dot" />
              <h2>ORDER CANCELLATION LOGGED</h2>
            </div>
            <div className="cancellation-body">
              <p>This order has been officially cancelled. If payment was completed, an automatic refund has been triggered via Razorpay. Restored inventory stock has been returned to the warehouse vaults.</p>
              <div className="cancellation-meta">
                <span>REFUND METHOD: <strong>RAZORPAY SOURCE METHOD</strong></span>
                <span>STATUS: <strong>SUCCESSFULLY PROCESSED</strong></span>
              </div>
            </div>
          </section>
        ) : (
          <section className="details-section tracker-section">
            <div className="tracker-header-bar" onClick={() => setIsTrackerCollapsed(!isTrackerCollapsed)}>
              <div className="title-left">
                <Truck size={18} className="text-red-500" />
                <h2>EXPRESS DISPATCH TRACKER</h2>
              </div>
              <button className="collapse-toggle-btn">
                {isTrackerCollapsed ? (
                  <>SHOW DETAILS <ChevronDown size={14} /></>
                ) : (
                  <>HIDE DETAILS <ChevronUp size={14} /></>
                )}
              </button>
            </div>

            {!isTrackerCollapsed && (
              <div className="tracker-body-wrapper animate-fade">
                {/* PC Progress Tracker (Horizontal) */}
                <div className="pc-tracker-timeline">
                  <div className="pc-timeline-line-bg">
                    <div 
                      className="pc-timeline-line-active" 
                      style={{ 
                        width: `${(steps.filter(s => s.active).length - 1) / (steps.length - 1) * 100}%` 
                      }}
                    />
                  </div>
                  <div className="pc-timeline-nodes">
                    {steps.map((step, idx) => (
                      <div key={idx} className={`pc-timeline-node ${step.active ? 'active' : ''}`}>
                        <div className="node-dot-wrap">
                          <div className="node-dot" />
                        </div>
                        <span className="node-label">{step.label}</span>
                        <p className="node-desc">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile Progress Tracker (Vertical) */}
                <div className="mobile-tracker-timeline">
                  {steps.map((step, idx) => (
                     <div key={idx} className={`mobile-timeline-step ${step.active ? 'active' : ''}`}>
                      <div className="step-indicator-col">
                        <div className="step-node-dot" />
                        {idx !== steps.length - 1 && (
                          <div className={`step-connecting-line ${step.active && steps[idx+1].active ? 'active' : ''}`} />
                        )}
                      </div>
                      <div className="step-content-col">
                        <span className="step-label">{step.label}</span>
                        <p className="step-desc">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shiprocket Tracker Quick Action Buttons */}
                {order.awbCode && (
                  <div className="tracking-action-panel">
                    <div className="tracking-info-text">
                      <p className="awb-label">AWB Tracking Code: <span className="highlight-code">{order.awbCode}</span></p>
                      <p className="courier-label">Courier Partner: <span>{order.courierName || "Kamigami Express"}</span></p>
                    </div>
                    
                    <div className="tracking-buttons-group">
                      <button 
                        onClick={() => setShowEmbeddedTracker(!showEmbeddedTracker)} 
                        className={`tracking-btn secondary-btn ${showEmbeddedTracker ? 'active' : ''}`}
                      >
                        {showEmbeddedTracker ? "Hide Live Frame" : "Track On Page"}
                      </button>
                      <a 
                        href={`https://shiprocket.co/tracking/${order.awbCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tracking-btn primary-btn"
                      >
                        Track Off Page (Direct Link)
                      </a>
                    </div>

                    {showEmbeddedTracker && (
                      <div className="embedded-tracking-frame-container animate-fade">
                        <div className="frame-header">
                          <span>LIVE CARRIER LOGISTICS FEED</span>
                        </div>
                        <iframe 
                          src={`https://shiprocket.co/tracking/${order.awbCode}`}
                          title="Carrier Tracking Portal"
                          className="tracking-iframe"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Split Layout: items and addresses */}
        <div className="details-split-layout">
          {/* Left panel: Items */}
          <div className="details-left-panel">
            <section className="details-section">
              <div className="section-title-wrap">
                <Package size={18} className="text-red-500" />
                <h2>ORDER ITEMS</h2>
              </div>
              <div className="items-list">
                {(order.items || []).map((item) => (
                  <div key={item.id} className="detail-item-row">
                    <div className="item-img">
                      <img src={item.image || "/logo.png"} alt={item.name} />
                    </div>
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p className="sku">SKU: {item.sku || 'N/A'}</p>
                      <p className="qty-price">Qty: {item.quantity} × ₹{Number(item.priceAtPurchase).toLocaleString()}</p>
                    </div>
                    <div className="item-price-total">
                      ₹{(Number(item.priceAtPurchase) * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right panel: Summary & Address */}
          <div className="details-right-panel">
            {/* Delivery address */}
            <section className="details-section">
              <div className="section-title-wrap">
                <MapPin size={18} className="text-red-500" />
                <h2>DELIVERY ADDRESS</h2>
              </div>
              <div className="address-display-box">
                <p className="street">{shippingAddr.street1 || shippingAddr.street_1}</p>
                {shippingAddr.street2 && <p className="street-2">{shippingAddr.street2}</p>}
                <p className="city-zip">{shippingAddr.city}, {shippingAddr.stateProvince} - {shippingAddr.postalCode}</p>
                <p className="country">{shippingAddr.country}</p>
                {shippingAddr.phoneNumber && <p className="phone">📞 {shippingAddr.phoneNumber}</p>}
              </div>
            </section>

            {/* Calculations breakdown */}
            <section className="details-section">
              <div className="section-title-wrap">
                <h2>PAYMENT BREAKDOWN</h2>
              </div>
              <div className="calculations-list">
                <div className="calc-row">
                  <span>Subtotal Value</span>
                  <span>₹{Number(order.subtotal || 0).toLocaleString()}</span>
                </div>
                {Number(order.taxAmount) > 0 && (
                  <div className="calc-row">
                    <span>Tax (GST)</span>
                    <span>₹{Number(order.taxAmount).toLocaleString()}</span>
                  </div>
                )}
                <div className="calc-row">
                  <span>Shipping & Handling</span>
                  <span className="text-green-500">FREE / COMPLIMENTARY</span>
                </div>
                <div className="calc-divider" />
                <div className="calc-row total">
                  <span>Total Amount Paid</span>
                  <span className="glow">₹{Number(order.totalAmount || 0).toLocaleString()}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
