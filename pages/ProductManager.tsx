import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Product } from '../types';
import { getItem, setItem } from '../lib/storage';

const MAX_PRODUCTS = 30; // Soft limit for URL size safety

export const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

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
    setEditingId(p.id);
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setDescription('');
    setEditingId(null);
    setIsFormOpen(false);
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Seus Produtos</h2>
        <span className="text-sm bg-gray-200 px-3 py-1 rounded-full text-gray-600 font-medium">
          {products.length} / {MAX_PRODUCTS}
        </span>
      </div>

      {products.length >= MAX_PRODUCTS && !isFormOpen && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4 flex items-start gap-3">
          <AlertCircle className="text-yellow-600 w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">
            Você atingiu o limite recomendado de produtos. Mais itens podem deixar o QR Code muito denso e difícil de ler.
          </p>
        </div>
      )}

      {!isFormOpen ? (
        <div className="space-y-4">
          <button
            onClick={() => setIsFormOpen(true)}
            disabled={products.length >= MAX_PRODUCTS}
            className="w-full py-4 bg-brand-50 border-2 border-dashed border-brand-300 text-brand-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus /> Adicionar Novo Produto
          </button>

          <div className="grid gap-3">
            {products.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900">{p.name}</h3>
                  <p className="text-brand-600 font-bold">R$ {p.price.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{p.description}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(p)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            
            {products.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                Nenhum produto cadastrado ainda.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in-up">
          <h3 className="font-bold text-lg mb-4">{editingId ? 'Editar Produto' : 'Novo Produto'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nome</label>
              <input required value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Ex: X-Bacon" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Preço</label>
              <input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Descrição</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Ingredientes, detalhes..." rows={3} />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={resetForm} className="flex-1 py-3 text-gray-600 font-bold bg-gray-100 rounded-lg">Cancelar</button>
              <button type="submit" className="flex-1 py-3 text-white font-bold bg-brand-600 rounded-lg hover:bg-brand-700">Salvar</button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};
