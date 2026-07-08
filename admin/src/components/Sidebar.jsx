import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Flame,
  Boxes,
  ShoppingCart,
  LogOut,
  Truck,
  Layers,
  Settings,
  Image,
  BookOpen,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const Sidebar = () => {
  const logout = useAuthStore(state => state.logout);

  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/products', icon: Package, label: 'Products' },
    { to: '/categories', icon: Layers, label: 'Categories' },
    { to: '/collections', icon: Boxes, label: 'Collections' },
    { to: '/drops', icon: Flame, label: 'Drops' },
    { to: '/inventory', icon: Package, label: 'Inventory' },
    { to: '/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/logistics', icon: Truck, label: 'Logistics' },
    { to: '/returns', icon: RefreshCw, label: 'Returns' },
    { to: '/settings', icon: Settings, label: 'Homepage CMS' },
    { to: '/media', icon: Image, label: 'Media Gallery' },
    { to: '/blogs', icon: BookOpen, label: 'Blog Articles' },
    { to: '/faqs', icon: HelpCircle, label: 'FAQs' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary-600 flex items-center gap-2">
          <Boxes className="w-8 h-8" />
          <span>KAMIGAMI</span>
        </h1>
        <p className="text-xs text-slate-400 font-medium tracking-widest mt-1">ADMIN CONSOLE</p>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
              ${isActive
                ? 'bg-primary-50 text-primary-600 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
            `}
          >
            <link.icon className="w-5 h-5" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
