/**
 * useRenderingMonitor - 렌더링 성능 모니터링 훅
 * 
 * 무한 렌더링 루프 감지 및 성능 메트릭 수집
 * 개발 환경에서만 동작하여 프로덕션 성능에 영향 없음
 * 
 * @version 1.0.0
 * @author RenderingOptimizationAgent
 */

import { useEffect, useRef, useState } from 'react';

interface RenderingMetrics {
  renderCount: number;
  averageRenderTime: number;
  suspiciousActivity: boolean;
  lastRenderTime: number;
}

interface UseRenderingMonitorOptions {
  componentName: string;
  threshold?: number; // 의심스러운 렌더링 임계값 (기본: 10)
  timeWindow?: number; // 시간 윈도우 ms (기본: 5000)
  enabled?: boolean; // 모니터링 활성화 여부 (기본: 개발 환경에서만)
}

/**
 * 렌더링 성능을 모니터링하고 무한 루프를 감지하는 훅
 */
export const useRenderingMonitor = ({
  componentName,
  threshold = 10,
  timeWindow = 5000,
  enabled = import.meta.env.MODE === 'development'
}: UseRenderingMonitorOptions): RenderingMetrics => {
  const renderCountRef = useRef(0);
  const renderTimesRef = useRef<number[]>([]);
  const startTimeRef = useRef(Date.now());
  const metricsRef = useRef<RenderingMetrics>({
    renderCount: 0,
    averageRenderTime: 0,
    suspiciousActivity: false,
    lastRenderTime: 0
  });
  const suspiciousActivityReportedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const renderStartTime = performance.now();
    renderCountRef.current += 1;
    
    // 렌더링 완료 시점 측정 (상태 업데이트 없이)
    const measureRenderEnd = () => {
      const renderEndTime = performance.now();
      const renderDuration = renderEndTime - renderStartTime;
      const currentTime = Date.now();
      
      renderTimesRef.current.push(renderDuration);
      
      // 시간 윈도우 내의 렌더링만 유지
      const windowStart = currentTime - timeWindow;
      renderTimesRef.current = renderTimesRef.current.filter(
        (_, index) => (currentTime - (timeWindow / renderTimesRef.current.length) * index) > windowStart
      );
      
      const recentRenderCount = renderTimesRef.current.length;
      const averageTime = renderTimesRef.current.reduce((sum, time) => sum + time, 0) / recentRenderCount;
      const isSuspicious = recentRenderCount > threshold;
      
      // 메트릭 업데이트 (ref만 업데이트, 리렌더 방지)
      metricsRef.current = {
        renderCount: renderCountRef.current,
        averageRenderTime: averageTime,
        suspiciousActivity: isSuspicious,
        lastRenderTime: renderDuration
      };
      
      // 의심스러운 활동 감지 시 경고 (한 번만 출력)
      if (isSuspicious && !suspiciousActivityReportedRef.current) {
        suspiciousActivityReportedRef.current = true;
        console.warn(
          `🚨 [Rendering Monitor] Suspicious rendering activity detected in ${componentName}:
          - Render count in ${timeWindow}ms: ${recentRenderCount}
          - Threshold: ${threshold}
          - Average render time: ${averageTime.toFixed(2)}ms
          - This might indicate an infinite rendering loop!`
        );
        
        // 스택 트레이스 출력
        console.trace(`Stack trace for ${componentName} suspicious rendering:`);
      }
      
      // 의심스러운 활동이 멈추면 리포트 리셋
      if (!isSuspicious && suspiciousActivityReportedRef.current) {
        suspiciousActivityReportedRef.current = false;
      }
    };

    // 마이크로태스크로 렌더링 완료 시점 측정 (상태 업데이트 없음)
    Promise.resolve().then(measureRenderEnd);
  });

  // 현재 메트릭 반환 (ref에서 직접 읽음)
  return metricsRef.current;
};

/**
 * 컴포넌트의 props/state 변경 사항을 추적하는 훅
 * 무한 렌더링의 원인이 되는 의존성을 찾는 데 유용
 */
export const useWhyDidYouUpdate = (
  name: string,
  props: Record<string, any>,
  enabled: boolean = import.meta.env.MODE === 'development'
) => {
  const previousProps = useRef<Record<string, any>>();

  useEffect(() => {
    if (!enabled) return;

    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: Record<string, { from: any; to: any }> = {};

      allKeys.forEach(key => {
        if (previousProps.current![key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current![key],
            to: props[key]
          };
        }
      });

      if (Object.keys(changedProps).length) {
        console.log(`[WhyDidYouUpdate] ${name}:`, changedProps);
      }
    }

    previousProps.current = props;
  });
};

/**
 * 특정 의존성 배열의 변경 사항을 추적하는 훅
 * useEffect 의존성 문제 디버깅에 유용
 */
export const useDependencyTracker = (
  name: string,
  dependencies: any[],
  enabled: boolean = import.meta.env.MODE === 'development'
) => {
  const previousDepsRef = useRef<any[]>();

  useEffect(() => {
    if (!enabled) return;

    if (previousDepsRef.current) {
      const changes = dependencies.map((dep, index) => ({
        index,
        previous: previousDepsRef.current![index],
        current: dep,
        changed: previousDepsRef.current![index] !== dep
      })).filter(item => item.changed);

      if (changes.length > 0) {
        console.log(`[DependencyTracker] ${name} - Dependencies changed:`, changes);
      }
    }

    previousDepsRef.current = dependencies;
  });
};