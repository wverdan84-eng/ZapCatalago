import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle, Store, Mail, Key, AlertOctagon, HelpCircle } from 'lucide-react';
import { verifyLicense } from '../lib/security';

export const Activation: React.FC = () => {
  const [email, setEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkExistingLicense();
  }, []);

  const checkExistingLicense = async () => {
    const savedLicense = localStorage.getItem('zapcatalog_license');
    const savedEmail = localStorage.getItem('merchant_email');
    
    if (savedLicense && savedEmail) {
      // Re-verify on load to ensure subscription hasn't expired
      const result = await verifyLicense(savedEmail, savedLicense);
      if (result.valid) {
        navigate('/dashboard');
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

    // Verify
    const result = await verifyLicense(cleanEmail, cleanKey);

    if (result.valid) {
      localStorage.setItem('zapcatalog_license', cleanKey);
      localStorage.setItem('merchant_email', cleanEmail);
      navigate('/dashboard');
    } else {
      setError(result.message || 'Chave inválida ou e-mail incorreto.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-600 to-brand-800 flex flex-col items-center justify-center p-6 text-white">
      <div className="bg-white text-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="bg-brand-50 p-4 rounded-full shadow-inner">
            <Store className="w-12 h-12 text-brand-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-1 text-gray-900">Área do Lojista</h1>
        <p className="text-gray-500 text-center mb-8 text-sm">
          Gerencie sua loja e seus pedidos
        </p>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">E-mail de Cadastro</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-gray-50 transition-all"
              />
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Chave de Acesso</label>
            <div className="relative">
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="XXXX-XXXXXXXXXXXX"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-mono uppercase bg-gray-50 transition-all"
              />
              <Key className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
              <HelpCircle size={10} />
              Enviada para seu e-mail após a compra.
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2 border border-red-100">
              <AlertOctagon size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleActivate}
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-200 transition-all flex justify-center items-center gap-2 disabled:opacity-70 active:scale-[0.98]"
          >
            {loading ? 'Acessando...' : (
              <>
                <CheckCircle size={20} />
                Entrar na Loja
              </>
            )}
          </button>
        </div>

        <div className="mt-8 border-t pt-6 text-center">
          <Link to="/admin-master" className="text-[10px] text-gray-300 hover:text-brand-600 transition-colors uppercase tracking-widest font-bold">
            Sou Administrador
          </Link>
        </div>
      </div>
    </div>
  );
};