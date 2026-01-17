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

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Error Boundary to prevent "White Screen" crashes
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Ops! Algo deu errado.</h1>
            <p className="text-gray-500 mb-6">Ocorreu um erro inesperado ao carregar sua loja.</p>
            <button 
                onClick={() => {
                    // Try to recover by going home
                    window.location.href = '/';
                }}
                className="bg-brand-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg"
            >
                Reiniciar Aplicativo
            </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
        <HashRouter>
        <Routes>
            {/* PUBLIC CUSTOMER ROUTE - HIGHEST PRIORITY */}
            <Route path="/c" element={<CustomerCatalog />} />

            {/* Merchant Routes */}
            <Route path="/" element={<Activation />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/products" element={<ProtectedRoute><ProductManager /></ProtectedRoute>} />
            <Route path="/dashboard/config" element={<ProtectedRoute><Config /></ProtectedRoute>} />

            {/* SECRET ADMIN ROUTE */}
            <Route path="/admin-master" element={<AdminMaster />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </HashRouter>
    </ErrorBoundary>
  );
};

export default App;