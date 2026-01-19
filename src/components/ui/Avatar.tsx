import React from 'react';
import { getInitials, cn } from '../../utils/helpers';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  className,
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-full object-cover',
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 text-white flex items-center justify-center font-semibold shadow-soft',
        sizes[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
