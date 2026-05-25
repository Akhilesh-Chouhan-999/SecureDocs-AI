import { cn } from '../../utils/cn';

export function Spinner({ className, size = 'md' }: { className?: string, size?: 'sm'|'md'|'lg' }) {
  return (
    <div className={cn(
      "animate-spin inline-block border-[3px] border-current border-t-transparent text-primary rounded-full",
      {
        'w-4 h-4': size === 'sm',
        'w-6 h-6': size === 'md',
        'w-8 h-8': size === 'lg',
      },
      className
    )} role="status" aria-label="loading">
      <span className="sr-only">Loading...</span>
    </div>
  );
}
