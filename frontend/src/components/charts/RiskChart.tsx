import { useState } from 'react';

interface RiskChartProps {
  data?: number[];
  labels?: string[];
  className?: string;
}

export function RiskChart({ 
  data = [20, 45, 28, 80, 50, 95, 60], 
  labels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], 
  className = '' 
}: RiskChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxVal = Math.max(...data, 100);
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * 1000;
    const y = 180 - (val / maxVal) * 140; // reserved padding
    return { x, y, value: val, label: labels[idx] };
  });

  const pathD = points.reduce((acc, p, idx) => {
    if (idx === 0) return `M ${p.x} ${p.y}`;
    const prev = points[idx - 1];
    const cpX = prev.x + (p.x - prev.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${p.y}, ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L 1000 200 L 0 200 Z`;

  return (
    <div className={`w-full relative ${className}`}>
      <svg className="w-full h-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGlow" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3"></stop>
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0"></stop>
          </linearGradient>
        </defs>
        
        {/* Horizontal grid lines */}
        <line x1="0" y1="40" x2="1000" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        <line x1="0" y1="110" x2="1000" y2="110" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        <line x1="0" y1="180" x2="1000" y2="180" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

        {/* Gradient fill */}
        <path d={areaD} fill="url(#chartGlow)" className="transition-all duration-500" />
        
        {/* Chart stroke line */}
        <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" className="transition-all duration-500" />

        {/* Interactive dots */}
        {points.map((p, idx) => (
          <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredIndex(idx)} onMouseLeave={() => setHoveredIndex(null)}>
            <circle cx={p.x} cy={p.y} r="16" fill="transparent" />
            <circle 
              cx={p.x} 
              cy={p.y} 
              r={hoveredIndex === idx ? 6 : 4} 
              fill="var(--primary)" 
              className="transition-all duration-200"
              stroke="var(--surface-container)"
              strokeWidth={hoveredIndex === idx ? 2 : 1}
            />
          </g>
        ))}
      </svg>
      
      {/* Tooltip Overlay */}
      {hoveredIndex !== null && (
        <div 
          className="absolute bg-surface-container-high border border-outline-variant rounded px-sm py-xs text-xs z-20 pointer-events-none shadow-xl text-on-surface"
          style={{
            left: `${Math.min(85, Math.max(2, (hoveredIndex / (data.length - 1)) * 90))}%`,
            bottom: `${(data[hoveredIndex] / maxVal) * 55 + 25}%`
          }}
        >
          <p className="font-label-mono font-bold text-primary">{points[hoveredIndex].value}% Risk</p>
          <p className="text-[10px] text-on-surface-variant">{points[hoveredIndex].label}</p>
        </div>
      )}

      {/* Axis Labels */}
      <div className="absolute inset-x-0 bottom-0 flex justify-between items-end text-label-mono text-[10px] text-on-surface-variant/50 px-sm pb-1 pointer-events-none select-none">
        {labels.map((lbl, idx) => (
          <span key={idx}>{lbl}</span>
        ))}
      </div>
    </div>
  );
}
