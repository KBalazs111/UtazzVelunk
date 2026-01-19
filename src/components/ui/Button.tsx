import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-600 text-white shadow-soft hover:shadow-glow hover:from-primary-600 hover:via-primary-700 hover:to-secondary-700 focus:ring-primary-500',
    secondary: 'bg-white/80 backdrop-blur-sm text-gray-800 border-2 border-primary-200 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700 focus:ring-primary-400',
    ghost: 'bg-transparent text-gray-600 hover:bg-primary-50 hover:text-primary-700',
    danger: 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-soft hover:from-rose-600 hover:to-rose-700 focus:ring-rose-500',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};

export default Button;
