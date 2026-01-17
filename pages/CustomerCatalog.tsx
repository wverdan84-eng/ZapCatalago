import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, MessageCircle, AlertTriangle } from 'lucide-react';
import { decodeStoreData } from '../lib/url-engine';
import { StoreData, CartItem } from '../types';

export const CustomerCatalog: React.FC = () => {
  const location = useLocation();
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [error, setError] = useState('');

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

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
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

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cart]);

  const handleCheckout = () => {
    if (!storeData) return;

    const lineItems = cart.map(item => `• ${item.quantity}x ${item.name} (R$ ${(item.price * item.quantity).toFixed(2)})`).join('\n');
    const message = `Olá! Gostaria de fazer um pedido:\n\n${lineItems}\n\n*Total: R$ ${cartTotal.toFixed(2)}*`;
    
    const whatsappUrl = `https://wa.me/${storeData.config.phone}?text=${encodeURIComponent(message)}`;
    window.location.href = whatsappUrl;
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-xl font-bold text-gray-900">Ops!</h1>
        <p className="text-gray-600 mt-2">{error}</p>
        <p className="text-sm text-gray-400 mt-4">Peça ao lojista para gerar o QR Code novamente.</p>
      </div>
    );
  }

  if (!storeData) return <div className="min-h-screen flex items-center justify-center text-brand-600 font-bold">Carregando catálogo...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900">{storeData.config.storeName}</h1>
        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
          <span className="w-2 h-2 rounded-full bg-green-500"></span> Aberto para pedidos
        </p>
      </div>

      {/* Product List */}
      <div className="container mx-auto max-w-lg p-4 space-y-4">
        {storeData.products.map(product => {
          const cartItem = cart.find(c => c.id === product.id);
          const quantity = cartItem?.quantity || 0;

          return (
            <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">{product.name}</h3>
                <p className="text-gray-500 text-sm my-1">{product.description}</p>
                <p className="font-bold text-brand-600">R$ {product.price.toFixed(2)}</p>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                {quantity === 0 ? (
                  <button 
                    onClick={() => addToCart(product)}
                    className="bg-brand-50 text-brand-700 font-bold px-4 py-2 rounded-lg text-sm hover:bg-brand-100 transition"
                  >
                    Adicionar
                  </button>
                ) : (
                  <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                    <button onClick={() => removeFromCart(product.id)} className="p-1 hover:text-red-500 transition"><Minus size={16} /></button>
                    <span className="font-bold text-sm w-4 text-center">{quantity}</span>
                    <button onClick={() => addToCart(product)} className="p-1 hover:text-green-500 transition"><Plus size={16} /></button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Cart Button / Sheet */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-20 safe-area-pb">
          <div className="container mx-auto max-w-lg">
            {!isCartOpen ? (
              <button 
                onClick={() => setIsCartOpen(true)}
                className="w-full bg-brand-600 text-white font-bold py-4 rounded-xl shadow-lg flex justify-between items-center px-6"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  <span>{cart.reduce((a, b) => a + b.quantity, 0)} itens</span>
                </div>
                <span>Ver Carrinho</span>
                <span>R$ {cartTotal.toFixed(2)}</span>
              </button>
            ) : (
              <div className="animate-slide-up">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <h3 className="font-bold text-lg">Seu Pedido</h3>
                  <button onClick={() => setIsCartOpen(false)} className="text-gray-500 text-sm underline">Fechar</button>
                </div>
                
                <div className="max-h-48 overflow-y-auto mb-4 space-y-2">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.quantity}x {item.name}</span>
                      <span className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between font-bold text-xl mb-6">
                  <span>Total</span>
                  <span className="text-brand-600">R$ {cartTotal.toFixed(2)}</span>
                </div>

                <button 
                  onClick={handleCheckout}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg flex justify-center items-center gap-2"
                >
                  <MessageCircle size={20} />
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
