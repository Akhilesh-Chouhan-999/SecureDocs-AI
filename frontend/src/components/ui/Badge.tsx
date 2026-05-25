import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      {
        'bg-surface-container-highest text-on-surface': variant === 'default',
        'bg-success/20 text-success': variant === 'success',
        'bg-warning/20 text-warning': variant === 'warning',
        'bg-error/20 text-error': variant === 'error',
      },
      className
    )}>
      {children}
    </span>
  );
}
