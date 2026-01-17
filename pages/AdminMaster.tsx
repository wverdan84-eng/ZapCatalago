import React, { useState, useEffect } from 'react';
import { Shield, Key, Copy, Check, Calendar, User, Search, FileDown, Trash2, AlertCircle } from 'lucide-react';
import { generateLicense } from '../lib/security';

const MASTER_PASSWORD = "admin"; 

interface LicenseHistoryItem {
  email: string;
  key: string;
  days: number;
  generatedAt: number; // Timestamp
}

export const AdminMaster: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  const [email, setEmail] = useState('');
  const [days, setDays] = useState(365);
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
    if (confirm('Isso remove apenas do seu histórico, não bloqueia o acesso do usuário (pois o app é offline). Deseja remover?')) {
      const updated = history.filter(item => item.key !== keyToRemove);
      setHistory(updated);
      localStorage.setItem('admin_license_history', JSON.stringify(updated));
    }
  };

  const exportToCSV = () => {
    const headers = "Email,Chave,Data Geração,Validade (Dias),Status,Expira Em\n";
    const rows = history.map(item => {
      const genDate = new Date(item.generatedAt);
      const expDate = new Date(item.generatedAt + (item.days * 24 * 60 * 60 * 1000));
      const now = new Date();
      const isActive = now < expDate;
      
      return `${item.email},${item.key},${genDate.toLocaleDateString()},${item.days},${isActive ? 'ATIVO' : 'VENCIDO'},${expDate.toLocaleDateString()}`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `clientes_zapcatalog_${new Date().toLocaleDateString()}.csv`;
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
    if (!email || !email.includes('@')) {
      alert("Digite um email válido");
      return;
    }

    const key = await generateLicense(email, days);
    setGeneratedKey(key);
    
    // Save to history
    saveHistory({
      email,
      key,
      days,
      generatedAt: Date.now()
    });
    
    // Formatar data de expiração para exibir
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + days);
    const dateStr = expDate.toLocaleDateString('pt-BR');

    const msg = `Olá!\n\nSeu acesso ao ZapCatalog foi liberado.\n\n📧 Login: ${email}\n🔑 Chave: ${key}\n📅 Validade: ${dateStr}\n\nAcesse agora: ${window.location.origin}`;
    setCopyText(msg);
    setCopied(false);
    setEmail(''); // Clear email after generating
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredHistory = history.filter(item => 
    item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="min-h-screen bg-slate-900 text-white p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8 border-b border-gray-700 pb-4">
          <div className="flex items-center gap-3">
            <Shield className="text-emerald-500" />
            <h1 className="text-xl font-bold">Gerenciador de Licenças</h1>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="text-sm text-slate-400 hover:text-white">Sair</button>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Generator Section */}
          <div className="space-y-6">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-emerald-400">
                <Key size={20} /> Nova Licença
              </h2>
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
                    <Calendar size={14} /> Validade
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => setDays(30)} 
                      className={`p-2 rounded border text-sm ${days === 30 ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-900 border-slate-600 hover:border-emerald-500'}`}
                    >
                      30 Dias
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

          {/* History Section */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl flex flex-col h-full max-h-[800px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg flex items-center gap-2 text-blue-400">
                <User size={20} /> Usuários ({history.length})
              </h2>
              <button onClick={exportToCSV} className="text-xs flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-white transition">
                <FileDown size={14} /> Exportar
              </button>
            </div>

            <div className="relative mb-4">
              <input 
                type="text" 
                placeholder="Buscar cliente..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
              />
              <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
            </div>

            <div className="overflow-y-auto flex-1 pr-2 space-y-2 custom-scrollbar">
              {filteredHistory.length === 0 ? (
                <div className="text-center text-slate-500 py-10 text-sm">
                  Nenhum registro encontrado.
                </div>
              ) : (
                filteredHistory.map((item, idx) => {
                  const expirationDate = new Date(item.generatedAt + (item.days * 24 * 60 * 60 * 1000));
                  const isActive = new Date() < expirationDate;

                  return (
                    <div key={idx} className="bg-slate-900 p-3 rounded-lg border border-slate-700 hover:border-slate-600 transition group">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm text-white truncate max-w-[180px]" title={item.email}>{item.email}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${isActive ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
                          {isActive ? 'Ativo' : 'Vencido'}
                        </span>
                      </div>
                      <div className="flex justify-between items-end text-xs text-slate-500">
                        <div>
                          <p>Gerado: {new Date(item.generatedAt).toLocaleDateString()}</p>
                          <p>Expira: {expirationDate.toLocaleDateString()}</p>
                        </div>
                        <button 
                          onClick={() => removeHistoryItem(item.key)}
                          className="text-slate-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition"
                          title="Remover do histórico"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-800">
                        <code className="text-[10px] font-mono text-slate-400 break-all select-all block cursor-pointer hover:text-slate-200">
                          {item.key}
                        </code>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-700 text-[10px] text-slate-500 flex gap-2 items-start">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <p>Este histórico é salvo localmente neste navegador. Se você limpar o cache, perderá esta lista (mas as chaves dos clientes continuarão funcionando).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};