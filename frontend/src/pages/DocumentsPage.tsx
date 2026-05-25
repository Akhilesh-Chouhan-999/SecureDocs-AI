import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { useAppStore } from '../store/appStore';
import { ROUTES } from '../constants/routes';

export default function DocumentsPage() {
  const navigate = useNavigate();
  const setProcessingDocument = useAppStore(state => state.setProcessingDocument);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(75);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => p < 100 ? p + 0.5 : 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileProcess();
  };

  const handleFileProcess = () => {
    setProcessingDocument(Math.random().toString(36).substr(2, 9));
    setTimeout(() => {
      setProcessingDocument(null);
      navigate(ROUTES.REPORTS);
    }, 3000);
  };

  const dashArray = 125;
  const dashOffset = dashArray - (progress / 100) * dashArray;

  return (
    <div className="pb-safe animate-fade-in">
      <div className="mb-xl text-center md:text-left">
        <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg mb-xs">Ingest Secure Assets</h2>
        <p className="text-on-surface-variant text-body-md max-w-2xl">Deploy enterprise-grade encryption to your sensitive documentation. All files are scanned for threats and PII before vaulting.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8 flex flex-col gap-gutter">
          <div 
            className={`relative group flex flex-col items-center justify-center p-xl rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden min-h-[400px] ${dragActive ? 'border-primary bg-surface-container' : 'border-outline-variant bg-surface-container-low hover:border-primary/50 hover:bg-surface-container'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(179,197,255,0.08),transparent)] pointer-events-none"></div>
            <div className="z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-primary-container/20 flex items-center justify-center mb-lg border border-primary/30">
                <span className="material-symbols-outlined text-primary text-4xl">cloud_upload</span>
              </div>
              <h3 className="text-headline-md font-headline-md mb-sm">Drop your archives here</h3>
              <p className="text-on-surface-variant text-body-sm mb-lg">Support for PDF, DOCX, and XLSX up to 500MB</p>
              <button 
                onClick={(e) => { e.stopPropagation(); handleFileProcess(); }}
                className="bg-primary text-on-primary px-lg py-sm rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 cursor-pointer"
              >
                Select Files
              </button>
            </div>
            
            <div className="absolute bottom-4 left-4 flex gap-base items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></div>
              <span className="text-label-mono font-label-mono text-[10px] text-primary">ENCRYPTION ENGINE STANDBY</span>
            </div>
          </div>

          <div className="flex flex-col gap-sm">
            <h4 className="text-label-mono font-label-mono text-on-surface-variant uppercase tracking-widest">Active Processing</h4>
            
            <GlassCard className="p-md flex items-center justify-between group">
              <div className="flex items-center gap-md">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle className="text-outline-variant/30" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="3"></circle>
                    <circle className="text-primary transition-all duration-100" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeDasharray={dashArray} strokeDashoffset={dashOffset} strokeWidth="3"></circle>
                  </svg>
                  <span className="absolute text-[10px] font-label-mono text-primary">{Math.round(progress)}%</span>
                </div>
                <div>
                  <p className="text-body-md font-semibold text-on-surface">Q4_Financial_Audit_Internal.pdf</p>
                  <div className="flex items-center gap-sm">
                    <span className="text-label-mono font-label-mono text-on-surface-variant text-[11px]">4.2 MB / 5.6 MB</span>
                    <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                    <span className="text-label-mono font-label-mono text-primary text-[11px] animate-pulse">OPTIMIZING...</span>
                  </div>
                </div>
              </div>
              <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-error/20 hover:text-error text-on-surface-variant transition-colors cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </GlassCard>

            <GlassCard className="p-md flex items-center justify-between border-primary/20 bg-primary/5">
              <div className="flex items-center gap-md">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="material-symbols-outlined text-primary">verified_user</span>
                </div>
                <div>
                  <p className="text-body-md font-semibold text-on-surface">Employee_Stock_Plan_V2.pdf</p>
                  <div className="flex items-center gap-sm text-primary">
                    <span className="text-label-mono font-label-mono text-[11px]">PDF VERIFIED</span>
                    <span className="w-1 h-1 rounded-full bg-primary"></span>
                    <span className="text-label-mono font-label-mono text-[11px]">THREAT SCAN CLEAN</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-sm">
                <button className="bg-surface-container-highest text-primary text-label-mono px-md py-xs rounded-full font-bold cursor-pointer hover:bg-surface-variant transition-colors">READY</button>
              </div>
            </GlassCard>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-gutter">
          <GlassCard className="p-lg">
            <h4 className="text-headline-md font-headline-md mb-md text-on-surface">Asset Preview</h4>
            
            <div className="aspect-[3/4] w-full rounded-lg bg-surface-container-highest border border-white/5 relative overflow-hidden group mb-md">
              <img className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" alt="Document preview" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0R3fs_wbt4b8LFDkHwNToWWTQcaM8hsHSnR6Y6ur4KwLC4IYFsXROb1PS7ob4PQXo03JqaOVOmEIIf4krmQ_AD_bXTHWPSGJWVewvoiFvekrZultJ55ZLOa0VEYazoDf_4wysBvMAtAkBqj69ZrChRv5lJH3yB9gyddfD_7p9o7H_j7QVLlKgXhdNIUzCULnUxTAgqzlVb46RSMbnb3PtymvDBvM6dOeEtt2588DZz0wOKIAQ0wDL31g2fMpKciq20rWw01uWBHw"/>
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest to-transparent"></div>
              
              <div className="absolute bottom-md left-md right-md">
                <div className="flex flex-col gap-xs">
                  <span className="text-label-mono font-label-mono bg-on-secondary-container/90 text-on-secondary-fixed px-sm py-1 rounded w-fit">PII DETECTED (2)</span>
                  <span className="text-label-mono font-label-mono bg-primary-container/90 text-on-primary-container px-sm py-1 rounded w-fit">HIGH SENSITIVITY</span>
                </div>
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/40 backdrop-blur-sm">
                <button className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg cursor-pointer hover:bg-primary-container hover:text-on-primary-container transition-colors">
                  <span className="material-symbols-outlined">fullscreen</span>
                </button>
              </div>
            </div>

            <div className="space-y-md">
              <div>
                <div className="flex justify-between mb-xs">
                  <span className="text-label-mono font-label-mono text-on-surface-variant">OCR ACCURACY</span>
                  <span className="text-label-mono font-label-mono text-primary">99.8%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-[99.8%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-xs">
                  <span className="text-label-mono font-label-mono text-on-surface-variant">COMPRESSION RATIO</span>
                  <span className="text-label-mono font-label-mono text-primary">64.0%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full w-[64%]"></div>
                </div>
              </div>
            </div>
            
            <div className="bg-error/10 border border-error/20 p-lg rounded-xl mt-md">
              <div className="flex items-center gap-sm mb-sm">
                <span className="material-symbols-outlined text-error">warning</span>
                <h5 className="text-label-mono font-label-mono text-error font-bold uppercase tracking-wider">Risk Alert</h5>
              </div>
              <p className="text-body-sm text-error/80">Detected Social Security Numbers and personal banking details in section 4.2. Recommended: Apply automatic redaction before final storage.</p>
              <button className="mt-md w-full border border-error/30 text-error py-sm rounded-xl text-label-mono font-label-mono hover:bg-error/10 transition-colors cursor-pointer">INITIATE REDACTION</button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
