export function ProcessingOverlay({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card p-xl rounded-2xl flex flex-col items-center max-w-md w-full mx-4 relative overflow-hidden border-primary/30 shadow-2xl shadow-primary/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(179,197,255,0.1),transparent)] pointer-events-none"></div>
        
        <div className="ai-pulse w-24 h-24 rounded-full bg-primary-container/20 flex items-center justify-center mb-lg border border-primary/30 relative">
           <div className="absolute inset-0 rounded-full border-4 border-surface-container-highest"></div>
           <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
           <div className="absolute inset-3 rounded-full border-2 border-secondary border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        
        <h2 className="text-headline-md font-headline-md text-on-surface mb-xs">Analyzing Document</h2>
        <p className="text-body-md text-on-surface-variant text-center mb-lg">Running OCR layer extraction and deep AI fraud detection...</p>
        
        <div className="w-full space-y-sm">
          <div className="flex justify-between text-label-mono font-label-mono text-xs">
            <span className="text-primary">PROCESSING</span>
            <span className="text-on-surface-variant">SECURE NODE</span>
          </div>
          <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-secondary w-0 animate-[fill_3s_ease-in-out_forwards]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
