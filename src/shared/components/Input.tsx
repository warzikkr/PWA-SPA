import { forwardRef, type InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, className = '', ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-brand-dark">{label}</label>
        )}
        <input
          ref={ref}
          className={`
            w-full min-h-[48px] px-4 py-3 text-base
            border rounded-lg transition-colors
            placeholder:text-brand-muted
            focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green
            ${error ? 'border-red-500' : 'border-brand-border'}
            ${className}
          `}
          {...rest}
        />
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
