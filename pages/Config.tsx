import React, { useState, useEffect } from 'react';
import { Save, Store as StoreIcon } from 'lucide-react';
import { Layout } from '../components/Layout';
import { StoreConfig } from '../types';
import { getItem, setItem } from '../lib/storage';

export const Config: React.FC = () => {
  const [config, setConfig] = useState<StoreConfig>({
    storeName: '',
    phone: '',
    currency: 'BRL',
    themeColor: '#10b981',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getItem<StoreConfig>('store_config').then((data) => {
      if (data) setConfig(data);
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    await setItem('store_config', config);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Layout>
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <StoreIcon className="text-brand-600" size={20} />
          Dados da Loja
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Loja</label>
            <input
              type="text"
              value={config.storeName}
              onChange={(e) => setConfig({ ...config, storeName: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="Ex: Pizzaria do João"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (com DDD)</label>
            <input
              type="tel"
              value={config.phone}
              onChange={(e) => setConfig({ ...config, phone: e.target.value.replace(/\D/g, '') })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="Ex: 5511999999999"
            />
            <p className="text-xs text-gray-500 mt-1">Apenas números. Inclua o código do país (55 para Brasil).</p>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex justify-center items-center gap-2 ${saved ? 'bg-brand-700' : 'bg-brand-600 hover:bg-brand-700'}`}
      >
        <Save size={20} />
        {saved ? 'Salvo com Sucesso!' : 'Salvar Configurações'}
      </button>
    </Layout>
  );
};
