'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'glow';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  showSuccess?: boolean;
  successLabel?: React.ReactNode;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  showSuccess = false,
  successLabel = (
    <span className="flex items-center gap-2 text-green-400">
      ✓ <span className="text-white">Saved</span>
    </span>
  ),
  ...props
}: ButtonProps) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl transform hover:-translate-y-[2px]';

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-emerald-700 text-white hover:bg-emerald-600 shadow-lg hover:shadow-xl',
    secondary:
      'bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 shadow-sm hover:shadow-md',
    ghost: 'bg-transparent text-zinc-300 hover:bg-zinc-800/50 hover:text-white',
    outline:
      'border border-zinc-500 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-400',
    glow: 'bg-emerald-700 text-white shadow-[0_0_10px_#047857] hover:bg-emerald-600 hover:shadow-[0_0_14px_#059669]',
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variants[variant], className)}
      {...props}
    >
      {showSuccess ? successLabel : children}
    </button>
  );
};
