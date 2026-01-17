import React, { useState, useEffect } from 'react';
import { Shield, Key, Copy, Check, Calendar, User, Search, FileDown, Trash2, AlertCircle, MessageCircle } from 'lucide-react';
import { generateLicense } from '../lib/security';

// --- CONFIGURAÇÃO DE SEGURANÇA ---
const MASTER_PASSWORD = "admin"; 
// ----------------------------------

interface LicenseHistoryItem {
  name: string;
  email: string;
  key: string;
  days: number;
  generatedAt: number;
}

export const AdminMaster: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  // Form Data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [days, setDays] = useState(365);
  
  // Result Data
  const [generatedKey, setGeneratedKey] = useState('');
  const [copyText, setCopyText] = useState('');
  const [copied, setCopied] = useState(false);

  // History State
  const [history, setHistory] = useState<LicenseHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const savedHistory = localStorage.getItem('admin_license_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveHistory = (newItem: LicenseHistoryItem) => {
    const updated = [newItem, ...history];
    setHistory(updated);
    localStorage.setItem('admin_license_history', JSON.stringify(updated));
  };

  const removeHistoryItem = (keyToRemove: string) => {
    if (confirm('Remover do histórico? (O cliente continuará tendo acesso se a chave for válida, isso limpa apenas sua lista visual).')) {
      const updated = history.filter(item => item.key !== keyToRemove);
      setHistory(updated);
      localStorage.setItem('admin_license_history', JSON.stringify(updated));
    }
  };

  const exportToCSV = () => {
    const headers = "Nome,Email,Chave,Data Geração,Validade (Dias),Expira Em\n";
    const rows = history.map(item => {
      const genDate = new Date(item.generatedAt);
      const expDate = new Date(item.generatedAt + (item.days * 24 * 60 * 60 * 1000));
      return `${item.name},${item.email},${item.key},${genDate.toLocaleDateString()},${item.days},${expDate.toLocaleDateString()}`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `vendas_zapcatalog_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === MASTER_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta');
    }
  };

  const handleGenerate = async () => {
    if (!email.includes('@')) {
      alert("Digite um email válido");
      return;
    }

    const key = await generateLicense(email, days);
    setGeneratedKey(key);
    
    // Save to history
    saveHistory({
      name: name || 'Cliente Sem Nome',
      email,
      key,
      days,
      generatedAt: Date.now()
    });
    
    // Generate Welcome Message
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + days);
    const dateStr = expDate.toLocaleDateString('pt-BR');
    
    // Obter URL base limpa (sem hash)
    const baseUrl = window.location.origin + window.location.pathname;

    const msg = `Olá ${name ? name : ''}!\n\nSeu acesso ao *ZapCatalog* está liberado! 🚀\n\nCrie sua loja virtual agora mesmo:\n\n🔗 *Link de Acesso:* ${baseUrl}\n📧 *Login:* ${email}\n🔑 *Sua Chave:* ${key}\n\n📅 Validade: ${dateStr}\n\nQualquer dúvida, estou à disposição!`;
    
    setCopyText(msg);
    setCopied(false);
    
    // Reset inputs but keep generated result visible
    setName('');
    setEmail('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredHistory = history.filter(item => 
    item.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
        <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-700">
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-500/10 p-4 rounded-full">
              <Shield className="w-12 h-12 text-emerald-500" />
            </div>
          </div>
          <h1 className="text-xl text-center text-white font-bold mb-1">Painel Master</h1>
          <p className="text-slate-400 text-center text-xs mb-6">Gerenciamento de Licenças</p>
          
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Senha de Administrador"
            className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded-xl mb-4 focus:border-emerald-500 outline-none transition-all"
          />
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-900/50 transition-all">
            Acessar Sistema
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 pb-24 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
                <Shield className="text-emerald-500 w-6 h-6" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-white">Administrador</h1>
                <p className="text-xs text-slate-400">Gerador de Acessos</p>
            </div>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="text-sm font-medium text-slate-400 hover:text-white px-4 py-2 hover:bg-slate-800 rounded-lg transition">Sair</button>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: GENERATOR */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
              <h2 className="font-bold text-lg mb-6 flex items-center gap-2 text-white">
                <Key className="text-emerald-500" size={20} /> Nova Venda
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Nome do Cliente</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-500" size={16} />
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: João Silva"
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl pl-10 pr-3 py-3 text-white focus:border-emerald-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">E-mail (Login)</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cliente@email.com"
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white focus:border-emerald-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Plano / Validade</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => setDays(30)} 
                      className={`p-2 rounded-lg border text-xs font-bold transition-all ${days === 30 ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-emerald-500'}`}
                    >
                      Mensal
                    </button>
                    <button 
                      onClick={() => setDays(365)} 
                      className={`p-2 rounded-lg border text-xs font-bold transition-all ${days === 365 ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-emerald-500'}`}
                    >
                      Anual
                    </button>
                    <button 
                      onClick={() => setDays(36500)} 
                      className={`p-2 rounded-lg border text-xs font-bold transition-all ${days === 36500 ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-emerald-500'}`}
                    >
                      Vitalício
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleGenerate}
                  className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
                >
                  Gerar Licença
                </button>
              </div>
            </div>

            {/* Success Card */}
            {generatedKey && (
              <div className="bg-emerald-900/20 p-6 rounded-2xl border border-emerald-500/30 shadow-xl animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Check size={64} />
                </div>
                
                <h3 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2">
                  <Check size={16} /> Licença Gerada com Sucesso!
                </h3>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-emerald-500/20 mb-4">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Chave de Acesso</p>
                  <code className="text-sm font-mono text-emerald-300 break-all select-all">
                    {generatedKey}
                  </code>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Mensagem para WhatsApp</label>
                  </div>
                  <textarea 
                    value={copyText}
                    readOnly
                    rows={8}
                    className="w-full bg-slate-900 text-slate-300 text-xs p-3 rounded-lg border border-slate-700 font-mono focus:outline-none resize-none"
                  />
                </div>

                <button 
                  onClick={copyToClipboard}
                  className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg"
                >
                  {copied ? <Check size={18} /> : <MessageCircle size={18} />}
                  {copied ? 'Copiado!' : 'Copiar Texto'}
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: HISTORY */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
             <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl flex flex-col flex-1 overflow-hidden">
                
                {/* History Toolbar */}
                <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-800/50">
                    <div className="flex items-center gap-2">
                        <User className="text-blue-400" size={20} />
                        <h2 className="font-bold text-white">Clientes ({history.length})</h2>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-48">
                            <input 
                                type="text" 
                                placeholder="Buscar..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white focus:border-blue-500 outline-none"
                            />
                            <Search className="absolute left-2.5 top-2 text-slate-500" size={14} />
                        </div>
                        <button onClick={exportToCSV} className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-white transition flex items-center gap-1" title="Exportar CSV">
                            <FileDown size={16} />
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-900/30">
                  {filteredHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                        <User size={48} className="mb-2 stroke-1" />
                        <p className="text-sm">Nenhum registro encontrado.</p>
                    </div>
                  ) : (
                    filteredHistory.map((item, idx) => {
                      const expirationDate = new Date(item.generatedAt + (item.days * 24 * 60 * 60 * 1000));
                      const isActive = new Date() < expirationDate;
                      const isLifetime = item.days > 30000;

                      return (
                        <div key={idx} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition group relative">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-white text-sm">{item.name}</h3>
                                <p className="text-xs text-slate-400">{item.email}</p>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                              {isActive ? (isLifetime ? 'Vitalício' : 'Ativo') : 'Vencido'}
                            </span>
                          </div>
                          
                          <div className="bg-black/30 p-2 rounded border border-white/5 mb-2">
                             <code className="text-[10px] font-mono text-slate-400 break-all">{item.key}</code>
                          </div>

                          <div className="flex justify-between items-center pt-1">
                            <div className="flex gap-3 text-[10px] text-slate-500 font-medium">
                                <span className="flex items-center gap-1"><Calendar size={10} /> Gerado: {new Date(item.generatedAt).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1"><Calendar size={10} /> Expira: {expirationDate.toLocaleDateString()}</span>
                            </div>
                            
                            <button 
                              onClick={() => removeHistoryItem(item.key)}
                              className="text-slate-600 hover:text-red-400 transition p-1"
                              title="Remover registro"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};