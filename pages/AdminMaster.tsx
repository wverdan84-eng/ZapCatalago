import React, { useState } from 'react';
import { Shield, Key, Copy, Check, Calendar, User } from 'lucide-react';
import { generateLicense } from '../lib/security';

const MASTER_PASSWORD = "admin"; 

export const AdminMaster: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  const [email, setEmail] = useState('');
  const [days, setDays] = useState(365); // Default 1 year
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
    if (!email || !email.includes('@')) {
      alert("Digite um email válido");
      return;
    }

    const key = await generateLicense(email, days);
    setGeneratedKey(key);
    
    // Formatar data de expiração para exibir
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + days);
    const dateStr = expDate.toLocaleDateString('pt-BR');

    const msg = `Olá!\n\nSeu acesso ao ZapCatalog foi liberado.\n\n📧 Login: ${email}\n🔑 Chave: ${key}\n📅 Validade: ${dateStr}\n\nAcesse agora: ${window.location.origin}`;
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
          <h1 className="text-xl text-center text-white font-bold mb-6">Painel Mestre</h1>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Senha Master"
            className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded-lg mb-4 focus:border-emerald-500 outline-none"
          />
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg">
            Acessar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-xl mx-auto">
        <header className="flex items-center justify-between mb-8 border-b border-gray-700 pb-4">
          <div className="flex items-center gap-3">
            <Shield className="text-emerald-500" />
            <h1 className="text-xl font-bold">Gerenciador de Licenças</h1>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="text-sm text-slate-400 hover:text-white">Sair</button>
        </header>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl mb-6">
          <div className="grid gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                <User size={14} /> E-mail do Cliente
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@email.com"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                <Calendar size={14} /> Período de Acesso
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setDays(30)} 
                  className={`p-2 rounded border text-sm ${days === 30 ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-900 border-slate-600 hover:border-emerald-500'}`}
                >
                  1 Mês
                </button>
                <button 
                  onClick={() => setDays(180)} 
                  className={`p-2 rounded border text-sm ${days === 180 ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-900 border-slate-600 hover:border-emerald-500'}`}
                >
                  6 Meses
                </button>
                <button 
                  onClick={() => setDays(365)} 
                  className={`p-2 rounded border text-sm ${days === 365 ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-900 border-slate-600 hover:border-emerald-500'}`}
                >
                  1 Ano
                </button>
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              className="mt-2 bg-emerald-600 hover:bg-emerald-700 py-3 rounded-lg font-bold transition shadow-lg shadow-emerald-900/50"
            >
              Gerar Licença
            </button>
          </div>
        </div>

        {generatedKey && (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl animate-fade-in">
            <h3 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2">
              <Key size={16} /> Licença Gerada
            </h3>

            <div className="bg-black p-4 rounded-lg font-mono text-center text-lg tracking-wider text-emerald-400 border border-emerald-900/50 mb-6 break-all">
              {generatedKey}
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-500 uppercase font-bold">Copiar e enviar:</label>
              <textarea 
                value={copyText}
                readOnly
                rows={6}
                className="w-full bg-slate-900 text-slate-300 text-sm p-4 rounded-lg border border-slate-700 font-mono focus:outline-none"
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