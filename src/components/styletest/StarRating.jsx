import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ onRate }) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleRating = (star) => {
    setHoverRating(0);
    onRate(star);
  };

  return (
    <div className="flex justify-center space-x-2 md:space-x-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`評分 ${star} 星`}
          title={`評分 ${star} 星`}
          onClick={() => handleRating(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className="transform transition-transform duration-200 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-75 rounded-full p-1 min-h-12 min-w-12"
        >
          <Star
            className={`w-10 h-10 md:w-12 md:h-12 transition-colors duration-200 ${
              star <= (hoverRating || 0)
                ? 'text-amber-400 fill-current'
                : 'text-stone-300 hover:text-amber-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
