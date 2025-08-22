/**
 * 진행률 표시 바 컴포넌트
 * 체크리스트 진행 상황 표시용
 */
import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // 0-100
  steps?: string[];
  currentStep?: number;
  showPercentage?: boolean;
  showSteps?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  steps = [],
  currentStep = 0,
  showPercentage = true,
  showSteps = false,
  className = '',
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`w-full ${className}`}>
      {/* 진행률 텍스트 */}
      {showPercentage && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-elderberry-700">
            진행률
          </span>
          <span className="text-sm font-semibold text-elderberry-900">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}

      {/* 진행률 바 */}
      <div className="w-full bg-elderberry-100 rounded-full h-3 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-elderberry-500 to-elderberry-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* 단계별 표시 */}
      {showSteps && steps.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="flex flex-col items-center"
              >
                {/* 단계 원형 표시 */}
                <div 
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                    transition-all duration-300
                    ${index <= currentStep 
                      ? 'bg-elderberry-600 text-white' 
                      : 'bg-elderberry-100 text-elderberry-400'
                    }
                  `}
                >
                  {index + 1}
                </div>
                
                {/* 단계 이름 */}
                <span 
                  className={`
                    mt-2 text-xs text-center max-w-16
                    ${index <= currentStep 
                      ? 'text-elderberry-700 font-medium' 
                      : 'text-elderberry-400'
                    }
                  `}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>

          {/* 단계 간 연결선 */}
          <div className="relative mt-2">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-elderberry-100" />
            <motion.div
              className="absolute top-0 left-0 h-0.5 bg-elderberry-600"
              initial={{ width: 0 }}
              animate={{ 
                width: steps.length > 1 
                  ? `${(currentStep / (steps.length - 1)) * 100}%` 
                  : '0%' 
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;