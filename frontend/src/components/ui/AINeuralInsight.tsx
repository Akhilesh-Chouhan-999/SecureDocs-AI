import React from 'react';

interface AINeuralInsightProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function AINeuralInsight({ title = 'AI Neural Insight', children, className = '' }: AINeuralInsightProps) {
  return (
    <div className={`ai-pulse-border p-lg rounded-xl flex flex-col ${className}`}>
      <div className="flex items-center gap-sm mb-md">
        <span className="material-symbols-outlined text-secondary">psychology</span>
        <h3 className="text-headline-md font-headline-md text-secondary">{title}</h3>
      </div>
      {children}
    </div>
  );
}
