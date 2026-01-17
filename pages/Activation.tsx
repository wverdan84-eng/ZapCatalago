import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle, Smartphone, Mail, Key } from 'lucide-react';
import { verifyLicense } from '../lib/security';

export const Activation: React.FC = () => {
  const [email, setEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedLicense = localStorage.getItem('zapcatalog_license');
    if (savedLicense) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleActivate = async () => {
    setError('');
    setLoading(true);

    // Basic validation
    if (!email.includes('@') || licenseKey.length < 8) {
      setError('Por favor, insira um e-mail e chave válidos.');
      setLoading(false);
      return;
    }

    // Cryptographic Verification
    const isValid = await verifyLicense(email, licenseKey);

    if (isValid) {
      // Save license and email
      localStorage.setItem('zapcatalog_license', `active|${Date.now()}|${email}`);
      // Store email in config for convenience later if needed
      localStorage.setItem('merchant_email', email);
      
      navigate('/dashboard');
    } else {
      setError('Chave de licença inválida para este e-mail.');
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
          Ativação única. Use o e-mail cadastrado na compra.
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
              />
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chave de Acesso</label>
            <div className="relative">
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="Cole sua chave aqui"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none font-mono uppercase"
              />
              <Key className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
              <Lock size={16} />
              {error}
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
                Liberar Acesso
              </>
            )}
          </button>
        </div>

        <div className="mt-8 border-t pt-4">
          <p className="text-xs text-center text-gray-400">
            Dúvidas? Entre em contato com o suporte informando seu e-mail de compra.
          </p>
          <div className="mt-6 flex justify-center">
            <Link to="/admin-master" className="text-[10px] text-gray-300 hover:text-brand-600 transition-colors uppercase tracking-widest font-bold">
              Área Administrativa
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};