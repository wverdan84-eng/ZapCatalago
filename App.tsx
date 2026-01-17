import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Activation } from './pages/Activation';
import { Dashboard } from './pages/Dashboard';
import { ProductManager } from './pages/ProductManager';
import { Config } from './pages/Config';
import { CustomerCatalog } from './pages/CustomerCatalog';
import { AdminMaster } from './pages/AdminMaster';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: React.PropsWithChildren) => {
  const isActivated = !!localStorage.getItem('zapcatalog_license');
  return isActivated ? <>{children}</> : <Navigate to="/" replace />;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* PUBLIC CUSTOMER ROUTE - HIGHEST PRIORITY */}
        {/* Placed first to ensure it matches before any catch-all or default redirects */}
        <Route path="/c" element={<CustomerCatalog />} />

        {/* Merchant Routes */}
        <Route path="/" element={<Activation />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/products" element={<ProtectedRoute><ProductManager /></ProtectedRoute>} />
        <Route path="/dashboard/config" element={<ProtectedRoute><Config /></ProtectedRoute>} />

        {/* SECRET ADMIN ROUTE */}
        <Route path="/admin-master" element={<AdminMaster />} />
        
        {/* Fallback - Redirects to Home (which redirects to Dashboard if logged in) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;