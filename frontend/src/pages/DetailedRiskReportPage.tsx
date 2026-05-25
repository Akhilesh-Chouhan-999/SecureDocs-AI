import { GlassCard } from '../components/ui/GlassCard';
import { useAppStore } from '../store/appStore';
import toast from 'react-hot-toast';

export default function DetailedRiskReportPage() {
  const { vaultDocuments } = useAppStore();

  // Pick the latest document or fall back to Corp_Asset_Transfer_0924.pdf
  const activeDoc = vaultDocuments[0] || {
    name: 'Corp_Asset_Transfer_0924.pdf',
    riskScore: 94,
    size: '5.6 MB'
  };

  const handleDownloadReport = () => {
    const loadingToast = toast.loading('Compiling cryptographic forensic report...');
    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success('Forensic PDF report downloaded successfully.');
    }, 2000);
  };

  return (
    <div className="pb-safe animate-fade-in space-y-lg">
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <GlassCard className="lg:col-span-2 p-lg rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-md">
            <div className="flex items-center gap-sm bg-error-container/20 text-tertiary px-md py-xs rounded-full border border-tertiary-container/30">
              <span className="material-symbols-outlined text-sm animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
              <span className="text-label-mono font-label-mono uppercase tracking-widest text-[10px]">High Risk Alert</span>
            </div>
          </div>
          <h2 className="text-headline-md font-headline-md mb-md text-on-surface">AI Analysis Summary</h2>
          <p className="text-on-surface-variant text-body-md max-w-2xl">
            The document <span className="text-on-surface font-semibold">"{activeDoc.name}"</span> shows significant structural anomalies in the signature block and metadata headers. Discrepancies between OCR layer 2 and the visual bitmap suggest potential font-substitution forgery.
          </p>
          <div className="mt-lg flex flex-wrap gap-md">
            <div className="px-md py-sm rounded-lg bg-surface-container-high border border-outline-variant flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">fingerprint</span>
              <span className="text-label-mono font-label-mono text-xs">Hash: 8f2a...c9e1</span>
            </div>
            <div className="px-md py-sm rounded-lg bg-surface-container-high border border-outline-variant flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">history</span>
              <span className="text-label-mono font-label-mono text-xs">Processed: 2 mins ago</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-lg rounded-xl flex flex-col items-center justify-center text-center border-primary/20">
          <div className="relative w-32 h-32 mb-md">
            <svg className="w-full h-full transform -rotate-90">
              <circle className="text-surface-container-highest" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
              <circle className="text-primary transition-all duration-1000 ease-out" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364.4" strokeDashoffset="21.8" strokeWidth="8"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-headline-lg font-headline-lg text-on-surface">{activeDoc.riskScore}%</span>
              <span className="text-[10px] uppercase font-label-mono text-outline">Confidence</span>
            </div>
          </div>
          <h3 className="text-body-lg font-headline-md text-on-surface">Integrity Score</h3>
          <p className="text-label-mono font-label-mono text-tertiary mt-2">Anomaly Detected</p>
        </GlassCard>
      </section>

      {/* Document Overlay Mapping */}
      <section className="glass-card rounded-xl overflow-hidden border-outline-variant/30">
        <div className="flex items-center justify-between p-md border-b border-white/5 bg-surface-container-low">
          <div className="flex gap-md items-center">
            <span className="material-symbols-outlined text-on-surface">description</span>
            <h2 className="text-label-mono font-label-mono uppercase tracking-widest text-on-surface text-xs">Document Mapping Overlay</h2>
          </div>
          <div className="flex gap-sm">
            <button className="p-base rounded hover:bg-white/10 transition-colors text-on-surface cursor-pointer">
              <span className="material-symbols-outlined text-sm">zoom_in</span>
            </button>
            <button className="p-base rounded hover:bg-white/10 transition-colors text-on-surface cursor-pointer">
              <span className="material-symbols-outlined text-sm">layers</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 h-[500px]">
          <div className="bg-surface-container p-lg overflow-auto border-r border-white/5 relative group">
            <div className="bg-white text-black p-xl shadow-2xl min-h-[600px] relative">
              <h4 className="font-serif text-xl border-b border-black/10 pb-base mb-lg">Asset Transfer Deed</h4>
              <div className="space-y-md text-sm leading-relaxed">
                <p>This agreement is entered into this 14th day of September...</p>
                <p>Section 4.2: The Transferor agrees to remit the sum of <span className="bg-error/30 border border-error p-0.5 rounded-sm relative group/tooltip cursor-help font-bold">$4,250,000.00
                  <span className="hidden group-hover/tooltip:block absolute -top-12 left-0 bg-surface-container text-on-surface text-[10px] p-2 rounded border border-outline-variant shadow-lg whitespace-nowrap z-50">Modification Detected: Digit 4 and 2 lack standard kerning.</span>
                </span> as defined in Annex A.</p>
                <div className="h-12 w-32 border border-dashed border-black/20 mt-xl flex items-center justify-center italic text-black/40">
                  [Signature Scan]
                </div>
              </div>
              <div className="absolute inset-0 bg-primary/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
          <div className="bg-surface-dim p-lg overflow-auto font-label-mono text-xs">
            <div className="space-y-sm">
              <div className="flex justify-between items-center text-outline mb-md border-b border-outline-variant pb-xs">
                <span>OCR LAYER 2 STREAM</span>
                <span>TOKEN CONFIDENCE</span>
              </div>
              <div className="flex justify-between items-center py-xs border-b border-white/5">
                <span className="text-on-surface-variant">0x001: Header_Title</span>
                <span className="text-primary font-bold">99.8%</span>
              </div>
              <div className="flex justify-between items-center py-xs border-b border-white/5">
                <span className="text-on-surface-variant">0x042: Section_4.2_Text</span>
                <span className="text-primary font-bold">98.2%</span>
              </div>
              <div className="flex justify-between items-center py-xs border-b border-error/20 bg-error/5 -mx-lg px-lg">
                <span className="text-tertiary font-bold">0x043: Transaction_Value</span>
                <span className="text-tertiary font-bold">14.2% [ALERT]</span>
              </div>
              <div className="p-sm bg-surface-container-highest rounded mt-md border border-white/10 italic text-outline leading-relaxed">
                // Analysis Note: The glyph for "4" in the transaction field shows a pixel-density mismatch of 14% compared to the rest of the document. Possible digital injection.
              </div>
              <div className="flex justify-between items-center py-xs border-b border-white/5">
                <span className="text-on-surface-variant">0x098: Signature_Block</span>
                <span className="text-primary font-bold">82.1%</span>
              </div>
              <div className="flex justify-between items-center py-xs">
                <span className="text-on-surface-variant">0x102: Footer_Meta</span>
                <span className="text-primary font-bold">99.9%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Forensic Timeline Section */}
      <GlassCard className="p-lg rounded-xl">
        <h2 className="text-headline-md font-headline-md mb-xl text-on-surface">Ownership & Anomaly Timeline</h2>
        <div className="relative pl-lg border-l-2 border-white/10 space-y-xl ml-sm">
          
          <div className="relative">
            <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-primary ring-4 ring-surface-container"></div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
              <div>
                <p className="text-label-mono font-label-mono text-primary uppercase text-[10px] tracking-wider">Original Creation</p>
                <h4 className="text-body-lg font-bold text-on-surface">Document generated by 'legal_auth_v4'</h4>
              </div>
              <time className="text-outline text-label-mono text-xs">Sept 12, 2023 • 09:12 AM</time>
            </div>
            <p className="text-on-surface-variant text-sm mt-sm">Verified hash created at origin. System integrity: 100%.</p>
          </div>

          <div className="relative">
            <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-tertiary ring-4 ring-surface-container"></div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
              <div>
                <p className="text-label-mono font-label-mono text-tertiary uppercase text-[10px] tracking-wider">Unauthorized Access</p>
                <h4 className="text-body-lg font-bold text-on-surface">Metadata Modification Detected</h4>
              </div>
              <time className="text-outline text-label-mono text-xs">Sept 14, 2023 • 11:45 PM</time>
            </div>
            <div className="mt-sm p-md bg-tertiary-container/10 border border-tertiary/20 rounded-lg">
              <p className="text-on-surface text-sm leading-relaxed">
                IP Address 185.22.x.x (Kyiv, UA) accessed file via compromised credential 'Admin_02'. Field 4.2 value modified from $1,250,000 to $4,250,000.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-outline ring-4 ring-surface-container"></div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
              <div>
                <p className="text-label-mono font-label-mono text-outline uppercase text-[10px] tracking-wider">Distribution</p>
                <h4 className="text-body-lg font-bold text-on-surface">Sent to External Recipient</h4>
              </div>
              <time className="text-outline text-label-mono text-xs">Sept 15, 2023 • 02:00 AM</time>
            </div>
            <p className="text-on-surface-variant text-sm mt-sm">Encrypted transfer via SFTP. Recipient: global_ops@investments.corp</p>
          </div>

        </div>
      </GlassCard>

      {/* Action Download Section */}
      <div className="flex justify-center pt-xl">
        <button 
          onClick={handleDownloadReport}
          className="group flex items-center gap-md bg-primary text-on-primary px-xl py-lg rounded-xl font-bold text-body-lg hover:bg-primary/95 transition-all active:scale-95 shadow-lg shadow-primary/20 cursor-pointer"
        >
          <span className="material-symbols-outlined">picture_as_pdf</span>
          Download PDF Report
          <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
