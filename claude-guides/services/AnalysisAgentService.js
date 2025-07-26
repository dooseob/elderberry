/**
 * AnalysisAgentService
 * 
 * 하위 에이전트를 활용한 AI 분석 시스템
 * SonarQube, Snyk, 과거 경험을 종합하는 분석 오케스트레이터
 */

const logger = require('./DocumentLearningService').logger;
const { spawn, exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const path = require('path');
const fs = require('fs').promises;

class AnalysisAgentService {
    constructor() {
        this.analysisHistory = [];
        this.initialized = false;
    }

    async initialize() {
        try {
            logger.info('AnalysisAgentService 초기화 시작');
            
            // 분석 이력 로드
            await this.loadAnalysisHistory();
            
            this.initialized = true;
            logger.info('AnalysisAgentService 초기화 완료');
            
        } catch (error) {
            logger.error('AnalysisAgentService 초기화 실패', error);
            throw error;
        }
    }

    /**
     * 하위 에이전트를 활용한 종합 분석
     * SonarQube, Snyk, 과거 경험을 통합하여 최종 결과 생성
     */
    async performComprehensiveAnalysis(projectPath, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        const analysisId = this.generateAnalysisId();
        const startTime = Date.now();

        logger.info('하위 에이전트 기반 종합 분석 시작', { analysisId, projectPath });

        try {
            // 1. SonarQube 분석 에이전트 실행
            const sonarAnalysis = await this.runSonarQubeAnalysisAgent(projectPath, options);
            
            // 2. Snyk 보안 분석 에이전트 실행  
            const snykAnalysis = await this.runSnykAnalysisAgent(projectPath, options);
            
            // 3. 과거 경험 분석 에이전트 실행
            const experienceAnalysis = await this.runExperienceAnalysisAgent(projectPath, options);
            
            // 4. 결과 통합 및 권장사항 생성 에이전트 실행
            const integratedResult = await this.runIntegrationAgent({
                sonar: sonarAnalysis,
                snyk: snykAnalysis,
                experience: experienceAnalysis,
                projectPath,
                options
            });

            const finalResult = {
                analysisId,
                timestamp: new Date().toISOString(),
                projectPath,
                duration: Date.now() - startTime,
                results: integratedResult,
                metadata: {
                    agentVersion: '1.0.0',
                    analysisMethod: 'hybrid-agent'
                }
            };

            // 이력에 저장
            await this.saveAnalysisResult(finalResult);

            logger.info('하위 에이전트 기반 종합 분석 완료', { 
                analysisId, 
                duration: finalResult.duration 
            });

            return finalResult;

        } catch (error) {
            logger.error('종합 분석 실패', { analysisId, error });
            throw error;
        }
    }

    /**
     * SonarQube 분석 하위 에이전트 실행
     */
    async runSonarQubeAnalysisAgent(projectPath, options) {
        try {
            // 현재 시스템의 SonarQube 분석 서비스 활용
            const SonarQubeAnalysisService = require('./SonarQubeAnalysisService');
            const sonarService = new SonarQubeAnalysisService();
            
            await sonarService.initialize();
            const result = await sonarService.analyzeProject(projectPath, options);
            
            logger.info('SonarQube 분석 완료', { 
                available: result.available,
                issueCount: result.issues?.length || 0
            });
            
            return result;
        } catch (error) {
            logger.warn('SonarQube 분석 에이전트 실행 실패', error);
            return {
                available: false,
                reason: `SonarQube 분석 실패: ${error.message}`,
                analysis: {},
                issues: [],
                summary: 'SonarQube 분석을 수행할 수 없습니다.'
            };
        }
    }

    /**
     * Snyk 보안 분석 하위 에이전트 실행
     */
    async runSnykAnalysisAgent(projectPath, options) {
        const prompt = `
        Snyk 보안 취약점 분석을 수행해주세요.

        **분석 대상:**
        - 프로젝트 경로: ${projectPath}
        - 분석 옵션: ${JSON.stringify(options)}

        **수행 작업:**
        1. 프로젝트의 의존성 파일 확인:
           - package.json (Node.js)
           - build.gradle.kts (Java/Kotlin)
           - requirements.txt (Python)
           - pom.xml (Maven)
        
        2. 알려진 보안 취약점 패턴 검색:
           - SQL Injection 가능성
           - XSS 취약점
           - 인증/인가 우회
           - 민감 정보 노출
           - 의존성 보안 이슈

        3. 코드에서 보안 취약점 패턴 분석:
           - 하드코딩된 시크릿
           - 안전하지 않은 암호화
           - 입력 검증 부족
           - CORS 설정 문제

        **결과 형식:**
        {
          "available": true/false,
          "vulnerabilities": [
            {
              "severity": "critical|high|medium|low",
              "title": "취약점 제목",
              "description": "취약점 설명",
              "file": "파일경로",
              "line": 라인번호,
              "cve": "CVE-번호",
              "recommendation": "해결 방법"
            }
          ],
          "summary": {
            "critical": 수치,
            "high": 수치, 
            "medium": 수치,
            "low": 수치,
            "total": 수치
          }
        }

        실제 코드 파일들을 검토하여 보안 취약점을 찾아주세요.
        `;

        try {
            return await Task.run({
                description: "Snyk 보안 분석",
                prompt
            });
        } catch (error) {
            logger.warn('Snyk 분석 에이전트 실행 실패', error);
            return {
                available: false,
                reason: `Snyk 분석 실패: ${error.message}`,
                vulnerabilities: [],
                summary: { critical: 0, high: 0, medium: 0, low: 0, total: 0 }
            };
        }
    }

    /**
     * 과거 경험 분석 하위 에이전트 실행
     */
    async runExperienceAnalysisAgent(projectPath, options) {
        const prompt = `
        과거 경험 기반 분석을 수행해주세요.

        **분석 대상:**
        - 프로젝트 경로: ${projectPath}
        - 분석 옵션: ${JSON.stringify(options)}

        **수행 작업:**
        1. troubleshooting/solutions-db.md 파일 검토
        2. 과거 해결된 이슈들과 현재 코드베이스 비교
        3. 유사한 패턴의 문제점 예측
        4. 성공적으로 적용된 해결책 식별

        **분석할 영역:**
        - Spring Boot 컴파일 에러 패턴
        - JWT 인증 관련 이슈
        - Repository 메서드 시그니처 문제
        - 엔티티 getter/setter 누락
        - DTO 타입 불일치
        - 의존성 충돌

        **결과 형식:**
        {
          "available": true/false,
          "solutions": [
            {
              "issue": "문제 설명",
              "solution": "해결 방법",
              "confidence": 0.0-1.0,
              "tags": ["태그1", "태그2"],
              "dateResolved": "해결 날짜",
              "effort": "예상 소요시간",
              "success": true/false
            }
          ],
          "predictions": [
            {
              "issue": "예상 문제",
              "probability": 0.0-1.0,
              "prevention": "예방 방법"
            }
          ],
          "patterns": {
            "recurring": ["반복되는 문제들"],
            "resolved": ["해결된 문제들"],
            "pending": ["미해결 문제들"]  
          }
        }

        실제 파일들을 읽고 과거 경험과 비교 분석해주세요.
        `;

        try {
            return await Task.run({
                description: "과거 경험 분석",
                prompt
            });
        } catch (error) {
            logger.warn('경험 분석 에이전트 실행 실패', error);
            return {
                available: false,
                reason: `경험 분석 실패: ${error.message}`,
                solutions: [],
                predictions: [],
                patterns: { recurring: [], resolved: [], pending: [] }
            };
        }
    }

    /**
     * 결과 통합 및 권장사항 생성 하위 에이전트 실행
     */
    async runIntegrationAgent(analysisData) {
        const prompt = `
        다음 분석 결과들을 통합하여 최종 권장사항을 생성해주세요.

        **입력 데이터:**
        ${JSON.stringify(analysisData, null, 2)}

        **수행 작업:**
        1. 각 분석 결과의 상관관계 분석
        2. 우선순위 기반 이슈 정리
        3. 실행 가능한 해결책 제시
        4. 과거 경험과 현재 이슈 연계

        **특별히 주목할 패턴:**
        - Snyk 보안 취약점 + 과거 유사 해결 사례
        - SonarQube 코드 품질 이슈 + 과거 수정 경험  
        - 반복되는 문제 패턴과 근본 원인

        **결과 형식:**
        {
          "integrated": {
            "sonarqube": 처리된_sonar_결과,
            "snyk": 처리된_snyk_결과,
            "experience": 처리된_경험_결과,
            "correlations": [
              {
                "type": "correlation_type",
                "description": "상관관계 설명",
                "confidence": 0.0-1.0,
                "evidence": ["증거들"]
              }
            ],
            "riskScore": 0-10,
            "confidence": 0.0-1.0
          },
          "recommendations": [
            {
              "priority": "critical|high|medium|low",
              "title": "권장사항 제목",
              "description": "Snyk에서 XSS 취약점이 발견되었습니다. 과거 우리 프로젝트에서는 유사 이슈를 'DOMPurify' 라이브러리로 해결한 이력이 있습니다.",
              "actions": ["실행할 작업들"],
              "evidence": {
                "current": "현재 발견된 이슈",
                "historical": "과거 해결 경험"
              },
              "estimatedEffort": "예상 작업 시간"
            }
          ],
          "summary": {
            "totalIssues": 숫자,
            "criticalRecommendations": 숫자,
            "overallRisk": "high|medium|low",
            "keyInsights": ["주요 인사이트들"]
          }
        }

        과거 경험과 현재 분석을 연계하여 실용적인 가이드를 제공해주세요.
        `;

        try {
            return await Task.run({
                description: "분석 결과 통합",
                prompt
            });
        } catch (error) {
            logger.error('통합 분석 에이전트 실행 실패', error);
            throw error;
        }
    }

    /**
     * 예측적 이슈 해결 분석
     */
    async predictIssueResolution(issue, context = {}) {
        const prompt = `
        다음 이슈에 대한 예측적 해결 분석을 수행해주세요.

        **이슈:** ${issue}
        **컨텍스트:** ${JSON.stringify(context)}

        **수행 작업:**
        1. troubleshooting/solutions-db.md에서 유사 이슈 검색
        2. 과거 해결 패턴 분석
        3. 해결 방법 예측 및 신뢰도 평가
        4. 예상 소요 시간 및 복잡도 평가

        **결과 형식:**
        {
          "issue": "${issue}",
          "predictions": [
            {
              "solution": "예상 해결 방법",
              "confidence": 0.0-1.0,
              "effort": "low|medium|high",
              "steps": ["실행 단계들"],
              "risks": ["잠재적 위험들"],
              "basedOn": "과거 유사 사례"
            }
          ],
          "recommendedSolution": {
            "title": "권장 해결책",
            "description": "상세 설명",
            "implementation": "구현 방법"
          },
          "estimatedEffort": "예상 작업 시간",
          "confidence": 0.0-1.0
        }

        실제 과거 경험 데이터를 바탕으로 분석해주세요.
        `;

        try {
            return await Task.run({
                description: "이슈 해결 예측",
                prompt
            });
        } catch (error) {
            logger.error('예측 분석 실패', error);
            throw error;
        }
    }

    /**
     * 솔루션 기록 (피드백 루프)
     */
    async logSolution(issue, fix, metadata = {}) {
        const prompt = `
        다음 해결 사례를 solutions-db.md 파일에 기록해주세요.

        **이슈:** ${issue}
        **해결책:** ${fix}
        **메타데이터:** ${JSON.stringify(metadata)}

        **수행 작업:**
        1. troubleshooting/solutions-db.md 파일 읽기
        2. 새로운 해결 사례 추가
        3. 유사한 기존 사례가 있다면 업데이트
        4. 태그 및 카테고리 분류
        5. 검색 가능한 형태로 구조화

        **기록 형식:**
        ## ${new Date().toISOString().split('T')[0]} - ${issue}

        **문제:** ${issue}
        **해결책:** ${fix}
        **태그:** #자동생성_태그 #카테고리
        **소요시간:** ${metadata.effort || 'unknown'}
        **성공여부:** ${metadata.success ? 'success' : 'pending'}
        **추가정보:** ${JSON.stringify(metadata)}

        기존 파일에 새로운 항목을 추가해주세요.
        `;

        try {
            await Task.run({
                description: "솔루션 기록",
                prompt
            });

            logger.info('솔루션 기록 완료', { issue, fix });
        } catch (error) {
            logger.error('솔루션 기록 실패', error);
            throw error;
        }
    }

    /**
     * 대시보드 데이터 생성
     */
    async getDashboardData() {
        try {
            const recentAnalyses = this.analysisHistory.slice(-10);
            
            return {
                summary: {
                    totalAnalyses: this.analysisHistory.length,
                    recentAnalyses: recentAnalyses.length,
                    averageRiskScore: this.calculateAverageRiskScore(recentAnalyses),
                    lastAnalysis: recentAnalyses[recentAnalyses.length - 1]?.timestamp
                },
                trends: this.calculateTrends(recentAnalyses),
                topIssues: this.getTopIssues(recentAnalyses),
                recentRecommendations: this.getRecentRecommendations(recentAnalyses)
            };
        } catch (error) {
            logger.error('대시보드 데이터 생성 실패', error);
            throw error;
        }
    }

    // ===== 유틸리티 메서드 =====

    generateAnalysisId() {
        return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async saveAnalysisResult(result) {
        this.analysisHistory.push(result);
        
        // 최근 50개만 메모리에 유지
        if (this.analysisHistory.length > 50) {
            this.analysisHistory = this.analysisHistory.slice(-50);
        }

        // 파일로도 저장
        try {
            const historyPath = path.join(__dirname, '../data/analysis-history.json');
            await fs.writeFile(historyPath, JSON.stringify(this.analysisHistory, null, 2));
        } catch (error) {
            logger.warn('분석 이력 파일 저장 실패', error);
        }
    }

    async loadAnalysisHistory() {
        try {
            const historyPath = path.join(__dirname, '../data/analysis-history.json');
            const data = await fs.readFile(historyPath, 'utf8');
            this.analysisHistory = JSON.parse(data);
            logger.info(`분석 이력 로드 완료: ${this.analysisHistory.length}개`);
        } catch (error) {
            logger.info('분석 이력 파일이 없어 새로 시작합니다');
            this.analysisHistory = [];
        }
    }

    calculateAverageRiskScore(analyses) {
        if (analyses.length === 0) return 0;
        
        const scores = analyses
            .map(a => a.results?.integrated?.riskScore || 0)
            .filter(score => score > 0);
            
        return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    }

    calculateTrends(analyses) {
        // 간단한 트렌드 분석 (실제로는 더 정교하게 구현)
        return {
            riskScoreTrend: analyses.map(a => a.results?.integrated?.riskScore || 0),
            analysisFrequency: analyses.reduce((acc, a) => {
                const date = a.timestamp.split('T')[0];
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {})
        };
    }

    getTopIssues(analyses) {
        // 최근 분석에서 가장 많이 발견된 이슈 타입들
        const issueTypes = {};
        
        analyses.forEach(analysis => {
            const recommendations = analysis.results?.recommendations || [];
            recommendations.forEach(rec => {
                issueTypes[rec.title] = (issueTypes[rec.title] || 0) + 1;
            });
        });

        return Object.entries(issueTypes)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([title, count]) => ({ title, count }));
    }

    getRecentRecommendations(analyses) {
        return analyses
            .filter(a => a.results?.recommendations)
            .flatMap(a => a.results.recommendations)
            .filter(rec => rec.priority === 'critical' || rec.priority === 'high')
            .slice(-10);
    }
}

module.exports = AnalysisAgentService;