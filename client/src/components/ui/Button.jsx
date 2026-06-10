import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] border border-transparent',
  secondary: 'bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-light)] border border-transparent',
  outline: 'bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-gray-50',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 border border-transparent',
  danger: 'bg-red-500 text-white hover:bg-red-600 border border-transparent',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled = false,
  icon: Icon,
  ...props
}) {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]';
  const variantStyle = variants[variant] || variants.primary;
  const sizeStyle = sizes[size] || sizes.md;
  const disabledStyle = (disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      className={`${baseStyle} ${variantStyle} ${sizeStyle} ${disabledStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!isLoading && Icon && <Icon className="w-5 h-5 mr-2" />}
      {children}
    </button>
  );
}
