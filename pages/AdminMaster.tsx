import React, { useState } from 'react';
import { Shield, Key, Copy, Check } from 'lucide-react';
import { generateSignature } from '../lib/security';

// PASSWORD TO ACCESS THIS PAGE
// Change this to something only you know
const MASTER_PASSWORD = "admin"; 

export const AdminMaster: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  const [email, setEmail] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [copyText, setCopyText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === MASTER_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta');
    }
  };

  const handleGenerate = async () => {
    if (!email) return;
    const key = await generateSignature(email);
    setGeneratedKey(key);
    
    const msg = `Olá!\n\nObrigado por comprar o ZapCatalog.\n\nSeus dados de acesso:\nE-mail: ${email}\nChave: ${key}\n\nAcesse em: ${window.location.origin}`;
    setCopyText(msg);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
          <div className="flex justify-center mb-6">
            <Shield className="w-12 h-12 text-emerald-500" />
          </div>
          <h1 className="text-xl text-center text-white font-bold mb-6">Acesso Administrativo</h1>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Senha Master"
            className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded-lg mb-4 focus:border-emerald-500 outline-none"
          />
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-xl mx-auto">
        <header className="flex items-center gap-3 mb-8 border-b border-gray-700 pb-4">
          <Shield className="text-emerald-500" />
          <h1 className="text-xl font-bold">Gerador de Licenças (Dono)</h1>
        </header>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl mb-6">
          <label className="block text-sm text-slate-400 mb-2">E-mail do Cliente (Hotmart)</label>
          <div className="flex gap-2">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@email.com"
              className="flex-1 bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
            />
            <button 
              onClick={handleGenerate}
              className="bg-emerald-600 hover:bg-emerald-700 px-6 rounded-lg font-bold transition"
            >
              Gerar
            </button>
          </div>
        </div>

        {generatedKey && (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl animate-fade-in">
            <h3 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2">
              <Key size={16} /> Licença Gerada com Sucesso
            </h3>

            <div className="bg-black p-4 rounded-lg font-mono text-center text-xl tracking-widest text-emerald-400 border border-emerald-900/50 mb-6">
              {generatedKey}
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-500 uppercase font-bold">Mensagem para enviar:</label>
              <textarea 
                value={copyText}
                readOnly
                rows={6}
                className="w-full bg-slate-900 text-slate-300 text-sm p-4 rounded-lg border border-slate-700 font-mono"
              />
            </div>

            <button 
              onClick={copyToClipboard}
              className="mt-4 w-full bg-slate-700 hover:bg-slate-600 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition"
            >
              {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
              {copied ? 'Copiado!' : 'Copiar Mensagem'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
