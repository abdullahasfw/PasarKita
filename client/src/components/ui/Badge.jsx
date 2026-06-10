import React from 'react';

const variants = {
  active: 'bg-green-100 text-green-800 border-green-200',
  sold: 'bg-gray-100 text-gray-800 border-gray-200',
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  ended: 'bg-red-100 text-red-800 border-red-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  completed: 'bg-purple-100 text-purple-800 border-purple-200',
  cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
};

export function Badge({ children, variant = 'active', className = '' }) {
  const variantStyle = variants[variant.toLowerCase()] || variants.active;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyle} ${className}`}>
      {children}
    </span>
  );
}
