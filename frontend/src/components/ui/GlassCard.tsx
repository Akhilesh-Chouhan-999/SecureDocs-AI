import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function GlassCard({ className = '', children, ...props }: GlassCardProps) {
  return (
    <div className={`glass-card rounded-xl ${className}`} {...props}>
      {children}
    </div>
  );
}
