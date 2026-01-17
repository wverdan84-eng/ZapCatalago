import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Store, Package, Settings, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  hideNav?: boolean; // New prop to hide navigation during setup
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, hideNav = false, title }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10 border-b border-gray-100">
        <div className="flex justify-between items-center container mx-auto max-w-lg">
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <div className="bg-brand-100 p-1.5 rounded-lg text-brand-600">
              <Store className="w-5 h-5" />
            </div>
            {title || 'Painel do Lojista'}
          </h1>
          
          {!hideNav && (
            <button 
              onClick={() => {
                if(confirm("Deseja realmente sair?")) {
                  localStorage.removeItem('zapcatalog_license');
                  window.location.hash = '/';
                }
              }}
              className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-gray-100 transition"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 container mx-auto max-w-lg p-4 ${!hideNav ? 'pb-24' : 'pb-8'}`}>
        {children}
      </main>

      {/* Bottom Navigation - Hidden during setup */}
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-1 safe-area-pb z-20 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center container mx-auto max-w-lg h-16">
            <Link to="/dashboard" className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive('/dashboard') ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}>
              <Store size={22} strokeWidth={isActive('/dashboard') ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Início</span>
            </Link>
            
            <Link to="/dashboard/products" className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive('/dashboard/products') ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}>
              <Package size={22} strokeWidth={isActive('/dashboard/products') ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Produtos</span>
            </Link>
            
            <Link to="/dashboard/config" className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive('/dashboard/config') ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}>
              <Settings size={22} strokeWidth={isActive('/dashboard/config') ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Config</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
};