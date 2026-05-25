
import { GlassCard } from '../components/ui/GlassCard';

export default function SecureVaultPage() {
  return (
    <div className="pb-safe animate-fade-in">
      <div className="mb-xl flex flex-col md:flex-row md:items-end justify-between gap-lg">
        <div>
          <div className="flex items-center gap-base text-primary mb-xs">
            <span className="material-symbols-outlined text-sm">enhanced_encryption</span>
            <span className="font-label-mono text-label-mono tracking-widest">AES-256 ENCRYPTED</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg md:text-display-lg text-on-surface">Secure Vault</h1>
          <p className="text-on-surface-variant font-body-md text-body-md mt-xs max-w-lg">Advanced biometric storage for sensitive financial entities and corporate documentation.</p>
        </div>
        <div className="flex flex-col gap-sm w-full md:w-auto">
          <div className="flex items-center justify-between text-label-mono font-label-mono text-on-surface-variant px-xs">
            <span>CAPACITY</span>
            <span className="text-primary">64% USED</span>
          </div>
          <div className="w-full md:w-64 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: '64%' }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-md mb-lg">
        <div className="md:col-span-8 relative">
          <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">search</span>
          <input className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-md pl-12 pr-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-body-md text-body-md" placeholder="Search encrypted identifiers..." type="text"/>
        </div>
        <div className="md:col-span-4 flex gap-md">
          <div className="relative flex-1">
            <select className="w-full appearance-none bg-surface-container-low border border-outline-variant rounded-xl py-md px-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary transition-all font-body-md text-body-md">
              <option>Risk Level: All</option>
              <option>Critical</option>
              <option>Elevated</option>
              <option>Nominal</option>
            </select>
            <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
          </div>
          <button className="bg-surface-container-high border border-outline-variant p-md rounded-xl hover:bg-surface-bright transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-on-surface">tune</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <aside className="hidden md:block md:col-span-3 space-y-lg">
          <GlassCard className="rounded-xl p-lg relative overflow-hidden">
            <div className="absolute w-32 h-32 bg-primary/20 rounded-full blur-[50px] -top-10 -left-10 pointer-events-none"></div>
            <h3 className="font-label-mono text-label-mono text-outline mb-md uppercase tracking-tighter">AI Health Monitor</h3>
            <div className="space-y-md">
              <div className="flex justify-between items-center">
                <span className="text-body-sm font-body-sm text-on-surface-variant">System Integrity</span>
                <span className="text-primary font-label-mono text-label-mono">100%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-sm font-body-sm text-on-surface-variant">Threat Neutralized</span>
                <span className="text-secondary font-label-mono text-label-mono">24h / 0</span>
              </div>
              <div className="pt-sm border-t border-white/5">
                <p className="text-[10px] font-label-mono text-outline leading-tight">ACTIVE PROTOCOL: OB_CIPHER_V4.1</p>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="rounded-xl p-lg">
            <h3 className="font-label-mono text-label-mono text-outline mb-md uppercase tracking-tighter">Quick Actions</h3>
            <div className="space-y-sm">
              <button className="w-full flex items-center gap-md p-md bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-all active:scale-95 cursor-pointer">
                <span className="material-symbols-outlined text-md">add_circle</span>
                <span className="font-label-mono text-label-mono">NEW UPLOAD</span>
              </button>
              <button className="w-full flex items-center gap-md p-md hover:bg-white/5 text-on-surface-variant border border-transparent rounded-lg transition-all cursor-pointer">
                <span className="material-symbols-outlined text-md">history</span>
                <span className="font-label-mono text-label-mono">ACCESS LOGS</span>
              </button>
            </div>
          </GlassCard>
        </aside>

        <div className="md:col-span-9 space-y-md">
          <GlassCard className="p-md flex flex-col md:flex-row items-start md:items-center gap-lg hover:border-primary/40 transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded bg-surface-container-highest flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">description</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-headline-md text-body-md text-on-surface truncate">Q3_Revenue_Forecast_Encrypted.pdf</h4>
              <div className="flex flex-wrap gap-md mt-xs">
                <span className="text-label-mono font-label-mono text-outline flex items-center gap-xs">
                  <span className="material-symbols-outlined text-xs">timer</span> 2m ago
                </span>
                <span className="text-label-mono font-label-mono text-outline flex items-center gap-xs">
                  <span className="material-symbols-outlined text-xs">database</span> 1.2 MB
                </span>
              </div>
            </div>
            <div className="flex items-center gap-xl w-full md:w-auto justify-between md:justify-end">
              <div className="text-right">
                <div className="text-label-mono font-label-mono text-primary flex items-center justify-end gap-xs">
                  <span className="material-symbols-outlined text-xs">verified_user</span>
                  CLEAN
                </div>
                <div className="text-[10px] font-label-mono text-outline uppercase">NO THREATS FOUND</div>
              </div>
              <div className="flex gap-sm">
                <button className="p-sm text-outline hover:text-on-surface cursor-pointer"><span className="material-symbols-outlined">download</span></button>
                <button className="p-sm text-outline hover:text-error cursor-pointer"><span className="material-symbols-outlined">delete</span></button>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-md flex flex-col md:flex-row items-start md:items-center gap-lg hover:border-error/40 transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded bg-error/20 flex items-center justify-center text-error group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-headline-md text-body-md text-on-surface truncate">Unknown_Signature_Block_AX.bin</h4>
              <div className="flex flex-wrap gap-md mt-xs">
                <span className="text-label-mono font-label-mono text-outline flex items-center gap-xs">
                  <span className="material-symbols-outlined text-xs">timer</span> 14h ago
                </span>
                <span className="text-label-mono font-label-mono text-outline flex items-center gap-xs">
                  <span className="material-symbols-outlined text-xs">database</span> 450 KB
                </span>
              </div>
            </div>
            <div className="flex items-center gap-xl w-full md:w-auto justify-between md:justify-end">
              <div className="text-right">
                <div className="text-label-mono font-label-mono text-error flex items-center justify-end gap-xs">
                  <span className="material-symbols-outlined text-xs">gpp_maybe</span>
                  QUARANTINED
                </div>
                <div className="text-[10px] font-label-mono text-outline uppercase">SUSPICIOUS HASH</div>
              </div>
              <div className="flex gap-sm">
                <button className="p-sm text-outline hover:text-on-surface cursor-pointer"><span className="material-symbols-outlined">visibility</span></button>
                <button className="p-sm text-outline hover:text-error cursor-pointer"><span className="material-symbols-outlined">delete</span></button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
