import React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'glow';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = ({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl px-6 py-3 text-base transform hover:-translate-y-[2px]';

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
    <button className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </button>
  );
};
