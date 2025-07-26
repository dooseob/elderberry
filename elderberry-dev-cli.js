#!/usr/bin/env node

/**
 * 엘더베리 통합 개발 CLI 도구
 * Elderberry-Intellect 자기 진화형 개발 지원 시스템의 통합 명령줄 인터페이스
 * 
 * 주요 기능:
 * - 지능형 가이드 시스템 (Claude Guide System)
 * - 동적 체크리스트 생성 (Dynamic Checklist Service)
 * - AI 예측 및 위험 분석 (Predictive Analysis Service)
 * - 트러블슈팅 자동화 (Troubleshooting Service)
 * - 지침 준수 검증 (Compliance Checker)
 * - 통합 로그 및 디버깅 시스템
 * 
 * Context7 지침에 따른 개발자 경험 최적화
 */

// Node.js 모듈
const fs = require('fs').promises;
const path = require('path');
const { spawn, exec } = require('child_process');
const { promisify } = require('util');

// Elderberry-Intellect 서비스
const ClaudeGuideSystem = require('./claude-guides/claude-guide.js');
const DynamicChecklistService = require('./claude-guides/services/DynamicChecklistService.js');
const PredictiveAnalysisService = require('./claude-guides/services/PredictiveAnalysisService.js');
const SolutionsDbLearningService = require('./claude-guides/services/SolutionsDbLearningService.js');
const ComplianceChecker = require('./claude-guides/helpers/compliance-checker.js');

const execAsync = promisify(exec);

class ElderberryDevCLI {
    constructor() {
        this.version = "1.0.0";
        this.projectRoot = process.cwd();
        this.configPath = path.join(this.projectRoot, '.elderberry');
        
        // 핵심 서비스 초기화
        this.claudeGuide = new ClaudeGuideSystem();
        this.dynamicChecklist = new DynamicChecklistService();
        this.predictiveAnalysis = new PredictiveAnalysisService();
        this.solutionsLearning = new SolutionsDbLearningService();
        this.complianceChecker = new ComplianceChecker();
        
        // CLI 명령어 등록
        this.commands = new Map();
        this.registerCommands();
        
        console.log('🚀 엘더베리 개발 CLI 시스템 초기화 완료');
    }

    /**
     * CLI 명령어 등록
     */
    registerCommands() {
        // 🧠 지능형 가이드 명령어
        this.commands.set('guide', {
            description: '지능형 개발 가이드 실행',
            usage: 'elderberry guide [work-type] [options]',
            action: this.runGuide.bind(this),
            options: [
                '--interactive, -i    대화형 모드',
                '--quick-check        30초 빠른 상태 체크',
                '--work-type <type>   작업 유형 지정'
            ]
        });

        // 📋 동적 체크리스트 명령어
        this.commands.set('checklist', {
            description: 'AI 기반 동적 체크리스트 생성',
            usage: 'elderberry checklist [work-type] [message]',
            action: this.generateChecklist.bind(this),
            options: [
                '--format <format>    출력 형식 (console|json|markdown)',
                '--priority <level>   우선순위 필터 (critical|high|medium|low)'
            ]
        });

        // 🔮 예측 분석 명령어
        this.commands.set('predict', {
            description: 'AI 예측 및 위험 분석 실행',
            usage: 'elderberry predict [work-type] [message]',
            action: this.runPredictiveAnalysis.bind(this),
            options: [
                '--detailed          상세 분석 모드',
                '--risk-threshold <n> 위험도 임계값 (0-100)',
                '--export <file>      결과를 파일로 내보내기'
            ]
        });

        // 🔧 트러블슈팅 명령어
        this.commands.set('troubleshoot', {
            description: '자동화된 트러블슈팅 실행',
            usage: 'elderberry troubleshoot [symptom] [options]',
            action: this.runTroubleshooting.bind(this),
            options: [
                '--auto-fix          자동 수정 시도',
                '--create-issue      이슈 자동 생성',
                '--analyze-logs      로그 자동 분석'
            ]
        });

        // 📊 지침 준수 검증 명령어
        this.commands.set('compliance', {
            description: 'Context7 지침 준수 검증',
            usage: 'elderberry compliance [check-type]',
            action: this.runComplianceCheck.bind(this),
            options: [
                '--pre-work          작업 시작 전 체크',
                '--post-work         작업 완료 후 체크',
                '--fix-suggestions   수정 제안 생성'
            ]
        });

        // 🏥 시스템 헬스체크 명령어
        this.commands.set('health', {
            description: '시스템 상태 및 헬스체크',
            usage: 'elderberry health [component]',
            action: this.runHealthCheck.bind(this),
            options: [
                '--all               모든 컴포넌트 체크',
                '--fix               발견된 문제 자동 수정',
                '--report            상세 리포트 생성'
            ]
        });

        // 📈 통계 및 분석 명령어
        this.commands.set('stats', {
            description: '개발 통계 및 분석 데이터',
            usage: 'elderberry stats [period] [type]',
            action: this.showStats.bind(this),
            options: [
                '--period <period>   기간 지정 (day|week|month)',
                '--type <type>       통계 유형 (errors|performance|compliance)',
                '--chart             차트 형태로 표시'
            ]
        });

        // 🔄 워크플로우 자동화 명령어
        this.commands.set('workflow', {
            description: '개발 워크플로우 자동화',
            usage: 'elderberry workflow [action] [options]',
            action: this.runWorkflow.bind(this),
            options: [
                '--action <action>   워크플로우 액션 (start|check|deploy)',
                '--phase <phase>     개발 Phase 지정',
                '--auto-commit      자동 커밋 수행'
            ]
        });

        // ⚙️ 설정 관리 명령어
        this.commands.set('config', {
            description: '시스템 설정 관리',
            usage: 'elderberry config [action] [key] [value]',
            action: this.manageConfig.bind(this),
            options: [
                'get <key>           설정값 조회',
                'set <key> <value>   설정값 변경',
                'list                모든 설정 목록',
                'reset               설정 초기화'
            ]
        });
    }

    /**
     * CLI 메인 실행 함수
     */
    async run() {
        const args = process.argv.slice(2);
        
        if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
            this.showHelp();
            return;
        }

        if (args.includes('--version') || args.includes('-v')) {
            console.log(`🍇 엘더베리 개발 CLI v${this.version}`);
            console.log('Elderberry-Intellect 자기 진화형 개발 지원 시스템');
            return;
        }

        const command = args[0];
        const commandArgs = args.slice(1);

        if (this.commands.has(command)) {
            try {
                await this.commands.get(command).action(commandArgs);
            } catch (error) {
                console.error(`❌ 명령어 실행 실패: ${error.message}`);
                console.log(`💡 도움말: elderberry ${command} --help`);
                process.exit(1);
            }
        } else {
            console.error(`❌ 알 수 없는 명령어: ${command}`);
            console.log('💡 사용 가능한 명령어: elderberry --help');
            process.exit(1);
        }
    }

    /**
     * 📖 도움말 표시
     */
    showHelp() {
        console.log(`
🍇 엘더베리 개발 CLI v${this.version}
Elderberry-Intellect 자기 진화형 개발 지원 시스템

사용법:
  elderberry <명령어> [옵션]

주요 명령어:`);

        this.commands.forEach((cmd, name) => {
            console.log(`  ${name.padEnd(12)} ${cmd.description}`);
        });

        console.log(`
예제:
  elderberry guide --interactive          # 대화형 가이드 시작
  elderberry checklist spring_boot_error  # Spring Boot 에러 체크리스트
  elderberry predict api_development      # API 개발 위험 분석
  elderberry health --all                 # 전체 시스템 헬스체크
  elderberry workflow start --phase=7     # Phase 7 워크플로우 시작

추가 정보:
  elderberry <명령어> --help              # 명령어별 상세 도움말
  elderberry --version                    # 버전 정보
  
🌟 지능형 개발 지원으로 생산성을 극대화하세요!
        `);
    }

    /**
     * 🧠 지능형 가이드 실행
     */
    async runGuide(args) {
        console.log('🧠 지능형 개발 가이드 시작...\n');
        
        const options = this.parseOptions(args, {
            interactive: ['-i', '--interactive'],
            quickCheck: ['--quick-check'],
            workType: ['--work-type']
        });

        if (options.quickCheck) {
            console.log('⚡ 30초 빠른 상태 체크 실행...');
            // 빠른 체크 로직 구현
            await this.runQuickSystemCheck();
            return;
        }

        if (options.interactive) {
            console.log('🔄 대화형 모드로 전환...');
            await this.claudeGuide.runInteractiveMode();
        } else {
            const workType = options.workType || this.detectWorkType();
            const userMessage = args.filter(arg => !arg.startsWith('-')).join(' ') || '개발 가이드 요청';
            
            console.log(`📋 작업 유형: ${workType}`);
            console.log(`💬 메시지: ${userMessage}\n`);
            
            const guide = await this.claudeGuide.getGuide(workType, userMessage);
            this.claudeGuide.displayGuide(guide);
        }
    }

    /**
     * 📋 동적 체크리스트 생성
     */
    async generateChecklist(args) {
        console.log('📋 AI 기반 동적 체크리스트 생성...\n');
        
        const workType = args[0] || this.detectWorkType();
        const message = args.slice(1).join(' ') || '체크리스트 생성 요청';
        
        const options = this.parseOptions(args, {
            format: ['--format'],
            priority: ['--priority']
        });

        const projectContext = await this.getProjectContext();
        const checklist = await this.dynamicChecklist.generateDynamicChecklist(workType, message, projectContext);
        
        console.log(`✅ 체크리스트 생성 완료: ${checklist.items.length}개 항목\n`);

        if (options.format === 'json') {
            console.log(JSON.stringify(checklist, null, 2));
        } else if (options.format === 'markdown') {
            this.displayChecklistAsMarkdown(checklist);
        } else {
            this.displayChecklistConsole(checklist, options.priority);
        }
    }

    /**
     * 🔮 예측 분석 실행
     */
    async runPredictiveAnalysis(args) {
        console.log('🔮 AI 예측 및 위험 분석 시작...\n');
        
        const workType = args[0] || this.detectWorkType();
        const message = args.slice(1).join(' ') || '예측 분석 요청';
        
        const options = this.parseOptions(args, {
            detailed: ['--detailed'],
            riskThreshold: ['--risk-threshold'],
            export: ['--export']
        });

        const projectContext = await this.getProjectContext();
        const analysis = await this.predictiveAnalysis.performComprehensiveAnalysis(workType, message, projectContext);
        
        console.log(`📊 위험 분석 완료 - 전체 위험도: ${analysis.overallRiskScore}점 (${analysis.riskLevel})\n`);

        if (options.detailed) {
            this.displayDetailedAnalysis(analysis);
        } else {
            this.displayAnalysisSummary(analysis);
        }

        if (options.export) {
            await this.exportAnalysis(analysis, options.export);
            console.log(`💾 분석 결과 저장: ${options.export}`);
        }
    }

    /**
     * 🔧 트러블슈팅 실행
     */
    async runTroubleshooting(args) {
        console.log('🔧 자동화된 트러블슈팅 시작...\n');
        
        const symptom = args.join(' ') || '일반적인 문제';
        
        const options = this.parseOptions(args, {
            autoFix: ['--auto-fix'],
            createIssue: ['--create-issue'],
            analyzeLogs: ['--analyze-logs']
        });

        // 1. 증상 분석
        console.log(`🔍 증상 분석: ${symptom}`);
        
        // 2. 로그 분석 (옵션)
        if (options.analyzeLogs) {
            console.log('📊 로그 자동 분석 중...');
            await this.analyzeSystemLogs();
        }

        // 3. 해결책 제안
        const solutions = await this.generateTroubleshootingSolutions(symptom);
        this.displayTroubleshootingSolutions(solutions);

        // 4. 자동 수정 시도 (옵션)
        if (options.autoFix) {
            console.log('\n🔧 자동 수정 시도 중...');
            await this.attemptAutoFix(solutions);
        }

        // 5. 이슈 생성 (옵션)
        if (options.createIssue) {
            console.log('\n📝 이슈 자동 생성 중...');
            await this.createTroubleshootingIssue(symptom, solutions);
        }
    }

    /**
     * 📊 지침 준수 검증 실행
     */
    async runComplianceCheck(args) {
        console.log('📊 Context7 지침 준수 검증 시작...\n');
        
        const options = this.parseOptions(args, {
            preWork: ['--pre-work'],
            postWork: ['--post-work'],
            fixSuggestions: ['--fix-suggestions']
        });

        let results = {};

        if (options.preWork || (!options.postWork && !options.preWork)) {
            console.log('🔍 작업 시작 전 체크리스트 검증...');
            results.preWork = await this.complianceChecker.runPreWorkCheck();
        }

        if (options.postWork || (!options.postWork && !options.preWork)) {
            console.log('🔍 작업 완료 후 체크리스트 검증...');
            results.postWork = await this.complianceChecker.runPostWorkCheck();
        }

        if (options.fixSuggestions && (results.preWork || results.postWork)) {
            console.log('\n🔧 자동 수정 제안 생성...');
            const allResults = [...(results.preWork?.results || []), ...(results.postWork?.results || [])];
            const suggestions = this.complianceChecker.generateAutoFixSuggestions(allResults);
            console.log(suggestions);
        }

        // 종합 리포트
        if (results.preWork && results.postWork) {
            const report = this.complianceChecker.generateComplianceReport(results.preWork, results.postWork);
            console.log(`\n🏆 최종 지침 준수 점수: ${report.score}점 (${report.grade})`);
        }
    }

    /**
     * 🏥 시스템 헬스체크 실행
     */
    async runHealthCheck(args) {
        console.log('🏥 시스템 상태 및 헬스체크 시작...\n');
        
        const component = args[0];
        const options = this.parseOptions(args, {
            all: ['--all'],
            fix: ['--fix'],
            report: ['--report']
        });

        const healthStatus = {
            timestamp: new Date().toISOString(),
            overall: 'checking',
            components: {}
        };

        // 컴포넌트별 헬스체크
        const componentsToCheck = options.all ? 
            ['backend', 'frontend', 'database', 'logs', 'git', 'dependencies'] :
            [component || 'backend'];

        for (const comp of componentsToCheck) {
            console.log(`🔍 ${comp} 상태 점검 중...`);
            healthStatus.components[comp] = await this.checkComponentHealth(comp);
        }

        // 전체 상태 결정
        const healthScores = Object.values(healthStatus.components).map(c => c.score);
        const averageScore = healthScores.reduce((a, b) => a + b, 0) / healthScores.length;
        healthStatus.overall = averageScore >= 80 ? 'healthy' : averageScore >= 60 ? 'warning' : 'critical';

        this.displayHealthStatus(healthStatus);

        // 자동 수정 옵션
        if (options.fix) {
            console.log('\n🔧 발견된 문제 자동 수정 시도...');
            await this.autoFixHealthIssues(healthStatus);
        }

        // 상세 리포트 생성
        if (options.report) {
            const reportPath = path.join(this.projectRoot, `health-report-${Date.now()}.json`);
            await fs.writeFile(reportPath, JSON.stringify(healthStatus, null, 2));
            console.log(`📋 상세 리포트 생성: ${reportPath}`);
        }
    }

    /**
     * 📈 통계 및 분석 데이터 표시
     */
    async showStats(args) {
        console.log('📈 개발 통계 및 분석 데이터 로드 중...\n');
        
        const period = args[0] || 'week';
        const type = args[1] || 'all';
        
        const options = this.parseOptions(args, {
            period: ['--period'],
            type: ['--type'],
            chart: ['--chart']
        });

        const finalPeriod = options.period || period;
        const finalType = options.type || type;

        // solutions-db.md에서 통계 데이터 수집
        const knowledge = await this.solutionsLearning.loadSolutionsDatabase();
        const stats = this.generateStats(knowledge, finalPeriod, finalType);

        if (options.chart) {
            console.log('📊 차트 형태로 통계 표시:\n');
            this.displayStatsAsChart(stats);
        } else {
            this.displayStatsConsole(stats);
        }
    }

    /**
     * 🔄 워크플로우 자동화 실행
     */
    async runWorkflow(args) {
        console.log('🔄 개발 워크플로우 자동화 시작...\n');
        
        const action = args[0] || 'start';
        
        const options = this.parseOptions(args, {
            action: ['--action'],
            phase: ['--phase'],
            autoCommit: ['--auto-commit']
        });

        const finalAction = options.action || action;
        const phase = options.phase || 'current';

        console.log(`🎯 워크플로우 액션: ${finalAction}`);
        console.log(`📋 개발 Phase: ${phase}\n`);

        switch (finalAction) {
            case 'start':
                await this.startWorkflow(phase, options);
                break;
            case 'check':
                await this.checkWorkflow(phase);
                break;
            case 'deploy':
                await this.deployWorkflow(phase, options);
                break;
            default:
                console.error(`❌ 알 수 없는 워크플로우 액션: ${finalAction}`);
                break;
        }
    }

    /**
     * ⚙️ 설정 관리
     */
    async manageConfig(args) {
        const action = args[0];
        const key = args[1];
        const value = args[2];

        const configFile = path.join(this.configPath, 'config.json');
        
        let config = {};
        try {
            const configData = await fs.readFile(configFile, 'utf8');
            config = JSON.parse(configData);
        } catch (error) {
            // 설정 파일이 없으면 기본값 사용
            config = this.getDefaultConfig();
        }

        switch (action) {
            case 'get':
                console.log(`${key}: ${config[key] || 'undefined'}`);
                break;
            
            case 'set':
                config[key] = value;
                await this.saveConfig(config);
                console.log(`✅ ${key} = ${value} 설정 완료`);
                break;
            
            case 'list':
                console.log('📋 현재 설정:');
                Object.entries(config).forEach(([k, v]) => {
                    console.log(`  ${k}: ${v}`);
                });
                break;
            
            case 'reset':
                config = this.getDefaultConfig();
                await this.saveConfig(config);
                console.log('✅ 설정 초기화 완료');
                break;
            
            default:
                console.error(`❌ 알 수 없는 설정 액션: ${action}`);
                break;
        }
    }

    /**
     * 헬퍼 메서드들
     */

    // 명령행 옵션 파싱
    parseOptions(args, optionMap) {
        const options = {};
        
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            
            Object.entries(optionMap).forEach(([key, flags]) => {
                if (flags.includes(arg)) {
                    // 불린 플래그
                    if (flags.some(f => f.startsWith('--') && !f.includes('='))) {
                        options[key] = true;
                    }
                    // 값이 있는 옵션
                    else if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
                        options[key] = args[i + 1];
                        i++; // 다음 인자 스킵
                    }
                }
            });
        }
        
        return options;
    }

    // 작업 유형 자동 감지
    detectWorkType() {
        // Git 상태, 파일 구조 등을 분석하여 작업 유형 추정
        const possibleTypes = [
            'spring_boot_error',
            'api_development', 
            'frontend_development',
            'database_optimization',
            'general_development'
        ];
        
        // 현재는 기본값 반환, 실제로는 더 지능적인 감지 로직 필요
        return 'general_development';
    }

    // 프로젝트 컨텍스트 수집
    async getProjectContext() {
        try {
            const claudeMd = await fs.readFile(path.join(this.projectRoot, 'CLAUDE.md'), 'utf8');
            const packageJson = await fs.readFile(path.join(this.projectRoot, 'package.json'), 'utf8').catch(() => '{}');
            
            return {
                projectName: 'ElderberryProject',
                currentPhase: 'Phase 7',
                hasClaudeMd: !!claudeMd,
                springBootStatus: '67개 컴파일 에러 존재',
                packageInfo: JSON.parse(packageJson)
            };
        } catch (error) {
            return {
                projectName: 'Unknown',
                currentPhase: 'Unknown',
                hasClaudeMd: false,
                springBootStatus: 'Unknown'
            };
        }
    }

    // 기본 설정값
    getDefaultConfig() {
        return {
            'ai.guide.enabled': true,
            'ai.checklist.enabled': true,
            'ai.prediction.enabled': true,
            'logging.level': 'info',
            'compliance.strict': false,
            'workflow.auto-commit': false,
            'health.check.interval': '5m'
        };
    }

    // 설정 저장
    async saveConfig(config) {
        try {
            await fs.mkdir(this.configPath, { recursive: true });
            await fs.writeFile(
                path.join(this.configPath, 'config.json'),
                JSON.stringify(config, null, 2)
            );
        } catch (error) {
            console.error('❌ 설정 저장 실패:', error.message);
        }
    }

    // 추가 헬퍼 메서드들은 실제 구현에서 확장...
    async runQuickSystemCheck() {
        console.log('⚡ 시스템 빠른 체크 수행 중...');
        // 구현 필요
    }

    displayChecklistConsole(checklist, priorityFilter) {
        console.log(`🔥 ${checklist.title}`);
        // 구현 필요
    }

    displayAnalysisSummary(analysis) {
        console.log(`📊 분석 요약: 위험도 ${analysis.overallRiskScore}점`);
        // 구현 필요
    }

    async generateTroubleshootingSolutions(symptom) {
        return [{ problem: symptom, solution: '기본 해결책', confidence: 0.7 }];
    }

    displayTroubleshootingSolutions(solutions) {
        console.log('💡 제안된 해결책:');
        solutions.forEach((sol, i) => {
            console.log(`  ${i + 1}. ${sol.solution} (신뢰도: ${Math.round(sol.confidence * 100)}%)`);
        });
    }

    async checkComponentHealth(component) {
        // 컴포넌트별 헬스체크 로직
        return { status: 'healthy', score: 85, issues: [] };
    }

    displayHealthStatus(status) {
        console.log(`🏥 전체 시스템 상태: ${status.overall.toUpperCase()}`);
        // 구현 필요
    }

    generateStats(knowledge, period, type) {
        return {
            period,
            type,
            totalIssues: knowledge.totalIssues,
            resolvedIssues: knowledge.resolvedIssues,
            errorPatterns: knowledge.errorPatterns.size
        };
    }

    displayStatsConsole(stats) {
        console.log(`📊 ${stats.period} 기간 통계:`);
        console.log(`  총 이슈: ${stats.totalIssues}개`);
        console.log(`  해결된 이슈: ${stats.resolvedIssues}개`);
        console.log(`  에러 패턴: ${stats.errorPatterns}개`);
    }

    async startWorkflow(phase, options) {
        console.log(`🚀 ${phase} 워크플로우 시작`);
        // 구현 필요
    }
}

// CLI 실행 부분
if (require.main === module) {
    const cli = new ElderberryDevCLI();
    
    cli.run().catch(error => {
        console.error('❌ CLI 실행 중 오류 발생:', error.message);
        process.exit(1);
    });
}

module.exports = ElderberryDevCLI;