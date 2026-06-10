import React from 'react';
import { User } from 'lucide-react';

export function Avatar({ src, alt, size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative inline-block ${currentSize} ${className}`}>
      {src ? (
        <img
          src={src.startsWith('http') ? src : `http://localhost:5000${src}`}
          alt={alt || 'Avatar'}
          className="w-full h-full rounded-full object-cover border border-gray-200"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      
      <div 
        className={`w-full h-full rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 text-gray-400 ${src ? 'hidden absolute inset-0' : ''}`}
      >
        <User size={size === 'sm' ? 16 : size === 'md' ? 20 : size === 'lg' ? 32 : 48} />
      </div>
    </div>
  );
}
