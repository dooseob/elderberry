/**
 * 로그기반 디버깅 시스템 서브에이전트
 * Java 백엔드 로그 분석, 자동 진단, 패턴 인식
 * Spring Boot 로그 파일과 실시간 로그 스트림 분석
 */

const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

class LogBasedDebuggingAgent {
    constructor() {
        this.name = 'LogBasedDebuggingAgent';
        this.version = '2.0.0';
        this.capabilities = [
            'log_analysis',
            'error_pattern_recognition',
            'performance_monitoring',
            'automatic_diagnosis',
            'suggestion_generation'
        ];

        this.logPatterns = new Map();
        this.errorDatabase = new Map();
        this.performanceMetrics = new Map();
        this.analysisHistory = [];
        this.realTimeMonitoring = false;

        this.initializeLogPatterns();
        console.log('📊 로그기반 디버깅 시스템 서브에이전트 초기화 완료');
    }

    /**
     * 로그 패턴 초기화
     */
    initializeLogPatterns() {
        // Spring Boot 에러 패턴
        this.logPatterns.set('spring_errors', {
            'NullPointerException': {
                severity: 'HIGH',
                category: 'RUNTIME_ERROR',
                description: 'Null 값 접근으로 인한 예외',
                commonCauses: [
                    '초기화되지 않은 객체 접근',
                    'Optional 미사용',
                    'null 체크 누락'
                ],
                solutions: [
                    'null 체크 추가',
                    'Optional 사용',
                    '@Nullable/@NonNull 어노테이션 활용'
                ]
            },
            'DataIntegrityViolationException': {
                severity: 'HIGH',
                category: 'DATABASE_ERROR',
                description: '데이터베이스 제약 조건 위반',
                commonCauses: [
                    '중복 키 삽입',
                    '외래키 제약 위반',
                    'NOT NULL 제약 위반'
                ],
                solutions: [
                    '데이터 유효성 검증 강화',
                    '트랜잭션 처리 개선',
                    '데이터베이스 제약 조건 재검토'
                ]
            },
            'ValidationException': {
                severity: 'MEDIUM',
                category: 'VALIDATION_ERROR',
                description: '입력값 유효성 검증 실패',
                commonCauses: [
                    '@Valid 어노테이션 누락',
                    '잘못된 입력 데이터',
                    '제약 조건 위반'
                ],
                solutions: [
                    'DTO 유효성 검증 강화',
                    '프론트엔드 입력 검증 추가',
                    '에러 메시지 개선'
                ]
            },
            'AuthenticationException': {
                severity: 'HIGH',
                category: 'SECURITY_ERROR',
                description: '인증 실패',
                commonCauses: [
                    '잘못된 자격증명',
                    '토큰 만료',
                    '권한 부족'
                ],
                solutions: [
                    '인증 로직 재검토',
                    '토큰 갱신 로직 확인',
                    '권한 설정 점검'
                ]
            }
        });

        // 성능 패턴
        this.logPatterns.set('performance_patterns', {
            'slow_query': {
                threshold: 1000, // 1초
                description: '느린 데이터베이스 쿼리',
                solutions: [
                    '인덱스 추가',
                    '쿼리 최적화',
                    '페이징 적용'
                ]
            },
            'high_memory_usage': {
                threshold: 85, // 85%
                description: '높은 메모리 사용률',
                solutions: [
                    '메모리 누수 점검',
                    'GC 튜닝',
                    '객체 생성 최적화'
                ]
            },
            'slow_request': {
                threshold: 5000, // 5초
                description: '느린 HTTP 요청',
                solutions: [
                    '비즈니스 로직 최적화',
                    '캐싱 적용',
                    '비동기 처리 고려'
                ]
            }
        });

        // Spring Boot 로그 레벨 패턴
        this.logPatterns.set('log_levels', {
            'ERROR': { priority: 1, action: 'immediate_attention' },
            'WARN': { priority: 2, action: 'review_required' },
            'INFO': { priority: 3, action: 'informational' },
            'DEBUG': { priority: 4, action: 'development_only' }
        });
    }

    /**
     * 로그 파일 분석
     */
    async analyzeLogFile(logFilePath, options = {}) {
        console.log(`📋 로그 파일 분석 시작: ${logFilePath}`);
        
        try {
            const analysis = {
                timestamp: new Date().toISOString(),
                filePath: logFilePath,
                fileSize: 0,
                lineCount: 0,
                errors: [],
                warnings: [],
                performance: [],
                patterns: [],
                summary: {},
                recommendations: []
            };

            // 파일 존재 확인
            const stats = await fs.stat(logFilePath);
            analysis.fileSize = stats.size;

            // 로그 파일 읽기
            const logContent = await fs.readFile(logFilePath, 'utf8');
            const lines = logContent.split('\n');
            analysis.lineCount = lines.length;

            console.log(`📄 로그 파일 크기: ${Math.round(analysis.fileSize / 1024)}KB, 라인 수: ${analysis.lineCount}`);

            // 라인별 분석
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (!line.trim()) continue;

                // 에러 패턴 분석
                const errorMatch = this.analyzeErrorLine(line, i + 1);
                if (errorMatch) {
                    analysis.errors.push(errorMatch);
                }

                // 경고 패턴 분석
                const warningMatch = this.analyzeWarningLine(line, i + 1);
                if (warningMatch) {
                    analysis.warnings.push(warningMatch);
                }

                // 성능 패턴 분석
                const performanceMatch = this.analyzePerformanceLine(line, i + 1);
                if (performanceMatch) {
                    analysis.performance.push(performanceMatch);
                }

                // 일반 패턴 분석
                const patternMatch = this.analyzeGeneralPattern(line, i + 1);
                if (patternMatch) {
                    analysis.patterns.push(patternMatch);
                }
            }

            // 요약 생성
            analysis.summary = this.generateAnalysisSummary(analysis);
            
            // 권장사항 생성
            analysis.recommendations = await this.generateRecommendations(analysis);

            // 분석 히스토리에 저장
            this.analysisHistory.push(analysis);

            console.log(`✅ 로그 분석 완료 - 에러: ${analysis.errors.length}, 경고: ${analysis.warnings.length}, 성능이슈: ${analysis.performance.length}`);
            
            return analysis;

        } catch (error) {
            console.error('❌ 로그 파일 분석 실패:', error);
            throw error;
        }
    }

    /**
     * 실시간 로그 모니터링
     */
    async startRealTimeMonitoring(logFilePath, callback) {
        console.log(`🔄 실시간 로그 모니터링 시작: ${logFilePath}`);
        
        this.realTimeMonitoring = true;
        
        try {
            // tail 명령어를 사용한 실시간 로그 모니터링
            const tail = spawn('tail', ['-f', logFilePath]);
            
            tail.stdout.on('data', (data) => {
                if (!this.realTimeMonitoring) return;
                
                const lines = data.toString().split('\n');
                
                for (const line of lines) {
                    if (!line.trim()) continue;
                    
                    const analysis = this.analyzeLogLineRealTime(line);
                    
                    if (analysis.severity === 'HIGH' || analysis.severity === 'CRITICAL') {
                        console.log(`🚨 중요 로그 감지: ${analysis.type}`);
                        if (callback) callback(analysis);
                    }
                }
            });

            tail.stderr.on('data', (data) => {
                console.error('로그 모니터링 에러:', data.toString());
            });

            tail.on('close', (code) => {
                console.log(`로그 모니터링 종료 (코드: ${code})`);
                this.realTimeMonitoring = false;
            });

            return tail;

        } catch (error) {
            console.error('❌ 실시간 로그 모니터링 시작 실패:', error);
            this.realTimeMonitoring = false;
            throw error;
        }
    }

    /**
     * 에러 라인 분석
     */
    analyzeErrorLine(line, lineNumber) {
        const errorPatterns = this.logPatterns.get('spring_errors');
        
        // ERROR 레벨 로그인지 확인
        if (!line.includes('ERROR')) return null;
        
        // 패턴 매칭
        for (const [errorType, pattern] of Object.entries(errorPatterns)) {
            if (line.includes(errorType)) {
                return {
                    lineNumber,
                    line: line.trim(),
                    type: errorType,
                    severity: pattern.severity,
                    category: pattern.category,
                    description: pattern.description,
                    timestamp: this.extractTimestamp(line),
                    stackTrace: this.extractStackTrace(line),
                    suggestions: pattern.solutions
                };
            }
        }

        // 일반 에러 패턴
        return {
            lineNumber,
            line: line.trim(),
            type: 'GENERAL_ERROR',
            severity: 'MEDIUM',
            category: 'UNKNOWN',
            description: '일반 에러',
            timestamp: this.extractTimestamp(line),
            suggestions: ['로그 상세 내용 확인', '스택 트레이스 분석']
        };
    }

    /**
     * 경고 라인 분석
     */
    analyzeWarningLine(line, lineNumber) {
        if (!line.includes('WARN')) return null;
        
        return {
            lineNumber,
            line: line.trim(),
            type: 'WARNING',
            severity: 'LOW',
            category: 'WARNING',
            description: '경고 메시지',
            timestamp: this.extractTimestamp(line),
            suggestions: ['근본 원인 파악', '필요시 수정']
        };
    }

    /**
     * 성능 라인 분석
     */
    analyzePerformanceLine(line, lineNumber) {
        const performancePatterns = this.logPatterns.get('performance_patterns');
        
        // 실행 시간 패턴 찾기
        const timeMatch = line.match(/(\d+)ms|(\d+\.\d+)s/);
        if (timeMatch) {
            const timeInMs = timeMatch[1] ? parseInt(timeMatch[1]) : parseFloat(timeMatch[2]) * 1000;
            
            if (timeInMs > performancePatterns.slow_request.threshold) {
                return {
                    lineNumber,
                    line: line.trim(),
                    type: 'SLOW_REQUEST',
                    severity: 'MEDIUM',
                    category: 'PERFORMANCE',
                    executionTime: timeInMs,
                    threshold: performancePatterns.slow_request.threshold,
                    description: performancePatterns.slow_request.description,
                    timestamp: this.extractTimestamp(line),
                    suggestions: performancePatterns.slow_request.solutions
                };
            }
        }

        // SQL 쿼리 성능 분석
        if (line.includes('Hibernate:') || line.includes('SQL')) {
            const sqlTimeMatch = line.match(/(\d+)ms/);
            if (sqlTimeMatch) {
                const queryTime = parseInt(sqlTimeMatch[1]);
                if (queryTime > performancePatterns.slow_query.threshold) {
                    return {
                        lineNumber,
                        line: line.trim(),
                        type: 'SLOW_QUERY',
                        severity: 'HIGH',
                        category: 'DATABASE_PERFORMANCE',
                        executionTime: queryTime,
                        threshold: performancePatterns.slow_query.threshold,
                        description: performancePatterns.slow_query.description,
                        timestamp: this.extractTimestamp(line),
                        suggestions: performancePatterns.slow_query.solutions
                    };
                }
            }
        }

        return null;
    }

    /**
     * 일반 패턴 분석
     */
    analyzeGeneralPattern(line, lineNumber) {
        const patterns = [];
        
        // 로그인 시도 패턴
        if (line.includes('Authentication') || line.includes('login')) {
            patterns.push({
                type: 'AUTHENTICATION_ATTEMPT',
                severity: 'INFO',
                description: '인증 시도 로그'
            });
        }

        // 데이터베이스 연결 패턴
        if (line.includes('datasource') || line.includes('connection')) {
            patterns.push({
                type: 'DATABASE_CONNECTION',
                severity: 'INFO', 
                description: '데이터베이스 연결 관련 로그'
            });
        }

        // 캐시 관련 패턴
        if (line.includes('cache') || line.includes('Cache')) {
            patterns.push({
                type: 'CACHE_OPERATION',
                severity: 'INFO',
                description: '캐시 작업 관련 로그'
            });
        }

        if (patterns.length > 0) {
            return {
                lineNumber,
                line: line.trim(),
                patterns,
                timestamp: this.extractTimestamp(line)
            };
        }

        return null;
    }

    /**
     * 실시간 로그 라인 분석
     */
    analyzeLogLineRealTime(line) {
        // 긴급도 높은 패턴 우선 확인
        if (line.includes('ERROR') && (line.includes('Exception') || line.includes('Error'))) {
            return {
                type: 'CRITICAL_ERROR',
                severity: 'CRITICAL',
                line: line.trim(),
                timestamp: this.extractTimestamp(line),
                action: 'immediate_attention_required'
            };
        }

        if (line.includes('OutOfMemoryError')) {
            return {
                type: 'MEMORY_ERROR',
                severity: 'CRITICAL',
                line: line.trim(),
                timestamp: this.extractTimestamp(line),
                action: 'restart_application'
            };
        }

        if (line.includes('SecurityException') || line.includes('AuthenticationException')) {
            return {
                type: 'SECURITY_ISSUE',
                severity: 'HIGH',
                line: line.trim(),
                timestamp: this.extractTimestamp(line),
                action: 'security_review_needed'
            };
        }

        return {
            type: 'NORMAL',
            severity: 'LOW',
            line: line.trim(),
            timestamp: this.extractTimestamp(line)
        };
    }

    /**
     * 분석 요약 생성
     */
    generateAnalysisSummary(analysis) {
        const summary = {
            totalLines: analysis.lineCount,
            totalErrors: analysis.errors.length,
            totalWarnings: analysis.warnings.length,
            totalPerformanceIssues: analysis.performance.length,
            
            errorBySeverity: {},
            errorByCategory: {},
            performanceStats: {},
            
            criticalIssues: 0,
            highPriorityIssues: 0,
            overallHealth: 'UNKNOWN'
        };

        // 에러 심각도별 분류
        analysis.errors.forEach(error => {
            summary.errorBySeverity[error.severity] = (summary.errorBySeverity[error.severity] || 0) + 1;
            summary.errorByCategory[error.category] = (summary.errorByCategory[error.category] || 0) + 1;
            
            if (error.severity === 'CRITICAL') summary.criticalIssues++;
            if (error.severity === 'HIGH') summary.highPriorityIssues++;
        });

        // 성능 통계
        if (analysis.performance.length > 0) {
            const executionTimes = analysis.performance.map(p => p.executionTime || 0);
            summary.performanceStats = {
                averageTime: Math.round(executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length),
                maxTime: Math.max(...executionTimes),
                minTime: Math.min(...executionTimes),
                slowOperations: analysis.performance.filter(p => p.severity === 'HIGH').length
            };
        }

        // 전체 건강도 평가
        if (summary.criticalIssues > 0) {
            summary.overallHealth = 'CRITICAL';
        } else if (summary.highPriorityIssues > 0) {
            summary.overallHealth = 'WARNING';
        } else if (summary.totalErrors > 0) {
            summary.overallHealth = 'CAUTION';
        } else {
            summary.overallHealth = 'HEALTHY';
        }

        return summary;
    }

    /**
     * 권장사항 생성
     */
    async generateRecommendations(analysis) {
        const recommendations = [];

        // 에러 기반 권장사항
        if (analysis.summary.criticalIssues > 0) {
            recommendations.push({
                priority: 'CRITICAL',
                category: 'ERROR_RESOLUTION',
                title: '긴급 에러 해결 필요',
                description: `${analysis.summary.criticalIssues}개의 긴급 에러가 감지되었습니다.`,
                action: '즉시 에러 로그 확인 및 해결',
                estimatedTime: '30분 이내'
            });
        }

        // 성능 기반 권장사항
        if (analysis.summary.performanceStats.slowOperations > 0) {
            recommendations.push({
                priority: 'HIGH',
                category: 'PERFORMANCE_OPTIMIZATION',
                title: '성능 최적화 필요',
                description: `${analysis.summary.performanceStats.slowOperations}개의 느린 작업이 감지되었습니다.`,
                action: '데이터베이스 쿼리 및 비즈니스 로직 최적화',
                estimatedTime: '1-2시간'
            });
        }

        // 보안 기반 권장사항
        const securityErrors = analysis.errors.filter(e => e.category === 'SECURITY_ERROR');
        if (securityErrors.length > 0) {
            recommendations.push({
                priority: 'HIGH',
                category: 'SECURITY_REVIEW',
                title: '보안 검토 필요',
                description: `${securityErrors.length}개의 보안 관련 에러가 감지되었습니다.`,
                action: '인증/인가 로직 재검토 및 보안 감사',
                estimatedTime: '2-4시간'
            });
        }

        // 모니터링 권장사항
        if (analysis.summary.totalErrors > 10) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'MONITORING_IMPROVEMENT',
                title: '모니터링 강화 권장',
                description: '빈번한 에러 발생으로 모니터링 강화가 필요합니다.',
                action: '알람 설정 및 대시보드 구성',
                estimatedTime: '1시간'
            });
        }

        return recommendations;
    }

    /**
     * 유틸리티 메서드들
     */
    extractTimestamp(line) {
        // Spring Boot 기본 로그 형식에서 타임스탬프 추출
        const timestampMatch = line.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})/);
        return timestampMatch ? timestampMatch[1] : null;
    }

    extractStackTrace(line) {
        // 스택 트레이스 시작 부분 추출 (간단화)
        if (line.includes('at ')) {
            return line.substring(line.indexOf('at '));
        }
        return null;
    }

    /**
     * 로그 패턴 학습
     */
    learnFromAnalysis(analysis, feedback) {
        // 분석 결과에 대한 피드백을 받아 패턴 학습
        if (feedback.accuracy > 0.8) {
            // 정확한 분석이었다면 패턴 강화
            analysis.errors.forEach(error => {
                const key = `${error.type}_${error.category}`;
                const existing = this.errorDatabase.get(key) || { count: 0, confidence: 0.5 };
                this.errorDatabase.set(key, {
                    count: existing.count + 1,
                    confidence: Math.min(existing.confidence + 0.1, 1.0),
                    lastSeen: new Date().toISOString()
                });
            });
        }
    }

    /**
     * 에이전트 상태 조회
     */
    getStatus() {
        return {
            name: this.name,
            version: this.version,
            capabilities: this.capabilities,
            analysisCount: this.analysisHistory.length,
            realTimeMonitoring: this.realTimeMonitoring,
            errorPatternsKnown: this.logPatterns.get('spring_errors') ? Object.keys(this.logPatterns.get('spring_errors')).length : 0,
            performancePatternsKnown: this.logPatterns.get('performance_patterns') ? Object.keys(this.logPatterns.get('performance_patterns')).length : 0,
            learnedPatterns: this.errorDatabase.size,
            memoryUsage: process.memoryUsage()
        };
    }

    /**
     * Spring Boot 로그 파일 자동 찾기
     */
    async findSpringBootLogFiles(projectPath) {
        const logFiles = [];
        const commonLogPaths = [
            path.join(projectPath, 'logs'),
            path.join(projectPath, 'log'),
            path.join(projectPath, 'target', 'logs'),
            path.join(projectPath, 'build', 'logs')
        ];

        for (const logPath of commonLogPaths) {
            try {
                const files = await fs.readdir(logPath);
                for (const file of files) {
                    if (file.endsWith('.log') || file.endsWith('.out')) {
                        logFiles.push(path.join(logPath, file));
                    }
                }
            } catch (e) {
                // 디렉토리가 없으면 무시
            }
        }

        return logFiles;
    }

    /**
     * MCP Task와 연동하여 실행
     */
    async executeWithMCPIntegration(input) {
        const { logFilePath, action = 'analyze', options = {} } = input;
        
        console.log('🤖 LogBasedDebuggingAgent MCP 통합 실행');
        console.log(`📝 Action: ${action}, LogFile: ${logFilePath}`);
        
        try {
            let result;
            
            switch (action) {
                case 'analyze':
                    result = await this.analyzeLogFile(logFilePath, options);
                    break;
                    
                case 'monitor':
                    result = await this.startRealTimeMonitoring(logFilePath, options.callback);
                    break;
                    
                case 'find_logs':
                    result = await this.findSpringBootLogFiles(input.projectPath || process.cwd());
                    break;
                    
                default:
                    throw new Error(`Unknown action: ${action}`);
            }
            
            return {
                success: true,
                agent: this.name,
                action,
                result,
                metadata: {
                    executionTime: Date.now(),
                    patternsUsed: this.logPatterns.size,
                    analysisHistoryCount: this.analysisHistory.length
                }
            };
            
        } catch (error) {
            console.error('❌ LogBasedDebuggingAgent 실행 실패:', error);
            return {
                success: false,
                agent: this.name,
                action,
                error: error.message,
                fallbackSuggestion: '로그 파일 경로와 권한을 확인해보세요.'
            };
        }
    }
}

// 글로벌 인스턴스 생성
const logBasedDebuggingAgent = new LogBasedDebuggingAgent();

/**
 * 에이전트 테스트 함수
 */
async function testLogBasedDebuggingAgent() {
    console.log('🧪 로그기반 디버깅 시스템 서브에이전트 테스트');
    
    try {
        // 1. 로그 파일 찾기 테스트
        console.log('\n📋 1. 로그 파일 찾기 테스트');
        const result1 = await logBasedDebuggingAgent.executeWithMCPIntegration({
            action: 'find_logs',
            projectPath: process.cwd()
        });
        console.log(`결과: ${result1.success ? '✅ 성공' : '❌ 실패'}`);
        if (result1.success) {
            console.log(`발견된 로그 파일: ${result1.result.length}개`);
        }
        
        // 2. 가상 로그 파일 생성 및 분석 테스트 (임시)
        console.log('\n📋 2. 로그 분석 테스트 (시뮬레이션)');
        const sampleLogContent = `
2024-01-27 10:15:30.123 ERROR 12345 --- [main] com.globalcarelink.auth.AuthController : NullPointerException occurred
2024-01-27 10:15:31.456 WARN  12345 --- [main] com.globalcarelink.facility.FacilityService : Slow query detected: 1500ms
2024-01-27 10:15:32.789 INFO  12345 --- [main] com.globalcarelink.Application : Application started successfully
2024-01-27 10:15:33.012 ERROR 12345 --- [main] com.globalcarelink.health.HealthController : DataIntegrityViolationException
        `;
        
        // 임시 로그 파일 생성
        const tempLogPath = path.join(process.cwd(), 'temp_test.log');
        await fs.writeFile(tempLogPath, sampleLogContent);
        
        const result2 = await logBasedDebuggingAgent.executeWithMCPIntegration({
            action: 'analyze',
            logFilePath: tempLogPath
        });
        console.log(`결과: ${result2.success ? '✅ 성공' : '❌ 실패'}`);
        if (result2.success) {
            console.log(`에러: ${result2.result.errors.length}개, 경고: ${result2.result.warnings.length}개`);
            console.log(`전체 건강도: ${result2.result.summary.overallHealth}`);
        }
        
        // 임시 파일 삭제
        await fs.unlink(tempLogPath);
        
    } catch (error) {
        console.error('테스트 실행 중 오류:', error);
    }
    
    // 상태 출력
    console.log('\n📊 에이전트 상태:');
    console.log(logBasedDebuggingAgent.getStatus());
}

module.exports = {
    LogBasedDebuggingAgent,
    logBasedDebuggingAgent,
    testLogBasedDebuggingAgent
};