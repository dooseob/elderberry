/**
 * 애니메이션 설정 관리 컴포넌트
 * 사용자가 애니메이션 옵션을 조절할 수 있는 UI
 */
import React, { useState, useEffect } from 'react';
import { animationManager, AnimationConfig } from '../../utils/animationConfig';
import { Settings, Zap, Eye, BarChart3 } from 'lucide-react';
import Button from '../../shared/ui/Button';
import { MotionFadeIn } from '../../shared/ui/ConditionalMotion';

export default function AnimationSettings() {
  const [config, setConfig] = useState<AnimationConfig>(animationManager.getConfig());
  const [isTestingAnimation, setIsTestingAnimation] = useState(false);

  // 설정 로드
  useEffect(() => {
    setConfig(animationManager.getConfig());
  }, []);

  // 설정 업데이트
  const updateConfig = (updates: Partial<AnimationConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    animationManager.updateConfig(updates);
  };

  // 애니메이션 테스트
  const testAnimation = () => {
    setIsTestingAnimation(true);
    setTimeout(() => setIsTestingAnimation(false), 1000);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="w-5 h-5 text-elderberry-600" />
        <h3 className="text-lg font-semibold text-gray-900">애니메이션 설정</h3>
      </div>

      <div className="space-y-6">
        {/* 애니메이션 활성화/비활성화 */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">애니메이션 활성화</h4>
            <p className="text-sm text-gray-500">페이지 전환 및 인터랙션 애니메이션을 활성화합니다.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => updateConfig({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-elderberry-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-elderberry-600"></div>
          </label>
        </div>

        {/* 성능 수준 표시 */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">감지된 성능 수준</h4>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              config.performance === 'high' ? 'bg-green-100 text-green-800' :
              config.performance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">
                {config.performance === 'high' && '높음'}
                {config.performance === 'medium' && '보통'}
                {config.performance === 'low' && '낮음'}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {config.performance === 'high' && '모든 애니메이션이 활성화됩니다.'}
              {config.performance === 'medium' && '기본 애니메이션만 활성화됩니다.'}
              {config.performance === 'low' && '애니메이션이 최소화됩니다.'}
            </span>
          </div>
        </div>

        {/* 시스템 설정 */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">시스템 설정</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">동작 감소 설정</span>
              </div>
              <span className={`text-sm font-medium ${
                config.reducedMotion ? 'text-orange-600' : 'text-green-600'
              }`}>
                {config.reducedMotion ? '활성화됨' : '비활성화됨'}
              </span>
            </div>
            {config.reducedMotion && (
              <p className="text-xs text-orange-600 ml-6">
                시스템에서 동작 감소를 요청했습니다. 애니메이션이 최소화됩니다.
              </p>
            )}
          </div>
        </div>

        {/* 번들 크기 최적화 정보 */}
        <div className="bg-elderberry-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-elderberry-900 mb-2">성능 최적화 정보</h4>
          <ul className="text-sm text-elderberry-700 space-y-1">
            <li>• 애니메이션 비활성화 시 Framer Motion이 번들에서 제외됩니다</li>
            <li>• 예상 번들 크기 절약: 약 2.6MB (압축 전)</li>
            <li>• 낮은 성능 기기에서 자동으로 애니메이션이 최소화됩니다</li>
          </ul>
        </div>

        {/* 테스트 버튼 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Button
            onClick={testAnimation}
            variant="outline"
            className="flex items-center space-x-2"
            disabled={!config.enabled}
          >
            <Zap className="w-4 h-4" />
            <span>애니메이션 테스트</span>
          </Button>

          {/* 테스트 애니메이션 */}
          {isTestingAnimation && config.enabled && (
            <MotionFadeIn className="ml-4">
              <div className="flex items-center space-x-2 text-elderberry-600">
                <div className="w-2 h-2 bg-elderberry-600 rounded-full animate-pulse"></div>
                <span className="text-sm">애니메이션 테스트 중...</span>
              </div>
            </MotionFadeIn>
          )}
        </div>
      </div>
    </div>
  );
}