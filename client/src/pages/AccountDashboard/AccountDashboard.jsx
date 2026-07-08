import React, { useEffect, useState } from "react";
import PageMeta from "../../components/PageMeta";
import {
  ShoppingBag,
  Package,
  Heart,
  MapPin,
  User,
  Phone,
  Mail,
  Loader2,
  Calendar,
  Lock,
  Plus,
  Eye,
  Sliders,
  Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";

import AccountSidebar from "../../components/AccountSidebar/AccountSidebar";
import StatCard from "../../components/StatCard/StatCard";
import AddressCard from "../../components/AddressCard/AddressCard";
import OrderCard from "../../components/OrderCard/OrderCard";

import "./module.css";

const AccountDashboard = () => {
  const { user, setUser, loading } = useAuth();
  const navigate = useNavigate();

  // Active Tab View State
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Profile Form States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Address Modal States
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street1: "",
    street2: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    country: "India",
    isDefault: false
  });

  // Dynamic Dashboard States
  const [addressList, setAddressList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/sign-up");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhoneNumber(user.phoneNumber || "");
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        setFetchingData(true);
        const [addressesRes, ordersRes] = await Promise.all([
          api.get("/users/me/addresses"),
          api.get("/orders/me")
        ]);

        setAddressList(addressesRes.data?.data?.addresses || []);
        setOrderList(ordersRes.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setFetchingData(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Loader2 className="animate-spin text-red-600" size={48} />
      </div>
    );
  }

  if (!user) return null;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!firstName) {
      toast.error("First name is required.");
      return;
    }

    try {
      setUpdatingProfile(true);
      const res = await api.put("/users/me", {
        firstName,
        lastName,
        phoneNumber
      });
      const updatedUser = res.data?.data?.user;
      if (updatedUser) {
        setUser(prev => ({ ...prev, ...updatedUser }));
        toast.success("Profile credentials updated successfully!");
        setShowProfileModal(false);
      }
    } catch (err) {
      console.error("Profile update failed:", err);
      const message = err.response?.data?.message || "Profile update failed";
      toast.error(message);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAddAddressClick = () => {
    setEditingAddress(null);
    setAddressForm({
      street1: "",
      street2: "",
      city: "",
      stateProvince: "",
      postalCode: "",
      country: "India",
      isDefault: addressList.length === 0
    });
    setShowAddressModal(true);
  };

  const handleEditAddress = (addressId) => {
    const target = addressList.find(addr => addr.id === addressId);
    if (target) {
      setEditingAddress(target);
      setAddressForm({
        street1: target.street1 || "",
        street2: target.street2 || "",
        city: target.city || "",
        stateProvince: target.stateProvince || "",
        postalCode: target.postalCode || "",
        country: target.country || "India",
        isDefault: target.isDefault || false
      });
      setShowAddressModal(true);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.street1 || !addressForm.city || !addressForm.stateProvince || !addressForm.postalCode) {
      toast.error("Please fill all required shipping fields.");
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
        isDefault: addressForm.isDefault
      };

      if (editingAddress) {
        // Edit address PUT request
        const res = await api.put(`/users/me/addresses/${editingAddress.id}`, payload);
        const updated = res.data?.data?.address;
        if (updated) {
          setAddressList(prev => prev.map(addr => {
            if (addr.id === editingAddress.id) return updated;
            if (payload.isDefault && addr.isDefault) return { ...addr, isDefault: false };
            return addr;
          }));
          toast.success("Coordinates updated successfully!");
        }
      } else {
        // Add address POST request
        const res = await api.post("/users/me/addresses", payload);
        const created = res.data?.data?.address;
        if (created) {
          setAddressList(prev => [
            created,
            ...prev.map(addr => payload.isDefault ? { ...addr, isDefault: false } : addr)
          ]);
          toast.success("Coordinates logged in temple vault!");
        }
      }
      setShowAddressModal(false);
    } catch (err) {
      console.error("Failed to save coordinates:", err);
      toast.error("Failed to save address coordinates.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete these coordinates?")) return;
    try {
      await api.delete(`/users/me/addresses/${addressId}`);
      setAddressList(prev => prev.filter(addr => addr.id !== addressId));
      toast.success("Coordinates deleted from temple records.");
    } catch (err) {
      console.error("Address deletion failed:", err);
      toast.error("Failed to delete coordinates.");
    }
  };

  // Stats Calculations
  const activeOrdersCount = orderList.filter(o =>
    ["PENDING", "PROCESSING", "PAID", "SHIPPED"].includes(o.status)
  ).length;

  const stats = [
    { icon: ShoppingBag, label: "Total Orders", value: orderList.length.toString() },
    { icon: Package, label: "Active Orders", value: activeOrdersCount.toString() },
    { icon: Heart, label: "Wishlist", value: "0" },
    { icon: MapPin, label: "Saved Addresses", value: addressList.length.toString() },
  ];

  const getStatusText = (status) => {
    if (status === "DELIVERED") return "Delivered";
    if (status === "SHIPPED") return "Shipping";
    return "Processing";
  };

  const formattedJoinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : "June 2026";

  return (
    <div className="dashboard-page">
      <PageMeta 
        title={`${activeTab} — My Account`} 
        description="Access and manage your personal Kamigami customer dashboard. View and track active orders, update your saved addresses, customize your profile, and more." 
      />
      <div className="dashboard-container">
        {/* Left Sidebar */}
        <AccountSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onEditProfile={() => setShowProfileModal(true)} 
        />

        {/* Main Content */}
        <main className="dashboard-main animate-fade">
          {/* Dashboard Header */}
          <div className="dashboard-header">
            <h1 className="dashboard-title">{activeTab}</h1>
            <p className="dashboard-subtitle">
              {activeTab === "Dashboard" && "Manage your profile, orders, and preferences"}
              {activeTab === "My Orders" && "Track, monitor, and inspect your active garments"}
              {activeTab === "Order History" && "Review your finalized and past vestments pacts"}
              {activeTab === "Saved Addresses" && "Configure shipping coordinates for physical manifestations"}
              {["Payment Methods", "Security", "Notifications", "Help Center"].includes(activeTab) && `Configure ${activeTab.toLowerCase()} parameters`}
            </p>
          </div>

          {/* VIEW: Dashboard (Default Overview) */}
          {activeTab === "Dashboard" && (
            <>
              {/* Account Stats */}
              <section className="dashboard-section">
                <h2 className="section-title">Account Overview</h2>
                <div className="stats-grid">
                  {stats.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                  ))}
                </div>
              </section>

              {/* Personal Details */}
              <section className="dashboard-section">
                <h2 className="section-title">Personal Details</h2>
                <div className="dashboard-details-view">
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Full Name</label>
                      <p>{user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Set your name"}</p>
                    </div>
                    <div className="info-item">
                      <label>Email Address</label>
                      <p>{user.email}</p>
                    </div>
                    <div className="info-item">
                      <label>Phone Number</label>
                      <p>{user.phoneNumber || "No phone added"}</p>
                    </div>
                    <div className="info-item">
                      <label>Member Since</label>
                      <p>{formattedJoinDate}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowProfileModal(true)} className="update-profile-btn">
                    Modify Profile details
                  </button>
                </div>
              </section>

              {/* Saved Addresses Summary */}
              <section className="dashboard-section">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 className="section-title">Shipping Coordinates</h2>
                  <button 
                    onClick={() => setActiveTab("Saved Addresses")} 
                    style={{ background: "none", border: "none", color: "#ff1a1a", fontSize: "0.78rem", cursor: "pointer", fontWeight: "600", letterSpacing: "0.5px" }}
                  >
                    MANAGE ADDRESSES
                  </button>
                </div>
                {fetchingData ? (
                  <div className="dashboard-data-loading">
                    <Loader2 className="animate-spin text-red-600" size={24} />
                  </div>
                ) : addressList.length === 0 ? (
                  <div className="dashboard-empty-state">
                    <MapPin size={20} />
                    <p>No delivery coordinates logged in your vault.</p>
                  </div>
                ) : (
                  <div className="addresses-grid">
                    {addressList.slice(0, 2).map((addr) => (
                      <AddressCard 
                        key={addr.id} 
                        id={addr.id}
                        label={addr.isDefault ? "Primary Coordinates" : "Alternate Coordinates"}
                        address={`${addr.street1}${addr.street2 ? ', ' + addr.street2 : ''}, ${addr.city}, ${addr.stateProvince} - ${addr.postalCode}, ${addr.country}`}
                        isDefault={addr.isDefault}
                        onDelete={handleDeleteAddress}
                        onEdit={handleEditAddress}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Recent Orders Summary */}
              <section className="dashboard-section">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 className="section-title">Recent Manifestations</h2>
                  <button 
                    onClick={() => setActiveTab("My Orders")} 
                    style={{ background: "none", border: "none", color: "#ff1a1a", fontSize: "0.78rem", cursor: "pointer", fontWeight: "600", letterSpacing: "0.5px" }}
                  >
                    VIEW ALL ORDERS
                  </button>
                </div>
                {fetchingData ? (
                  <div className="dashboard-data-loading">
                    <Loader2 className="animate-spin text-red-600" size={24} />
                  </div>
                ) : orderList.length === 0 ? (
                  <div className="dashboard-empty-state">
                    <ShoppingBag size={20} />
                    <p>No orders have been manifested yet.</p>
                  </div>
                ) : (
                  <div className="orders-list">
                    {orderList.slice(0, 2).map((order) => (
                      <OrderCard 
                        key={order.id} 
                        image={order.items?.[0]?.image || "img/logo.png"}
                        name={`Order #${order.orderNumber}`}
                        price={Number(order.totalAmount).toLocaleString()}
                        date={new Date(order.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                        status={getStatusText(order.status)}
                        onViewDetails={() => navigate(`/orders/${order.id}`)}
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {/* VIEW: My Orders / Order History */}
          {(activeTab === "My Orders" || activeTab === "Order History") && (
            <section className="dashboard-section">
              {fetchingData ? (
                <div className="dashboard-data-loading">
                  <Loader2 className="animate-spin text-red-600" size={32} />
                  <p>Decrypting orders manifest...</p>
                </div>
              ) : orderList.length === 0 ? (
                <div className="dashboard-empty-state">
                  <ShoppingBag size={32} />
                  <p>No orders have been manifested in this realm.</p>
                </div>
              ) : (
                <div className="orders-list">
                  {orderList.map((order) => (
                    <OrderCard 
                      key={order.id} 
                      image={order.items?.[0]?.image || "img/logo.png"}
                      name={`Order #${order.orderNumber}`}
                      price={Number(order.totalAmount).toLocaleString()}
                      date={new Date(order.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                      status={getStatusText(order.status)}
                      onViewDetails={() => navigate(`/orders/${order.id}`)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* VIEW: Saved Addresses */}
          {activeTab === "Saved Addresses" && (
            <section className="dashboard-section">
              {fetchingData ? (
                <div className="dashboard-data-loading">
                  <Loader2 className="animate-spin text-red-600" size={32} />
                  <p>Decrypting address vaults...</p>
                </div>
              ) : (
                <div className="addresses-grid">
                  {/* Add New Coordinates Card */}
                  <div className="add-coordinate-card" onClick={handleAddAddressClick}>
                    <Plus size={24} className="text-red-600 animate-pulse" />
                    <p>ADD COORDINATES</p>
                  </div>

                  {addressList.map((addr) => (
                    <AddressCard 
                      key={addr.id} 
                      id={addr.id}
                      label={addr.isDefault ? "Primary Coordinates" : "Alternate Coordinates"}
                      address={`${addr.street1}${addr.street2 ? ', ' + addr.street2 : ''}, ${addr.city}, ${addr.stateProvince} - ${addr.postalCode}, ${addr.country}`}
                      isDefault={addr.isDefault}
                      onDelete={handleDeleteAddress}
                      onEdit={handleEditAddress}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* VIEWS: Placeholder / Locks */}
          {["Payment Methods", "Security", "Notifications", "Help Center"].includes(activeTab) && (
            <section className="dashboard-section">
              <div className="dashboard-empty-state" style={{ padding: "80px 40px" }}>
                <Lock size={36} />
                <h3 style={{ color: "#fff", fontSize: "1.1rem", margin: "0 0 4px", letterSpacing: "0.5px" }}>
                  RITUAL CONSTRAINTS ACTIVE
                </h3>
                <p style={{ color: "#555", fontSize: "0.8rem", textAlign: "center", maxWidth: "340px", margin: 0, lineHeight: 1.5 }}>
                  This dashboard parameter ({activeTab}) is cryptographically sealed for this profile. Standard sandbox protocols do not require modification of these parameters.
                </p>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* =======================================
          MODAL: PROFILE UPDATE FORM
         ======================================= */}
      {showProfileModal && (
        <div className="dashboard-modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="dashboard-modal-box animate-fade" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">UPDATE PROFILE VAULT</h3>
            <p className="modal-subtitle">Modify your profile details registered in the sanctum</p>
            
            <form onSubmit={handleUpdateProfile}>
              <div className="modal-form-grid">
                <div className="modal-input-wrap">
                  <label>FIRST NAME *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="Enter first name"
                  />
                </div>
                <div className="modal-input-wrap">
                  <label>LAST NAME</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
                <div className="modal-input-wrap">
                  <label>PHONE NUMBER</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="E.g. +91 98765 43210"
                  />
                </div>
                <div className="modal-input-wrap">
                  <label>EMAIL ADDRESS (READ-ONLY)</label>
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    style={{ opacity: 0.5, cursor: "not-allowed" }}
                  />
                </div>
              </div>
              <div className="modal-actions-wrap">
                <button type="button" onClick={() => setShowProfileModal(false)} className="modal-btn-cancel">
                  ABORT
                </button>
                <button type="submit" disabled={updatingProfile} className="modal-btn-submit">
                  {updatingProfile ? <Loader2 className="animate-spin" size={14} /> : "SEAL PACT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================
          MODAL: ADDRESS LOGGING / EDITION FORM
         ======================================= */}
      {showAddressModal && (
        <div className="dashboard-modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="dashboard-modal-box animate-fade" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              {editingAddress ? "EDIT SHIPPING VAULT" : "LOG SHIPPING VAULT"}
            </h3>
            <p className="modal-subtitle">
              {editingAddress 
                ? "Modify existing physical manifestation coordinates" 
                : "Register a new drop coordinate in the temple database"}
            </p>
            
            <form onSubmit={handleSaveAddress}>
              <div className="modal-form-grid">
                <div className="modal-input-wrap">
                  <label>STREET ADDRESS 1 *</label>
                  <input
                    type="text"
                    value={addressForm.street1}
                    onChange={(e) => setAddressForm({ ...addressForm, street1: e.target.value })}
                    required
                    placeholder="Flat, House, Room No. *"
                  />
                </div>
                <div className="modal-input-wrap">
                  <label>STREET ADDRESS 2 (OPTIONAL)</label>
                  <input
                    type="text"
                    value={addressForm.street2}
                    onChange={(e) => setAddressForm({ ...addressForm, street2: e.target.value })}
                    placeholder="Apartment, Landmark, Area"
                  />
                </div>
                <div className="modal-input-wrap">
                  <label>CITY *</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    required
                    placeholder="City *"
                  />
                </div>
                <div className="modal-input-wrap">
                  <label>STATE / PROVINCE *</label>
                  <input
                    type="text"
                    value={addressForm.stateProvince}
                    onChange={(e) => setAddressForm({ ...addressForm, stateProvince: e.target.value })}
                    required
                    placeholder="State / Province *"
                  />
                </div>
                <div className="modal-input-wrap">
                  <label>PINCODE / POSTAL CODE *</label>
                  <input
                    type="text"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    required
                    placeholder="Pincode / Postal Code *"
                  />
                </div>
                <div className="modal-input-wrap">
                  <label>COUNTRY *</label>
                  <input
                    type="text"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    required
                    placeholder="Country *"
                  />
                </div>
                
                <label className="modal-checkbox-wrap">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  />
                  <span>MAKE PRIMARY VAULT COORDINATES</span>
                </label>
              </div>
              <div className="modal-actions-wrap">
                <button type="button" onClick={() => setShowAddressModal(false)} className="modal-btn-cancel">
                  ABORT
                </button>
                <button type="submit" disabled={savingAddress} className="modal-btn-submit">
                  {savingAddress ? <Loader2 className="animate-spin" size={14} /> : "SEAL VAULT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDashboard;
