import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout & Auth
import Layout from './components/Layout';
import Login from './pages/Login';

// Pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Drops from './pages/Drops';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import CreateProduct from './pages/CreateProduct';
import EditProduct from './pages/EditProduct';
import CreateDrop from './pages/CreateDrop';
import EditDrop from './pages/EditDrop';

// Store
import useAuthStore from './store/authStore';
import Categories from './pages/Categories';
import Collections from './pages/Collections';
import CmsSettings from './pages/CmsSettings';
import MediaGallery from './pages/MediaGallery';
import Logistics from './pages/Logistics';
import Blogs from './pages/Blogs';
import Faqs from './pages/Faqs';
import Returns from './pages/Returns';

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />}
        />

        {/* Protected Admin Routes */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/create" element={<CreateProduct />} />
          <Route path="/products/edit/:id" element={<EditProduct />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/drops" element={<Drops />} />
          <Route path="/drops/create" element={<CreateDrop />} />
          <Route path="/drops/edit/:id" element={<EditDrop />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/logistics" element={<Logistics />} />
          <Route path="/settings" element={<CmsSettings />} />
          <Route path="/media" element={<MediaGallery />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/faqs" element={<Faqs />} />
          <Route path="/returns" element={<Returns />} />
        </Route>

        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
