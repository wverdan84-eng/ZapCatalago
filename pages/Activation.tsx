import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, Smartphone } from 'lucide-react';

export const Activation: React.FC = () => {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already active
    if (localStorage.getItem('zapcatalog_license')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleActivate = () => {
    // Mock Validation Logic
    // In real app: Validate against a hardcoded hash or math logic to avoid server check
    if (key.length > 5) {
      localStorage.setItem('zapcatalog_license', 'active_' + Date.now());
      navigate('/dashboard');
    } else {
      setError('Licença inválida. Tente novamente.');
    }
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
          Crie seu catálogo digital e venda pelo WhatsApp sem pagar mensalidade.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chave de Licença</label>
            <div className="relative">
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Insira sua chave..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
              />
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>
          
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <button
            onClick={handleActivate}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg shadow-lg transition-all flex justify-center items-center gap-2"
          >
            <CheckCircle size={20} />
            Ativar Sistema
          </button>
        </div>

        <p className="mt-8 text-xs text-center text-gray-400">
          Produto protegido. Acesso offline garantido.
        </p>
      </div>
    </div>
  );
};
