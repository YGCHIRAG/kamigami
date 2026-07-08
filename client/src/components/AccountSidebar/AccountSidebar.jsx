import { useAuth } from "../../Context/AuthContext";
import {
  LayoutDashboard,
  ShoppingBag,
  History,
  MapPin,
  CreditCard,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  Pencil,
} from "lucide-react";
import "./module.css";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: ShoppingBag, label: "My Orders" },
  { icon: History, label: "Order History" },
  { icon: MapPin, label: "Saved Addresses" },
  { icon: CreditCard, label: "Payment Methods" },
  { icon: Shield, label: "Security" },
  { icon: Bell, label: "Notifications" },
  { icon: HelpCircle, label: "Help Center" },
  { icon: LogOut, label: "Logout", danger: true },
];

const AccountSidebar = ({ activeTab, setActiveTab, onEditProfile }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleNavClick = (item) => {
    if (item.danger) {
      if (window.confirm("Are you sure you want to log out from the temple?")) {
        logout();
      }
    } else {
      setActiveTab(item.label);
    }
  };

  const displayName = user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Kamigami Disciple";
  const avatarSeed = encodeURIComponent(user.email || "Kamigami");

  return (
    <aside className="account-sidebar">
      {/* Profile Card */}
      <div className="sidebar-profile-card">
        <div className="sidebar-avatar-ring">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=c0aede`}
            alt="User Avatar"
            className="sidebar-avatar"
          />
        </div>
        <h3 className="sidebar-user-name">{displayName}</h3>
        <p className="sidebar-user-email">{user.email}</p>
        <p className="sidebar-user-phone">{user.phoneNumber || "No phone added"}</p>
        <button className="sidebar-edit-btn" onClick={onEditProfile}>
          <Pencil size={14} />
          Edit Profile
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`sidebar-nav-item ${activeTab === item.label ? "active" : ""} ${item.danger ? "danger" : ""}`}
            onClick={() => handleNavClick(item)}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default AccountSidebar;
