

interface RiskIndicatorProps {
  score: number;
  label: string;
  className?: string;
}

export function RiskIndicator({ score, label, className = '' }: RiskIndicatorProps) {
  const dashArray = 283;
  const dashOffset = dashArray - (dashArray * score) / 100;
  
  return (
    <div className={`relative w-48 h-48 ${className}`}>
      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
        <circle className="text-surface-container-highest" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="8"></circle>
        <circle 
          className="risk-glow-red transition-all duration-1000 ease-out" 
          cx="50" cy="50" fill="none" r="45" stroke="var(--color-error, #d63135)" 
          strokeDasharray={dashArray} strokeDashoffset={dashOffset} 
          strokeLinecap="round" strokeWidth="8"
        ></circle>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-display-lg font-display-lg text-tertiary-container">{score}%</span>
        <span className="text-label-mono font-label-mono text-tertiary-container bg-tertiary-container/10 px-sm py-xs rounded mt-2">{label}</span>
      </div>
    </div>
  );
}
