import React, { forwardRef } from 'react';

export const Textarea = forwardRef(({
  label,
  error,
  className = '',
  id,
  rows = 4,
  ...props
}, ref) => {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`
          block w-full rounded-lg border-gray-300 shadow-sm
          focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
          px-3 py-2 border bg-white text-gray-900 transition-colors resize-y
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
