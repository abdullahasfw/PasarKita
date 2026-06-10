import React from 'react';
import { ProductCard } from './ProductCard';

export function ProductGrid({ products, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[340px]">
            <div className="bg-gray-200 h-48 w-full"></div>
            <div className="p-4 flex flex-col flex-grow">
              <div className="bg-gray-200 h-3 w-1/3 mb-2 rounded"></div>
              <div className="bg-gray-200 h-5 w-full mb-2 rounded"></div>
              <div className="bg-gray-200 h-5 w-2/3 mb-4 rounded"></div>
              <div className="mt-auto bg-gray-200 h-4 w-1/2 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
