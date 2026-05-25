import { useEffect, useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { RiskIndicator } from '../components/ui/RiskIndicator';
import { AINeuralInsight } from '../components/ui/AINeuralInsight';
import { useAppStore } from '../store/appStore';
import { AlertFeed } from '../components/dashboard/AlertFeed';
import { RecentDocumentsTable } from '../components/dashboard/RecentDocumentsTable';
import { RiskChart } from '../components/charts/RiskChart';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { alerts, vaultDocuments, isLockdown, toggleLockdown } = useAppStore();
  const [confidence, setConfidence] = useState(99.8);

  useEffect(() => {
    const interval = setInterval(() => {
      setConfidence(parseFloat((99.7 + Math.random() * 0.2).toFixed(1)));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLockdown = () => {
    toggleLockdown();
    if (!isLockdown) {
      toast.error('LOCKDOWN INITIATED - ALL NODES LOCKED', {
        icon: '⚠️',
        duration: 4000,
        style: {
          background: '#93000a',
          color: '#ffdad6',
          border: '1px solid #ffb4ab'
        }
      });
    } else {
      toast.success('Lockdown lifted. Systems returned to normal.', {
        icon: '🛡️',
        duration: 3000
      });
    }
  };

  const handleDeepForensics = () => {
    toast.loading('Initializing deep neural forensics scan...', { duration: 2000 });
    setTimeout(() => {
      toast.success('Forensic scan complete. No new vulnerabilities found.');
    }, 2000);
  };

  // Dynamically calculate metrics
  const anomaliesCount = vaultDocuments.filter(d => d.riskScore > 70).length;
  const totalAnalyzed = 1284092 + vaultDocuments.length;
  const globalRiskScore = isLockdown ? 100 : Math.round(
    vaultDocuments.reduce((acc, d) => acc + d.riskScore, 0) / (vaultDocuments.length || 1)
  );

  return (
    <div className="space-y-lg pb-safe">
      {isLockdown && (
        <div className="bg-error-container/20 text-error p-md rounded-xl border border-error-container flex items-center gap-md animate-pulse">
          <span className="material-symbols-outlined">warning</span>
          <div className="flex-1 text-sm">
            <span className="font-bold">LOCKDOWN PROTOCOL ACTIVE:</span> All vault document downloads are frozen. Cryptographic node handshake required.
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <div className="md:col-span-4 glass-card p-lg rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-tertiary-container/50 transition-colors">
          <div className="absolute inset-0 shimmer opacity-50 pointer-events-none"></div>
          <h3 className="text-label-mono font-label-mono text-on-surface-variant mb-lg uppercase tracking-widest">Global Risk Index</h3>
          <RiskIndicator 
            score={globalRiskScore} 
            label={isLockdown ? "LOCKED" : globalRiskScore > 70 ? "CRITICAL" : globalRiskScore > 40 ? "ELEVATED" : "SECURE"} 
            className="mb-md" 
          />
          <p className="text-body-sm font-body-sm text-on-surface-variant">
            {isLockdown ? 'Emergency lockdown active.' : 'Elevated risk detected in Q3 batch processing.'}
          </p>
        </div>
        
        <AINeuralInsight className="md:col-span-8 justify-between h-full">
          <div>
            <p className="text-body-lg font-body-lg text-on-surface leading-relaxed max-w-2xl">
              "Unusual metadata alignment detected in <span className="text-primary font-bold">Document #8821-X</span>. The cryptographic signature matches a known forensic fingerprint associated with recent invoice-padding fraud patterns in the EMEA region."
            </p>
          </div>
          <div className="mt-lg flex flex-wrap gap-md">
            <button 
              onClick={handleLockdown}
              className={`px-lg py-sm rounded-full font-label-mono text-label-mono hover:scale-95 transition-transform cursor-pointer shadow-lg ${
                isLockdown 
                  ? 'bg-secondary text-on-secondary shadow-secondary/20' 
                  : 'bg-primary text-on-primary shadow-primary/20'
              }`}
            >
              {isLockdown ? 'LIFT LOCKDOWN' : 'INITIALIZE LOCKDOWN'}
            </button>
            <button 
              onClick={handleDeepForensics}
              className="border border-outline-variant px-lg py-sm rounded-full text-on-surface font-label-mono text-label-mono hover:bg-surface-container-highest transition-colors cursor-pointer"
            >
              DEEP FORENSICS
            </button>
          </div>
        </AINeuralInsight>
      </section>

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-gutter">
        <GlassCard className="p-lg">
          <div className="flex justify-between items-start mb-md">
            <span className="material-symbols-outlined text-on-surface-variant">description</span>
            <span className="text-xs text-green-400 font-label-mono">+12.4%</span>
          </div>
          <p className="text-label-mono font-label-mono text-on-surface-variant uppercase mb-xs">Total Analyzed</p>
          <h4 className="text-headline-lg font-headline-lg">{totalAnalyzed.toLocaleString()}</h4>
        </GlassCard>
        
        <GlassCard className="p-lg border-tertiary-container/30">
          <div className="flex justify-between items-start mb-md">
            <span className="material-symbols-outlined text-tertiary-container">warning</span>
            <span className="text-xs text-tertiary-container font-label-mono">HIGH PRIORITY</span>
          </div>
          <p className="text-label-mono font-label-mono text-on-surface-variant uppercase mb-xs">Anomalies Detected</p>
          <h4 className="text-headline-lg font-headline-lg text-tertiary-container">{anomaliesCount}</h4>
        </GlassCard>
        
        <GlassCard className="p-lg">
          <div className="flex justify-between items-start mb-md">
            <span className="material-symbols-outlined text-secondary">memory</span>
            <span className="text-xs text-secondary font-label-mono">OPTIMAL</span>
          </div>
          <p className="text-label-mono font-label-mono text-on-surface-variant uppercase mb-xs">AI Confidence</p>
          <h4 className="text-headline-lg font-headline-lg text-secondary">{confidence}%</h4>
        </GlassCard>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <GlassCard className="md:col-span-8 p-lg overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-lg">
            <h3 className="text-headline-md font-headline-md">Fraud Risk Trends</h3>
            <div className="flex gap-sm">
              <span className="w-3 h-3 bg-primary rounded-full"></span>
              <span className="w-3 h-3 bg-secondary rounded-full"></span>
            </div>
          </div>
          <RiskChart className="h-64 flex-1" />
        </GlassCard>

        <GlassCard className="md:col-span-4 flex flex-col h-full overflow-hidden">
          <div className="p-lg border-b border-outline-variant flex items-center justify-between">
            <h3 className="text-headline-md font-headline-md">Alert Feed</h3>
            <span className="text-label-mono font-label-mono text-tertiary-container px-sm py-1 bg-tertiary-container/10 rounded">LIVE</span>
          </div>
          <AlertFeed alerts={alerts} />
        </GlassCard>
      </section>

      <section>
        <RecentDocumentsTable documents={vaultDocuments.slice(0, 4)} />
      </section>
    </div>
  );
}
