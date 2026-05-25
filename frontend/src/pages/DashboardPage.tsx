import { useEffect, useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { RiskIndicator } from '../components/ui/RiskIndicator';
import { AINeuralInsight } from '../components/ui/AINeuralInsight';
import { useAppStore } from '../store/appStore';
import { UIDocument } from '../types';
import { MetricsGrid } from '../components/dashboard/MetricsGrid';
import { AlertFeed } from '../components/dashboard/AlertFeed';
import { RecentDocumentsTable } from '../components/dashboard/RecentDocumentsTable';

const mockRecentDocuments: UIDocument[] = [
  { id: '1', name: 'Invoice_4521.pdf', type: 'Invoice', riskScore: 89, status: 'High Risk', timestamp: new Date(Date.now() - 7200000), size: '1.2 MB' },
  { id: '2', name: 'Contract_Q1_2024.pdf', type: 'Contract', riskScore: 45, status: 'Medium', timestamp: new Date(Date.now() - 18000000), size: '4.5 MB' },
  { id: '3', name: 'Property_Title_789.pdf', type: 'Title', riskScore: 72, status: 'High Risk', timestamp: new Date(Date.now() - 86400000), size: '8.1 MB' },
  { id: '4', name: 'Bank_Statement_March.pdf', type: 'Statement', riskScore: 23, status: 'Low Risk', timestamp: new Date(Date.now() - 172800000), size: '2.3 MB' },
];

export default function DashboardPage() {
  const alerts = useAppStore(state => state.alerts);
  const [confidence, setConfidence] = useState(99.8);

  useEffect(() => {
    const interval = setInterval(() => {
      setConfidence(parseFloat((99.7 + Math.random() * 0.2).toFixed(1)));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-lg pb-safe">
      <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <div className="md:col-span-4 glass-card p-lg rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-tertiary-container/50 transition-colors">
          <div className="absolute inset-0 shimmer opacity-50 pointer-events-none"></div>
          <h3 className="text-label-mono font-label-mono text-on-surface-variant mb-lg uppercase tracking-widest">Global Risk Index</h3>
          <RiskIndicator score={78} label="CRITICAL" className="mb-md" />
          <p className="text-body-sm font-body-sm text-on-surface-variant">Elevated risk detected in Q3 batch processing.</p>
        </div>
        
        <AINeuralInsight className="md:col-span-8 justify-between h-full">
          <div>
            <p className="text-body-lg font-body-lg text-on-surface leading-relaxed max-w-2xl">
              "Unusual metadata alignment detected in <span className="text-primary font-bold">Document #8821-X</span>. The cryptographic signature matches a known forensic fingerprint associated with recent invoice-padding fraud patterns in the EMEA region."
            </p>
          </div>
          <div className="mt-lg flex flex-wrap gap-md">
            <button className="bg-primary px-lg py-sm rounded-full text-on-primary font-label-mono text-label-mono hover:scale-95 transition-transform cursor-pointer shadow-lg shadow-primary/20">
              INITIALIZE LOCKDOWN
            </button>
            <button className="border border-outline-variant px-lg py-sm rounded-full text-on-surface font-label-mono text-label-mono hover:bg-surface-container-highest transition-colors cursor-pointer">
              DEEP FORENSICS
            </button>
          </div>
        </AINeuralInsight>
      </section>

      <MetricsGrid confidence={confidence} />

      <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <GlassCard className="md:col-span-8 p-lg overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-lg">
            <h3 className="text-headline-md font-headline-md">Fraud Risk Trends</h3>
            <div className="flex gap-sm">
              <span className="w-3 h-3 bg-primary rounded-full"></span>
              <span className="w-3 h-3 bg-secondary rounded-full"></span>
            </div>
          </div>
          <div className="h-64 w-full relative flex-1">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 200">
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3"></stop>
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0"></stop>
                </linearGradient>
              </defs>
              <path d="M0,180 Q100,120 200,150 T400,80 T600,100 T800,40 T1000,60 L1000,200 L0,200 Z" fill="url(#chartGradient)"></path>
              <path d="M0,180 Q100,120 200,150 T400,80 T600,100 T800,40 T1000,60" fill="none" stroke="var(--color-primary)" strokeWidth="2"></path>
              <circle cx="200" cy="150" fill="var(--color-primary)" r="4"></circle>
              <circle cx="800" cy="40" fill="var(--color-primary)" r="4"></circle>
            </svg>
            <div className="absolute inset-0 flex justify-between items-end text-label-mono text-[10px] text-on-surface-variant/50 px-sm pb-1">
              <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
            </div>
          </div>
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
        <RecentDocumentsTable documents={mockRecentDocuments} />
      </section>
    </div>
  );
}
