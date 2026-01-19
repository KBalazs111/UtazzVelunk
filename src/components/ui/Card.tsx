import React from 'react';
import { cn } from '../../utils/helpers';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  padding = 'md',
  onClick,
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-white/90 backdrop-blur-sm rounded-3xl shadow-card overflow-hidden transition-all duration-300 border border-primary-100/30',
        hover && 'hover:shadow-card-hover hover:-translate-y-1 hover:border-primary-200/50 cursor-pointer',
        paddings[padding],
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
