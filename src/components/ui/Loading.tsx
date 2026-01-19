import React from 'react';
import { Loader2, Plane } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'plane' | 'dots';
  className?: string;
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  className,
  text,
}) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const renderLoader = () => {
    switch (variant) {
      case 'plane':
        return (
          <div className="relative">
            <Plane className={cn(sizes[size], 'text-primary-500 animate-bounce')} />
          </div>
        );
      case 'dots':
        return (
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full bg-primary-500',
                  size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4',
                  'animate-bounce'
                )}
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        );
      default:
        return (
          <Loader2 className={cn(sizes[size], 'text-primary-500 animate-spin')} />
        );
    }
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      {renderLoader()}
      {text && (
        <p className="text-gray-600 text-sm font-medium">{text}</p>
      )}
    </div>
  );
};


export const PageLoading: React.FC<{ text?: string }> = ({ text = 'Betöltés...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-50">
      <Loading variant="plane" size="lg" text={text} />
    </div>
  );
};

export default Loading;
