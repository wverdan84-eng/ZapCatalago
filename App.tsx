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
        {/* Merchant Routes */}
        <Route path="/" element={<Activation />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/products" element={<ProtectedRoute><ProductManager /></ProtectedRoute>} />
        <Route path="/dashboard/config" element={<ProtectedRoute><Config /></ProtectedRoute>} />

        {/* Public Customer Route */}
        {/* URL will look like: mysite.com/#/c?d=compressed_data */}
        <Route path="/c" element={<CustomerCatalog />} />

        {/* SECRET ADMIN ROUTE */}
        {/* Access this URL to generate keys: yoursite.com/#/admin-master */}
        <Route path="/admin-master" element={<AdminMaster />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;