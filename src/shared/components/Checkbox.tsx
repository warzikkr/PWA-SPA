import { forwardRef, type InputHTMLAttributes } from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, Props>(
  ({ label, error, className = '', ...rest }, ref) => {
    return (
      <label className={`flex items-start gap-3 min-h-[48px] py-2 cursor-pointer ${className}`}>
        <input
          ref={ref}
          type="checkbox"
          className="mt-1 w-5 h-5 rounded border-brand-border text-brand-green focus:ring-brand-green shrink-0"
          {...rest}
        />
        <span className="text-base text-brand-dark">{label}</span>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
