/**
 * 성능 모니터링 유틸리티
 * 메모리 사용량, 렌더링 성능, Core Web Vitals 추적
 */

interface PerformanceMetrics {
  // 메모리 사용량
  memory: {
    heapUsed: number;
    heapTotal: number;
    heapLimit: number;
  };
  // 렌더링 성능
  renderTime: number;
  // Core Web Vitals
  vitals: {
    LCP?: number;
    FID?: number;
    CLS?: number;
  };
  // 네트워크
  network: {
    connectionType: string;
    effectiveType: string;
  };
  // 타임스탬프
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initWebVitals();
    this.initMemoryMonitoring();
  }

  /**
   * Core Web Vitals 모니터링 초기화
   */
  private initWebVitals() {
    try {
      // Largest Contentful Paint (LCP)
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            this.updateVitals({ LCP: lastEntry.startTime });
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        this.observers.push(lcpObserver);

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (entry.name === 'first-input') {
              this.updateVitals({ FID: entry.processingStart - entry.startTime });
            }
          }
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
        this.observers.push(fidObserver);

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          this.updateVitals({ CLS: clsValue });
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        this.observers.push(clsObserver);
      }
    } catch (error) {
      console.warn('Web Vitals 모니터링을 초기화할 수 없습니다:', error);
    }
  }

  /**
   * 메모리 모니터링 초기화
   */
  private initMemoryMonitoring() {
    if (typeof window !== 'undefined') {
      // 5분마다 메모리 사용량 체크
      setInterval(() => {
        this.collectMetrics();
      }, 5 * 60 * 1000);

      // 페이지 언로드 시 메트릭 정리
      window.addEventListener('beforeunload', () => {
        this.cleanup();
      });
    }
  }

  /**
   * 현재 성능 메트릭 수집
   */
  collectMetrics(): PerformanceMetrics {
    const now = performance.now();
    
    const metric: PerformanceMetrics = {
      memory: this.getMemoryInfo(),
      renderTime: this.getRenderTime(),
      vitals: this.getCurrentVitals(),
      network: this.getNetworkInfo(),
      timestamp: Date.now()
    };

    this.metrics.push(metric);
    
    // 최근 100개 메트릭만 유지 (메모리 절약)
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    return metric;
  }

  /**
   * 메모리 사용량 정보 수집
   */
  private getMemoryInfo() {
    const memory = (performance as any).memory;
    if (memory) {
      return {
        heapUsed: memory.usedJSHeapSize / 1024 / 1024, // MB
        heapTotal: memory.totalJSHeapSize / 1024 / 1024, // MB
        heapLimit: memory.jsHeapSizeLimit / 1024 / 1024 // MB
      };
    }
    
    return {
      heapUsed: 0,
      heapTotal: 0,
      heapLimit: 0
    };
  }

  /**
   * 렌더링 시간 측정
   */
  private getRenderTime(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : 0;
  }

  /**
   * 현재 Web Vitals 상태
   */
  private getCurrentVitals() {
    return this.metrics.length > 0 
      ? this.metrics[this.metrics.length - 1].vitals 
      : {};
  }

  /**
   * Web Vitals 업데이트
   */
  private updateVitals(vitals: Partial<PerformanceMetrics['vitals']>) {
    const currentMetric = this.metrics[this.metrics.length - 1];
    if (currentMetric) {
      currentMetric.vitals = { ...currentMetric.vitals, ...vitals };
    }
  }

  /**
   * 네트워크 정보 수집
   */
  private getNetworkInfo() {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      return {
        connectionType: connection.type || 'unknown',
        effectiveType: connection.effectiveType || 'unknown'
      };
    }
    
    return {
      connectionType: 'unknown',
      effectiveType: 'unknown'
    };
  }

  /**
   * 성능 경고 체크
   */
  checkPerformanceWarnings(): Array<{type: string, message: string, severity: 'low' | 'medium' | 'high'}> {
    const warnings = [];
    const latestMetric = this.metrics[this.metrics.length - 1];
    
    if (!latestMetric) return warnings;

    // 메모리 사용량 경고
    if (latestMetric.memory.heapUsed > 100) { // 100MB 이상
      warnings.push({
        type: 'memory',
        message: `메모리 사용량이 ${latestMetric.memory.heapUsed.toFixed(1)}MB입니다. 최적화가 필요할 수 있습니다.`,
        severity: latestMetric.memory.heapUsed > 200 ? 'high' : 'medium'
      });
    }

    // LCP 경고 (2.5초 이상)
    if (latestMetric.vitals.LCP && latestMetric.vitals.LCP > 2500) {
      warnings.push({
        type: 'lcp',
        message: `Largest Contentful Paint가 ${(latestMetric.vitals.LCP / 1000).toFixed(1)}초입니다. 2.5초 이하로 개선하세요.`,
        severity: latestMetric.vitals.LCP > 4000 ? 'high' : 'medium'
      });
    }

    // FID 경고 (100ms 이상)
    if (latestMetric.vitals.FID && latestMetric.vitals.FID > 100) {
      warnings.push({
        type: 'fid',
        message: `First Input Delay가 ${latestMetric.vitals.FID.toFixed(1)}ms입니다. 100ms 이하로 개선하세요.`,
        severity: latestMetric.vitals.FID > 300 ? 'high' : 'medium'
      });
    }

    // CLS 경고 (0.1 이상)
    if (latestMetric.vitals.CLS && latestMetric.vitals.CLS > 0.1) {
      warnings.push({
        type: 'cls',
        message: `Cumulative Layout Shift가 ${latestMetric.vitals.CLS.toFixed(3)}입니다. 0.1 이하로 개선하세요.`,
        severity: latestMetric.vitals.CLS > 0.25 ? 'high' : 'medium'
      });
    }

    return warnings;
  }

  /**
   * 성능 리포트 생성
   */
  generateReport() {
    if (this.metrics.length === 0) {
      return null;
    }

    const latestMetric = this.metrics[this.metrics.length - 1];
    const warnings = this.checkPerformanceWarnings();

    return {
      timestamp: new Date().toISOString(),
      summary: {
        memoryUsage: latestMetric.memory.heapUsed.toFixed(1) + 'MB',
        lcp: latestMetric.vitals.LCP ? (latestMetric.vitals.LCP / 1000).toFixed(1) + 's' : 'N/A',
        fid: latestMetric.vitals.FID ? latestMetric.vitals.FID.toFixed(1) + 'ms' : 'N/A',
        cls: latestMetric.vitals.CLS ? latestMetric.vitals.CLS.toFixed(3) : 'N/A'
      },
      warnings,
      recommendations: this.getRecommendations(warnings)
    };
  }

  /**
   * 성능 개선 권장사항
   */
  private getRecommendations(warnings: Array<{type: string, severity: string}>) {
    const recommendations = [];

    const hasMemoryWarning = warnings.some(w => w.type === 'memory');
    const hasLCPWarning = warnings.some(w => w.type === 'lcp');
    const hasFIDWarning = warnings.some(w => w.type === 'fid');
    const hasCLSWarning = warnings.some(w => w.type === 'cls');

    if (hasMemoryWarning) {
      recommendations.push('메모리 사용량 최적화: React.memo, useMemo, useCallback 활용');
      recommendations.push('불필요한 리렌더링 방지: 상태 관리 최적화');
    }

    if (hasLCPWarning) {
      recommendations.push('이미지 최적화: WebP 포맷, 지연 로딩 적용');
      recommendations.push('번들 크기 최적화: 코드 스플리팅, Tree Shaking');
    }

    if (hasFIDWarning) {
      recommendations.push('JavaScript 실행 최적화: 무거운 연산 Web Worker로 이동');
      recommendations.push('이벤트 핸들러 최적화: debounce, throttle 적용');
    }

    if (hasCLSWarning) {
      recommendations.push('레이아웃 안정성: 이미지, 광고 영역 크기 고정');
      recommendations.push('폰트 로딩 최적화: font-display: swap 사용');
    }

    return recommendations;
  }

  /**
   * 정리 작업
   */
  cleanup() {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers = [];
    this.metrics = [];
  }

  /**
   * 현재 메트릭 가져오기
   */
  getMetrics() {
    return [...this.metrics];
  }

  /**
   * 메트릭 초기화
   */
  clearMetrics() {
    this.metrics = [];
  }
}

// 싱글톤 인스턴스
export const performanceMonitor = new PerformanceMonitor();

// React Hook으로 사용할 수 있는 래퍼
export const usePerformanceMonitor = () => {
  const collectMetrics = () => performanceMonitor.collectMetrics();
  const generateReport = () => performanceMonitor.generateReport();
  const getWarnings = () => performanceMonitor.checkPerformanceWarnings();
  
  return {
    collectMetrics,
    generateReport,
    getWarnings
  };
};

export default performanceMonitor;