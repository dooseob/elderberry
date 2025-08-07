/**
 * 라디오 버튼 그룹 컴포넌트
 * ADL 평가용 선택 인터페이스
 */
import React from 'react';
import { motion } from 'framer-motion';

export interface RadioOption {
  value: string | number;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  name: string;
  value?: string | number;
  options: RadioOption[];
  onChange: (value: string | number) => void;
  error?: string;
  required?: boolean;
  className?: string;
  direction?: 'vertical' | 'horizontal';
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  options,
  onChange,
  error,
  required = false,
  className = '',
  direction = 'vertical',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  const containerClasses = direction === 'vertical' 
    ? 'space-y-3' 
    : 'space-x-4 flex flex-wrap';

  const errorId = error ? `${name}-error` : undefined;
  const describedBy = [ariaDescribedBy, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={className}>
      <div 
        className={containerClasses}
        role="radiogroup"
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        aria-required={required}
        aria-invalid={!!error}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          const isDisabled = option.disabled;
          
          return (
            <motion.label
              key={option.value}
              className={`
                relative flex items-start cursor-pointer p-4 rounded-lg border-2 transition-all duration-200
                ${isSelected 
                  ? 'border-elderberry-500 bg-elderberry-50' 
                  : 'border-elderberry-200 bg-white hover:border-elderberry-300'
                }
                ${isDisabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-elderberry-25'
                }
                ${error ? 'border-red-300' : ''}
              `}
              whileHover={!isDisabled ? { scale: 1.02 } : {}}
              whileTap={!isDisabled ? { scale: 0.98 } : {}}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => !isDisabled && onChange(option.value)}
                disabled={isDisabled}
                required={required}
                className="sr-only"
                aria-describedby={option.description ? `${name}-${option.value}-desc` : undefined}
              />
              
              {/* 커스텀 라디오 버튼 */}
              <div className={`
                flex-shrink-0 w-5 h-5 rounded-full border-2 mr-4 mt-0.5 relative
                ${isSelected 
                  ? 'border-elderberry-500' 
                  : 'border-elderberry-300'
                }
              `}>
                {isSelected && (
                  <motion.div
                    className="absolute inset-1 bg-elderberry-500 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </div>
              
              {/* 라벨 및 설명 */}
              <div className="flex-1 min-w-0">
                <div className={`
                  text-sm font-medium
                  ${isSelected ? 'text-elderberry-900' : 'text-elderberry-700'}
                  ${isDisabled ? 'text-elderberry-400' : ''}
                `}>
                  {option.label}
                </div>
                
                {option.description && (
                  <div 
                    id={`${name}-${option.value}-desc`}
                    className={`
                      text-xs mt-1
                      ${isSelected ? 'text-elderberry-600' : 'text-elderberry-500'}
                      ${isDisabled ? 'text-elderberry-300' : ''}
                    `}
                  >
                    {option.description}
                  </div>
                )}
              </div>
              
              {/* 선택 표시 아이콘 */}
              {isSelected && (
                <motion.div
                  className="flex-shrink-0 ml-4"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-5 h-5 bg-elderberry-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </motion.div>
              )}
            </motion.label>
          );
        })}
      </div>
      
      {/* 에러 메시지 */}
      {error && (
        <motion.div
          id={errorId}
          className="mt-2 text-sm text-red-600"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          role="alert"
          aria-live="polite"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
};

export { RadioGroup };
export default RadioGroup;