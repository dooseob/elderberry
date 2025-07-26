#!/usr/bin/env node

/**
 * 엘더베리 포트폴리오 CLI
 * 
 * 개발자와 AI 모두에게 도움이 되는 통합 명령줄 도구
 * - 핵심 이슈만 자동 선별 및 기록
 * - 포트폴리오 품질 관리
 * - 성장 추적 및 분석
 * - 간단한 명령어로 복잡한 작업 수행
 */

const { program } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const ora = require('ora');
const path = require('path');

// 서비스 모듈들
const PortfolioTroubleshootingService = require('./claude-guides/services/PortfolioTroubleshootingService');
const AutomatedSolutionLogger = require('./claude-guides/services/AutomatedSolutionLogger');
const EnhancedAnalysisOrchestrator = require('./claude-guides/services/EnhancedAnalysisOrchestrator').EnhancedAnalysisOrchestrator;

class PortfolioCLI {
    constructor() {
        this.portfolioService = new PortfolioTroubleshootingService();
        this.solutionLogger = new AutomatedSolutionLogger();
        this.analysisOrchestrator = new EnhancedAnalysisOrchestrator();
        
        this.setupCommands();
    }

    setupCommands() {
        program
            .name('elderberry-portfolio')
            .description('엘더베리 프로젝트 포트폴리오 관리 도구')
            .version('1.0.0');

        // 이슈 기록 명령어들
        this.setupIssueCommands();
        
        // 분석 명령어들
        this.setupAnalysisCommands();
        
        // 포트폴리오 관리 명령어들
        this.setupPortfolioCommands();
        
        // 유틸리티 명령어들
        this.setupUtilityCommands();
    }

    setupIssueCommands() {
        const issueCmd = program
            .command('issue')
            .description('이슈 및 솔루션 관리');

        // 새 이슈 기록 시작
        issueCmd
            .command('start')
            .description('새로운 문제 해결 세션 시작')
            .option('-t, --title <title>', '문제 제목')
            .option('-p, --priority <priority>', '우선순위 (critical|high|medium|low)', 'medium')
            .option('-c, --category <category>', '카테고리')
            .action(async (options) => {
                await this.startIssueSession(options);
            });

        // 해결 단계 기록
        issueCmd
            .command('log <step>')
            .description('해결 단계 기록')
            .option('-t, --type <type>', '단계 유형 (analysis|action|test|breakthrough)', 'action')
            .action(async (step, options) => {
                await this.logSolutionStep(step, options);
            });

        // 이슈 완료
        issueCmd
            .command('complete')
            .description('문제 해결 완료 및 솔루션 기록')
            .option('-s, --summary <summary>', '솔루션 요약')
            .action(async (options) => {
                await this.completeIssue(options);
            });

        // 빠른 이슈 기록 (한 번에)
        issueCmd
            .command('quick')
            .description('빠른 이슈 기록 (대화형)')
            .action(async () => {
                await this.quickIssueRecord();
            });
    }

    setupAnalysisCommands() {
        const analysisCmd = program
            .command('analyze')
            .description('프로젝트 종합 분석');

        // 전체 분석 실행
        analysisCmd
            .command('all')
            .description('모든 에이전트를 사용한 종합 분석')
            .option('--agents <agents>', '특정 에이전트만 실행 (comma-separated)')
            .option('--cache', '캐시 사용 여부', true)
            .action(async (options) => {
                await this.runComprehensiveAnalysis(options);
            });

        // 특정 영역 분석
        analysisCmd
            .command('code')
            .description('코드 품질 분석만 실행')
            .action(async () => {
                await this.runSpecificAnalysis(['claudeGuide', 'sonarQube']);
            });

        analysisCmd
            .command('security')
            .description('보안 분석만 실행')
            .action(async () => {
                await this.runSpecificAnalysis(['snykSecurity']);
            });

        analysisCmd
            .command('docs')
            .description('문서화 분석만 실행')
            .action(async () => {
                await this.runSpecificAnalysis(['apiDocumentation']);
            });
    }

    setupPortfolioCommands() {
        const portfolioCmd = program
            .command('portfolio')
            .description('포트폴리오 관리');

        // 포트폴리오 현황
        portfolioCmd
            .command('status')
            .description('포트폴리오 현재 상태')
            .action(async () => {
                await this.showPortfolioStatus();
            });

        // 성장 스토리 생성
        portfolioCmd
            .command('story')
            .description('성장 스토리 생성')
            .action(async () => {
                await this.generateGrowthStory();
            });

        // 포트폴리오 품질 검사
        portfolioCmd
            .command('quality')
            .description('포트폴리오 품질 점검')
            .action(async () => {
                await this.checkPortfolioQuality();
            });

        // 카테고리별 조회
        portfolioCmd
            .command('list [category]')
            .description('카테고리별 이슈 목록')
            .action(async (category) => {
                await this.listIssuesByCategory(category);
            });
    }

    setupUtilityCommands() {
        // 대시보드 실행
        program
            .command('dashboard')
            .description('분석 대시보드 실행')
            .option('-p, --port <port>', '포트 번호', '3000')
            .action(async (options) => {
                await this.startDashboard(options);
            });

        // 시스템 상태 확인
        program
            .command('health')
            .description('시스템 상태 확인')
            .action(async () => {
                await this.checkSystemHealth();
            });

        // 설정 초기화
        program
            .command('init')
            .description('포트폴리오 시스템 초기화')
            .action(async () => {
                await this.initializeSystem();
            });
    }

    // ===== 명령어 구현 =====

    async startIssueSession(options) {
        const spinner = ora('문제 해결 세션 시작 중...').start();

        try {
            let title = options.title;
            if (!title) {
                spinner.stop();
                const answer = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'title',
                        message: '해결하려는 문제를 간단히 설명해주세요:',
                        validate: input => input.length > 10 || '문제 설명은 10자 이상이어야 합니다.'
                    }
                ]);
                title = answer.title;
                spinner.start();
            }

            await this.solutionLogger.initialize();
            const sessionId = await this.solutionLogger.startProblemSolvingSession(title, {
                priority: options.priority,
                category: options.category,
                cli: true
            });

            spinner.succeed(chalk.green('문제 해결 세션이 시작되었습니다!'));
            console.log(chalk.blue(`세션 ID: ${sessionId}`));
            console.log(chalk.yellow('해결 과정에서 "elderberry-portfolio issue log <단계>"로 과정을 기록하세요.'));

        } catch (error) {
            spinner.fail(chalk.red('세션 시작 실패: ' + error.message));
        }
    }

    async logSolutionStep(step, options) {
        const spinner = ora('해결 단계 기록 중...').start();

        try {
            await this.solutionLogger.logSolutionStep(step, options.type, {
                timestamp: Date.now(),
                cli: true
            });

            spinner.succeed(chalk.green('해결 단계가 기록되었습니다!'));
            console.log(chalk.blue(`단계: ${step}`));
            console.log(chalk.yellow(`유형: ${options.type}`));

        } catch (error) {
            spinner.fail(chalk.red('단계 기록 실패: ' + error.message));
        }
    }

    async completeIssue(options) {
        const spinner = ora('솔루션 완료 처리 중...').start();

        try {
            let summary = options.summary;
            if (!summary) {
                spinner.stop();
                const answer = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'summary',
                        message: '솔루션을 요약해주세요:',
                        validate: input => input.length > 20 || '솔루션 요약은 20자 이상이어야 합니다.'
                    }
                ]);
                summary = answer.summary;
                spinner.start();
            }

            const result = await this.solutionLogger.completeSolution(summary, {
                success: true,
                cli: true
            });

            if (result.success) {
                if (result.recorded) {
                    spinner.succeed(chalk.green(`솔루션이 포트폴리오에 기록되었습니다! (품질 점수: ${result.qualityScore}/10)`));
                } else {
                    spinner.succeed(chalk.yellow(`솔루션이 완료되었지만 품질 기준에 미달하여 포트폴리오에는 기록되지 않았습니다. (품질 점수: ${result.qualityScore}/10)`));
                }
            } else {
                spinner.fail(chalk.red('솔루션 완료 처리 실패: ' + result.error));
            }

        } catch (error) {
            spinner.fail(chalk.red('솔루션 완료 실패: ' + error.message));
        }
    }

    async quickIssueRecord() {
        console.log(chalk.blue('📝 빠른 이슈 기록 (대화형 모드)\n'));

        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: '문제 제목:',
                validate: input => input.length > 5 || '제목은 5자 이상이어야 합니다.'
            },
            {
                type: 'list',
                name: 'category',
                message: '카테고리:',
                choices: [
                    'architecture - 시스템 아키텍처',
                    'performance - 성능 최적화', 
                    'security - 보안 강화',
                    'integration - 시스템 통합',
                    'dataModeling - 데이터 모델링',
                    'userExperience - 사용자 경험'
                ]
            },
            {
                type: 'list',
                name: 'priority',
                message: '우선순위:',
                choices: ['critical', 'high', 'medium', 'low']
            },
            {
                type: 'editor',
                name: 'situation',
                message: '상황 설명 (Situation):',
                validate: input => input.length > 50 || '상황 설명은 50자 이상이어야 합니다.'
            },
            {
                type: 'editor', 
                name: 'solution',
                message: '해결 방법 (Action):',
                validate: input => input.length > 50 || '해결 방법은 50자 이상이어야 합니다.'
            },
            {
                type: 'editor',
                name: 'result',
                message: '결과 및 성과 (Result):',
                validate: input => input.length > 30 || '결과 설명은 30자 이상이어야 합니다.'
            }
        ]);

        const spinner = ora('이슈 기록 처리 중...').start();

        try {
            const issueData = {
                title: answers.title,
                category: answers.category.split(' - ')[0],
                priority: answers.priority,
                description: answers.situation,
                solution: answers.solution,
                outcome: answers.result,
                context: {
                    cli: true,
                    quickRecord: true
                }
            };

            await this.portfolioService.initialize();
            const success = await this.portfolioService.recordCoreIssue(issueData);

            if (success) {
                spinner.succeed(chalk.green('이슈가 성공적으로 포트폴리오에 기록되었습니다!'));
            } else {
                spinner.warn(chalk.yellow('이슈가 포트폴리오 품질 기준에 미달하여 기록되지 않았습니다.'));
            }

        } catch (error) {
            spinner.fail(chalk.red('이슈 기록 실패: ' + error.message));
        }
    }

    async runComprehensiveAnalysis(options) {
        const spinner = ora('종합 분석 실행 중...').start();

        try {
            await this.analysisOrchestrator.initialize();

            const analysisOptions = {
                projectPath: process.cwd(),
                cache: options.cache
            };

            if (options.agents) {
                analysisOptions.agents = options.agents.split(',').map(a => a.trim());
            }

            const result = await this.analysisOrchestrator.performIntegratedAnalysis(
                process.cwd(),
                analysisOptions
            );

            spinner.succeed(chalk.green('종합 분석 완료!'));
            
            this.displayAnalysisResults(result);

        } catch (error) {
            spinner.fail(chalk.red('분석 실패: ' + error.message));
        }
    }

    async showPortfolioStatus() {
        const spinner = ora('포트폴리오 상태 조회 중...').start();

        try {
            await this.portfolioService.initialize();
            const summary = await this.portfolioService.generatePortfolioSummary();

            spinner.succeed(chalk.green('포트폴리오 상태 조회 완료!'));

            console.log(chalk.blue('\n📊 포트폴리오 현황'));
            console.log(chalk.green('─'.repeat(50)));
            console.log(`총 이슈 수: ${chalk.yellow(summary.overview.totalIssues)}개`);
            console.log(`평균 영향도: ${chalk.yellow(summary.overview.averageImpact.toFixed(1))}/10`);
            console.log(`포트폴리오 준비도: ${chalk.yellow(summary.readinessIndicator)}%`);
            
            console.log(chalk.blue('\n🏆 주요 성과'));
            summary.highlights.forEach((highlight, index) => {
                console.log(`${index + 1}. ${chalk.yellow(highlight.title)} (${highlight.impact}/10)`);
            });

            console.log(chalk.blue('\n🛠️ 기술 스택'));
            console.log(summary.overview.techStackCoverage.join(', '));

        } catch (error) {
            spinner.fail(chalk.red('포트폴리오 상태 조회 실패: ' + error.message));
        }
    }

    displayAnalysisResults(result) {
        console.log(chalk.blue('\n📊 종합 분석 결과'));
        console.log(chalk.green('─'.repeat(60)));
        
        console.log(`분석 ID: ${chalk.yellow(result.analysisId)}`);
        console.log(`소요 시간: ${chalk.yellow(result.duration)}ms`);
        console.log(`참여 에이전트: ${chalk.yellow(result.metadata.participatingAgents.join(', '))}`);
        
        if (result.recommendations && result.recommendations.length > 0) {
            console.log(chalk.blue('\n🚀 주요 권장사항'));
            result.recommendations.slice(0, 5).forEach((rec, index) => {
                const priorityColor = {
                    critical: chalk.red,
                    high: chalk.yellow,
                    medium: chalk.blue,
                    low: chalk.gray
                }[rec.priority] || chalk.white;
                
                console.log(`${index + 1}. ${priorityColor(`[${rec.priority.toUpperCase()}]`)} ${rec.title}`);
            });
        }

        console.log(chalk.blue('\n📈 요약'));
        if (result.summary) {
            console.log(`총 권장사항: ${chalk.yellow(result.summary.totalRecommendations)}개`);
            console.log(`치명적 이슈: ${chalk.red(result.summary.criticalIssues)}개`);
        }
    }

    async checkSystemHealth() {
        const spinner = ora('시스템 상태 확인 중...').start();

        try {
            const health = {
                portfolioService: false,
                solutionLogger: false,
                analysisOrchestrator: false
            };

            // 각 서비스 상태 확인
            try {
                await this.portfolioService.initialize();
                health.portfolioService = true;
            } catch (error) {
                console.log(chalk.red(`포트폴리오 서비스 오류: ${error.message}`));
            }

            try {
                await this.solutionLogger.initialize();
                health.solutionLogger = true;
            } catch (error) {
                console.log(chalk.red(`솔루션 로거 오류: ${error.message}`));
            }

            try {
                await this.analysisOrchestrator.initialize();
                health.analysisOrchestrator = true;
            } catch (error) {
                console.log(chalk.red(`분석 오케스트레이터 오류: ${error.message}`));
            }

            const healthyServices = Object.values(health).filter(Boolean).length;
            const totalServices = Object.keys(health).length;

            if (healthyServices === totalServices) {
                spinner.succeed(chalk.green('모든 시스템이 정상 작동 중입니다!'));
            } else {
                spinner.warn(chalk.yellow(`${healthyServices}/${totalServices} 서비스가 정상 작동 중입니다.`));
            }

            console.log(chalk.blue('\n🏥 서비스 상태'));
            Object.entries(health).forEach(([service, status]) => {
                const statusIcon = status ? chalk.green('✅') : chalk.red('❌');
                console.log(`${statusIcon} ${service}`);
            });

        } catch (error) {
            spinner.fail(chalk.red('시스템 상태 확인 실패: ' + error.message));
        }
    }

    // 스켈레톤 메서드들
    async runSpecificAnalysis(agents) {
        await this.runComprehensiveAnalysis({ agents: agents.join(',') });
    }

    async generateGrowthStory() {
        const spinner = ora('성장 스토리 생성 중...').start();
        try {
            await this.portfolioService.initialize();
            await this.portfolioService.generateGrowthStory();
            spinner.succeed(chalk.green('성장 스토리가 생성되었습니다!'));
        } catch (error) {
            spinner.fail(chalk.red('성장 스토리 생성 실패: ' + error.message));
        }
    }

    async checkPortfolioQuality() {
        console.log(chalk.blue('포트폴리오 품질 검사 구현 예정'));
    }

    async listIssuesByCategory(category) {
        console.log(chalk.blue(`${category || '전체'} 카테고리 이슈 목록 구현 예정`));
    }

    async startDashboard(options) {
        console.log(chalk.blue(`포트 ${options.port}에서 대시보드 실행 구현 예정`));
    }

    async initializeSystem() {
        const spinner = ora('시스템 초기화 중...').start();
        try {
            await this.portfolioService.initialize();
            await this.solutionLogger.initialize();
            await this.analysisOrchestrator.initialize();
            spinner.succeed(chalk.green('시스템 초기화 완료!'));
        } catch (error) {
            spinner.fail(chalk.red('시스템 초기화 실패: ' + error.message));
        }
    }

    run() {
        program.parse();
    }
}

// CLI 실행
if (require.main === module) {
    const cli = new PortfolioCLI();
    cli.run();
}

module.exports = PortfolioCLI;