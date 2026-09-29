import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold text-dark-800 tracking-wide uppercase">
          {label} {props.required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-dark-400 pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm text-dark-900 placeholder:text-dark-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
              : 'border-dark-200 hover:border-dark-300 focus:border-dark-900 focus:ring-dark-900/10'
          } ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3.5 text-dark-400">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs font-medium text-rose-600 mt-0.5">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
