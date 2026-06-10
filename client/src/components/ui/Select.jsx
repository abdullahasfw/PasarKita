import React, { forwardRef } from 'react';

export const Select = forwardRef(({
  label,
  error,
  options = [],
  className = '',
  id,
  placeholder,
  ...props
}, ref) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`
          block w-full rounded-lg border-gray-300 shadow-sm
          focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
          px-3 py-2 border bg-white text-gray-900 transition-colors
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
