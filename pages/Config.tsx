import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, Store as StoreIcon, Clock, MapPin, Instagram, Camera, Share2, Copy, Download, ExternalLink, ArrowRight, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Layout } from '../components/Layout';
import { StoreConfig, Product } from '../types';
import { getItem, setItem } from '../lib/storage';
import { processImage } from '../lib/image-utils';
import { generateStoreLink } from '../lib/url-engine';

export const Config: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isSetupMode = searchParams.get('setup') === 'true';
  const navigate = useNavigate();
  
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
    
    const products = await getItem<Product[]>('store_products') || [];
    
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
    if (!config.storeName || !config.phone) {
      alert("Nome da loja e WhatsApp são obrigatórios!");
      return;
    }

    setLoading(true);
    await setItem('store_config', config);
    
    const products = await getItem<Product[]>('store_products') || [];
    updateShareLink(config, products);

    setLoading(false);
    setSaved(true);

    if (isSetupMode) {
      // Small delay so user sees "Saved!" before redirecting
      setTimeout(() => {
        navigate('/dashboard/products');
      }, 1500);
    } else {
      setTimeout(() => setSaved(false), 3000);
    }
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

  return (
    <Layout hideNav={isSetupMode} title={isSetupMode ? "Criar Minha Loja" : "Configurações"}>
      <div className="space-y-6 mb-24">
        
        {isSetupMode && (
          <div className="bg-brand-50 border border-brand-100 p-5 rounded-xl text-brand-900 text-sm mb-4 leading-relaxed shadow-sm">
            <h3 className="font-bold text-brand-700 text-lg mb-1">Bem-vindo(a)! 👋</h3>
            <p className="text-brand-800">
                Preencha os dados abaixo para ativar sua loja. 
                Isso é feito apenas uma vez. Depois, você poderá cadastrar seus produtos.
            </p>
          </div>
        )}

        {/* Identidade Visual */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold mb-4 flex items-center gap-2 text-gray-800 uppercase tracking-wide text-xs">
            <StoreIcon className="text-brand-600" size={16} /> Identidade Visual
          </h2>
          
          <div className="space-y-5">
            {/* Logo Upload */}
            <div className="flex flex-col items-center justify-center mb-2">
              <div 
                className="relative w-28 h-28 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer hover:border-brand-500 transition group"
                onClick={() => fileInputRef.current?.click()}
              >
                {config.logoUrl ? (
                  <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-400 group-hover:text-brand-500 transition">
                    <Camera size={28} className="mx-auto mb-1" />
                    <span className="text-[10px] font-bold uppercase">Adicionar Logo</span>
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
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome da Loja *</label>
              <input
                type="text"
                value={config.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-800 font-medium"
                placeholder="Ex: Hamburgueria do Zé"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cor Principal</label>
              <div className="flex gap-3 overflow-x-auto py-1 no-scrollbar">
                {['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#111827'].map(color => (
                  <button
                    key={color}
                    onClick={() => handleChange('themeColor', color)}
                    className={`w-10 h-10 rounded-full shadow-sm transition-transform ${config.themeColor === color ? 'scale-110 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-105'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contato e Localização */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold mb-4 flex items-center gap-2 text-gray-800 uppercase tracking-wide text-xs">
            <MapPin className="text-brand-600" size={16} /> Contato
          </h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">WhatsApp (Somente números) *</label>
              <input
                type="tel"
                value={config.phone}
                onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
                className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-mono text-gray-800"
                placeholder="5511999999999"
              />
              <p className="text-[10px] text-gray-400 mt-1">Seus pedidos chegarão neste número.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-2">
                 Instagram
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-gray-400">@</span>
                <input
                    type="text"
                    value={config.instagram}
                    onChange={(e) => handleChange('instagram', e.target.value)}
                    className="w-full pl-8 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-800"
                    placeholder="usuario"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Endereço (Opcional)</label>
              <textarea
                value={config.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-800 text-sm"
                rows={2}
                placeholder="Rua, Número - Bairro, Cidade"
              />
            </div>
          </div>
        </div>

        {/* Funcionamento */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold mb-4 flex items-center gap-2 text-gray-800 uppercase tracking-wide text-xs">
            <Clock className="text-brand-600" size={16} /> Horários e Serviços
          </h2>
          
          <div className="flex gap-4 mb-5">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Abre</label>
              <input
                type="time"
                value={config.openTime}
                onChange={(e) => handleChange('openTime', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl outline-none text-center font-bold text-gray-800 bg-gray-50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha</label>
              <input
                type="time"
                value={config.closeTime}
                onChange={(e) => handleChange('closeTime', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl outline-none text-center font-bold text-gray-800 bg-gray-50"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <label className={`flex items-center justify-center gap-2 border p-3 rounded-xl flex-1 cursor-pointer transition-all ${config.allowDelivery ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-gray-200 text-gray-400'}`}>
              <input
                type="checkbox"
                checked={config.allowDelivery}
                onChange={(e) => handleChange('allowDelivery', e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <span className="text-xs font-bold uppercase">Entrega</span>
            </label>
            <label className={`flex items-center justify-center gap-2 border p-3 rounded-xl flex-1 cursor-pointer transition-all ${config.allowPickup ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-gray-200 text-gray-400'}`}>
              <input
                type="checkbox"
                checked={config.allowPickup}
                onChange={(e) => handleChange('allowPickup', e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <span className="text-xs font-bold uppercase">Retirada</span>
            </label>
          </div>
        </div>

        {/* Seção de Compartilhamento (Oculta durante Setup) */}
        {!isSetupMode && config.storeName && config.phone && (
            <div className="bg-indigo-900 text-white rounded-xl shadow-lg p-6 text-center">
                <h2 className="text-lg font-bold mb-2 flex items-center justify-center gap-2">
                    <Share2 className="text-indigo-400" size={20} /> Link da Loja
                </h2>
                <p className="text-indigo-200 text-xs mb-6">
                    Seu link está pronto para enviar.
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
                        className="bg-indigo-800 hover:bg-indigo-700 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition"
                    >
                        <Copy size={16} /> Copiar
                    </button>
                    <button 
                        onClick={handleDownloadQR}
                        className="bg-indigo-800 hover:bg-indigo-700 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition"
                    >
                        <Download size={16} /> Salvar QR
                    </button>
                </div>

                <a 
                  href={storeLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-6 block text-indigo-300 text-xs hover:text-white flex items-center justify-center gap-1"
                >
                  Ver minha loja como cliente <ExternalLink size={10} />
                </a>
            </div>
        )}

      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-30 shadow-lg">
        <div className="container mx-auto max-w-lg">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex justify-center items-center gap-2 text-lg active:scale-[0.98] ${saved ? 'bg-green-600' : 'bg-brand-600 hover:bg-brand-700'}`}
          >
            {saved ? (
                <>
                    <Check size={24} /> {isSetupMode ? 'Loja Criada!' : 'Salvo!'}
                </>
            ) : (
                <>
                    {isSetupMode ? (
                        <>Criar Loja <ArrowRight size={20} /></>
                    ) : (
                        <><Save size={20} /> Salvar Alterações</>
                    )}
                </>
            )}
          </button>
        </div>
      </div>
    </Layout>
  );
};