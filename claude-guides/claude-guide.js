#!/usr/bin/env node

// 🤖 Claude AI 개발 가이드 통합 시스템
// 엘더베리 프로젝트 특화 단일 진입점 시스템

const path = require('path');
const fs = require('fs').promises;
const SolutionsDbLearningService = require('./services/SolutionsDbLearningService');
const DynamicChecklistService = require('./services/DynamicChecklistService');
const DocumentLearningService = require('./services/DocumentLearningService');

class ClaudeGuideSystem {
    constructor() {
        this.version = "4.0.0-ai-enhanced";
        this.projectName = "ElderberryProject";
        this.guidelinesFile = path.join(__dirname, 'CLAUDE.md');
        
        // Solutions-DB 학습 서비스 초기화
        this.solutionsLearning = new SolutionsDbLearningService();
        
        // 동적 체크리스트 생성 서비스 초기화
        this.dynamicChecklist = new DynamicChecklistService();
        
        // 문서 학습 서비스 초기화 (WORK_LOG.md, work-reports/ 학습)
        this.documentLearning = new DocumentLearningService();
        
        // 엘더베리 프로젝트 특화 설정
        this.projectConfig = {
            currentPhase: "Phase 6-B → Phase 7",
            springBootErrors: 67,
            plainJavaServer: "포트 8080 (정상 동작)",
            frontendServer: "포트 5173 (React 정상 동작)",
            urgentTasks: [
                "Spring Boot 컴파일 에러 해결",
                "AI 챗봇팀과 API 스펙 협의",
                "Repository 메서드 Pageable 인자 추가",
                "Phase 7 챗봇 연동 완료"
            ]
        };
        
        console.log(`🤖 Claude 가이드 시스템 v${this.version} 초기화 완료`);
        console.log(`🍇 프로젝트: ${this.projectName}`);
        console.log(`📋 현재 단계: ${this.projectConfig.currentPhase}`);
        console.log(`🧠 AI 학습 기능: Solutions-DB 연동 활성화`);
        console.log(`📚 문서 학습 기능: WORK_LOG.md & work-reports 연동 활성화`);
        console.log(`🔥 동적 체크리스트: 경험 기반 자동 생성 활성화`);
    }
    
    // 🚀 메인 API: 스마트 가이드 생성
    async getGuide(userMessage, options = {}) {
        const startTime = Date.now();
        
        try {
            console.log(`\n🧠 가이드 생성: "${userMessage.substring(0, 50)}..."`);
            
            // 1. 작업 유형 감지
            const workType = this.detectWorkType(userMessage);
            
            // 2. 핵심 가이드라인 검색
            const relevantGuidelines = await this.searchGuidelines(userMessage, workType);
            
            // 3. 실제 경험 데이터 조회 (Solutions-DB)
            const experienceAdvice = await this.solutionsLearning.getExperienceBasedAdvice(workType, userMessage);
            
            // 3.1. 문서 히스토리 학습 데이터 조회 (WORK_LOG.md, work-reports)
            const documentInsights = await this.documentLearning.extractDevelopmentInsights();
            const workRecommendations = await this.documentLearning.generateWorkRecommendations({
                workType,
                userMessage,
                currentHour: new Date().getHours()
            });
            
            // 4. 동적 체크리스트 생성
            const dynamicChecklist = await this.dynamicChecklist.generateDynamicChecklist(
                workType, 
                userMessage, 
                this.projectConfig
            );
            
            // 5. 엘더베리 컨텍스트 적용
            const elderberryContext = this.getElderberryContext(userMessage, workType);
            
            // 6. 통합 가이드 생성
            const guide = {
                // 기본 정보
                title: `${workType} 가이드`,
                workType: workType,
                timestamp: new Date().toISOString(),
                version: this.version,
                
                // 🧠 AI 학습 기반 경험 데이터
                experienceData: experienceAdvice,
                
                // 📚 문서 히스토리 학습 데이터
                documentInsights: documentInsights,
                workRecommendations: workRecommendations,
                
                // 🔥 동적 체크리스트 - 경험 기반 자동 생성
                dynamicChecklist: dynamicChecklist,
                
                // 즉시 체크리스트 (30초) - 경험 데이터로 강화 (하위 호환성)
                quickChecklist: this.convertDynamicToQuickChecklist(dynamicChecklist, experienceAdvice),
                
                // 상세 가이드 (2-5분)
                detailedGuide: relevantGuidelines,
                
                // 엘더베리 특화 정보
                elderberryInfo: elderberryContext,
                
                // 다음 단계 - 경험 기반 최적화
                nextSteps: this.generateEnhancedNextSteps(workType, elderberryContext, experienceAdvice),
                
                // 주의사항 - 과거 이슈 기반 경고 포함
                warnings: this.generateEnhancedWarnings(workType, elderberryContext, experienceAdvice),
                
                // 도움 명령어
                helpCommands: this.getHelpCommands(workType)
            };
            
            const processingTime = Date.now() - startTime;
            console.log(`✅ 가이드 생성 완료 (${processingTime}ms)`);
            
            return guide;
            
        } catch (error) {
            console.error("❌ 가이드 생성 오류:", error.message);
            return this.generateErrorGuide(error, userMessage);
        }
    }
    
    // 🔍 작업 유형 자동 감지
    detectWorkType(userMessage) {
        const message = userMessage.toLowerCase();
        
        // 우선순위별 감지
        if (message.includes('spring boot') || message.includes('컴파일 에러')) {
            return 'spring_boot_error';
        }
        if (message.includes('챗봇') || message.includes('ai') || message.includes('python')) {
            return 'chatbot_integration';
        }
        if (message.includes('api') || message.includes('controller')) {
            return 'api_development';
        }
        if (message.includes('서비스') || message.includes('service')) {
            return 'service_implementation';
        }
        if (message.includes('리팩토링') || message.includes('refactor')) {
            return 'refactoring';
        }
        if (message.includes('테스트') || message.includes('test')) {
            return 'testing';
        }
        if (message.includes('데이터베이스') || message.includes('repository')) {
            return 'database_operation';
        }
        if (message.includes('성능') || message.includes('최적화')) {
            return 'performance_optimization';
        }
        if (message.includes('보안') || message.includes('security')) {
            return 'security_implementation';
        }
        
        return 'general_development';
    }
    
    // 📚 가이드라인 검색 (814줄 원본에서)
    async searchGuidelines(userMessage, workType) {
        try {
            // 가이드라인 파일이 있으면 읽기
            const guidelines = await fs.readFile(this.guidelinesFile, 'utf8');
            
            // 작업 유형별 관련 섹션 추출
            const sections = this.extractRelevantSections(guidelines, workType, userMessage);
            
            return {
                source: "CLAUDE_GUIDELINES.md",
                sections: sections,
                searchTip: `grep -n "${workType}" ${this.guidelinesFile}로 더 자세한 내용 확인 가능`
            };
            
        } catch (error) {
            return {
                source: "fallback",
                sections: this.getFallbackGuidelines(workType),
                note: "가이드라인 파일을 찾을 수 없어 기본 가이드를 제공합니다."
            };
        }
    }
    
    // 🍇 엘더베리 컨텍스트 생성
    getElderberryContext(userMessage, workType) {
        const context = {
            // 현재 프로젝트 상황
            currentPhase: this.projectConfig.currentPhase,
            springBootStatus: `${this.projectConfig.springBootErrors}개 컴파일 에러 (해결 진행 중)`,
            
            // 작업별 특화 정보
            phaseSpecific: this.getPhaseSpecificInfo(workType),
            
            // 긴급 알림
            urgentNotices: this.getUrgentNotices(workType),
            
            // 개발 표준
            koreanStandards: {
                comments: "모든 주석은 한국어로 작성",
                testing: "테스트 커버리지 90% 목표",
                naming: "비즈니스 도메인 용어 사용",
                documentation: "복잡한 로직은 상세 설명 필수"
            }
        };
        
        return context;
    }
    
    // 🔄 동적 체크리스트를 빠른 체크리스트로 변환 (하위 호환성)
    convertDynamicToQuickChecklist(dynamicChecklist, experienceAdvice) {
        return {
            title: dynamicChecklist.title,
            type: 'dynamic_converted',
            experienceEnhanced: dynamicChecklist.metadata.basedOnExperience,
            experienceStats: experienceAdvice.totalExperience,
            items: dynamicChecklist.items.slice(0, 8).map(item => item.content), // 상위 8개만
            estimatedTime: dynamicChecklist.statistics?.averageEstimatedTime || '30초',
            priority: dynamicChecklist.priority,
            metadata: dynamicChecklist.metadata
        };
    }

    // 🧠 AI 학습 기반 강화된 즉시 체크리스트 생성 (레거시 지원)
    generateEnhancedQuickChecklist(workType, context, experienceAdvice) {
        // 기본 체크리스트
        const basicChecklist = this.generateQuickChecklist(workType, context);
        
        // 경험 데이터가 있으면 강화된 항목 추가
        if (experienceAdvice.hasExperienceData) {
            const experienceItems = [];
            
            // 과거 이슈 기반 주의사항
            experienceAdvice.warningsFromPastIssues.forEach(warning => {
                experienceItems.push(`🔥 ${warning}`);
            });
            
            // 효과적인 예방 조치
            experienceAdvice.preventiveActions.forEach(action => {
                experienceItems.push(`💡 ${action.action} (효과율: ${action.effectiveness})`);
            });
            
            // 관련 패턴 기반 체크
            experienceAdvice.relevantPatterns.slice(0, 2).forEach(pattern => {
                if (pattern.type === 'error') {
                    experienceItems.push(`⚠️ "${pattern.pattern}" 에러 ${pattern.count}회 발생 - 주의 필요`);
                } else if (pattern.type === 'performance') {
                    experienceItems.push(`⚡ "${pattern.location}" 성능 이슈 ${pattern.count}회 발생 - 최적화 고려`);
                }
            });
            
            return {
                ...basicChecklist,
                title: `🧠 AI 강화 ${workType} 즉시 체크 (30초)`,
                experienceEnhanced: true,
                experienceStats: experienceAdvice.totalExperience,
                items: [...basicChecklist.items, ...experienceItems.slice(0, 3)] // 최대 3개 추가
            };
        }
        
        return basicChecklist;
    }

    // ⚡ 30초 즉시 체크리스트 생성 (기본)
    generateQuickChecklist(workType, context) {
        const baseChecklist = [
            "🔥 CLAUDE.md 프로젝트 가이드 확인",
            "🔥 현재 Phase 상황 파악",
            "🔥 Spring Boot 에러 상태 확인"
        ];
        
        const typeSpecificItems = {
            'spring_boot_error': [
                "🔥 컴파일 에러 우선순위 확인",
                "🔥 Repository 메서드 시그니처 점검",
                "🔥 Plain Java 서버 동작 확인",
                "📋 Lombok getter/setter 확인",
                "📋 DTO import 문 점검"
            ],
            'chatbot_integration': [
                "🔥 AI 챗봇팀 미팅 스케줄 확인",
                "🔥 API 스펙 협의 상태 점검",
                "🔥 WebSocket 설정 준비",
                "📋 JWT 인증 방식 확인",
                "📋 메시지 프로토콜 설계"
            ],
            'api_development': [
                "🔥 REST API 설계 원칙 확인",
                "🔥 JWT 보안 설정 점검",
                "🔥 응답 포맷 표준화",
                "📋 에러 처리 로직 구현",
                "📋 API 문서화 계획"
            ],
            'service_implementation': [
                "🔥 단일 책임 원칙 확인",
                "🔥 의존성 주입 설계",
                "🔥 트랜잭션 경계 설정",
                "📋 비즈니스 로직 분리",
                "📋 한국어 주석 작성"
            ]
        };
        
        const specificItems = typeSpecificItems[workType] || [
            "📋 코딩 컨벤션 확인",
            "📋 테스트 전략 수립",
            "📋 문서화 계획"
        ];
        
        return {
            title: `🔥 ${workType} 즉시 체크 (30초)`,
            items: [...baseChecklist, ...specificItems],
            estimatedTime: "30초",
            priority: "즉시 확인 필요"
        };
    }
    
    // 🧠 AI 학습 기반 강화된 다음 단계 생성
    generateEnhancedNextSteps(workType, context, experienceAdvice) {
        // 기본 다음 단계
        const basicSteps = this.generateNextSteps(workType, context);
        
        // 경험 데이터가 있으면 우선순위 조정 및 새로운 단계 추가
        if (experienceAdvice.hasExperienceData && experienceAdvice.relevantPatterns.length > 0) {
            const experienceSteps = [];
            
            // 과거 이슈 기반 우선 점검 사항
            experienceAdvice.relevantPatterns.slice(0, 2).forEach(pattern => {
                if (pattern.type === 'error' && pattern.solutions.length > 0) {
                    experienceSteps.push({
                        step: `"${pattern.pattern}" 에러 예방 점검 (과거 ${pattern.count}회 발생)`,
                        time: "10분",
                        priority: "high",
                        experienceBased: true,
                        solutions: pattern.solutions.slice(0, 2)
                    });
                } else if (pattern.type === 'performance' && pattern.optimizations.length > 0) {
                    experienceSteps.push({
                        step: `"${pattern.location}" 성능 최적화 적용 (과거 평균 ${pattern.averageTime}ms)`,
                        time: "20분", 
                        priority: "medium",
                        experienceBased: true,
                        optimizations: Array.from(pattern.optimizations).slice(0, 2)
                    });
                }
            });
            
            // 경험 기반 단계를 앞에 배치
            return [...experienceSteps, ...basicSteps];
        }
        
        return basicSteps;
    }

    // 📋 다음 단계 생성 (기본)
    generateNextSteps(workType, context) {
        const steps = {
            'spring_boot_error': [
                { step: "Repository 메서드 시그니처 수정", time: "30분", priority: "high" },
                { step: "엔티티 getter/setter 추가", time: "20분", priority: "medium" },
                { step: "DTO 타입 불일치 해결", time: "15분", priority: "medium" },
                { step: "컴파일 테스트 및 검증", time: "10분", priority: "high" }
            ],
            'chatbot_integration': [
                { step: "AI 팀과 API 스펙 최종 협의", time: "1주일", priority: "high" },
                { step: "ChatbotController 구현", time: "1주일", priority: "high" },
                { step: "React 채팅 인터페이스 구현", time: "5일", priority: "medium" },
                { step: "통합 테스트 및 성능 튜닝", time: "3일", priority: "medium" }
            ]
        };
        
        return steps[workType] || [
            { step: "요구사항 분석", time: "1시간", priority: "high" },
            { step: "설계 및 구현", time: "TBD", priority: "medium" },
            { step: "테스트 및 검증", time: "30분", priority: "high" }
        ];
    }
    
    // 🧠 AI 학습 기반 강화된 주의사항 생성
    generateEnhancedWarnings(workType, context, experienceAdvice) {
        // 기본 주의사항
        const basicWarnings = this.generateWarnings(workType, context);
        
        // 경험 데이터 기반 추가 경고
        const experienceWarnings = [];
        
        if (experienceAdvice.hasExperienceData) {
            // 과거 이슈 기반 경고 추가
            experienceAdvice.warningsFromPastIssues.forEach(warning => {
                experienceWarnings.push(`🧠 AI 경고: ${warning}`);
            });
            
            // 관련 패턴 기반 구체적 경고
            experienceAdvice.relevantPatterns.forEach(pattern => {
                if (pattern.type === 'error' && pattern.count >= 3) {
                    experienceWarnings.push(
                        `🚨 "${pattern.pattern}" 에러 다발 주의: ${pattern.count}회 발생, ${pattern.severity} 심각도`
                    );
                }
                if (pattern.type === 'performance' && pattern.averageTime > 2000) {
                    experienceWarnings.push(
                        `⚡ "${pattern.location}" 성능 저하 주의: 평균 ${Math.round(pattern.averageTime)}ms 소요`
                    );
                }
            });
            
            // 경험 통계 기반 일반적 경고
            if (experienceAdvice.totalExperience) {
                experienceWarnings.push(
                    `📊 프로젝트 경험 통계: ${experienceAdvice.totalExperience} - 과거 이슈 패턴 참고 권장`
                );
            }
        }
        
        return [...experienceWarnings.slice(0, 3), ...basicWarnings]; // 최대 3개 경험 경고 + 기본 경고
    }

    // ⚠️ 주의사항 생성 (기본)
    generateWarnings(workType, context) {
        const warnings = [];
        
        // 공통 주의사항
        warnings.push("🚨 모든 변경사항은 Plain Java 서버 동작 확인 후 진행");
        
        // 타입별 주의사항
        if (workType === 'spring_boot_error') {
            warnings.push("🚨 Spring Boot 에러 해결 시 기존 기능 영향 최소화");
            warnings.push("🚨 Repository 메서드 변경 시 Service 레이어 동시 수정 필요");
        }
        
        if (workType === 'chatbot_integration') {
            warnings.push("🚨 AI 챗봇팀과 인터페이스 변경 시 사전 협의 필수");
            warnings.push("🚨 WebSocket 연결 시 보안 토큰 검증 강화");
        }
        
        // 현재 프로젝트 상황 경고
        if (context.springBootStatus.includes('67개')) {
            warnings.push("⚠️ Spring Boot 컴파일 에러로 인한 제약사항 고려");
        }
        
        return warnings;
    }
    
    // 🛠️ 도움 명령어 생성
    getHelpCommands(workType) {
        const commands = {
            basic: [
                "npm run quick-check        # 30초 빠른 상태 체크",
                "npm run guide             # 이 시스템 실행",
                "npm run help              # 도움말"
            ],
            specific: {
                'spring_boot_error': [
                    "npm run spring-boot-help  # Spring Boot 에러 해결"
                ],
                'chatbot_integration': [
                    "npm run chatbot-help      # AI 챗봇 연동 가이드"
                ]
            }
        };
        
        const specificCommands = commands.specific[workType] || [];
        return [...commands.basic, ...specificCommands];
    }
    
    // 🔄 명령줄 인터페이스
    async runCLI() {
        const args = process.argv.slice(2);
        
        if (args.includes('--help') || args.includes('-h')) {
            this.showHelp();
            return;
        }
        
        if (args.includes('--version') || args.includes('-v')) {
            console.log(`Claude Guide System v${this.version}`);
            return;
        }
        
        if (args.includes('--quick-check')) {
            await this.runQuickCheck();
            return;
        }
        
        // 대화형 모드
        await this.runInteractiveMode();
    }
    
    // 📖 도움말 표시
    showHelp() {
        console.log(`
🤖 Claude Guide System v${this.version}

사용법:
  node claude-guide.js [옵션]

옵션:
  --help, -h                 이 도움말 표시
  --version, -v              버전 정보
  --quick-check              30초 빠른 상태 체크

예제:
  node claude-guide.js                    # 대화형 모드
  node claude-guide.js --quick-check      # 빠른 체크
  npm run guide                           # npm 스크립트로 실행
  npm run spring-boot-help                # Spring Boot 도움

엘더베리 프로젝트 특화 지능형 가이드 시스템
        `);
    }
    
    // ⚡ 빠른 체크 실행
    async runQuickCheck() {
        console.log("🍇 엘더베리 프로젝트 상태 체크\n");
        
        console.log("📋 현재 상황:");
        console.log(`   Phase: ${this.projectConfig.currentPhase}`);
        console.log(`   Spring Boot: ${this.projectConfig.springBootErrors}개 에러`);
        console.log(`   Plain Java: ${this.projectConfig.plainJavaServer}`);
        console.log(`   Frontend: ${this.projectConfig.frontendServer}\n`);
        
        console.log("🔥 긴급 작업:");
        this.projectConfig.urgentTasks.forEach((task, index) => {
            console.log(`   ${index + 1}. ${task}`);
        });
        
        console.log("\n💡 권장 명령어:");
        console.log("   npm run spring-boot-help  # Spring Boot 에러 해결");
        console.log("   npm run chatbot-help      # AI 챗봇 연동 준비");
        console.log("   npm run guide             # 상세 가이드");
    }
    
    // 🤝 대화형 모드
    async runInteractiveMode() {
        console.log(`\n🤖 Claude 가이드 시스템 v${this.version}`);
        console.log("엘더베리 프로젝트 개발을 도와드립니다!\n");
        
        console.log("💡 사용 예시:");
        console.log('   "FacilityService 리팩토링 필요"');
        console.log('   "Spring Boot 컴파일 에러 해결"');
        console.log('   "AI 챗봇 연동 방법"');
        console.log('   "API 성능 최적화"\n');
        
        // 간단한 프롬프트 (외부 의존성 없이)
        process.stdout.write("작업 내용을 입력하세요: ");
        
        process.stdin.once('data', async (input) => {
            const userMessage = input.toString().trim();
            
            if (userMessage) {
                const guide = await this.getGuide(userMessage);
                this.displayGuide(guide);
            }
            
            process.exit(0);
        });
    }
    
    // 📺 가이드 표시
    displayGuide(guide) {
        console.log(`\n📋 ${guide.title} v${guide.version}`);
        console.log("=".repeat(50));
        
        // AI 학습 데이터 표시
        if (guide.experienceData.hasExperienceData) {
            console.log(`\n🧠 AI 학습 기반 가이드 (${guide.experienceData.totalExperience})`);
            
            // 관련 패턴이 있으면 표시
            if (guide.experienceData.relevantPatterns.length > 0) {
                console.log("\n💡 과거 경험 패턴:");
                guide.experienceData.relevantPatterns.slice(0, 2).forEach(pattern => {
                    if (pattern.type === 'error') {
                        console.log(`   ⚠️ "${pattern.pattern}" 에러 ${pattern.count}회 발생 (${pattern.severity})`);
                        if (pattern.solutions.length > 0) {
                            console.log(`      해결책: ${pattern.solutions[0]}`);
                        }
                    } else if (pattern.type === 'performance') {
                        console.log(`   ⚡ "${pattern.location}" 성능 이슈 ${pattern.count}회 (평균 ${Math.round(pattern.averageTime)}ms)`);
                        if (pattern.optimizations.length > 0) {
                            console.log(`      최적화: ${Array.from(pattern.optimizations)[0]}`);
                        }
                    }
                });
            }
        } else {
            console.log(`\n🧠 AI 학습 상태: ${guide.experienceData.message}`);
        }
        
        // 📚 문서 히스토리 학습 데이터 표시
        if (guide.documentInsights) {
            console.log(`\n📚 문서 히스토리 분석`);
            
            // 개발 속도 패턴
            if (guide.documentInsights.velocityInsights) {
                const velocity = guide.documentInsights.velocityInsights;
                console.log(`   ⏱️ 평균 작업 시간: ${velocity.averageTaskTime}시간/작업`);
                if (velocity.peakProductivityHours.length > 0) {
                    console.log(`   🔥 생산성 최고 시간: ${velocity.peakProductivityHours.slice(0, 3).join(', ')}시`);
                }
            }
            
            // 품질 지표
            if (guide.documentInsights.qualityInsights) {
                const quality = guide.documentInsights.qualityInsights;
                if (quality.bugRate > 0.3) {
                    console.log(`   ⚠️ 버그 발생률: ${Math.round(quality.bugRate * 100)}% (주의 필요)`);
                } else if (quality.bugRate > 0) {
                    console.log(`   ✅ 버그 발생률: ${Math.round(quality.bugRate * 100)}% (양호)`);
                }
            }
        }
        
        // 📊 작업 추천사항 표시
        if (guide.workRecommendations && guide.workRecommendations.length > 0) {
            console.log(`\n📊 상황별 추천사항:`);
            guide.workRecommendations.slice(0, 2).forEach(rec => {
                const typeIcons = {
                    'timing': '⏰',
                    'quality': '🔍', 
                    'technical': '⚙️'
                };
                console.log(`   ${typeIcons[rec.type] || '💡'} ${rec.message}`);
                console.log(`      → ${rec.suggestion}`);
            });
        }
        
        // 동적 체크리스트 표시 (우선)
        if (guide.dynamicChecklist && guide.dynamicChecklist.items.length > 0) {
            console.log(`\n🔥 ${guide.dynamicChecklist.title}`);
            console.log(`   📊 최적화 통계: ${guide.dynamicChecklist.statistics.totalItems}개 항목 → ${guide.dynamicChecklist.items.length}개 선별`);
            
            // 카테고리별 표시
            const categories = ['immediate', 'preparation', 'implementation', 'verification'];
            categories.forEach(category => {
                const categoryItems = guide.dynamicChecklist.categories[category];
                if (categoryItems && categoryItems.length > 0) {
                    const categoryNames = {
                        immediate: '🚨 즉시 조치',
                        preparation: '📋 사전 준비', 
                        implementation: '⚡ 구현 단계',
                        verification: '✅ 검증 단계'
                    };
                    
                    console.log(`\n   ${categoryNames[category]}:`);
                    categoryItems.slice(0, 3).forEach(item => { // 카테고리당 최대 3개
                        const typeIcon = {
                            'error_prevention': '🚨',
                            'security_check': '🔒',
                            'performance_optimization': '⚡', 
                            'message_specific': '🎯',
                            'best_practice': '💡',
                            'static': '📋'
                        };
                        const icon = typeIcon[item.type] || '📋';
                        console.log(`     ${icon} ${item.content} (${item.estimatedTime})`);
                        
                        // 세부 정보가 있으면 추가 표시
                        if (item.details && (item.type === 'error_prevention' || item.type === 'performance_optimization')) {
                            if (item.details.commonCauses && item.details.commonCauses.length > 0) {
                                console.log(`        💡 주요 원인: ${item.details.commonCauses[0]}`);
                            }
                            if (item.details.knownOptimizations && item.details.knownOptimizations.length > 0) {
                                console.log(`        ⚡ 최적화 방안: ${item.details.knownOptimizations[0]}`);
                            }
                        }
                    });
                }
            });
        }
        
        console.log(`\n🔥 ${guide.quickChecklist.experienceEnhanced ? 'AI 강화 ' : ''}즉시 체크리스트 (하위 호환):`);
        if (guide.quickChecklist.experienceStats) {
            console.log(`   📊 경험 통계: ${guide.quickChecklist.experienceStats}`);
        }
        guide.quickChecklist.items.forEach((item, index) => {
            const prefix = item.startsWith('🔥') ? '   ' : 
                          item.startsWith('💡') ? '   ' : 
                          item.startsWith('⚠️') ? '   ' : 
                          item.startsWith('⚡') ? '   ' : '   ';
            console.log(`${prefix}${item}`);
        });
        
        if (guide.elderberryInfo.urgentNotices && guide.elderberryInfo.urgentNotices.length > 0) {
            console.log("\n🚨 긴급 알림:");
            guide.elderberryInfo.urgentNotices.forEach(notice => {
                console.log(`   ${notice}`);
            });
        }
        
        console.log("\n📋 다음 단계:");
        guide.nextSteps.forEach((step, index) => {
            const priority = step.priority === 'high' ? '🔥' : '📋';
            console.log(`   ${index + 1}. ${priority} ${step.step} (${step.time})`);
            
            // 경험 기반 추가 정보 표시
            if (step.experienceBased) {
                if (step.solutions && step.solutions.length > 0) {
                    console.log(`      💡 추천 해결책: ${step.solutions[0]}`);
                }
                if (step.optimizations && step.optimizations.length > 0) {
                    console.log(`      ⚡ 최적화 방안: ${step.optimizations[0]}`);
                }
            }
        });
        
        if (guide.warnings.length > 0) {
            console.log("\n⚠️ 주의사항:");
            guide.warnings.forEach((warning, index) => {
                const isAIWarning = warning.startsWith('🧠 AI 경고:') || 
                                   warning.startsWith('🚨') && warning.includes('에러 다발') ||
                                   warning.startsWith('⚡') && warning.includes('성능 저하') ||
                                   warning.startsWith('📊') && warning.includes('경험 통계');
                
                if (isAIWarning) {
                    console.log(`   🤖 ${warning}`);
                } else {
                    console.log(`   ${warning}`);
                }
            });
        }
        
        console.log("\n🛠️ 도움 명령어:");
        guide.helpCommands.forEach(cmd => {
            console.log(`   ${cmd}`);
        });
        
        // AI 학습 상태 요약
        if (guide.experienceData.hasExperienceData) {
            console.log(`\n🧠 AI 학습 요약:`);
            console.log(`   • 총 경험: ${guide.experienceData.totalExperience}`);
            console.log(`   • 관련 패턴: ${guide.experienceData.relevantPatterns.length}개 발견`);
            console.log(`   • 예방 조치: ${guide.experienceData.preventiveActions.length}개 추천`);
            console.log(`   • 과거 경고: ${guide.experienceData.warningsFromPastIssues.length}개 제공`);
        }
        
        console.log(`\n✅ 가이드 생성 완료 (${guide.workType})`);
        console.log(`📅 생성 시간: ${new Date(guide.timestamp).toLocaleString('ko-KR')}`);
        console.log(`🤖 시스템 버전: ${guide.version}`);
    }
    
    // 🔄 Fallback 가이드라인 (파일이 없을 때)
    getFallbackGuidelines(workType) {
        const guidelines = {
            'spring_boot_error': [
                "1. Repository 메서드에 Pageable 인자 추가",
                "2. 엔티티 클래스에 Lombok @Getter @Setter 확인",
                "3. DTO import 문 확인 및 올바른 패키지 경로 설정",
                "4. 점진적 해결 - 한 번에 하나씩 수정"
            ],
            'chatbot_integration': [
                "1. AI 챗봇팀과 API 스펙 협의",
                "2. JWT 인증 방식 적용",
                "3. WebSocket 또는 SSE 연결 설정",
                "4. 메시지 프로토콜 JSON 형태로 정의"
            ],
            'api_development': [
                "1. REST API 설계 원칙 준수",
                "2. @Valid 어노테이션으로 입력 검증",
                "3. 통일된 응답 형태 (ResponseEntity 사용)",
                "4. 적절한 HTTP 상태 코드 반환"
            ]
        };
        
        return guidelines[workType] || [
            "1. 요구사항 명확히 정의",
            "2. 단계별 구현 계획 수립", 
            "3. 테스트 주도 개발 적용",
            "4. 코드 리뷰 및 문서화"
        ];
    }
    
    // Helper 메서드들
    extractRelevantSections(guidelines, workType, userMessage) {
        // 실제 구현에서는 더 정교한 텍스트 분석 필요
        return this.getFallbackGuidelines(workType);
    }
    
    getPhaseSpecificInfo(workType) {
        if (workType === 'chatbot_integration') {
            return "Phase 7 - AI 챗봇 연동 단계 (Python 팀과 협업)";
        }
        if (workType === 'api_development') {
            return "Phase 6-B - 공공데이터 API 연동 완료 후 내부 API 확장";
        }
        return "일반 개발 단계";
    }
    
    getUrgentNotices(workType) {
        const notices = [];
        
        if (workType === 'spring_boot_error') {
            notices.push("Spring Boot 67개 컴파일 에러 해결 진행 중");
        }
        
        if (workType === 'chatbot_integration') {
            notices.push("AI 챗봇팀과 주 2회 미팅 (화, 금 오후 2시)");
        }
        
        return notices;
    }
    
    generateErrorGuide(error, userMessage) {
        return {
            title: "❌ 에러 가이드",
            workType: "error_handling",
            quickChecklist: {
                title: "🔥 에러 처리 (30초)",
                items: [
                    "🔥 에러 메시지 상세 확인",
                    "🔥 로그 파일 점검",
                    "📋 관련 파일 백업",
                    "📋 단계별 원복 시도"
                ]
            },
            elderberryInfo: {
                currentPhase: this.projectConfig.currentPhase,
                springBootStatus: this.projectConfig.springBootErrors + "개 컴파일 에러"
            },
            nextSteps: [
                { step: "에러 원인 분석", time: "10분", priority: "high" },
                { step: "관련 문서 확인", time: "5분", priority: "medium" },
                { step: "팀에 도움 요청", time: "즉시", priority: "high" }
            ],
            warnings: ["🚨 복구 불가능한 변경 전 백업 필수"],
            helpCommands: this.getHelpCommands("general_development"),
            error: error.message
        };
    }
}

// 실행 부분
if (require.main === module) {
    const system = new ClaudeGuideSystem();
    system.runCLI().catch(console.error);
}

module.exports = ClaudeGuideSystem;