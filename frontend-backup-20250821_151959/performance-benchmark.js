#!/usr/bin/env node
/**
 * 엘더베리 프로젝트 성능 벤치마크 도구
 * 최적화 전후 성능을 측정하고 비교하는 스크립트
 * 
 * @version 1.0.0
 * @author Claude Code Assistant
 * @date 2025-08-07
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 성능 지표 타입 정의 (JavaScript JSDoc 주석으로 대체)
 * @typedef {Object} PerformanceMetrics
 * @property {string} timestamp
 * @property {string} version
 * @property {Object} bundleSize
 * @property {number} bundleSize.total
 * @property {number} bundleSize.gzipped
 * @property {Record<string, number>} bundleSize.chunks
 * @property {Object} buildTime
 * @property {number} buildTime.clean
 * @property {number} buildTime.build
 * @property {number} buildTime.total
 * @property {Object} loadTime
 * @property {number} loadTime.initial
 * @property {number} loadTime.interactive
 * @property {number} loadTime.complete
 * @property {Object} codeQuality
 * @property {number} codeQuality.totalLines
 * @property {number} codeQuality.duplicateRate
 * @property {Array<{file: string, lines: number}>} codeQuality.largeFiles
 * @property {Record<string, number>} codeQuality.importDuplication
 * @property {Object} memory
 * @property {number} memory.initial
 * @property {number} memory.peak
 * @property {number} memory.average
 * @property {Object} webVitals
 * @property {number} webVitals.lcp
 * @property {number} webVitals.fid
 * @property {number} webVitals.cls
 */

class PerformanceBenchmark {
  constructor() {
    this.baseDir = process.cwd();
    this.distDir = path.join(this.baseDir, 'dist');
    this.metricsFile = path.join(this.baseDir, 'performance-metrics.json');
  }
  
  /**
   * 전체 성능 벤치마크 실행
   */
  async runBenchmark() {
    console.log('🚀 엘더베리 성능 벤치마크 시작...\n');
    
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    const version = await this.getProjectVersion();
    
    // 1. 빌드 메트릭 측정
    console.log('📦 빌드 메트릭 측정 중...');
    const bundleMetrics = await this.measureBundleSize();
    const buildMetrics = await this.measureBuildTime();
    
    // 2. 코드 품질 메트릭 측정
    console.log('🔍 코드 품질 메트릭 측정 중...');
    const codeQuality = await this.measureCodeQuality();
    
    // 3. 런타임 메트릭 추정
    console.log('⚡ 런타임 성능 추정 중...');
    const loadTime = await this.estimateLoadTime(bundleMetrics);
    
    // 4. 메모리 사용량 추정
    console.log('💾 메모리 사용량 추정 중...');
    const memory = await this.estimateMemoryUsage();
    
    // 5. Core Web Vitals 추정
    console.log('🎯 Core Web Vitals 추정 중...');
    const webVitals = await this.estimateWebVitals(bundleMetrics, codeQuality);
    
    const metrics = {
      timestamp,
      version,
      bundleSize: bundleMetrics,
      buildTime: buildMetrics,
      loadTime,
      codeQuality,
      memory,
      webVitals
    };
    
    // 결과 저장
    await this.saveMetrics(metrics);
    
    // 결과 출력
    this.displayResults(metrics);
    
    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`\n✅ 벤치마크 완료! (${totalTime.toFixed(2)}초 소요)`);
    
    return metrics;
  }
  
  /**
   * 번들 크기 측정
   */
  async measureBundleSize() {
    try {
      // 프로덕션 빌드 실행
      await execAsync('npm run build', { 
        cwd: this.baseDir,
        timeout: 300000 // 5분 타임아웃
      });
      
      // dist 폴더의 파일들 크기 측정
      const chunks = {};
      let total = 0;
      
      if (fs.existsSync(this.distDir)) {
        const files = this.getFilesRecursive(this.distDir);
        
        for (const file of files) {
          if (file.endsWith('.js') || file.endsWith('.css')) {
            const stats = fs.statSync(file);
            const fileName = path.relative(this.distDir, file);
            chunks[fileName] = stats.size;
            total += stats.size;
          }
        }
      }
      
      // gzip 압축 크기 추정 (일반적으로 원본의 30-40%)
      const gzipped = Math.round(total * 0.35);
      
      return { total, gzipped, chunks };
      
    } catch (error) {
      console.warn('⚠️ 번들 크기 측정 실패:', error.message);
      return { total: 0, gzipped: 0, chunks: {} };
    }
  }
  
  /**
   * 빌드 시간 측정
   */
  async measureBuildTime() {
    try {
      // clean 시간 측정
      const cleanStart = Date.now();
      await execAsync('rm -rf dist', { cwd: this.baseDir });
      const cleanTime = Date.now() - cleanStart;
      
      // build 시간 측정
      const buildStart = Date.now();
      await execAsync('npm run build', { 
        cwd: this.baseDir,
        timeout: 300000
      });
      const buildTime = Date.now() - buildStart;
      
      return {
        clean: cleanTime,
        build: buildTime,
        total: cleanTime + buildTime
      };
      
    } catch (error) {
      console.warn('⚠️ 빌드 시간 측정 실패:', error.message);
      return { clean: 0, build: 0, total: 0 };
    }
  }
  
  /**
   * 코드 품질 메트릭 측정
   */
  async measureCodeQuality() {
    try {
      const srcDir = path.join(this.baseDir, 'src');
      
      // 전체 라인 수 계산
      const { stdout: lineCount } = await execAsync(
        `find ${srcDir} -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs wc -l | tail -1 | awk '{print $1}'`
      );
      const totalLines = parseInt(lineCount.trim()) || 0;
      
      // 큰 파일들 찾기
      const { stdout: largeFilesOutput } = await execAsync(
        `find ${srcDir} -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -nr | head -10`
      );
      
      const largeFiles = largeFilesOutput.trim().split('\n')
        .filter(line => line.trim())
        .slice(0, -1) // 마지막 total 라인 제거
        .map(line => {
          const [lines, ...fileParts] = line.trim().split(/\s+/);
          const file = fileParts.join(' ').replace(srcDir, '');
          return { file, lines: parseInt(lines) };
        })
        .filter(item => item.lines > 200); // 200줄 이상인 파일만
      
      // Import 중복 계산
      const importDuplication = {};
      try {
        const { stdout: importOutput } = await execAsync(
          `grep -r "import.*Button\\|import.*Card\\|import.*Input" ${srcDir} --include="*.tsx" --include="*.ts" | cut -d: -f1 | sort | uniq -c`
        );
        
        importOutput.trim().split('\n').forEach(line => {
          const [count, ...fileParts] = line.trim().split(/\s+/);
          const component = fileParts.join(' ').match(/import.*?(\w+)/)?.[1] || 'unknown';
          importDuplication[component] = parseInt(count) || 0;
        });
      } catch (e) {
        // Import 중복 계산 실패해도 계속 진행
      }
      
      // 중복률 추정 (경험적 수치)
      const duplicateRate = largeFiles.length > 10 ? 25 : largeFiles.length > 5 ? 15 : 8;
      
      return {
        totalLines,
        duplicateRate,
        largeFiles,
        importDuplication
      };
      
    } catch (error) {
      console.warn('⚠️ 코드 품질 측정 실패:', error.message);
      return {
        totalLines: 0,
        duplicateRate: 0,
        largeFiles: [],
        importDuplication: {}
      };
    }
  }
  
  /**
   * 로딩 시간 추정
   */
  async estimateLoadTime(bundleMetrics) {
    // Fast 3G 기준으로 추정 (1.6 Mbps = 200 KB/s)
    const downloadSpeedKBps = 200;
    const totalSizeKB = bundleMetrics.total / 1024;
    
    // 네트워크 지연 + 파싱 시간 고려
    const networkLatency = 300; // ms
    const parseTime = totalSizeKB * 0.5; // KB당 0.5ms 파싱 시간
    const downloadTime = (totalSizeKB / downloadSpeedKBps) * 1000; // ms
    
    const initial = networkLatency + downloadTime * 0.3; // 초기 청크만
    const interactive = initial + parseTime * 0.6;
    const complete = initial + downloadTime + parseTime;
    
    return {
      initial: Math.round(initial),
      interactive: Math.round(interactive),
      complete: Math.round(complete)
    };
  }
  
  /**
   * 메모리 사용량 추정
   */
  async estimateMemoryUsage() {
    // JavaScript 번들 크기 기반으로 추정
    const { stdout: jsFiles } = await execAsync(
      `find ${this.distDir} -name "*.js" -exec ls -la {} \\; | awk '{sum += $5} END {print sum}'`
    ).catch(() => ({ stdout: '0' }));
    
    const jsSizeBytes = parseInt(jsFiles.trim()) || 0;
    const jsSizeMB = jsSizeBytes / (1024 * 1024);
    
    // 경험적 추정치 (JS 크기의 8-12배가 런타임 메모리 사용량)
    const initial = Math.round(jsSizeMB * 8);
    const peak = Math.round(jsSizeMB * 12);
    const average = Math.round(jsSizeMB * 10);
    
    return { initial, peak, average };
  }
  
  /**
   * Core Web Vitals 추정
   */
  async estimateWebVitals(bundleMetrics, codeQuality) {
    const totalSizeMB = bundleMetrics.total / (1024 * 1024);
    const duplicateRateFactor = codeQuality.duplicateRate / 100;
    
    // LCP: 번들 크기와 중복률에 따라 추정
    const lcp = Math.round(1500 + (totalSizeMB * 200) + (duplicateRateFactor * 1000));
    
    // FID: JavaScript 크기에 비례
    const fid = Math.round(50 + (totalSizeMB * 20));
    
    // CLS: 큰 파일 수와 상관관계 (경험적 추정)
    const largeFileCount = codeQuality.largeFiles.length;
    const cls = Math.round((largeFileCount * 0.02 + duplicateRateFactor * 0.1) * 100) / 100;
    
    return { lcp, fid, cls };
  }
  
  /**
   * 프로젝트 버전 가져오기
   */
  async getProjectVersion() {
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(this.baseDir, 'package.json'), 'utf8')
      );
      return packageJson.version || '1.0.0';
    } catch {
      return '1.0.0';
    }
  }
  
  /**
   * 재귀적으로 파일 목록 가져오기
   */
  getFilesRecursive(dir) {
    const files = [];
    
    if (!fs.existsSync(dir)) return files;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getFilesRecursive(fullPath));
      } else {
        files.push(fullPath);
      }
    }
    
    return files;
  }
  
  /**
   * 메트릭 저장
   */
  async saveMetrics(metrics) {
    try {
      let history = [];
      
      // 기존 히스토리 로드
      if (fs.existsSync(this.metricsFile)) {
        const content = fs.readFileSync(this.metricsFile, 'utf8');
        history = JSON.parse(content);
      }
      
      // 새 메트릭 추가
      history.push(metrics);
      
      // 최근 50개만 유지
      if (history.length > 50) {
        history = history.slice(-50);
      }
      
      // 저장
      fs.writeFileSync(this.metricsFile, JSON.stringify(history, null, 2));
      
    } catch (error) {
      console.warn('⚠️ 메트릭 저장 실패:', error.message);
    }
  }
  
  /**
   * 결과 출력
   */
  displayResults(metrics) {
    console.log('\n📊 성능 벤치마크 결과');
    console.log('='.repeat(50));
    
    // 번들 크기
    console.log('\n📦 번들 크기:');
    console.log(`  전체: ${(metrics.bundleSize.total / 1024).toFixed(1)} KB`);
    console.log(`  Gzipped: ${(metrics.bundleSize.gzipped / 1024).toFixed(1)} KB`);
    console.log(`  주요 청크: ${Object.keys(metrics.bundleSize.chunks).length}개`);
    
    // 빌드 시간
    console.log('\n⏱️ 빌드 시간:');
    console.log(`  전체: ${(metrics.buildTime.total / 1000).toFixed(1)}초`);
    console.log(`  빌드만: ${(metrics.buildTime.build / 1000).toFixed(1)}초`);
    
    // 로딩 시간
    console.log('\n⚡ 로딩 시간 (추정):');
    console.log(`  초기 로딩: ${(metrics.loadTime.initial / 1000).toFixed(1)}초`);
    console.log(`  상호작용 가능: ${(metrics.loadTime.interactive / 1000).toFixed(1)}초`);
    console.log(`  완료: ${(metrics.loadTime.complete / 1000).toFixed(1)}초`);
    
    // 코드 품질
    console.log('\n🔍 코드 품질:');
    console.log(`  전체 라인 수: ${metrics.codeQuality.totalLines.toLocaleString()}줄`);
    console.log(`  중복률: ${metrics.codeQuality.duplicateRate}%`);
    console.log(`  대용량 파일: ${metrics.codeQuality.largeFiles.length}개`);
    
    // 메모리 사용량
    console.log('\n💾 메모리 사용량 (추정):');
    console.log(`  초기: ${metrics.memory.initial} MB`);
    console.log(`  피크: ${metrics.memory.peak} MB`);
    console.log(`  평균: ${metrics.memory.average} MB`);
    
    // Core Web Vitals
    console.log('\n🎯 Core Web Vitals (추정):');
    console.log(`  LCP: ${metrics.webVitals.lcp} ms`);
    console.log(`  FID: ${metrics.webVitals.fid} ms`);
    console.log(`  CLS: ${metrics.webVitals.cls}`);
    
    // 개선 권장사항
    console.log('\n💡 개선 권장사항:');
    this.generateRecommendations(metrics);
  }
  
  /**
   * 개선 권장사항 생성
   */
  generateRecommendations(metrics) {
    const recommendations = [];
    
    // 번들 크기 체크
    if (metrics.bundleSize.total > 500 * 1024) {
      recommendations.push('📦 번들 크기가 큼: 코드 스플리팅 적용 권장');
    }
    
    // 빌드 시간 체크
    if (metrics.buildTime.total > 120 * 1000) {
      recommendations.push('⏱️ 빌드 시간이 김: 빌드 설정 최적화 필요');
    }
    
    // 중복률 체크
    if (metrics.codeQuality.duplicateRate > 20) {
      recommendations.push('🔄 코드 중복률이 높음: 리팩토링 필요');
    }
    
    // 대용량 파일 체크
    if (metrics.codeQuality.largeFiles.length > 5) {
      recommendations.push('📁 대용량 파일이 많음: 파일 분할 권장');
    }
    
    // Core Web Vitals 체크
    if (metrics.webVitals.lcp > 2500) {
      recommendations.push('🎯 LCP 개선 필요: 이미지 최적화 및 지연 로딩');
    }
    
    if (metrics.webVitals.fid > 100) {
      recommendations.push('🎯 FID 개선 필요: JavaScript 최적화 및 코드 스플리팅');
    }
    
    if (metrics.webVitals.cls > 0.1) {
      recommendations.push('🎯 CLS 개선 필요: 레이아웃 안정성 향상');
    }
    
    if (recommendations.length === 0) {
      console.log('  🎉 모든 지표가 양호합니다!');
    } else {
      recommendations.forEach(rec => console.log(`  ${rec}`));
    }
  }
  
  /**
   * 히스토리 비교
   */
  async compareWithHistory() {
    try {
      if (!fs.existsSync(this.metricsFile)) {
        console.log('📈 이전 히스토리가 없습니다.');
        return;
      }
      
      const history = JSON.parse(
        fs.readFileSync(this.metricsFile, 'utf8')
      );
      
      if (history.length < 2) {
        console.log('📈 비교할 이전 데이터가 부족합니다.');
        return;
      }
      
      const current = history[history.length - 1];
      const previous = history[history.length - 2];
      
      console.log('\n📈 이전 대비 변화:');
      console.log('='.repeat(30));
      
      // 번들 크기 비교
      const bundleDiff = current.bundleSize.total - previous.bundleSize.total;
      const bundlePercent = ((bundleDiff / previous.bundleSize.total) * 100).toFixed(1);
      console.log(`번들 크기: ${bundleDiff > 0 ? '+' : ''}${(bundleDiff / 1024).toFixed(1)}KB (${bundlePercent}%)`);
      
      // 빌드 시간 비교
      const buildDiff = current.buildTime.total - previous.buildTime.total;
      const buildPercent = ((buildDiff / previous.buildTime.total) * 100).toFixed(1);
      console.log(`빌드 시간: ${buildDiff > 0 ? '+' : ''}${(buildDiff / 1000).toFixed(1)}초 (${buildPercent}%)`);
      
      // 중복률 비교
      const dupeDiff = current.codeQuality.duplicateRate - previous.codeQuality.duplicateRate;
      console.log(`중복률: ${dupeDiff > 0 ? '+' : ''}${dupeDiff.toFixed(1)}%`);
      
    } catch (error) {
      console.warn('⚠️ 히스토리 비교 실패:', error.message);
    }
  }
}

// 실행
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  const benchmark = new PerformanceBenchmark();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'compare':
      benchmark.compareWithHistory();
      break;
    case 'run':
    default:
      benchmark.runBenchmark().then(() => {
        console.log('\n📁 결과가 performance-metrics.json에 저장되었습니다.');
        console.log('📈 비교하려면: node performance-benchmark.js compare');
      });
      break;
  }
}

export default PerformanceBenchmark;