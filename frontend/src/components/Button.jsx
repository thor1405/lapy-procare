import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseClasses =
    'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary:
      'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm hover:shadow-md hover:shadow-indigo-500/20 border border-transparent',
    gradient:
      'bg-gradient-to-r from-[#4F46E5] via-[#3B82F6] to-[#14B8A6] hover:opacity-95 text-white shadow-sm hover:shadow-md border border-transparent',
    secondary:
      'bg-white hover:bg-slate-50 text-[#111827] border border-[#E2E8F0] shadow-sm hover:border-slate-300',
    outline:
      'bg-transparent hover:bg-indigo-50 text-[#4F46E5] border border-indigo-200 hover:border-indigo-400',
    ghost: 'bg-transparent hover:bg-slate-100 text-[#475569] hover:text-[#111827]',
    teal: 'bg-[#14B8A6] hover:bg-[#0D9488] text-white shadow-sm border border-transparent',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
    icon: 'p-2',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          {children}
        </>
      )}
    </button>
  );
};
