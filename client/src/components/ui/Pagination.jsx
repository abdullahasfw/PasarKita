import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, hasNext, hasPrev } = pagination;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);

    if (page <= 3) {
      end = Math.min(totalPages, 5);
    }
    if (page >= totalPages - 2) {
      start = Math.max(1, totalPages - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrev}
        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {getPageNumbers().map(num => (
        <button
          key={num}
          onClick={() => onPageChange(num)}
          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
            page === num
              ? 'bg-[var(--color-primary)] text-white'
              : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {num}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
