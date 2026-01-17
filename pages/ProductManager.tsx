import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, AlertCircle, Image as ImageIcon, Search } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Product } from '../types';
import { getItem, setItem } from '../lib/storage';

const MAX_PRODUCTS = 40; 

export const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
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
      updatedList = [...products, newProduct];
    }

    setProducts(updatedList);
    await setItem('store_products', updatedList);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir?')) {
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

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Catálogo</h2>
        <span className="text-xs bg-gray-200 px-3 py-1 rounded-full text-gray-600 font-bold">
          {products.length} itens
        </span>
      </div>

      {!isFormOpen ? (
        <div className="space-y-4">
          <button
            onClick={() => setIsFormOpen(true)}
            disabled={products.length >= MAX_PRODUCTS}
            className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-700 shadow-md transition-all"
          >
            <Plus /> Adicionar Produto
          </button>

          <div className="grid gap-3">
            {products.map(p => (
              <div key={p.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-3">
                {/* Thumbnail */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon size={24} />
                    </div>
                  )}
                  {p.stock !== undefined && p.stock < 5 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-[10px] text-center font-bold">
                      {p.stock === 0 ? 'ESGOTADO' : 'POUCO ESTOQUE'}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{p.category || 'Geral'}</span>
                      <h3 className="font-bold text-gray-900 truncate">{p.name}</h3>
                    </div>
                    <span className="font-bold text-brand-600">R$ {p.price.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{p.description}</p>
                  
                  <div className="flex justify-end gap-3 mt-2">
                    <button onClick={() => handleEdit(p)} className="text-blue-600 text-xs font-bold flex items-center gap-1">
                      <Edit2 size={12} /> Editar
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 text-xs font-bold flex items-center gap-1">
                      <Trash2 size={12} /> Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">{editingId ? 'Editar Produto' : 'Novo Produto'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Produto</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Ex: X-Bacon" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Preço (R$)</label>
                <input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="0.00" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estoque (Opcional)</label>
                <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Infinito" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoria</label>
              <input value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Ex: Lanches, Bebidas..." />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><ImageIcon size={12}/> Link da Imagem</label>
              <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="https://..." />
              <p className="text-[10px] text-gray-400 mt-1">Use um link público de imagem (ex: Imgur)</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Ingredientes, detalhes..." rows={3} />
            </div>

            <div className="flex gap-3 pt-4 border-t mt-4">
              <button type="button" onClick={resetForm} className="flex-1 py-3 text-gray-600 font-bold bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
              <button type="submit" className="flex-1 py-3 text-white font-bold bg-brand-600 rounded-lg hover:bg-brand-700">Salvar Produto</button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};