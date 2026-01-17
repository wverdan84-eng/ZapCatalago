import React, { useState, useEffect, useRef } from 'react';
import { Save, Store as StoreIcon, Clock, MapPin, Instagram, Camera, Share2, Copy, Download, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Layout } from '../components/Layout';
import { StoreConfig, Product } from '../types';
import { getItem, setItem } from '../lib/storage';
import { processImage } from '../lib/image-utils';
import { generateStoreLink } from '../lib/url-engine';

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
  
  // State for Sharing
  const [storeLink, setStoreLink] = useState('');
  const [productsCount, setProductsCount] = useState(0);
  const qrRef = useRef<SVGSVGElement>(null);

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getItem<StoreConfig>('store_config');
    if (data) setConfig({ ...config, ...data });
    
    // Load products only to generate the correct link
    const products = await getItem<Product[]>('store_products') || [];
    setProductsCount(products.length);
    
    if (data) {
        updateShareLink(data, products);
    }
  };

  const updateShareLink = (currentConfig: StoreConfig, products: Product[]) => {
    const link = generateStoreLink({
        config: currentConfig,
        products: products
    });
    setStoreLink(link);
  };

  const handleSave = async () => {
    setLoading(true);
    await setItem('store_config', config);
    
    // Update link after save
    const products = await getItem<Product[]>('store_products') || [];
    updateShareLink(config, products);

    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (field: keyof StoreConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await processImage(file);
        handleChange('logoUrl', base64);
      } catch (err) {
        alert("Erro ao processar imagem. Tente uma menor.");
      }
    }
  };

  // Share Actions
  const handleDownloadQR = () => {
    const svg = qrRef.current;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QRCode-${config.storeName || 'Loja'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storeLink);
    alert('Link copiado!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: config.storeName,
        text: 'Acesse meu catálogo online:',
        url: storeLink,
      });
    } else {
      handleCopyLink();
    }
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
            {/* Logo Upload */}
            <div className="flex justify-center mb-4">
              <div 
                className="relative w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer hover:border-brand-500 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                {config.logoUrl ? (
                  <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-400">
                    <Camera size={24} className="mx-auto mb-1" />
                    <span className="text-[10px]">Logo</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

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

        {/* Seção de Compartilhamento (Só aparece se tiver loja configurada) */}
        {config.storeName && config.phone && (
            <div className="bg-indigo-900 text-white rounded-xl shadow-lg p-6 text-center">
                <h2 className="text-lg font-bold mb-2 flex items-center justify-center gap-2">
                    <Share2 className="text-indigo-400" size={20} /> Divulgar Loja
                </h2>
                <p className="text-indigo-200 text-xs mb-6">
                    Use as opções abaixo para enviar seu catálogo para os clientes.
                </p>

                <div className="bg-white p-3 rounded-xl w-fit mx-auto mb-6">
                    <QRCodeSVG
                        value={storeLink || 'https://zapcatalog.com'}
                        size={140}
                        level={"M"}
                        includeMargin={true}
                        ref={qrRef}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <button 
                        onClick={handleCopyLink}
                        className="bg-indigo-800 hover:bg-indigo-700 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                    >
                        <Copy size={16} /> Copiar Link
                    </button>
                    <button 
                        onClick={handleDownloadQR}
                        className="bg-indigo-800 hover:bg-indigo-700 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                    >
                        <Download size={16} /> Salvar QR
                    </button>
                </div>

                <button 
                    onClick={handleShare}
                    className="w-full bg-indigo-500 hover:bg-indigo-400 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition"
                >
                    <Share2 size={18} /> Compartilhar no Zap
                </button>

                <a 
                  href={storeLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-6 block text-indigo-300 text-xs hover:text-white flex items-center justify-center gap-1"
                >
                  Testar catálogo como cliente <ExternalLink size={10} />
                </a>
            </div>
        )}

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