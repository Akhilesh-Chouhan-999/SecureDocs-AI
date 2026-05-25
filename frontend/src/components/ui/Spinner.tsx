import { cn } from '../../utils/cn';

export function Spinner({ className, size = 'md' }: { className?: string, size?: 'sm'|'md'|'lg' }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  return (
    <div className={cn(
      "animate-spin inline-block border-[3px] border-current border-t-transparent text-primary rounded-full",
      sizeClass,
      className
    )} role="status" aria-label="loading">
      <span className="sr-only">Loading...</span>
    </div>
  );
}
