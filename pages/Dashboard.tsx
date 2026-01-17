import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Share2, Download, ExternalLink, AlertTriangle } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Product, StoreConfig } from '../types';
import { getItem } from '../lib/storage';
import { generateStoreLink } from '../lib/url-engine';

export const Dashboard: React.FC = () => {
  const [storeLink, setStoreLink] = useState('');
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const qrRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadedConfig = await getItem<StoreConfig>('store_config');
    const loadedProducts = await getItem<Product[]>('store_products') || [];
    
    setConfig(loadedConfig || null);
    setProducts(loadedProducts);

    if (loadedConfig) {
      const link = generateStoreLink({
        config: loadedConfig,
        products: loadedProducts
      });
      setStoreLink(link);
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
      downloadLink.download = `QRCode-${config?.storeName || 'Loja'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: config?.storeName,
        text: 'Confira nosso catálogo online!',
        url: storeLink,
      });
    } else {
      navigator.clipboard.writeText(storeLink);
      alert('Link copiado!');
    }
  };

  if (!config || !config.phone) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full text-center py-20">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Configure sua Loja</h2>
          <p className="text-gray-500 mb-6 max-w-xs">Antes de gerar o QR Code, precisamos do nome da loja e do seu WhatsApp.</p>
          <a href="#/dashboard/config" className="bg-brand-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-brand-700 transition">
            Ir para Configurações
          </a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-brand-600 text-white p-6 rounded-2xl shadow-xl mb-6 relative overflow-hidden">
        <div className="relative z-10">
          <p className="opacity-80 text-sm mb-1">Bem-vindo ao</p>
          <h2 className="text-3xl font-bold">{config.storeName}</h2>
          <div className="mt-4 flex items-center gap-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              {products.length} Produtos ativos
            </span>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
        <h3 className="font-bold text-gray-800 mb-4">Seu QR Code de Vendas</h3>
        
        <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-100 mb-6">
          <QRCodeSVG
            value={storeLink}
            size={200}
            level={"M"}
            includeMargin={true}
            ref={qrRef}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          <button 
            onClick={handleDownloadQR}
            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
          >
            <Download size={18} /> Baixar
          </button>
          <button 
            onClick={handleShare}
            className="flex items-center justify-center gap-2 bg-brand-50 text-brand-700 py-3 rounded-xl font-bold hover:bg-brand-100 transition"
          >
            <Share2 size={18} /> Compartilhar
          </button>
        </div>
        
        <a 
          href={storeLink} 
          target="_blank" 
          rel="noreferrer"
          className="mt-6 text-brand-600 text-sm font-medium flex items-center gap-1 hover:underline"
        >
          Visualizar como cliente <ExternalLink size={14} />
        </a>
      </div>

      <div className="mt-8 bg-blue-50 p-4 rounded-xl border border-blue-100">
        <h4 className="font-bold text-blue-800 mb-2 text-sm">Como funciona?</h4>
        <p className="text-xs text-blue-700 leading-relaxed">
          Este QR Code contém todo o seu catálogo. O cliente escaneia, escolhe os produtos e o pedido chega pronto no seu WhatsApp. 
          <span className="font-bold block mt-1">Não precisa de internet para funcionar no seu celular após carregar!</span>
        </p>
      </div>
    </Layout>
  );
};
