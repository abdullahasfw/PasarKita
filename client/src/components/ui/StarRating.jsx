import React, { useState } from 'react';
import { Star } from 'lucide-react';

export function StarRating({ rating = 0, onChange, readonly = false, size = 'md' }) {
  const [hover, setHover] = useState(0);

  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'} focus:outline-none`}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
        >
          <Star
            className={`${currentSize} ${
              star <= (hover || rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}
