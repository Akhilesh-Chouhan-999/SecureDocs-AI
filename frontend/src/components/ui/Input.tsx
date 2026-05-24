import React, { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", id, ...props }, ref) => {
    const inputId = id || label?.replace(/\s+/g, "-").toLowerCase();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-300 mb-1.5 ml-1"
          >
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-blue-500 transition-colors">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`
              w-full px-4 py-3 bg-white/5 border rounded-xl 
              transition-all duration-300 outline-none text-foreground
              placeholder:text-neutral-500
              ${icon ? "pl-11" : ""}
              ${
                error
                  ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  : "border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 hover:border-white/20"
              }
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-400 ml-1 flex items-center">
            <span className="inline-block w-1 h-1 rounded-full bg-red-400 mr-2"></span>
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
