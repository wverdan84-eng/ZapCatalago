import React, { useState, useEffect } from 'react';
import { Save, Store as StoreIcon, Clock, MapPin, Instagram, Image as ImageIcon } from 'lucide-react';
import { Layout } from '../components/Layout';
import { StoreConfig } from '../types';
import { getItem, setItem } from '../lib/storage';

export const Config: React.FC = () => {
  const [config, setConfig] = useState<StoreConfig>({
    storeName: '',
    phone: '',
    currency: 'BRL',
    themeColor: '#10b981',
    logoUrl: '',
    instagram: '',
    address: '',
    openTime: '08:00',
    closeTime: '18:00',
    allowPickup: true,
    allowDelivery: true
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getItem<StoreConfig>('store_config').then((data) => {
      if (data) setConfig({ ...config, ...data });
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    await setItem('store_config', config);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (field: keyof StoreConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Layout>
      <div className="space-y-6 mb-24">
        
        {/* Identidade Visual */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
            <StoreIcon className="text-brand-600" size={20} /> Identidade
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Loja</label>
              <input
                type="text"
                value={config.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="Ex: Pizzaria do João"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <ImageIcon size={14} /> URL do Logo (Opcional)
              </label>
              <input
                type="url"
                value={config.logoUrl}
                onChange={(e) => handleChange('logoUrl', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                placeholder="https://imgur.com/seulogo.png"
              />
              <p className="text-xs text-gray-400 mt-1">Use um link direto de imagem.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cor do Tema</label>
              <div className="flex gap-2 overflow-x-auto py-2">
                {['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#111827'].map(color => (
                  <button
                    key={color}
                    onClick={() => handleChange('themeColor', color)}
                    className={`w-8 h-8 rounded-full border-2 ${config.themeColor === color ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contato e Localização */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
            <MapPin className="text-brand-600" size={20} /> Contato
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (Somente números)</label>
              <input
                type="tel"
                value={config.phone}
                onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="5511999999999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Instagram size={14} /> Instagram (Sem @)
              </label>
              <input
                type="text"
                value={config.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="minhaloja"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
              <textarea
                value={config.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                rows={2}
                placeholder="Rua das Flores, 123 - Centro"
              />
            </div>
          </div>
        </div>

        {/* Funcionamento */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
            <Clock className="text-brand-600" size={20} /> Funcionamento
          </h2>
          
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Abre</label>
              <input
                type="time"
                value={config.openTime}
                onChange={(e) => handleChange('openTime', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="time"
                value={config.closeTime}
                onChange={(e) => handleChange('closeTime', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg outline-none"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 border p-3 rounded-lg flex-1 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={config.allowDelivery}
                onChange={(e) => handleChange('allowDelivery', e.target.checked)}
                className="w-5 h-5 text-brand-600 rounded"
              />
              <span className="text-sm font-medium">Faz Entrega</span>
            </label>
            <label className="flex items-center gap-2 border p-3 rounded-lg flex-1 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={config.allowPickup}
                onChange={(e) => handleChange('allowPickup', e.target.checked)}
                className="w-5 h-5 text-brand-600 rounded"
              />
              <span className="text-sm font-medium">Retirada</span>
            </label>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20">
        <div className="container mx-auto max-w-lg">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex justify-center items-center gap-2 ${saved ? 'bg-brand-700' : 'bg-brand-600 hover:bg-brand-700'}`}
          >
            <Save size={20} />
            {saved ? 'Dados Salvos!' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </Layout>
  );
};