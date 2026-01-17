import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit2, AlertCircle, Image as ImageIcon, Search, Camera, X, Check } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Product } from '../types';
import { getItem, setItem } from '../lib/storage';
import { processImage } from '../lib/image-utils';

const MAX_PRODUCTS = 40; 

export const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await getItem<Product[]>('store_products');
    if (data) setProducts(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProduct: Product = {
      id: editingId || Date.now().toString(),
      name,
      price: parseFloat(price.replace(',', '.')),
      description,
      imageUrl: imageUrl || undefined,
      category: category || 'Geral',
      stock: stock ? parseInt(stock) : undefined,
      available: true
    };

    let updatedList;
    if (editingId) {
      updatedList = products.map(p => p.id === editingId ? newProduct : p);
    } else {
      updatedList = [newProduct, ...products]; // Newest first
    }

    setProducts(updatedList);
    await setItem('store_products', updatedList);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      const updatedList = products.filter(p => p.id !== id);
      setProducts(updatedList);
      await setItem('store_products', updatedList);
    }
  };

  const handleEdit = (p: Product) => {
    setName(p.name);
    setPrice(p.price.toString());
    setDescription(p.description);
    setImageUrl(p.imageUrl || '');
    setCategory(p.category || '');
    setStock(p.stock ? p.stock.toString() : '');
    setEditingId(p.id);
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setDescription('');
    setImageUrl('');
    setCategory('');
    setStock('');
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await processImage(file);
        setImageUrl(base64);
      } catch (err) {
        alert("Erro ao processar imagem.");
      }
    }
  };

  return (
    <Layout title="Gerenciar Produtos">
      
      {!isFormOpen ? (
        <div className="space-y-4">
          
          {/* Header Stats */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-400 text-[10px] uppercase font-bold">Total Produtos</p>
                <p className="text-2xl font-bold text-gray-800">{products.length} <span className="text-gray-300 text-sm">/ {MAX_PRODUCTS}</span></p>
             </div>
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-400 text-[10px] uppercase font-bold">Categorias</p>
                <p className="text-2xl font-bold text-gray-800">{new Set(products.map(p => p.category || 'Geral')).size}</p>
             </div>
          </div>

          <button
            onClick={() => setIsFormOpen(true)}
            disabled={products.length >= MAX_PRODUCTS}
            className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all active:scale-[0.98]"
          >
            <Plus size={20} /> Adicionar Novo Produto
          </button>

          {products.length === 0 && (
             <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ImageIcon className="text-gray-300" size={32} />
                </div>
                <h3 className="text-gray-600 font-bold">Estoque Vazio</h3>
                <p className="text-gray-400 text-sm mt-1">Adicione seu primeiro produto acima.</p>
             </div>
          )}

          <div className="space-y-3 pb-20">
            {products.map(p => (
              <div key={p.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-3 group relative overflow-hidden">
                {/* Thumbnail */}
                <div className="w-20 h-20 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden relative border border-gray-100">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon size={24} />
                    </div>
                  )}
                  {p.stock !== undefined && p.stock < 5 && (
                    <div className={`absolute bottom-0 left-0 right-0 text-white text-[9px] text-center font-bold py-0.5 ${p.stock === 0 ? 'bg-red-500' : 'bg-orange-500'}`}>
                      {p.stock === 0 ? 'ESGOTADO' : 'BAIXO'}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{p.category || 'Geral'}</span>
                      <span className="font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded text-xs">R$ {p.price.toFixed(2)}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 truncate mt-0.5">{p.name}</h3>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{p.description || 'Sem descrição'}</p>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => handleEdit(p)} className="bg-gray-50 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition">
                      <Edit2 size={12} /> Editar
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="bg-gray-50 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
             <h3 className="font-bold text-gray-800">{editingId ? 'Editar Produto' : 'Novo Produto'}</h3>
             <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Image Uploader */}
            <div className="flex justify-center">
               <div 
                className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-brand-50/10 transition relative group"
                onClick={() => fileInputRef.current?.click()}
               >
                 {imageUrl ? (
                   <>
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-contain rounded-lg p-2" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-xl">
                        <span className="text-white font-bold text-sm flex items-center gap-2"><Camera size={16} /> Trocar Foto</span>
                    </div>
                   </>
                 ) : (
                    <>
                        <div className="bg-white p-3 rounded-full shadow-sm mb-2 group-hover:scale-110 transition">
                            <Camera size={24} className="text-gray-400 group-hover:text-brand-500" />
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase">Adicionar Foto</span>
                    </>
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
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Item *</label>
              <input required value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-gray-800" placeholder="Ex: X-Bacon Especial" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Preço (R$) *</label>
                <input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none font-bold text-gray-800" placeholder="0.00" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estoque</label>
                <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Infinito" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoria</label>
              <input value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Ex: Bebidas, Lanches..." />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição Detalhada</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm" placeholder="Liste ingredientes ou detalhes importantes..." rows={3} />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={resetForm} className="flex-1 py-3.5 text-gray-600 font-bold bg-gray-100 rounded-xl hover:bg-gray-200 transition">Cancelar</button>
              <button type="submit" className="flex-1 py-3.5 text-white font-bold bg-brand-600 rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-200 transition flex items-center justify-center gap-2">
                <Check size={18} /> Salvar
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};