import React from 'react';

export function Card({ children, className = '', hover = false, ...props }) {
  const hoverStyle = hover ? 'hover-lift' : '';
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
