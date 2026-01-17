import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle, Smartphone, Mail, Key, AlertOctagon } from 'lucide-react';
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

    if (!email.includes('@') || licenseKey.length < 5) {
      setError('Dados inválidos.');
      setLoading(false);
      return;
    }

    const result = await verifyLicense(email, licenseKey);

    if (result.valid) {
      localStorage.setItem('zapcatalog_license', licenseKey);
      localStorage.setItem('merchant_email', email);
      navigate('/dashboard');
    } else {
      setError(result.message || 'Chave inválida.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-500 flex flex-col items-center justify-center p-6 text-white">
      <div className="bg-white text-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="bg-brand-100 p-4 rounded-full">
            <Smartphone className="w-10 h-10 text-brand-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2">ZapCatalog</h1>
        <p className="text-gray-500 text-center mb-6 text-sm">
          Ativação do Produto
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seu E-mail</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@email.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              />
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chave de Licença</label>
            <div className="relative">
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="XXXX-XXXXXXXXXXXX"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none font-mono uppercase"
              />
              <Key className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2">
              <AlertOctagon size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleActivate}
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {loading ? 'Verificando...' : (
              <>
                <CheckCircle size={20} />
                Ativar Loja
              </>
            )}
          </button>
        </div>

        <div className="mt-8 border-t pt-4">
          <div className="mt-2 flex justify-center">
            <Link to="/admin-master" className="text-[10px] text-gray-300 hover:text-brand-600 transition-colors uppercase tracking-widest font-bold">
              Acesso Admin (Dono)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};