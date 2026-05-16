/**
 * Reusable Input component
 */

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full min-w-0">
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          className={`
            w-full min-w-0 rounded-lg border bg-white px-3 py-2 text-sm text-slate-900
            focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500
            disabled:cursor-not-allowed disabled:bg-slate-100 dark:bg-slate-800 dark:text-slate-100
            dark:disabled:bg-slate-900
            ${error ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}
            ${className}
          `}
          {...props}
        />

        {error && (
          <p className="mt-1.5 text-sm text-red-600">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
