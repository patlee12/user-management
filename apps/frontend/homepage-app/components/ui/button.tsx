import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';

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
    'inline-flex items-center justify-center font-medium transition rounded-lg px-5 py-2.5 shadow-sm transform hover:-translate-y-1 hover:shadow-md';

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-zinc-700 text-white hover:bg-zinc-600 focus:ring-2 focus:ring-zinc-400',
    secondary:
      'border border-zinc-600 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-500',
    ghost:
      'bg-transparent text-zinc-300 hover:bg-zinc-800 focus:ring-2 focus:ring-zinc-500',
    outline:
      'border border-zinc-500 text-zinc-200 hover:bg-zinc-800 focus:ring-2 focus:ring-zinc-500',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
