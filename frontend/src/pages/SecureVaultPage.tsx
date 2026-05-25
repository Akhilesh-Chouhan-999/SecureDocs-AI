import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { useAppStore } from '../store/appStore';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { mockAccessLogs } from '../data/mockDb';
import { ROUTES } from '../constants/routes';
import { UIDocument } from '../types';
import toast from 'react-hot-toast';

export default function SecureVaultPage() {
  const navigate = useNavigate();
  const { vaultDocuments, deleteDocument, isLockdown } = useAppStore();
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  
  // Modal states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Access Logs drawer state
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  const handleDeleteClick = (id: string) => {
    setSelectedDocId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedDocId) {
      deleteDocument(selectedDocId);
      setIsConfirmOpen(false);
      setSelectedDocId(null);
      toast.success('Secure asset permanently expunged.');
    }
  };

  const handleDownloadFile = (docName: string) => {
    if (isLockdown) {
      toast.error('ACCESS DENIED: Downloads blocked during Lockdown.', {
        icon: '🚫'
      });
      return;
    }
    
    const loadingToast = toast.loading(`Decrypting ${docName} and transferring bytes...`);
    
    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success(`Download complete: ${docName}`);
    }, 2000);
  };

  // Filter documents dynamically
  const filteredDocs = vaultDocuments.filter((doc: UIDocument) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (riskFilter === 'All') return matchesSearch;
    if (riskFilter === 'Critical') return matchesSearch && doc.riskScore > 75;
    if (riskFilter === 'Elevated') return matchesSearch && doc.riskScore > 40 && doc.riskScore <= 75;
    if (riskFilter === 'Nominal') return matchesSearch && doc.riskScore <= 40;
    
    return matchesSearch;
  });

  const anomaliesCount = vaultDocuments.filter(d => d.riskScore > 70).length;
  const totalCapacityUsed = Math.min(100, Math.round((vaultDocuments.reduce((acc, d) => acc + parseFloat(d.size), 0) / 50) * 100));

  return (
    <div className="pb-safe animate-fade-in relative">
      {/* Access Logs Sidebar Drawer */}
      <div className={`fixed right-0 top-0 h-screen w-full sm:w-[450px] bg-surface-container-low border-l border-white/10 z-50 p-lg shadow-2xl transition-transform duration-300 transform ${
        isLogsOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex justify-between items-center mb-lg border-b border-white/5 pb-md">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">history</span>
            <h3 className="font-headline-md text-headline-md text-on-surface">Vault Audit Logs</h3>
          </div>
          <button 
            onClick={() => setIsLogsOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 text-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="space-y-md overflow-y-auto h-[calc(100vh-120px)] pr-xs">
          {mockAccessLogs.map((log) => (
            <div key={log.id} className="p-md rounded-xl bg-surface-container border border-white/5 space-y-xs">
              <div className="flex justify-between items-center text-xs">
                <span className="text-label-mono font-label-mono text-outline">{log.ip}</span>
                <span className={`text-[9px] font-label-mono uppercase px-2 py-0.5 rounded border ${
                  log.status === 'allowed' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-error/10 border-error/20 text-error'
                }`}>
                  {log.status === 'allowed' ? 'AUTHORIZED' : 'BLOCKED'}
                </span>
              </div>
              <p className="text-body-md font-semibold text-on-surface">{log.event}</p>
              <div className="flex justify-between items-center text-[10px] text-on-surface-variant/60 font-label-mono">
                <span>{log.location}</span>
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={handleConfirmDelete} 
        title="Expunge Secure Asset" 
        message="Are you absolutely sure you want to permanently delete this document from the decentralized vault? This action cannot be undone."
      />

      <div className="mb-xl flex flex-col md:flex-row md:items-end justify-between gap-lg">
        <div>
          <div className="flex items-center gap-base text-primary mb-xs">
            <span className="material-symbols-outlined text-sm">enhanced_encryption</span>
            <span className="font-label-mono text-label-mono tracking-widest text-[10px]">AES-256 ENCRYPTED</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg md:text-display-lg text-on-surface">Secure Vault</h1>
          <p className="text-on-surface-variant font-body-md text-body-md mt-xs max-w-[512px]">Advanced biometric storage for sensitive financial entities and corporate documentation.</p>
        </div>
        <div className="flex flex-col gap-sm w-full md:w-auto">
          <div className="flex items-center justify-between text-label-mono font-label-mono text-on-surface-variant px-xs text-[10px]">
            <span>CAPACITY</span>
            <span className="text-primary">{totalCapacityUsed}% USED</span>
          </div>
          <div className="w-full md:w-64 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${totalCapacityUsed}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-md mb-lg">
        <div className="md:col-span-8 relative">
          <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">search</span>
          <input 
            className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-md pl-12 pr-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-body-md text-body-md placeholder:text-on-surface-variant/30" 
            placeholder="Search encrypted identifiers..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="md:col-span-4 flex gap-md">
          <div className="relative flex-1">
            <select 
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full appearance-none bg-surface-container-low border border-outline-variant rounded-xl py-md px-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary transition-all font-body-md text-body-md pr-10 cursor-pointer"
            >
              <option value="All">Risk Level: All</option>
              <option value="Critical">Critical (&gt;75)</option>
              <option value="Elevated">Elevated (41-75)</option>
              <option value="Nominal">Nominal (&le;40)</option>
            </select>
            <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
          </div>
          <button onClick={() => setSearchQuery('')} className="bg-surface-container-high border border-outline-variant p-md rounded-xl hover:bg-surface-bright transition-colors cursor-pointer text-on-surface">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Sidebar panels */}
        <aside className="hidden md:block md:col-span-3 space-y-lg">
          <GlassCard className="rounded-xl p-lg relative overflow-hidden">
            <div className="absolute w-32 h-32 bg-primary/20 rounded-full blur-[50px] -top-10 -left-10 pointer-events-none"></div>
            <h3 className="font-label-mono text-label-mono text-outline mb-md uppercase tracking-tighter text-xs">AI Health Monitor</h3>
            <div className="space-y-md">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant text-[13px]">System Integrity</span>
                <span className="text-primary font-label-mono text-xs font-bold">100%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant text-[13px]">Anomalies Locked</span>
                <span className="text-secondary font-label-mono text-xs font-bold">{anomaliesCount}</span>
              </div>
              <div className="pt-sm border-t border-white/5">
                <p className="text-[9px] font-label-mono text-outline leading-tight uppercase">Active Protocol: OB_CIPHER_V4.1</p>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="rounded-xl p-lg">
            <h3 className="font-label-mono text-label-mono text-outline mb-md uppercase tracking-tighter text-xs">Quick Actions</h3>
            <div className="space-y-sm">
              <button 
                onClick={() => navigate(ROUTES.DOCUMENTS)} 
                className="w-full flex items-center gap-md p-md bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-all active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-md">add_circle</span>
                <span className="font-label-mono text-label-mono text-xs">NEW UPLOAD</span>
              </button>
              <button 
                onClick={() => setIsLogsOpen(true)}
                className="w-full flex items-center gap-md p-md hover:bg-white/5 text-on-surface-variant border border-transparent rounded-lg transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-md">history</span>
                <span className="font-label-mono text-label-mono text-xs">ACCESS LOGS</span>
              </button>
            </div>
          </GlassCard>
        </aside>

        {/* Document Cards List */}
        <div className="md:col-span-9 space-y-md">
          {filteredDocs.map((doc) => (
            <GlassCard 
              key={doc.id}
              className={`p-md flex flex-col md:flex-row items-start md:items-center gap-lg hover:border-primary/40 transition-all group border-l-2 ${
                doc.riskScore > 75 ? 'border-l-error' : doc.riskScore > 40 ? 'border-l-secondary' : 'border-l-primary'
              }`}
            >
              <div className={`w-12 h-12 rounded flex items-center justify-center group-hover:scale-110 transition-transform ${
                doc.riskScore > 75 ? 'bg-error-container/20 text-error' : 'bg-surface-container-highest text-primary'
              }`}>
                <span className="material-symbols-outlined">
                  {doc.riskScore > 75 ? 'warning' : 'description'}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-headline-md text-body-md text-on-surface truncate font-semibold">{doc.name}</h4>
                <div className="flex flex-wrap gap-md mt-xs text-xs">
                  <span className="text-label-mono font-label-mono text-outline flex items-center gap-xs">
                    <span className="material-symbols-outlined text-xs">timer</span> 
                    {new Date(doc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-label-mono font-label-mono text-outline flex items-center gap-xs">
                    <span className="material-symbols-outlined text-xs">database</span> {doc.size}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-xl w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                  <div className={`text-label-mono font-label-mono text-xs flex items-center justify-end gap-xs font-bold uppercase ${
                    doc.riskScore > 75 ? 'text-error' : doc.riskScore > 40 ? 'text-secondary' : 'text-primary'
                  }`}>
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {doc.riskScore > 75 ? 'gpp_maybe' : 'verified_user'}
                    </span>
                    {doc.status}
                  </div>
                  <div className="text-[9px] font-label-mono text-outline uppercase mt-0.5">
                    {doc.riskScore > 75 ? 'QUARANTINED HASH' : 'SCANNED SAFE'}
                  </div>
                </div>
                
                <div className="flex gap-sm">
                  <button 
                    onClick={() => handleDownloadFile(doc.name)}
                    className="p-sm text-outline hover:text-on-surface cursor-pointer rounded hover:bg-white/5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-md">download</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(doc.id)}
                    className="p-sm text-outline hover:text-error cursor-pointer rounded hover:bg-white/5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-md">delete</span>
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}

          {filteredDocs.length === 0 && (
            <GlassCard className="p-xl text-center text-on-surface-variant text-body-md border-dashed border-2 bg-transparent">
              <span className="material-symbols-outlined text-4xl text-outline mb-md">inventory_2</span>
              <p>No secure assets match your search parameters.</p>
            </GlassCard>
          )}

          {/* Pagination / Fetch more */}
          {filteredDocs.length > 0 && (
            <div className="flex justify-center py-xl">
              <button 
                onClick={() => toast('Fetching additional historical logs...', { icon: '🔄' })}
                className="px-xl py-md border border-outline-variant rounded-full text-on-surface-variant text-label-mono font-label-mono hover:bg-white/5 transition-all cursor-pointer hover:text-on-surface text-xs"
              >
                FETCH MORE RECORDS
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
