import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({ 
  icon: Icon = PackageOpen, 
  title = 'Tidak ada data', 
  description = 'Belum ada data yang dapat ditampilkan saat ini.',
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
