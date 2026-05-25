import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variantClass = variant === 'success' ? 'bg-success/20 text-success' :
                       variant === 'warning' ? 'bg-warning/20 text-warning' :
                       variant === 'error' ? 'bg-error/20 text-error' :
                       'bg-surface-container-highest text-on-surface';
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      variantClass,
      className
    )}>
      {children}
    </span>
  );
}
