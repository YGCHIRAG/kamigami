import React, { useState } from "react";
import PageMeta from "../../components/PageMeta";
import { ArrowRight, RefreshCw, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import "./returns.css";

const Returns = () => {
  const [step, setStep] = useState(1); // 1: Lookup, 2: Select Items, 3: Success
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState(null);
  
  // Return form inputs
  const [selectedItems, setSelectedItems] = useState({}); // { itemId: true/false }
  const [quantities, setQuantities] = useState({}); // { itemId: quantity }
  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!orderNumber || !email) {
      toast.error("Please provide both order number and email.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      const res = await api.get(`/returns/lookup-order?orderNumber=${orderNumber.trim()}&email=${email.trim()}`);
      const orderData = res.data?.data || res.data;
      if (orderData) {
        setOrder(orderData);
        // Pre-populate quantities and selection states
        const initialSelected = {};
        const initialQuantities = {};
        orderData.items.forEach(item => {
          initialSelected[item.id] = false;
          initialQuantities[item.id] = 1;
        });
        setSelectedItems(initialSelected);
        setQuantities(initialQuantities);
        setStep(2);
      } else {
        setErrorMsg("Failed to find details for this order.");
      }
    } catch (err) {
      console.error("Order lookup error:", err);
      setErrorMsg(err.response?.data?.message || "Order not found. Please verify the order number and email.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (itemId) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleQuantityChange = (itemId, val, max) => {
    const q = Math.max(1, Math.min(max, parseInt(val) || 1));
    setQuantities(prev => ({
      ...prev,
      [itemId]: q
    }));
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    
    // Extract selected items
    const itemsToReturn = [];
    order.items.forEach(item => {
      if (selectedItems[item.id]) {
        itemsToReturn.push({
          sku: item.sku,
          name: item.name,
          quantity: quantities[item.id]
        });
      }
    });

    if (itemsToReturn.length === 0) {
      toast.error("Please select at least one item to return.");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason for the return request.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      
      const payload = {
        orderNumber: order.orderNumber,
        email: email,
        reason: reason,
        items: itemsToReturn
      };

      await api.post("/returns", payload);
      setStep(3);
      toast.success("Return request filed successfully.");
    } catch (err) {
      console.error("Submit return error:", err);
      setErrorMsg(err.response?.data?.message || "Failed to submit return request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="returns-page">
      <PageMeta 
        title="Returns & Exchanges Portal" 
        description="File return and exchange claims for your Kamigami vestments order quickly and securely." 
      />
      <div className="returns-container">
        
        {/* Step 1: Order Lookup */}
        {step === 1 && (
          <div className="returns-card lookup-view">
            <header className="returns-header">
              <RefreshCw size={36} className="text-red-500" />
              <h2>RETURNS & EXCHANGES</h2>
              <p>Enter your order details below to initiate a return request.</p>
            </header>

            {errorMsg && (
              <div className="error-banner">
                <AlertTriangle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLookup} className="returns-form">
              <div className="form-group">
                <label htmlFor="orderNum">ORDER NUMBER</label>
                <input 
                  id="orderNum"
                  type="text" 
                  placeholder="e.g. KAMI-1234" 
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">EMAIL ADDRESS</label>
                <input 
                  id="email"
                  type="email" 
                  placeholder="e.g. scribe@temple.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              <button type="submit" className="action-btn" disabled={loading}>
                {loading ? <><Loader2 className="animate-spin" size={14} /> LOCATING ORDER...</> : <>FIND ORDER <ArrowRight size={14} /></>}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Select Items */}
        {step === 2 && order && (
          <div className="returns-card select-items-view">
            <header className="returns-header">
              <h2>SELECT ITEMS TO RETURN</h2>
              <p>Order #{order.orderNumber} • {new Date(order.createdAt).toLocaleDateString()}</p>
            </header>

            {errorMsg && (
              <div className="error-banner">
                <AlertTriangle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReturn} className="returns-items-form">
              <div className="order-items-select-list">
                {order.items.map(item => (
                  <div key={item.id} className={`return-item-row ${selectedItems[item.id] ? 'selected' : ''}`}>
                    <label className="checkbox-container">
                      <input 
                        type="checkbox" 
                        checked={!!selectedItems[item.id]} 
                        onChange={() => handleCheckboxChange(item.id)}
                      />
                      <span className="checkmark" />
                    </label>

                    <div className="item-info-col">
                      <h4>{item.name}</h4>
                      <p className="sku">SKU: {item.sku || 'N/A'}</p>
                    </div>

                    <div className="qty-select-col">
                      <label htmlFor={`qty-${item.id}`}>Qty:</label>
                      <input 
                        id={`qty-${item.id}`}
                        type="number" 
                        min="1" 
                        max={item.quantity}
                        value={quantities[item.id] || 1}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value, item.quantity)}
                        disabled={!selectedItems[item.id]}
                      />
                      <span className="max-qty">of {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-group return-reason-group">
                <label htmlFor="reason">REASON FOR RETURN</label>
                <textarea 
                  id="reason"
                  placeholder="Provide details about why you want to return or exchange these items..." 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="button-group">
                <button type="button" className="back-btn" onClick={() => setStep(1)}>
                  BACK
                </button>
                <button type="submit" className="action-btn" disabled={loading}>
                  {loading ? <><Loader2 className="animate-spin" size={14} /> SUBMITTING CLAIM...</> : <>SUBMIT RETURN REQUEST</>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="returns-card success-view">
            <CheckCircle size={48} className="text-green-500 animate-bounce" />
            <h2>RETURN REQUEST FILED</h2>
            <p>Your return request has been registered in the database sanctum.</p>
            <div className="instructions-box">
              <h4>WHAT HAPPENS NEXT?</h4>
              <ol>
                <li>Our temple administrators will inspect your order and return claim details.</li>
                <li>Upon approval, a reverse-pickup request will be initiated at your delivery address.</li>
                <li>Your refund or replacement will be processed within 5-7 business days of arrival at our hub.</li>
              </ol>
            </div>
            <button className="action-btn" onClick={() => {
              setOrderNumber("");
              setEmail("");
              setReason("");
              setStep(1);
            }}>
              FILE ANOTHER RETURN
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Returns;
