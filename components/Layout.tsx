import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Store, Package, Settings, LogOut } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="flex justify-between items-center container mx-auto max-w-lg">
          <h1 className="text-xl font-bold text-brand-600 flex items-center gap-2">
            <Store className="w-6 h-6" />
            Painel Loja
          </h1>
          <button 
            onClick={() => {
              localStorage.removeItem('zapcatalog_license');
              window.location.hash = '/';
            }}
            className="text-gray-500 hover:text-red-500"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-lg p-4 pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 safe-area-pb z-20">
        <div className="flex justify-between items-center container mx-auto max-w-lg">
          <Link to="/dashboard" className={`flex flex-col items-center p-2 rounded-lg ${isActive('/dashboard') ? 'text-brand-600' : 'text-gray-400'}`}>
            <Store size={24} />
            <span className="text-xs mt-1">Início</span>
          </Link>
          <Link to="/dashboard/products" className={`flex flex-col items-center p-2 rounded-lg ${isActive('/dashboard/products') ? 'text-brand-600' : 'text-gray-400'}`}>
            <Package size={24} />
            <span className="text-xs mt-1">Produtos</span>
          </Link>
          <Link to="/dashboard/config" className={`flex flex-col items-center p-2 rounded-lg ${isActive('/dashboard/config') ? 'text-brand-600' : 'text-gray-400'}`}>
            <Settings size={24} />
            <span className="text-xs mt-1">Config</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};
