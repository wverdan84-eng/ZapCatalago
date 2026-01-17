import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, Mail, Key, AlertOctagon, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { verifyLicense } from '../lib/security';
import { getItem } from '../lib/storage';

export const Activation: React.FC = () => {
  const [email, setEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in securely
    checkExistingLicense();
  }, []);

  const routeUser = async () => {
    try {
        // Critical Check: Does the store have configuration?
        const config = await getItem('store_config');
        
        if (config) {
            // Store exists -> Go to Dashboard
            navigate('/dashboard');
        } else {
            // Store is new -> Go to Setup Wizard
            navigate('/dashboard/config?setup=true');
        }
    } catch (e) {
        // Fallback if DB fails
        console.error("Routing error:", e);
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
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white font-sans">
      <div className="bg-slate-800 text-gray-100 p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-700">
        <div className="flex justify-center mb-6">
          <div className="bg-emerald-500/10 p-4 rounded-2xl shadow-inner border border-emerald-500/20">
            <Store className="w-10 h-10 text-emerald-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-extrabold text-center mb-1 text-white tracking-tight">Painel do Lojista</h1>
        <p className="text-slate-400 text-center mb-8 text-sm font-medium">
          Gerencie sua loja e produtos
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">E-mail de Acesso</label>
            <div className="relative group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-10 pr-4 py-3.5 bg-slate-900 border border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-white transition-all group-hover:border-slate-500"
              />
              <Mail className="w-5 h-5 text-slate-500 absolute left-3 top-3.5 group-focus-within:text-emerald-500 transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Chave da Licença</label>
            <div className="relative group">
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="XXXX-XXXXXXXXXXXX"
                className="w-full pl-10 pr-4 py-3.5 bg-slate-900 border border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono uppercase text-white transition-all group-hover:border-slate-500 text-sm"
              />
              <Key className="w-5 h-5 text-slate-500 absolute left-3 top-3.5 group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1.5 px-1">
              <ShieldCheck size={12} />
              Ambiente Seguro e Criptografado
            </p>
          </div>
          
          {error && (
            <div className="bg-red-900/20 text-red-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-500/20 animate-shake">
              <AlertOctagon size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleActivate}
            disabled={loading}
            className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/50 transition-all flex justify-center items-center gap-2 disabled:opacity-70 active:scale-[0.98]"
          >
            {loading ? 'Validando...' : (
              <>
                Entrar na Loja <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>

        <div className="mt-8 border-t border-slate-700 pt-6 text-center">
          <Link to="/admin-master" className="text-[10px] text-slate-500 hover:text-emerald-400 transition-colors uppercase tracking-widest font-bold">
            Sou Administrador
          </Link>
        </div>
      </div>
    </div>
  );
};