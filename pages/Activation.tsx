import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Store, Mail, Key, AlertOctagon, HelpCircle, ArrowRight } from 'lucide-react';
import { verifyLicense } from '../lib/security';
import { getItem } from '../lib/storage';

export const Activation: React.FC = () => {
  const [email, setEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkExistingLicense();
  }, []);

  const routeUser = async () => {
    // Check if store is already configured
    const config = await getItem('store_config');
    if (config) {
        navigate('/dashboard');
    } else {
        // First time setup!
        navigate('/dashboard/config?setup=true');
    }
  };

  const checkExistingLicense = async () => {
    const savedLicense = localStorage.getItem('zapcatalog_license');
    const savedEmail = localStorage.getItem('merchant_email');
    
    if (savedLicense && savedEmail) {
      const result = await verifyLicense(savedEmail, savedLicense);
      if (result.valid) {
        routeUser();
      } else if (result.expired) {
        setError('Sua licença expirou. Entre em contato para renovar.');
        localStorage.removeItem('zapcatalog_license');
      }
    }
  };

  const handleActivate = async () => {
    setError('');
    setLoading(true);

    const cleanEmail = email.trim();
    const cleanKey = licenseKey.trim();

    if (!cleanEmail.includes('@') || cleanKey.length < 5) {
      setError('Por favor, verifique os dados informados.');
      setLoading(false);
      return;
    }

    const result = await verifyLicense(cleanEmail, cleanKey);

    if (result.valid) {
      localStorage.setItem('zapcatalog_license', cleanKey);
      localStorage.setItem('merchant_email', cleanEmail);
      await routeUser();
    } else {
      setError(result.message || 'Chave inválida ou e-mail incorreto.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-600 to-brand-800 flex flex-col items-center justify-center p-6 text-white font-sans">
      <div className="bg-white text-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="bg-brand-50 p-4 rounded-2xl shadow-inner rotate-3 hover:rotate-0 transition-transform duration-300">
            <Store className="w-10 h-10 text-brand-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-extrabold text-center mb-1 text-gray-900 tracking-tight">Login do Lojista</h1>
        <p className="text-gray-500 text-center mb-8 text-sm font-medium">
          Acesse para gerenciar sua loja
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">E-mail</label>
            <div className="relative group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-gray-50 focus:bg-white transition-all group-hover:border-brand-300"
              />
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5 group-focus-within:text-brand-500 transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Chave de Acesso</label>
            <div className="relative group">
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="XXXX-XXXXXXXXXXXX"
                className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-mono uppercase bg-gray-50 focus:bg-white transition-all group-hover:border-brand-300 text-sm"
              />
              <Key className="w-5 h-5 text-gray-400 absolute left-3 top-3.5 group-focus-within:text-brand-500 transition-colors" />
            </div>
            <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1.5 px-1">
              <HelpCircle size={12} />
              Enviada para seu e-mail após a compra.
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-100 animate-shake">
              <AlertOctagon size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleActivate}
            disabled={loading}
            className="w-full mt-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-200 transition-all flex justify-center items-center gap-2 disabled:opacity-70 active:scale-[0.98]"
          >
            {loading ? 'Validando...' : (
              <>
                Acessar Painel <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>

        <div className="mt-8 border-t pt-6 text-center">
          <Link to="/admin-master" className="text-[10px] text-gray-400 hover:text-brand-600 transition-colors uppercase tracking-widest font-bold">
            Acesso Administrativo
          </Link>
        </div>
      </div>
    </div>
  );
};