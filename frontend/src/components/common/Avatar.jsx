import React, { useState } from 'react';
import { FiUser } from 'react-icons/fi';

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-3xl',
};

/**
 * Reusable Avatar Component
 * - Displays custom image if provided
 * - Defaults to initial letter on gradient background (like Google / modern apps)
 * - Falls back to Instagram-style user silhouette icon if no name is available
 */
export const Avatar = ({
  src,
  name,
  size = 'md',
  className = '',
  border = true,
}) => {
  const [imgError, setImgError] = useState(false);
  const dimensionClass = sizeMap[size] || sizeMap.md;
  const initial = name?.trim() ? name.trim().charAt(0).toUpperCase() : null;

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || 'Profile'}
        onError={() => setImgError(true)}
        className={`${dimensionClass} rounded-full object-cover shrink-0 ${
          border ? 'border border-[#C9A44C]/30 shadow-xs' : ''
        } ${className}`}
      />
    );
  }

  return (
    <div
      className={`${dimensionClass} rounded-full bg-gradient-to-br from-[#7A2525] to-[#C85A17] flex items-center justify-center text-white font-bold shrink-0 select-none shadow-xs ${
        border ? 'border border-[#C9A44C]/40' : ''
      } ${className}`}
      title={name || 'User'}
    >
      {initial ? (
        <span>{initial}</span>
      ) : (
        <FiUser className="w-1/2 h-1/2 text-white/90" />
      )}
    </div>
  );
};

export default Avatar;
