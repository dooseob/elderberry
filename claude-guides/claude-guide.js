#!/usr/bin/env node

// 🤖 Claude AI 개발 가이드 통합 시스템
// 엘더베리 프로젝트 특화 단일 진입점 시스템

const path = require('path');
const fs = require('fs').promises;

class ClaudeGuideSystem {
    constructor() {
        this.version = "3.0.0-unified";
        this.projectName = "ElderberryProject";
        this.guidelinesFile = path.join(__dirname, 'CLAUDE_GUIDELINES.md');
        
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
            
            // 3. 엘더베리 컨텍스트 적용
            const elderberryContext = this.getElderberryContext(userMessage, workType);
            
            // 4. 통합 가이드 생성
            const guide = {
                // 기본 정보
                title: `${workType} 가이드`,
                workType: workType,
                timestamp: new Date().toISOString(),
                
                // 즉시 체크리스트 (30초)
                quickChecklist: this.generateQuickChecklist(workType, elderberryContext),
                
                // 상세 가이드 (2-5분)
                detailedGuide: relevantGuidelines,
                
                // 엘더베리 특화 정보
                elderberryInfo: elderberryContext,
                
                // 다음 단계
                nextSteps: this.generateNextSteps(workType, elderberryContext),
                
                // 주의사항
                warnings: this.generateWarnings(workType, elderberryContext),
                
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
    
    // ⚡ 30초 즉시 체크리스트 생성
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
    
    // 📋 다음 단계 생성
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
    
    // ⚠️ 주의사항 생성
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
        console.log(`\n📋 ${guide.title}`);
        console.log("=".repeat(50));
        
        console.log("\n🔥 즉시 체크리스트:");
        guide.quickChecklist.items.forEach(item => {
            console.log(`   ${item}`);
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
        });
        
        if (guide.warnings.length > 0) {
            console.log("\n⚠️ 주의사항:");
            guide.warnings.forEach(warning => {
                console.log(`   ${warning}`);
            });
        }
        
        console.log("\n🛠️ 도움 명령어:");
        guide.helpCommands.forEach(cmd => {
            console.log(`   ${cmd}`);
        });
        
        console.log(`\n✅ 가이드 생성 완료 (${guide.workType})`);
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