import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-on-surface mb-1">{label}</label>}
        <div className="relative">
          {icon && <div className="absolute left-3 top-2.5 text-on-surface-variant">{icon}</div>}
          <input
            className={cn(
              "flex h-10 w-full rounded-md border border-outline bg-surface py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              icon ? "pl-10 pr-3" : "px-3",
              error && "border-error focus-visible:ring-error",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-error mt-1">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
