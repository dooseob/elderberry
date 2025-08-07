/**
 * 애니메이션 데모 섹션 - 애니메이션 전문가 구현
 * Hover, Transitions, Loading, Page Transitions 데모
 * 
 * @author 애니메이션 전문가 (서브 에이전트 시스템)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Zap, Loader2 } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/ui';
import { Button } from '@/shared/ui';

const HoverEffectsDemo: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>호버 효과</CardTitle>
        <CardDescription>다양한 호버 애니메이션 효과</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            className="p-6 bg-[var(--linear-color-surface-elevated)] rounded-lg border border-[var(--linear-color-border-default)] cursor-pointer"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <h4 className="font-semibold text-[var(--linear-color-text-primary)]">Scale & Lift</h4>
            <p className="text-sm text-[var(--linear-color-text-secondary)]">마우스를 올려보세요</p>
          </motion.div>
          
          <motion.div
            className="p-6 bg-[var(--linear-color-surface-elevated)] rounded-lg border border-[var(--linear-color-border-default)] cursor-pointer"
            whileHover={{ boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}
          >
            <h4 className="font-semibold text-[var(--linear-color-text-primary)]">Shadow</h4>
            <p className="text-sm text-[var(--linear-color-text-secondary)]">그림자 효과</p>
          </motion.div>
          
          <motion.div
            className="p-6 bg-[var(--linear-color-surface-elevated)] rounded-lg border border-[var(--linear-color-border-default)] cursor-pointer overflow-hidden relative"
            whileHover="hover"
            initial="initial"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[var(--linear-color-accent)]/10 to-transparent"
              variants={{
                initial: { x: '-100%' },
                hover: { x: '100%' }
              }}
              transition={{ duration: 0.6 }}
            />
            <h4 className="font-semibold text-[var(--linear-color-text-primary)] relative z-10">Shimmer</h4>
            <p className="text-sm text-[var(--linear-color-text-secondary)] relative z-10">반짝임 효과</p>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
};

const LoadingStatesDemo: React.FC = () => {
  const [loadingStates, setLoadingStates] = useState({
    spinner: false,
    dots: false,
    pulse: false
  });

  const toggleLoading = (type: keyof typeof loadingStates) => {
    setLoadingStates(prev => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>로딩 상태</CardTitle>
        <CardDescription>다양한 로딩 애니메이션</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center space-y-4">
            <h4 className="font-semibold text-[var(--linear-color-text-primary)]">스피너</h4>
            <div className="h-20 flex items-center justify-center">
              {loadingStates.spinner && (
                <motion.div
                  className="w-8 h-8 border-2 border-[var(--linear-color-accent)] border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleLoading('spinner')}
              icon={loadingStates.spinner ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            >
              {loadingStates.spinner ? '중지' : '시작'}
            </Button>
          </div>

          <div className="text-center space-y-4">
            <h4 className="font-semibold text-[var(--linear-color-text-primary)]">점 애니메이션</h4>
            <div className="h-20 flex items-center justify-center">
              {loadingStates.dots && (
                <div className="flex space-x-1">
                  {[0, 1, 2].map((index) => (
                    <motion.div
                      key={index}
                      className="w-2 h-2 bg-[var(--linear-color-accent)] rounded-full"
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: index * 0.2
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleLoading('dots')}
              icon={loadingStates.dots ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            >
              {loadingStates.dots ? '중지' : '시작'}
            </Button>
          </div>

          <div className="text-center space-y-4">
            <h4 className="font-semibold text-[var(--linear-color-text-primary)]">펄스</h4>
            <div className="h-20 flex items-center justify-center">
              {loadingStates.pulse && (
                <motion.div
                  className="w-8 h-8 bg-[var(--linear-color-accent)] rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleLoading('pulse')}
              icon={loadingStates.pulse ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            >
              {loadingStates.pulse ? '중지' : '시작'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AnimationDemo: React.FC = () => {
  return (
    <div className="animation-demo space-y-8">
      <HoverEffectsDemo />
      <LoadingStatesDemo />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            애니메이션 설정
          </CardTitle>
          <CardDescription>Linear Design System의 애니메이션 토큰</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-[var(--linear-color-text-primary)] mb-2">지속 시간</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Fast</span>
                    <code>150ms</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Normal</span>
                    <code>300ms</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Slow</span>
                    <code>500ms</code>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-[var(--linear-color-text-primary)] mb-2">이징</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Ease In</span>
                    <code>ease-in</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Ease Out</span>
                    <code>ease-out</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Ease In Out</span>
                    <code>ease-in-out</code>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-[var(--linear-color-text-primary)] mb-2">사용법</h4>
                <div className="space-y-2 text-sm text-[var(--linear-color-text-secondary)]">
                  <div>• 상태 변화에 애니메이션 추가</div>
                  <div>• 사용자 피드백 향상</div>
                  <div>• 부드러운 전환 효과</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimationDemo;