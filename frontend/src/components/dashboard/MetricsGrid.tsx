import { GlassCard } from '../ui/GlassCard';

export function MetricsGrid({ confidence }: { confidence: number }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-gutter">
      <GlassCard className="p-lg">
        <div className="flex justify-between items-start mb-md">
          <span className="material-symbols-outlined text-on-surface-variant">description</span>
          <span className="text-xs text-green-400 font-label-mono">+12.4%</span>
        </div>
        <p className="text-label-mono font-label-mono text-on-surface-variant uppercase mb-xs">Total Analyzed</p>
        <h4 className="text-headline-lg font-headline-lg">1,284,092</h4>
      </GlassCard>
      
      <GlassCard className="p-lg border-tertiary-container/30">
        <div className="flex justify-between items-start mb-md">
          <span className="material-symbols-outlined text-tertiary-container">warning</span>
          <span className="text-xs text-tertiary-container font-label-mono">HIGH PRIORITY</span>
        </div>
        <p className="text-label-mono font-label-mono text-on-surface-variant uppercase mb-xs">Anomalies Detected</p>
        <h4 className="text-headline-lg font-headline-lg text-tertiary-container">42</h4>
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
  );
}
