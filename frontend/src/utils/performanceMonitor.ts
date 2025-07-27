/**
 * 성능 모니터링 유틸리티
 * 지연 로딩 성능 측정 및 최적화 지표 수집
 */
import { devLogger, errorLogger } from './devLogger';

interface PerformanceMetrics {
  pageLoadTime: number;
  chunkLoadTime: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
}

interface ChunkLoadMetrics {
  chunkName: string;
  loadTime: number;
  size?: number;
  cached: boolean;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private chunkMetrics: ChunkLoadMetrics[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  /**
   * Performance Observer 초기화
   */
  private initializeObservers() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      // Largest Contentful Paint 측정
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.metrics.largestContentfulPaint = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // First Contentful Paint 측정
      const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        for (const entry of entries) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime;
          }
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(fcpObserver);

      // Cumulative Layout Shift 측정
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        let clsValue = 0;
        for (const entry of entries) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.metrics.cumulativeLayoutShift = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

      // 리소스 로딩 측정 (청크 파일 포함)
      const resourceObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        for (const entry of entries) {
          if (entry.name.includes('.js') && entry.name.includes('assets')) {
            this.trackChunkLoad(entry as PerformanceResourceTiming);
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);

    } catch (error) {
      errorLogger.warn('PerformanceMonitor Observer 초기화 실패', error);
    }
  }

  /**
   * 청크 로딩 성능 추적
   */
  private trackChunkLoad(entry: PerformanceResourceTiming) {
    const chunkName = this.extractChunkName(entry.name);
    const loadTime = entry.responseEnd - entry.requestStart;
    const cached = entry.transferSize === 0 && entry.decodedBodySize > 0;

    const chunkMetric: ChunkLoadMetrics = {
      chunkName,
      loadTime,
      size: entry.decodedBodySize,
      cached
    };

    this.chunkMetrics.push(chunkMetric);

    devLogger.performance(`Chunk loaded: ${chunkName}${cached ? ' [CACHED]' : ''}`, loadTime);
  }

  /**
   * 청크 이름 추출
   */
  private extractChunkName(url: string): string {
    const match = url.match(/assets\/([^-]+)/);
    return match ? match[1] : 'unknown';
  }

  /**
   * 페이지 로딩 시간 측정 시작
   */
  startPageLoad(pageName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const loadTime = performance.now() - startTime;
      this.metrics.pageLoadTime = loadTime;
      
      if (__DEV__) {
        devLogger.performance(`${pageName} page loaded`, loadTime);
      }
    };
  }

  /**
   * 상호작용 가능 시점 측정
   */
  markTimeToInteractive() {
    this.metrics.timeToInteractive = performance.now();
  }

  /**
   * 성능 메트릭스 수집
   */
  getMetrics(): Partial<PerformanceMetrics> & { chunks: ChunkLoadMetrics[] } {
    return {
      ...this.metrics,
      chunks: this.chunkMetrics
    };
  }

  /**
   * 성능 보고서 생성
   */
  generateReport(): string {
    const metrics = this.getMetrics();
    const report = [
      '📊 성능 보고서',
      '================',
      '',
      '🏃 로딩 성능:',
      `  페이지 로딩: ${metrics.pageLoadTime?.toFixed(2) || 'N/A'}ms`,
      `  첫 콘텐츠 표시: ${metrics.firstContentfulPaint?.toFixed(2) || 'N/A'}ms`,
      `  최대 콘텐츠 표시: ${metrics.largestContentfulPaint?.toFixed(2) || 'N/A'}ms`,
      `  상호작용 가능: ${metrics.timeToInteractive?.toFixed(2) || 'N/A'}ms`,
      '',
      '📦 청크 로딩:',
      ...metrics.chunks.map(chunk => 
        `  ${chunk.chunkName}: ${chunk.loadTime.toFixed(2)}ms (${(chunk.size! / 1024).toFixed(1)}KB)${chunk.cached ? ' [캐시됨]' : ''}`
      ),
      '',
      '⚡ Core Web Vitals:',
      `  LCP: ${this.evaluateMetric(metrics.largestContentfulPaint, [2500, 4000])}`,
      `  CLS: ${this.evaluateMetric(metrics.cumulativeLayoutShift, [0.1, 0.25], true)}`,
      '',
      '💡 최적화 제안:',
      ...this.getOptimizationSuggestions(metrics)
    ];

    return report.join('\n');
  }

  /**
   * 메트릭 평가
   */
  private evaluateMetric(value?: number, thresholds: [number, number] = [0, 0], lowerIsBetter = false): string {
    if (value === undefined) return 'N/A';

    const [good, poor] = thresholds;
    let status: string;
    
    if (lowerIsBetter) {
      status = value <= good ? '✅ 좋음' : value <= poor ? '⚠️ 개선 필요' : '❌ 나쁨';
    } else {
      status = value <= good ? '✅ 좋음' : value <= poor ? '⚠️ 개선 필요' : '❌ 나쁨';
    }
    
    return `${value.toFixed(2)}ms (${status})`;
  }

  /**
   * 최적화 제안 생성
   */
  private getOptimizationSuggestions(metrics: any): string[] {
    const suggestions: string[] = [];

    if (metrics.largestContentfulPaint > 2500) {
      suggestions.push('  - LCP 개선: 이미지 최적화, 중요 리소스 프리로딩 고려');
    }

    if (metrics.cumulativeLayoutShift > 0.1) {
      suggestions.push('  - CLS 개선: 이미지/비디오에 명시적 크기 지정');
    }

    const largeChunks = metrics.chunks.filter((chunk: ChunkLoadMetrics) => 
      chunk.size && chunk.size > 250 * 1024 // 250KB 이상
    );
    
    if (largeChunks.length > 0) {
      suggestions.push('  - 큰 청크 분리: ' + largeChunks.map((c: ChunkLoadMetrics) => c.chunkName).join(', '));
    }

    const slowChunks = metrics.chunks.filter((chunk: ChunkLoadMetrics) => 
      chunk.loadTime > 1000 // 1초 이상
    );
    
    if (slowChunks.length > 0) {
      suggestions.push('  - 느린 청크 최적화: ' + slowChunks.map((c: ChunkLoadMetrics) => c.chunkName).join(', '));
    }

    if (suggestions.length === 0) {
      suggestions.push('  - 모든 지표가 양호합니다! 🎉');
    }

    return suggestions;
  }

  /**
   * 콘솔에 성능 보고서 출력
   */
  logReport() {
    if (__DEV__) {
      devLogger.log(this.generateReport());
    }
  }

  /**
   * 리소스 정리
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// 싱글톤 인스턴스
export const performanceMonitor = new PerformanceMonitor();

// 컴포넌트 성능 측정 훅
export function usePagePerformance(pageName: string) {
  React.useEffect(() => {
    const endMeasurement = performanceMonitor.startPageLoad(pageName);
    
    // 컴포넌트가 마운트된 후 상호작용 가능 상태로 마킹
    const timer = setTimeout(() => {
      performanceMonitor.markTimeToInteractive();
    }, 100);

    return () => {
      endMeasurement();
      clearTimeout(timer);
    };
  }, [pageName]);
}

// 개발 환경에서 성능 보고서 출력 (5초 후)
if (__DEV__) {
  setTimeout(() => {
    performanceMonitor.logReport();
  }, 5000);
}

// React import 추가
import React from 'react';