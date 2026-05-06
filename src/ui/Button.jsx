import React from 'react';

const VARIANTS = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white border border-transparent',
  secondary:
    'bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 shadow-sm',
  danger: 'bg-red-600 hover:bg-red-700 text-white border border-transparent',
};

const SIZES = {
  default:
    'px-4 py-2.5 min-h-[44px] text-sm font-medium rounded-lg justify-center',
  sm: 'px-3 py-2 min-h-[40px] text-xs font-medium rounded-md justify-center',
};

export default function Button({
  children,
  onClick,
  color,
  variant = 'primary',
  size = 'default',
  className = '',
  type = 'button',
  disabled = false,
  styles,
}) {
  const variantClass = color || VARIANTS[variant] || VARIANTS.primary;
  const sizeClass = SIZES[size] || SIZES.default;
  const base =
    'inline-flex items-center gap-1 transition-colors select-none max-w-full disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      style={styles}
      className={`${base} ${sizeClass} ${variantClass} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
