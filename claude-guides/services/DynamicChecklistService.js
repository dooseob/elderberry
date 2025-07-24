#!/usr/bin/env node

/**
 * 동적 체크리스트 생성 서비스
 * 과거 경험 데이터와 프로젝트 현황을 기반으로 
 * 맞춤형 사전 예방 체크리스트를 자동 생성
 * Context7 지침에 따른 지능형 예방 시스템
 */

const SolutionsDbLearningService = require('./SolutionsDbLearningService');

class DynamicChecklistService {
    constructor() {
        this.version = "1.0.0";
        this.solutionsLearning = new SolutionsDbLearningService();
        this.staticTemplates = this.loadStaticTemplates();
        this.priorityWeights = {
            'critical': 100,
            'high': 80,
            'medium': 60,
            'low': 40
        };
        
        console.log('🔥 동적 체크리스트 생성 서비스 초기화 완료');
    }

    /**
     * 작업 유형별 동적 체크리스트 생성
     */
    async generateDynamicChecklist(workType, userMessage, projectContext = {}) {
        try {
            console.log(`📋 동적 체크리스트 생성: ${workType}`);
            
            // 1. 경험 데이터 로드
            const knowledge = await this.solutionsLearning.loadSolutionsDatabase();
            
            // 2. 정적 템플릿 기반 체크리스트 생성
            const staticChecklist = this.generateStaticChecklist(workType, projectContext);
            
            // 3. 경험 기반 동적 항목 추가
            const dynamicItems = await this.generateDynamicItems(knowledge, workType, userMessage);
            
            // 4. 우선순위 기반 정렬 및 최적화
            const optimizedChecklist = this.optimizeChecklist(staticChecklist, dynamicItems, projectContext);
            
            // 5. 메타데이터 추가
            const finalChecklist = {
                ...optimizedChecklist,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    workType: workType,
                    basedOnExperience: knowledge.totalIssues > 0,
                    experienceLevel: this.calculateExperienceLevel(knowledge),
                    adaptationSource: dynamicItems.length > 0 ? 'experience_data' : 'static_template',
                    version: this.version
                }
            };
            
            console.log(`✅ 동적 체크리스트 생성 완료 - ${finalChecklist.items.length}개 항목`);
            return finalChecklist;
            
        } catch (error) {
            console.error('❌ 동적 체크리스트 생성 실패:', error.message);
            return this.generateFallbackChecklist(workType, projectContext);
        }
    }

    /**
     * 정적 템플릿 기반 체크리스트 생성
     */
    generateStaticChecklist(workType, projectContext) {
        const template = this.staticTemplates[workType] || this.staticTemplates['general_development'];
        
        const checklist = {
            title: `${workType} 체크리스트`,
            type: 'static_template',
            priority: 'high',
            estimatedTime: template.estimatedTime || '10분',
            items: [...template.items],
            categories: {
                immediate: [],
                preparation: [],
                implementation: [],
                verification: []
            }
        };
        
        // 프로젝트 컨텍스트 기반 커스터마이징
        this.applyProjectContext(checklist, projectContext);
        
        return checklist;
    }

    /**
     * 경험 기반 동적 항목 생성
     */
    async generateDynamicItems(knowledge, workType, userMessage) {
        const dynamicItems = [];
        
        if (knowledge.totalIssues === 0) {
            return dynamicItems;
        }
        
        // 1. 자주 발생하는 에러 기반 예방 항목
        this.addErrorPreventionItems(dynamicItems, knowledge, workType);
        
        // 2. 성능 이슈 기반 최적화 항목
        this.addPerformanceOptimizationItems(dynamicItems, knowledge, workType);
        
        // 3. 보안 인시던트 기반 보안 체크 항목
        this.addSecurityCheckItems(dynamicItems, knowledge, workType);
        
        // 4. 사용자 메시지 기반 특화 항목
        this.addMessageSpecificItems(dynamicItems, knowledge, userMessage);
        
        // 5. 효과적인 해결책 기반 베스트 프랙티스
        this.addBestPracticeItems(dynamicItems, knowledge, workType);
        
        return dynamicItems;
    }

    /**
     * 에러 예방 항목 추가
     */
    addErrorPreventionItems(dynamicItems, knowledge, workType) {
        // 가장 빈번한 에러 패턴 상위 3개 선택
        const topErrors = Array.from(knowledge.errorPatterns.entries())
            .sort(([,a], [,b]) => b.count - a.count)
            .slice(0, 3);
        
        topErrors.forEach(([errorType, pattern]) => {
            if (pattern.count >= 2) { // 2회 이상 발생한 에러만
                const preventionItem = {
                    type: 'error_prevention',
                    priority: this.calculatePriority(pattern.count, pattern.severity),
                    content: `🚨 "${errorType}" 에러 예방 확인 (과거 ${pattern.count}회 발생)`,
                    details: {
                        errorType: errorType,
                        frequency: pattern.count,
                        severity: pattern.severity,
                        commonCauses: Array.from(pattern.commonCauses).slice(0, 2),
                        preventiveMeasures: this.generatePreventiveMeasures(errorType, pattern)
                    },
                    category: 'immediate',
                    estimatedTime: '5분',
                    source: 'experience_data'
                };
                
                dynamicItems.push(preventionItem);
            }
        });
    }

    /**
     * 성능 최적화 항목 추가
     */
    addPerformanceOptimizationItems(dynamicItems, knowledge, workType) {
        // 평균 실행 시간이 긴 위치들 상위 2개 
        const slowLocations = Array.from(knowledge.performanceIssues.entries())
            .filter(([, issue]) => issue.averageTime > 1000) // 1초 이상
            .sort(([,a], [,b]) => b.averageTime - a.averageTime)
            .slice(0, 2);
        
        slowLocations.forEach(([location, issue]) => {
            const optimizationItem = {
                type: 'performance_optimization',
                priority: issue.averageTime > 3000 ? 'high' : 'medium',
                content: `⚡ "${location}" 성능 최적화 체크 (평균 ${Math.round(issue.averageTime)}ms)`,
                details: {
                    location: location,
                    averageTime: Math.round(issue.averageTime),
                    frequency: issue.count,
                    maxTime: issue.maxTime,
                    knownOptimizations: Array.from(issue.optimizations).slice(0, 3)
                },
                category: 'implementation',
                estimatedTime: '15분',
                source: 'experience_data'
            };
            
            dynamicItems.push(optimizationItem);
        });
    }

    /**
     * 보안 체크 항목 추가
     */
    addSecurityCheckItems(dynamicItems, knowledge, workType) {
        // 보안 인시던트가 있었던 경우에만
        if (knowledge.securityIncidents.size > 0) {
            const securityTypes = Array.from(knowledge.securityIncidents.entries())
                .sort(([,a], [,b]) => b.count - a.count)
                .slice(0, 2);
            
            securityTypes.forEach(([securityType, incident]) => {
                const securityItem = {
                    type: 'security_check',
                    priority: 'high',
                    content: `🔒 ${securityType} 보안 점검 (과거 ${incident.count}회 인시던트)`,
                    details: {
                        securityType: securityType,
                        incidentCount: incident.count,
                        severity: incident.severity,
                        knownCountermeasures: Array.from(incident.countermeasures).slice(0, 2)
                    },
                    category: 'immediate',
                    estimatedTime: '10분',
                    source: 'experience_data'
                };
                
                dynamicItems.push(securityItem);
            });
        }
    }

    /**
     * 사용자 메시지별 특화 항목 추가
     */
    addMessageSpecificItems(dynamicItems, knowledge, userMessage) {
        const messageWords = userMessage.toLowerCase().split(/\s+/);
        const matchingPatterns = [];
        
        // 에러 패턴에서 메시지와 관련된 것들 찾기
        knowledge.errorPatterns.forEach((pattern, errorType) => {
            const relevance = this.calculateMessageRelevance(errorType, messageWords);
            if (relevance > 0.4) {
                matchingPatterns.push({
                    type: 'error',
                    pattern: errorType,
                    data: pattern,
                    relevance: relevance
                });
            }
        });
        
        // 관련도가 높은 패턴 기반 특화 항목 추가
        matchingPatterns
            .sort((a, b) => b.relevance - a.relevance)
            .slice(0, 2)
            .forEach(match => {
                const specificItem = {
                    type: 'message_specific',
                    priority: 'medium',
                    content: `🎯 "${match.pattern}" 관련 특별 점검 (관련도: ${Math.round(match.relevance * 100)}%)`,
                    details: {
                        pattern: match.pattern,
                        relevanceScore: match.relevance,
                        frequency: match.data.count,
                        relatedSolutions: Array.from(match.data.solutions).slice(0, 2)
                    },
                    category: 'preparation',
                    estimatedTime: '8분',
                    source: 'message_analysis'
                };
                
                dynamicItems.push(specificItem);
            });
    }

    /**
     * 베스트 프랙티스 항목 추가
     */
    addBestPracticeItems(dynamicItems, knowledge, workType) {
        // 효과적인 해결책들을 베스트 프랙티스로 변환
        const effectiveSolutions = knowledge.statistics.effectiveSolutions
            .filter(solution => solution.effectiveness > 0.8)
            .slice(0, 2);
        
        effectiveSolutions.forEach(solution => {
            const practiceItem = {
                type: 'best_practice',
                priority: 'medium',
                content: `💡 "${solution.problem}" 베스트 프랙티스 적용 (효과율: ${Math.round(solution.effectiveness * 100)}%)`,
                details: {
                    problem: solution.problem,
                    solution: solution.solution,
                    effectiveness: solution.effectiveness,
                    usageCount: solution.usageCount
                },
                category: 'implementation',
                estimatedTime: '12분',
                source: 'best_practices'
            };
            
            dynamicItems.push(practiceItem);
        });
    }

    /**
     * 체크리스트 최적화 (우선순위 정렬 및 중복 제거)
     */
    optimizeChecklist(staticChecklist, dynamicItems, projectContext) {
        // 1. 모든 항목 통합
        const allItems = [
            ...staticChecklist.items.map(item => ({
                type: 'static',
                priority: 'medium',
                content: item,
                category: 'preparation',
                estimatedTime: '5분',
                source: 'static_template'
            })),
            ...dynamicItems
        ];
        
        // 2. 우선순위 기반 정렬
        allItems.sort((a, b) => {
            const priorityDiff = this.priorityWeights[b.priority] - this.priorityWeights[a.priority];
            if (priorityDiff !== 0) return priorityDiff;
            
            // 같은 우선순위 내에서는 타입별 정렬
            const typeOrder = {
                'error_prevention': 1,
                'security_check': 2,
                'performance_optimization': 3,
                'message_specific': 4,
                'best_practice': 5,
                'static': 6
            };
            return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
        });
        
        // 3. 카테고리별 분류
        const categorized = {
            immediate: allItems.filter(item => item.category === 'immediate'),
            preparation: allItems.filter(item => item.category === 'preparation'),
            implementation: allItems.filter(item => item.category === 'implementation'),
            verification: allItems.filter(item => item.category === 'verification')
        };
        
        // 4. 최종 체크리스트 구성
        const optimized = {
            title: `🧠 AI 최적화 ${staticChecklist.title}`,
            type: 'dynamic_optimized',
            priority: 'high',
            items: allItems.slice(0, 12), // 최대 12개 항목
            categories: categorized,
            statistics: {
                totalItems: allItems.length,
                dynamicItems: dynamicItems.length,
                staticItems: staticChecklist.items.length,
                experienceBasedItems: dynamicItems.filter(item => item.source === 'experience_data').length,
                averageEstimatedTime: this.calculateAverageTime(allItems)
            }
        };
        
        return optimized;
    }

    /**
     * 프로젝트 컨텍스트 적용
     */
    applyProjectContext(checklist, projectContext) {
        // 엘더베리 프로젝트 특화 항목 추가
        if (projectContext.projectName === 'ElderberryProject') {
            checklist.items.unshift(
                '🍇 CLAUDE.md 프로젝트 가이드라인 확인',
                '🔥 Spring Boot 컴파일 에러 상태 점검',
                '⚡ Plain Java 서버 동작 확인'
            );
        }
        
        // 현재 Phase 기반 커스터마이징
        if (projectContext.currentPhase) {
            checklist.items.unshift(`📋 ${projectContext.currentPhase} 진행 상황 확인`);
        }
    }

    /**
     * 헬퍼 메서드들
     */
    calculatePriority(frequency, severity) {
        if (frequency >= 5 || severity === 'CRITICAL') return 'critical';
        if (frequency >= 3 || severity === 'HIGH') return 'high';
        if (frequency >= 2 || severity === 'MEDIUM') return 'medium';
        return 'low';
    }

    calculateMessageRelevance(pattern, messageWords) {
        let relevance = 0;
        const patternWords = pattern.toLowerCase().split(/[._\s]+/);
        
        messageWords.forEach(word => {
            if (word.length > 2) { // 2글자 이상만
                patternWords.forEach(pWord => {
                    if (pWord.includes(word) || word.includes(pWord)) {
                        relevance += 0.2;
                    }
                });
            }
        });
        
        return Math.min(relevance, 1.0);
    }

    calculateExperienceLevel(knowledge) {
        if (knowledge.totalIssues === 0) return 'none';
        if (knowledge.totalIssues < 5) return 'beginner';
        if (knowledge.totalIssues < 15) return 'intermediate';
        if (knowledge.totalIssues < 30) return 'advanced';
        return 'expert';
    }

    calculateAverageTime(items) {
        const totalMinutes = items.reduce((sum, item) => {
            const timeMatch = item.estimatedTime.match(/(\d+)/);
            return sum + (timeMatch ? parseInt(timeMatch[1]) : 5);
        }, 0);
        return Math.round(totalMinutes / items.length) + '분';
    }

    generatePreventiveMeasures(errorType, pattern) {
        // 에러 타입별 일반적인 예방 조치
        const measures = {
            'NullPointerException': [
                'null 체크 로직 추가',
                'Optional 클래스 사용',
                '@Nullable/@NonNull 어노테이션 활용'
            ],
            'ValidationException': [
                '@Valid 어노테이션 확인',
                'DTO 유효성 검증 강화',
                '입력값 범위 검증'
            ],
            'DataIntegrityViolationException': [
                '데이터 정합성 체크',
                '제약 조건 검토',
                '트랜잭션 처리 개선'
            ]
        };
        
        return measures[errorType] || ['코드 리뷰 실시', '단위 테스트 추가'];
    }

    /**
     * 정적 템플릿 로드
     */
    loadStaticTemplates() {
        return {
            'spring_boot_error': {
                estimatedTime: '15분',
                items: [
                    '🔍 컴파일 에러 우선순위 분석',
                    '📝 Repository 메서드 시그니처 확인', 
                    '🏷️ Lombok 어노테이션 점검',
                    '📦 import 문 및 패키지 구조 검토',
                    '🧪 단위 테스트 실행'
                ]
            },
            'api_development': {
                estimatedTime: '20분',
                items: [
                    '📋 API 설계 원칙 검토',
                    '🔐 보안 설정 확인',
                    '📝 입력 유효성 검증',
                    '📊 응답 형태 표준화',
                    '📚 API 문서 작성'
                ]
            },
            'performance_optimization': {
                estimatedTime: '25분',
                items: [
                    '📊 성능 메트릭 수집',
                    '🔍 병목 지점 식별',
                    '💾 캐싱 전략 검토',
                    '🗄️ 데이터베이스 쿼리 최적화',
                    '⚡ 비동기 처리 고려'
                ]
            },
            'general_development': {
                estimatedTime: '12분',
                items: [
                    '📋 요구사항 명확성 확인',
                    '🔧 개발 환경 설정',
                    '📝 코딩 컨벤션 적용',
                    '🧪 테스트 계획 수립',
                    '📚 문서화 준비'
                ]
            }
        };
    }

    /**
     * 폴백 체크리스트 생성
     */
    generateFallbackChecklist(workType, projectContext) {
        return {
            title: `${workType} 기본 체크리스트`,
            type: 'fallback',
            priority: 'medium',
            items: [
                '📋 작업 요구사항 확인',
                '🔧 개발 환경 점검',
                '📝 관련 문서 검토',
                '🧪 테스트 전략 수립',
                '✅ 완료 기준 정의'
            ],
            categories: {
                immediate: [],
                preparation: [],
                implementation: [],
                verification: []
            },
            metadata: {
                generatedAt: new Date().toISOString(),
                workType: workType,
                basedOnExperience: false,
                adaptationSource: 'fallback',
                version: this.version
            }
        };
    }

    /**
     * 서비스 상태 조회
     */
    getStatus() {
        return {
            version: this.version,
            staticTemplatesCount: Object.keys(this.staticTemplates).length,
            priorityWeights: this.priorityWeights,
            solutionsLearningStatus: this.solutionsLearning.getStatus()
        };
    }
}

module.exports = DynamicChecklistService;