import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
  maxRating?: number;
}

const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readonly = false,
  size = 'md',
  showValue = false,
  className = '',
  maxRating = 5,
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
  };

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(0);
    }
  };

  const displayValue = hoverValue || value;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, index) => {
          const rating = index + 1;
          const isFilled = rating <= displayValue;
          const isHalfFilled = rating - 0.5 === displayValue;

          return (
            <button
              key={rating}
              type="button"
              className={`${sizeClasses[size]} ${
                readonly 
                  ? 'cursor-default' 
                  : 'cursor-pointer hover:scale-110 transition-transform'
              } ${isFilled ? 'text-yellow-400' : 'text-gray-300'}`}
              onClick={() => handleClick(rating)}
              onMouseEnter={() => handleMouseEnter(rating)}
              onMouseLeave={handleMouseLeave}
              disabled={readonly}
            >
              {isHalfFilled ? (
                <div className="relative">
                  <Star className={`${sizeClasses[size]} text-gray-300`} />
                  <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                    <Star className={`${sizeClasses[size]} text-yellow-400 fill-current`} />
                  </div>
                </div>
              ) : (
                <Star 
                  className={`${sizeClasses[size]} ${
                    isFilled ? 'fill-current' : ''
                  } transition-colors`} 
                />
              )}
            </button>
          );
        })}
      </div>
      
      {showValue && (
        <span className={`ml-2 font-medium ${
          size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
        } text-elderberry-900`}>
          {value.toFixed(1)}
        </span>
      )}
      
      {!readonly && hoverValue > 0 && (
        <span className={`ml-2 ${
          size === 'sm' ? 'text-xs' : 'text-sm'
        } text-elderberry-600`}>
          {hoverValue}점
        </span>
      )}
    </div>
  );
};

export { StarRating };