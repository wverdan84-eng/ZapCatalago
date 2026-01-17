import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, MessageCircle, Clock, Search, Instagram, Share2, MapPin } from 'lucide-react';
import { decodeStoreData } from '../lib/url-engine';
import { StoreData, CartItem } from '../types';

export const CustomerCatalog: React.FC = () => {
  const location = useLocation();
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const dataParam = params.get('d');

    if (dataParam) {
      const decoded = decodeStoreData(dataParam);
      if (decoded) {
        setStoreData(decoded);
      } else {
        setError('Catálogo inválido ou corrompido.');
      }
    } else {
      setError('Nenhum dado de loja encontrado.');
    }
  }, [location]);

  // Update Page Title and Theme Color for immersive experience
  useEffect(() => {
    if (storeData) {
      document.title = storeData.config.storeName;
      
      // Update Meta Theme Color
      const metaThemeColor = document.querySelector("meta[name=theme-color]");
      if (metaThemeColor) {
        metaThemeColor.setAttribute("content", storeData.config.themeColor || '#10b981');
      }
    }
    
    // Cleanup on unmount (optional, reset to default if needed, but usually fine to leave)
  }, [storeData]);

  // Derived State
  const isOpen = useMemo(() => {
    if (!storeData?.config.openTime || !storeData?.config.closeTime) return true;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const [openH, openM] = storeData.config.openTime.split(':').map(Number);
    const [closeH, closeM] = storeData.config.closeTime.split(':').map(Number);
    
    const startMinutes = openH * 60 + openM;
    const endMinutes = closeH * 60 + closeM;
    
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }, [storeData]);

  const categories = useMemo(() => {
    if (!storeData) return [];
    const cats = new Set(storeData.products.map(p => p.category || 'Geral'));
    return ['Todos', ...Array.from(cats)];
  }, [storeData]);

  const filteredProducts = useMemo(() => {
    if (!storeData) return [];
    return storeData.products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || (p.category || 'Geral') === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [storeData, searchQuery, selectedCategory]);

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cart]);

  // Actions
  const addToCart = (product: any) => {
    if (product.stock !== undefined && product.stock <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      
      // Stock Check for existing items
      if (existing && product.stock !== undefined && existing.quantity >= product.stock) {
        alert('Estoque máximo atingido para este item.');
        return prev;
      }

      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item);
      }
      return prev.filter(item => item.id !== id);
    });
  };

  const handleCheckout = () => {
    if (!storeData) return;

    let message = `*Novo Pedido - ${storeData.config.storeName}*\n\n`;
    
    message += `*Itens:*\n`;
    cart.forEach(item => {
      message += `${item.quantity}x ${item.name} ... R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n*Total: R$ ${cartTotal.toFixed(2)}*\n`;
    
    if (storeData.config.address) {
       message += `\n_Obs: Aguardo confirmação do pedido._`;
    }

    const whatsappUrl = `https://wa.me/${storeData.config.phone}?text=${encodeURIComponent(message)}`;
    window.location.href = whatsappUrl;
  };

  const handleShareStore = () => {
    if (navigator.share) {
      navigator.share({
        title: storeData?.config.storeName,
        text: `Veja o catálogo online de ${storeData?.config.storeName}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link da loja copiado!');
    }
  };

  // Render Helpers
  if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;
  if (!storeData) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-400">Carregando Loja...</div>;

  const themeColor = storeData.config.themeColor || '#10b981';

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      
      {/* Hero Header */}
      <div style={{ backgroundColor: themeColor }} className="text-white pt-8 pb-16 px-6 rounded-b-[2.5rem] shadow-xl relative transition-colors duration-500">
        <div className="container mx-auto max-w-lg">
          <div className="flex items-center gap-4">
            {storeData.config.logoUrl ? (
              <img src={storeData.config.logoUrl} alt="Logo" className="w-16 h-16 rounded-full border-2 border-white shadow-md object-cover bg-white" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold border-2 border-white/50">
                {storeData.config.storeName.charAt(0)}
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                  <h1 className="text-2xl font-bold leading-tight shadow-sm">{storeData.config.storeName}</h1>
                  <button onClick={handleShareStore} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
                      <Share2 size={16} />
                  </button>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm font-medium opacity-90">
                <span className={`px-2 py-0.5 rounded text-xs font-bold shadow-sm ${isOpen ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'}`}>
                  {isOpen ? 'ABERTO' : 'FECHADO'}
                </span>
                {storeData.config.openTime && (
                  <span className="flex items-center gap-1 text-xs drop-shadow-sm"><Clock size={12}/> {storeData.config.openTime} - {storeData.config.closeTime}</span>
                )}
              </div>
            </div>
          </div>

          {/* Info Cards (Address/Insta) */}
          {(storeData.config.address || storeData.config.instagram) && (
              <div className="mt-4 flex gap-2 text-xs opacity-90 flex-wrap">
                  {storeData.config.instagram && (
                      <a href={`https://instagram.com/${storeData.config.instagram}`} target="_blank" className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition backdrop-blur-sm">
                          <Instagram size={12} /> @{storeData.config.instagram}
                      </a>
                  )}
                  {storeData.config.address && (
                      <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full truncate max-w-full backdrop-blur-sm">
                          <MapPin size={12} /> {storeData.config.address}
                      </div>
                  )}
              </div>
          )}
        </div>

        {/* Search Bar Overlay */}
        <div className="absolute -bottom-6 left-0 right-0 px-6 z-10">
            <div className="container mx-auto max-w-lg bg-white rounded-xl shadow-lg flex items-center p-1 border border-gray-100">
                <Search className="text-gray-400 ml-3 w-5 h-5 flex-shrink-0" />
                <input 
                    type="text" 
                    placeholder="Buscar produtos..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 outline-none text-gray-700 bg-transparent text-sm"
                />
            </div>
        </div>
      </div>

      {/* Categories */}
      <div className="container mx-auto max-w-lg mt-10 px-4">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{ 
                        backgroundColor: selectedCategory === cat ? themeColor : 'white',
                        color: selectedCategory === cat ? 'white' : '#4b5563',
                        borderColor: selectedCategory === cat ? themeColor : '#e5e7eb'
                    }}
                    className="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border transition-all shadow-sm active:scale-95"
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto max-w-lg px-4 mt-4 space-y-4">
        {filteredProducts.length === 0 ? (
            <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                <ShoppingBag size={48} className="text-gray-200 mb-2" />
                <p>Nenhum produto encontrado.</p>
            </div>
        ) : (
            filteredProducts.map(product => {
                const cartItem = cart.find(c => c.id === product.id);
                const quantity = cartItem?.quantity || 0;
                const isOutOfStock = product.stock !== undefined && product.stock <= 0;

                return (
                    <div key={product.id} className={`bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-3 ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}>
                        {/* Image */}
                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative">
                            {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <ShoppingBag size={24} />
                                </div>
                            )}
                            {isOutOfStock && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[10px] font-bold uppercase p-1 text-center">
                                    Esgotado
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                                <h3 className="font-bold text-gray-900 leading-tight text-sm mb-1">{product.name}</h3>
                                <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{product.description}</p>
                            </div>
                            
                            <div className="flex justify-between items-end mt-2">
                                <span className="font-bold text-base" style={{ color: themeColor }}>
                                    R$ {product.price.toFixed(2)}
                                </span>

                                {!isOutOfStock && (
                                    quantity === 0 ? (
                                        <button 
                                            onClick={() => addToCart(product)}
                                            style={{ borderColor: themeColor, color: themeColor }}
                                            className="border font-bold px-4 py-1.5 rounded-lg text-xs hover:bg-gray-50 transition uppercase active:scale-95"
                                        >
                                            Adicionar
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1 shadow-inner">
                                            <button onClick={() => removeFromCart(product.id)} className="p-1 hover:text-red-500 transition w-7 h-6 flex items-center justify-center active:scale-90"><Minus size={14} /></button>
                                            <span className="font-bold text-sm w-4 text-center">{quantity}</span>
                                            <button onClick={() => addToCart(product)} className="p-1 hover:text-green-500 transition w-7 h-6 flex items-center justify-center active:scale-90"><Plus size={14} /></button>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                );
            })
        )}
      </div>

      {/* Checkout Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.15)] z-30 p-4 rounded-t-2xl">
          <div className="container mx-auto max-w-lg">
            {!isCartOpen ? (
              <button 
                onClick={() => setIsCartOpen(true)}
                style={{ backgroundColor: themeColor }}
                className="w-full text-white font-bold py-4 rounded-xl shadow-lg flex justify-between items-center px-6 transition-transform active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <span className="bg-black/20 w-8 h-8 rounded-full flex items-center justify-center text-sm animate-pulse-once">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                  <span>Ver sacola</span>
                </div>
                <span>R$ {cartTotal.toFixed(2)}</span>
              </button>
            ) : (
              <div className="animate-slide-up">
                <div className="flex justify-between items-center mb-4 border-b pb-4">
                  <h3 className="font-bold text-lg text-gray-800">Resumo do Pedido</h3>
                  <button onClick={() => setIsCartOpen(false)} className="text-gray-400 text-sm hover:text-gray-600 font-medium">Fechar</button>
                </div>
                
                <div className="max-h-[40vh] overflow-y-auto mb-4 space-y-3 pr-2 custom-scrollbar">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between text-sm items-center border-b border-gray-50 pb-2 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-500 w-6">{item.quantity}x</span>
                        <div className="flex flex-col">
                            <span className="text-gray-800 font-medium">{item.name}</span>
                            <span className="text-xs text-gray-400">Unit: R$ {item.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between font-bold text-xl mb-6 pt-4 border-t border-dashed">
                  <span>Total</span>
                  <span style={{ color: themeColor }}>R$ {cartTotal.toFixed(2)}</span>
                </div>

                {!isOpen && (
                   <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-3 flex items-center gap-2 border border-red-100">
                       <Clock size={14} className="flex-shrink-0" /> 
                       <span>A loja está fechada. O pedido será enviado, mas pode demorar a ser visualizado.</span>
                   </div>
                )}

                <button 
                  onClick={handleCheckout}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg flex justify-center items-center gap-2 transition-all active:scale-[0.98]"
                >
                  <MessageCircle size={22} />
                  Enviar Pedido no WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};