import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { useAppStore } from '../store/appStore';
import { ROUTES } from '../constants/routes';
import { UIDocument } from '../types';
import toast from 'react-hot-toast';

export default function DocumentsPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setProcessingDocument, addDocument, isLockdown } = useAppStore();
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Selected file details
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    type: string;
    rawSize: number;
  } | null>(null);

  const [hasRedacted, setHasRedacted] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isUploading) {
      interval = setInterval(() => {
        setProgress(p => {
          if (p < 100) {
            return p + 5;
          } else {
            clearInterval(interval);
            handleUploadComplete();
            return 100;
          }
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isUploading]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLockdown) return;
    
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
    if (isLockdown) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (isLockdown) {
      toast.error('Vault is in lockdown. Uploads restricted.');
      return;
    }
    fileInputRef.current?.click();
  };

  const processSelectedFile = (file: File) => {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = `${sizeInMB} MB`;
    
    // Detect type
    let docType = 'PDF';
    if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) docType = 'Word';
    else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) docType = 'Excel';
    else if (file.name.endsWith('.bin')) docType = 'Binary';
    else if (file.name.endsWith('.png') || file.name.endsWith('.jpg')) docType = 'Image';

    setUploadedFile({
      name: file.name,
      size: sizeStr,
      type: docType,
      rawSize: file.size,
    });
    setHasRedacted(false);
    setProgress(0);
    setIsUploading(true);
  };

  const handleUploadComplete = () => {
    setIsUploading(false);
    toast.success('Document uploaded successfully.');
    
    // Trigger deep AI scan toast
    const loadingToast = toast.loading('Running threat and PII analysis...');
    
    // Generate risk profile
    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.error('PII detected in Section 4.2. Action required.', { icon: '⚠️' });
    }, 1500);
  };

  const handleInitiateRedaction = () => {
    if (!uploadedFile) return;
    const loadingToast = toast.loading('Masking SSNs and financial credentials...');
    
    setTimeout(() => {
      toast.dismiss(loadingToast);
      setHasRedacted(true);
      toast.success('Redaction complete. Threat level downgraded to CLEAN.');
    }, 1500);
  };

  const handleSaveToVault = () => {
    if (!uploadedFile) return;
    
    const riskScore = hasRedacted ? 5 : 82;
    const newDoc: UIDocument = {
      id: Math.random().toString(),
      name: uploadedFile.name,
      type: uploadedFile.type,
      riskScore: riskScore,
      status: hasRedacted ? 'Clean' : 'High Risk',
      timestamp: new Date(),
      size: uploadedFile.size,
    };
    
    addDocument(newDoc);
    toast.success('Secured asset successfully vaulted.');
    
    // Redirect to risk report page to view analysis
    setProcessingDocument(uploadedFile.name);
    setTimeout(() => {
      setProcessingDocument(null);
      navigate(ROUTES.REPORTS);
    }, 1500);
  };

  return (
    <div className="pb-safe animate-fade-in">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        accept=".pdf,.docx,.xlsx,.bin,.png,.jpg"
      />

      <div className="mb-xl text-center md:text-left">
        <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg mb-xs text-on-surface">Ingest Secure Assets</h2>
        <p className="text-on-surface-variant text-body-md max-w-2xl">Deploy enterprise-grade encryption to your sensitive documentation. All files are scanned for threats and PII before vaulting.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Drag & Drop container */}
        <div className="lg:col-span-8 flex flex-col gap-gutter">
          <div 
            onClick={triggerFileInput}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative group flex flex-col items-center justify-center p-xl rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden min-h-[400px] ${
              dragActive ? 'border-primary bg-surface-container' : 'border-outline-variant bg-surface-container-low hover:border-primary/50 hover:bg-surface-container'
            } ${isLockdown ? 'opacity-50 cursor-not-allowed border-error/20 bg-error-container/5' : ''}`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(179,197,255,0.08),transparent)] pointer-events-none"></div>
            <div className="z-10 flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-lg border ${
                isLockdown 
                  ? 'bg-error-container/20 border-error/30 text-error animate-pulse' 
                  : 'bg-primary-container/20 border-primary/30 text-primary'
              }`}>
                <span className="material-symbols-outlined text-4xl">{isLockdown ? 'lock' : 'cloud_upload'}</span>
              </div>
              <h3 className="text-headline-md font-headline-md mb-sm text-on-surface">
                {isLockdown ? 'Lockdown Active - Uploads Blocked' : 'Drop your archives here'}
              </h3>
              <p className="text-on-surface-variant text-body-sm mb-lg">Support for PDF, DOCX, and XLSX up to 500MB</p>
              <button 
                type="button"
                disabled={isLockdown}
                onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}
                className={`px-lg py-sm rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer ${
                  isLockdown 
                    ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed' 
                    : 'bg-primary text-on-primary shadow-primary/20'
                }`}
              >
                Select Files
              </button>
            </div>
            
            <div className="absolute bottom-4 left-4 flex gap-base items-center">
              <div className={`w-1.5 h-1.5 rounded-full animate-ping ${isLockdown ? 'bg-error' : 'bg-primary'}`}></div>
              <span className={`text-label-mono font-label-mono text-[10px] ${isLockdown ? 'text-error' : 'text-primary'}`}>
                {isLockdown ? 'ENCRYPTION ENGINE STOPPED' : 'ENCRYPTION ENGINE STANDBY'}
              </span>
            </div>
          </div>

          {/* Active Uploads / Processing list */}
          {(isUploading || uploadedFile) && (
            <div className="flex flex-col gap-sm animate-fade-in">
              <h4 className="text-label-mono font-label-mono text-on-surface-variant uppercase tracking-widest text-xs">Active Processing</h4>
              
              {isUploading && (
                <GlassCard className="p-md flex items-center justify-between group">
                  <div className="flex items-center gap-md">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        <circle className="text-outline-variant/30" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="3"></circle>
                        <circle className="text-primary transition-all duration-100" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeDasharray="125" strokeDashoffset={125 - (progress / 100) * 125} strokeWidth="3"></circle>
                      </svg>
                      <span className="absolute text-[10px] font-label-mono text-primary">{progress}%</span>
                    </div>
                    <div>
                      <p className="text-body-md font-semibold text-on-surface truncate max-w-[200px]">{uploadedFile?.name}</p>
                      <div className="flex items-center gap-sm">
                        <span className="text-label-mono font-label-mono text-on-surface-variant text-[11px]">{uploadedFile?.size}</span>
                        <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                        <span className="text-label-mono font-label-mono text-primary text-[11px] animate-pulse">CRYPT-ANALYZING...</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setIsUploading(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-error/20 hover:text-error text-on-surface-variant transition-colors cursor-pointer">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </GlassCard>
              )}

              {!isUploading && uploadedFile && (
                <GlassCard className={`p-md flex items-center justify-between border transition-all ${
                  hasRedacted ? 'border-primary/20 bg-primary/5' : 'border-error/20 bg-error-container/5'
                }`}>
                  <div className="flex items-center gap-md">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                      hasRedacted ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-error-container/10 border-error/20 text-error'
                    }`}>
                      <span className="material-symbols-outlined">{hasRedacted ? 'verified_user' : 'warning'}</span>
                    </div>
                    <div>
                      <p className="text-body-md font-semibold text-on-surface">{uploadedFile.name}</p>
                      <div className="flex items-center gap-sm">
                        <span className="text-label-mono font-label-mono text-[11px] text-on-surface-variant">{uploadedFile.size}</span>
                        <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                        <span className={`text-label-mono font-label-mono text-[11px] uppercase ${hasRedacted ? 'text-primary' : 'text-error'}`}>
                          {hasRedacted ? 'THREAT SCAN CLEAN' : 'METADATA INCONSISTENT / PII DETECTED'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-sm">
                    <button 
                      onClick={handleSaveToVault}
                      className="bg-primary text-on-primary text-label-mono text-[11px] px-md py-xs rounded-full font-bold cursor-pointer hover:bg-primary-container transition-colors uppercase tracking-wider"
                    >
                      Vault Asset
                    </button>
                  </div>
                </GlassCard>
              )}
            </div>
          )}
        </div>

        {/* Right Preview Panel */}
        <div className="lg:col-span-4 flex flex-col gap-gutter">
          <GlassCard className="p-lg">
            <h4 className="text-headline-md font-headline-md mb-md text-on-surface">Asset Preview</h4>
            
            <div className="aspect-[3/4] w-full rounded-lg bg-surface-container-highest border border-white/5 relative overflow-hidden group mb-md">
              <img className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" alt="Document preview" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0R3fs_wbt4b8LFDkHwNToWWTQcaM8hsHSnR6Y6ur4KwLC4IYFsXROb1PS7ob4PQXo03JqaOVOmEIIf4krmQ_AD_bXTHWPSGJWVewvoiFvekrZultJ55ZLOa0VEYazoDf_4wysBvMAtAkBqj69ZrChRv5lJH3yB9gyddfD_7p9o7H_j7QVLlKgXhdNIUzCULnUxTAgqzlVb46RSMbnb3PtymvDBvM6dOeEtt2588DZz0wOKIAQ0wDL31g2fMpKciq20rWw01uWBHw"/>
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest to-transparent"></div>
              
              <div className="absolute bottom-md left-md right-md">
                <div className="flex flex-col gap-xs">
                  {uploadedFile && !hasRedacted ? (
                    <span className="text-label-mono font-label-mono bg-error-container text-on-error-container px-sm py-1 rounded w-fit text-[10px] tracking-wider font-bold">PII DETECTED (2)</span>
                  ) : hasRedacted ? (
                    <span className="text-label-mono font-label-mono bg-primary text-on-primary px-sm py-1 rounded w-fit text-[10px] tracking-wider font-bold">PII SECURED</span>
                  ) : (
                    <span className="text-label-mono font-label-mono bg-white/5 text-on-surface-variant px-sm py-1 rounded w-fit text-[10px]">NO ACTIVE FILE</span>
                  )}
                  <span className="text-label-mono font-label-mono bg-primary-container/90 text-on-primary-container px-sm py-1 rounded w-fit text-[10px] font-bold">HIGH SENSITIVITY</span>
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
                  <span className="text-label-mono font-label-mono text-on-surface-variant text-[11px]">OCR ACCURACY</span>
                  <span className="text-label-mono font-label-mono text-primary text-[11px] font-bold">{uploadedFile ? '99.8%' : '0.0%'}</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: uploadedFile ? '99.8%' : '0%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-xs">
                  <span className="text-label-mono font-label-mono text-on-surface-variant text-[11px]">COMPRESSION RATIO</span>
                  <span className="text-label-mono font-label-mono text-primary text-[11px] font-bold">{uploadedFile ? '64.0%' : '0.0%'}</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full transition-all duration-500" style={{ width: uploadedFile ? '64%' : '0%' }}></div>
                </div>
              </div>
            </div>
            
            {uploadedFile && !hasRedacted && (
              <div className="bg-error-container/10 border border-error/20 p-lg rounded-xl mt-md animate-fade-in">
                <div className="flex items-center gap-sm mb-sm">
                  <span className="material-symbols-outlined text-error">warning</span>
                  <h5 className="text-label-mono font-label-mono text-error font-bold uppercase tracking-wider text-[11px]">PII Exposure Warning</h5>
                </div>
                <p className="text-body-sm text-error/80 leading-relaxed">
                  Detected Social Security Numbers and personal banking details in section 4.2. Recommended: Apply automatic redaction before final storage.
                </p>
                <button 
                  onClick={handleInitiateRedaction}
                  className="mt-md w-full border border-error/30 text-error py-sm rounded-xl text-label-mono font-label-mono hover:bg-error/10 transition-colors cursor-pointer text-xs"
                >
                  INITIATE REDACTION
                </button>
              </div>
            )}

            {uploadedFile && hasRedacted && (
              <div className="bg-primary/5 border border-primary/20 p-lg rounded-xl mt-md animate-fade-in">
                <div className="flex items-center gap-sm mb-sm text-primary">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  <h5 className="text-label-mono font-label-mono font-bold uppercase tracking-wider text-[11px]">PII Sanitized</h5>
                </div>
                <p className="text-body-sm text-primary/80 leading-relaxed">
                  Decentralized SSNs and banking details replaced with cryptographic hashes. Document is clean and ready for vaulting.
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
