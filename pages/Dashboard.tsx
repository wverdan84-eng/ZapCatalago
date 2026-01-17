import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Share2, Download, ExternalLink, AlertTriangle, CheckCircle, Package, Settings, Copy, Link as LinkIcon, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Product, StoreConfig } from '../types';
import { getItem } from '../lib/storage';
import { generateStoreLink } from '../lib/url-engine';

export const Dashboard: React.FC = () => {
  const [storeLink, setStoreLink] = useState('');
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const qrRef = useRef<SVGSVGElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const loadedConfig = await getItem<StoreConfig>('store_config');
      const loadedProducts = await getItem<Product[]>('store_products') || [];
      
      setConfig(loadedConfig || null);
      setProducts(loadedProducts);

      if (loadedConfig) {
        try {
            const link = generateStoreLink({
                config: loadedConfig,
                products: loadedProducts
            });
            setStoreLink(link);
        } catch (err) {
            console.error("Error generating link:", err);
        }
      }
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = () => {
    const svg = qrRef.current;
    if (!svg) return;
    
    try {
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
    } catch (e) {
        alert("Erro ao baixar QR Code. Tente tirar um print.");
    }
  };

  const handleCopyLink = () => {
    if (!storeLink) return;
    navigator.clipboard.writeText(storeLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (!storeLink) return;
    if (navigator.share) {
      navigator.share({
        title: config?.storeName,
        text: 'Confira nosso catálogo online!',
        url: storeLink,
      });
    } else {
      handleCopyLink();
    }
  };

  // Loading State
  if (loading) {
    return (
        <Layout>
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
        </Layout>
    );
  }

  // ESTADO 1: Loja não configurada
  if (!config || !config.storeName || !config.phone) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
          <div className="bg-yellow-50 p-4 rounded-full mb-6">
            <AlertTriangle className="w-12 h-12 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quase lá!</h2>
          <p className="text-gray-500 mb-8 max-w-xs leading-relaxed">
            Para gerar o link da sua loja, precisamos primeiro configurar o nome e o WhatsApp.
          </p>
          
          <Link to="/dashboard/config" className="w-full bg-brand-600 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-brand-700 transition flex items-center justify-center gap-2 animate-pulse-once">
            <Settings size={20} />
            Configurar Minha Loja
          </Link>
        </div>
      </Layout>
    );
  }

  // ESTADO 2: Loja configurada, mas sem produtos
  if (products.length === 0) {
    return (
      <Layout>
        <div className="bg-brand-600 text-white p-6 rounded-2xl shadow-xl mb-6 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold">{config.storeName}</h2>
            <p className="opacity-90 text-sm mt-1">Sua loja está configurada!</p>
          </div>
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center py-10">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="text-blue-500" size={32} />
          </div>
          <h3 className="font-bold text-gray-800 text-lg mb-2">Cadastre seus Produtos</h3>
          <p className="text-gray-500 text-sm mb-6 px-4">
            Sua loja está vazia. Adicione produtos para gerar o catálogo final para seu cliente.
          </p>
          <Link to="/dashboard/products" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition w-full justify-center">
            <Package size={20} />
            Adicionar Primeiro Produto
          </Link>
        </div>
      </Layout>
    );
  }

  // ESTADO 3: Loja Pronta (Dashboard Completo)
  return (
    <Layout>
      {/* Status Header */}
      <div className="bg-brand-600 text-white p-6 rounded-2xl shadow-xl mb-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="opacity-80 text-xs font-bold uppercase tracking-wider mb-1">Loja Ativa</p>
              <h2 className="text-3xl font-bold">{config.storeName}</h2>
            </div>
            {storeLink && (
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <QRCodeSVG value={storeLink} size={40} level="L" fgColor="#ffffff" bgColor="transparent" />
                </div>
            )}
          </div>
          
          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm">
              <Package size={14} />
              {products.length} Produtos
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm">
              <CheckCircle size={14} />
              Online
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
      </div>

      {/* Main Action: Share */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center mb-6">
        <h3 className="font-bold text-gray-800 mb-2">Link da Loja</h3>
        <p className="text-xs text-gray-400 mb-6">Compartilhe este link com seus clientes</p>
        
        {/* URL Input Box */}
        {storeLink ? (
            <div className="w-full bg-gray-50 border border-gray-200 rounded-xl flex items-center p-2 mb-6 text-left hover:border-brand-400 transition cursor-pointer group" onClick={handleCopyLink}>
                <div className="bg-white p-2.5 rounded-lg border border-gray-200 text-brand-600 group-hover:text-brand-700">
                    <LinkIcon size={18} />
                </div>
                <div className="flex-1 min-w-0 px-3">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Copiar Link</p>
                    <p className="text-sm font-medium text-gray-700 truncate">{storeLink}</p>
                </div>
                <div className="text-gray-400 pr-2 group-hover:text-brand-600">
                    {copied ? <CheckCircle size={20} className="text-green-500" /> : <Copy size={20} />}
                </div>
            </div>
        ) : (
            <div className="mb-6 text-red-500 text-sm">Erro ao gerar link. Verifique as configurações.</div>
        )}

        {/* QRCode Box */}
        {storeLink && (
            <div className="bg-white p-3 rounded-xl shadow-inner border border-gray-100 mb-6">
            <QRCodeSVG
                value={storeLink}
                size={160}
                level={"M"}
                includeMargin={true}
                ref={qrRef}
            />
            </div>
        )}

        <div className="grid grid-cols-2 gap-3 w-full">
          <button 
            onClick={handleDownloadQR}
            disabled={!storeLink}
            className="flex items-center justify-center gap-2 bg-gray-50 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-100 transition border border-gray-200 text-sm disabled:opacity-50"
          >
            <Download size={16} /> Baixar QR
          </button>
          <button 
            onClick={handleShare}
            disabled={!storeLink}
            className="flex items-center justify-center gap-2 bg-brand-600 text-white py-3.5 rounded-xl font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-200 text-sm disabled:opacity-50"
          >
            <Share2 size={16} /> Enviar Link
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4">
         <Link to="/dashboard/products" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2 hover:border-brand-300 transition group">
            <div className="bg-blue-50 w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition">
                <Package className="text-blue-500" size={20} />
            </div>
            <span className="font-bold text-gray-700 text-sm">Gerenciar Produtos</span>
         </Link>

         <Link to="/dashboard/config" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2 hover:border-brand-300 transition group">
            <div className="bg-orange-50 w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-orange-100 transition">
                <Settings className="text-orange-500" size={20} />
            </div>
            <span className="font-bold text-gray-700 text-sm">Editar Loja</span>
         </Link>
      </div>

      {storeLink && (
        <a 
            href={storeLink} 
            target="_blank" 
            rel="noreferrer"
            className="mt-8 mb-4 block text-center bg-gray-800 text-white py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-gray-900 transition flex items-center justify-center gap-2"
        >
            <Eye size={18} />
            Ver Loja como Cliente
        </a>
      )}
    </Layout>
  );
};