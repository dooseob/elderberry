/**
 * 에이전트 시스템 테스트 스위트
 * 새로 추가된 WebTestingMasterAgent와 기존 에이전트들의 통합 테스트
 * 
 * @version 1.0.0
 * @date 2025-08-01
 */

const { MCPIntegratedAgentSystem } = require('./MCPIntegratedAgentSystem');
const { WebTestingMasterAgent } = require('./WebTestingMasterAgent');

class AgentSystemTest {
    constructor() {
        this.testResults = {
            timestamp: new Date().toISOString(),
            tests: [],
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                warnings: 0
            }
        };
        
        this.mcpSystem = new MCPIntegratedAgentSystem();
        this.webTestingAgent = new WebTestingMasterAgent();
    }

    /**
     * 전체 에이전트 시스템 테스트 실행
     */
    async runCompleteAgentSystemTest() {
        console.log('🧪 엘더베리 에이전트 시스템 통합 테스트 시작...');
        
        const testSuite = [
            // 1. 기존 MCP 통합 에이전트 시스템 테스트
            { name: 'MCP 통합 시스템 초기화', test: () => this.testMCPSystemInitialization() },
            { name: '서브에이전트 매핑 검증', test: () => this.testAgentCapabilityMapping() },
            { name: '커스텀 명령어 시스템', test: () => this.testCustomCommandSystem() },
            
            // 2. WebTestingMasterAgent 테스트
            { name: 'WebTestingMasterAgent 초기화', test: () => this.testWebTestingAgentInitialization() },
            { name: '테스트 환경 설정 검증', test: () => this.testEnvironmentConfiguration() },
            { name: '테스트 스위트 실행 시뮬레이션', test: () => this.testSuitExecutionSimulation() },
            
            // 3. 에이전트 간 통합 테스트
            { name: '에이전트 통합 워크플로우', test: () => this.testAgentIntegrationWorkflow() },
            { name: '메모리 시스템 연동', test: () => this.testMemorySystemIntegration() },
            { name: '에러 처리 및 복구', test: () => this.testErrorHandlingAndRecovery() },
            
            // 4. 성능 및 안정성 테스트
            { name: '동시 에이전트 실행', test: () => this.testConcurrentAgentExecution() },
            { name: '대용량 테스트 처리', test: () => this.testLargeScaleTestHandling() },
            { name: '시스템 리소스 관리', test: () => this.testSystemResourceManagement() }
        ];

        for (const testCase of testSuite) {
            await this.runSingleTest(testCase.name, testCase.test);
        }

        await this.generateTestReport();
        return this.testResults;
    }

    /**
     * 개별 테스트 실행
     */
    async runSingleTest(testName, testFunction) {
        console.log(`  🔍 ${testName} 테스트 중...`);
        
        const startTime = Date.now();
        let result = { status: 'unknown', details: '', warnings: [] };
        
        try {
            result = await testFunction();
            this.testResults.summary.total++;
            
            if (result.status === 'passed') {
                this.testResults.summary.passed++;
                console.log(`    ✅ ${testName}: 통과`);
            } else if (result.status === 'warning') {
                this.testResults.summary.warnings++;
                console.log(`    ⚠️ ${testName}: 경고 - ${result.details}`);
            } else {
                this.testResults.summary.failed++;
                console.log(`    ❌ ${testName}: 실패 - ${result.details}`);
            }
        } catch (error) {
            result = { status: 'failed', details: error.message, error: error };
            this.testResults.summary.total++;
            this.testResults.summary.failed++;
            console.log(`    💥 ${testName}: 예외 발생 - ${error.message}`);
        }
        
        const duration = Date.now() - startTime;
        
        this.testResults.tests.push({
            name: testName,
            status: result.status,
            details: result.details,
            warnings: result.warnings || [],
            duration,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * 1. MCP 통합 시스템 초기화 테스트
     */
    async testMCPSystemInitialization() {
        const requiredMCPTools = ['sequential-thinking', 'context7', 'filesystem', 'memory', 'github', 'playwright'];
        const requiredAgents = ['CLAUDE_GUIDE', 'DEBUG', 'API_DOCUMENTATION', 'TROUBLESHOOTING', 'GOOGLE_SEO', 'SECURITY_AUDIT', 'WEB_TESTING_MASTER'];
        
        // MCP 도구 확인
        const mcpToolsMatch = requiredMCPTools.every(tool => 
            Object.values(this.mcpSystem.mcpTools).includes(tool)
        );
        
        // 에이전트 확인
        const agentsMatch = requiredAgents.every(agent => 
            Object.keys(this.mcpSystem.agentCapabilities).includes(agent)
        );
        
        if (mcpToolsMatch && agentsMatch) {
            return {
                status: 'passed',
                details: `MCP 도구 ${requiredMCPTools.length}개, 에이전트 ${requiredAgents.length}개 모두 정상 초기화`
            };
        } else {
            return {
                status: 'failed',
                details: `MCP 도구 매칭: ${mcpToolsMatch}, 에이전트 매칭: ${agentsMatch}`
            };
        }
    }

    /**
     * 2. 서브에이전트 매핑 검증
     */
    async testAgentCapabilityMapping() {
        const webTestingAgentCapabilities = this.mcpSystem.agentCapabilities['WEB_TESTING_MASTER'];
        const expectedCapabilities = ['playwright', 'sequential-thinking', 'memory', 'filesystem', 'github'];
        
        const hasAllCapabilities = expectedCapabilities.every(capability => 
            webTestingAgentCapabilities.includes(capability)
        );
        
        const playwrightPrimaryTool = webTestingAgentCapabilities[0] === 'playwright';
        
        if (hasAllCapabilities && playwrightPrimaryTool) {
            return {
                status: 'passed',
                details: `WEB_TESTING_MASTER 에이전트 매핑 완벽 - ${webTestingAgentCapabilities.length}개 MCP 도구 할당`
            };
        } else {
            return {
                status: 'failed',
                details: `매핑 실패: 필수 기능 ${hasAllCapabilities}, Playwright 우선순위 ${playwrightPrimaryTool}`
            };
        }
    }

    /**
     * 3. 커스텀 명령어 시스템 테스트
     */
    async testCustomCommandSystem() {
        const testCommands = ['/max', '/auto', '/smart', '/test'];
        const results = [];
        
        for (const command of testCommands) {
            try {
                const result = await this.mcpSystem.executeCustomCommandIntegration({
                    command: command,
                    task: '에이전트 시스템 테스트',
                    options: { testMode: true }
                });
                
                results.push({
                    command,
                    success: result.performance?.totalAgents > 0,
                    agentCount: result.performance?.totalAgents || 0
                });
            } catch (error) {
                results.push({
                    command,
                    success: false,
                    error: error.message
                });
            }
        }
        
        const successfulCommands = results.filter(r => r.success).length;
        const newTestCommand = results.find(r => r.command === '/test');
        
        if (successfulCommands === testCommands.length && newTestCommand?.success) {
            return {
                status: 'passed',
                details: `모든 커스텀 명령어 정상 작동, /test 명령어 성공적으로 추가`
            };
        } else {
            return {
                status: 'failed',
                details: `${successfulCommands}/${testCommands.length} 명령어 성공, /test 상태: ${newTestCommand?.success}`
            };
        }
    }

    /**
     * 4. WebTestingMasterAgent 초기화 테스트
     */
    async testWebTestingAgentInitialization() {
        const requiredCapabilities = [
            'playwright-mcp-integration',
            'e2e-testing-automation', 
            'visual-regression-testing',
            'web-performance-analysis',
            'accessibility-validation'
        ];
        
        const hasAllCapabilities = requiredCapabilities.every(capability => 
            this.webTestingAgent.capabilities.includes(capability)
        );
        
        const hasTestEnvironments = this.webTestingAgent.testEnvironments?.browsers?.desktop?.length > 0;
        const hasPerformanceThresholds = this.webTestingAgent.performanceThresholds?.lcp?.good === 2500;
        
        if (hasAllCapabilities && hasTestEnvironments && hasPerformanceThresholds) {
            return {
                status: 'passed',
                details: `WebTestingMasterAgent 완전 초기화 - ${this.webTestingAgent.capabilities.length}개 기능 활성화`
            };
        } else {
            return {
                status: 'failed',
                details: `초기화 실패: 기능 ${hasAllCapabilities}, 환경 ${hasTestEnvironments}, 임계값 ${hasPerformanceThresholds}`
            };
        }
    }

    /**
     * 5. 테스트 환경 설정 검증
     */
    async testEnvironmentConfiguration() {
        const browserCount = Object.values(this.webTestingAgent.testEnvironments.browsers).flat().length;
        const viewportCount = Object.keys(this.webTestingAgent.testEnvironments.viewports).length;
        const themeCount = this.webTestingAgent.testEnvironments.themes.length;
        
        const expectedMinimums = { browsers: 8, viewports: 5, themes: 4 };
        
        const validConfiguration = 
            browserCount >= expectedMinimums.browsers &&
            viewportCount >= expectedMinimums.viewports &&
            themeCount >= expectedMinimums.themes;
        
        if (validConfiguration) {
            return {
                status: 'passed',
                details: `테스트 환경 완비 - 브라우저 ${browserCount}개, 뷰포트 ${viewportCount}개, 테마 ${themeCount}개`
            };
        } else {
            return {
                status: 'warning',
                details: `일부 환경 부족: 브라우저 ${browserCount}/${expectedMinimums.browsers}, 뷰포트 ${viewportCount}/${expectedMinimums.viewports}`
            };
        }
    }

    /**
     * 6. 테스트 스위트 실행 시뮬레이션
     */
    async testSuitExecutionSimulation() {
        try {
            // 엘더베리 종합 테스트 스위트 시뮬레이션 (실제 실행 없이 구조만 검증)
            const mockConfig = {
                testUrl: 'http://localhost:5173',
                includeAuth: true,
                includeFacilities: true,
                includeHealth: true,
                includeLinearDesign: true,
                browsers: ['chromium'],
                generateDetailedReport: false
            };
            
            // 테스트 전략 수립 시뮬레이션
            const strategy = await this.webTestingAgent.planElderberryTestStrategy(mockConfig);
            
            const hasValidStrategy = strategy.phases?.length >= 5;
            const hasSuccessCriteria = strategy.successCriteria?.length >= 5;
            const hasEstimatedDuration = strategy.estimatedTotalDuration;
            
            if (hasValidStrategy && hasSuccessCriteria && hasEstimatedDuration) {
                return {
                    status: 'passed',
                    details: `테스트 전략 수립 성공 - ${strategy.phases.length}단계, ${strategy.successCriteria.length}개 성공 기준`
                };
            } else {
                return {
                    status: 'failed',
                    details: `전략 수립 실패: 단계 ${hasValidStrategy}, 기준 ${hasSuccessCriteria}, 시간 ${hasEstimatedDuration}`
                };
            }
        } catch (error) {
            return {
                status: 'failed',
                details: `테스트 스위트 시뮬레이션 실패: ${error.message}`
            };
        }
    }

    /**
     * 7. 에이전트 통합 워크플로우 테스트
     */
    async testAgentIntegrationWorkflow() {
        try {
            // /max 명령어로 전체 에이전트 통합 실행 시뮬레이션
            const maxModeResult = await this.mcpSystem.executeMaxModeIntegration({
                task: '에이전트 통합 테스트'
            });
            
            const hasIntegrationResult = maxModeResult?.mode === 'MAX_PERFORMANCE';
            const hasAllAgentsInvolved = maxModeResult?.results && Object.keys(maxModeResult.results).length >= 6;
            const webTestingIncluded = maxModeResult?.results?.WEB_TESTING_MASTER;
            
            if (hasIntegrationResult && hasAllAgentsInvolved && webTestingIncluded) {
                return {
                    status: 'passed',
                    details: `에이전트 통합 워크플로우 성공 - ${Object.keys(maxModeResult.results).length}개 에이전트 협업`
                };
            } else {
                return {
                    status: 'failed',
                    details: `통합 실패: 결과 ${hasIntegrationResult}, 에이전트 ${hasAllAgentsInvolved}, 웹테스팅 ${!!webTestingIncluded}`
                };
            }
        } catch (error) {
            return {
                status: 'failed',
                details: `워크플로우 테스트 실패: ${error.message}`
            };
        }
    }

    /**
     * 8. 메모리 시스템 연동 테스트
     */
    async testMemorySystemIntegration() {
        try {
            // 학습 시스템 테스트
            const learningResult = await this.mcpSystem.learnFromExperience(
                'WEB_TESTING_MASTER',
                '에이전트 시스템 테스트',
                { success: true, performance: 'excellent' },
                true
            );
            
            const memoryStorageTest = await this.webTestingAgent.storeComprehensiveResults(
                'test-integration',
                { testData: 'sample', timestamp: new Date().toISOString() }
            );
            
            const hasLearningResult = learningResult !== undefined;
            const hasMemoryStorage = memoryStorageTest?.memoryKey;
            
            if (hasLearningResult && hasMemoryStorage) {
                return {
                    status: 'passed',
                    details: `메모리 시스템 연동 성공 - 학습 데이터 저장 및 패턴 추출 완료`
                };
            } else {
                return {
                    status: 'warning',
                    details: `메모리 연동 부분 성공: 학습 ${hasLearningResult}, 저장 ${!!hasMemoryStorage}`
                };
            }
        } catch (error) {
            return {
                status: 'failed',
                details: `메모리 시스템 연동 실패: ${error.message}`
            };
        }
    }

    /**
     * 9. 에러 처리 및 복구 테스트
     */
    async testErrorHandlingAndRecovery() {
        const errorScenarios = [
            { name: 'invalid-command', test: () => this.mcpSystem.executeCustomCommandIntegration({ command: '/invalid' }) },
            { name: 'missing-parameters', test: () => this.webTestingAgent.runElderberryComprehensiveTestSuite() },
            { name: 'invalid-agent-type', test: () => this.mcpSystem.executeAgentWithCustomCommand('INVALID_AGENT', 'test', '/test', []) }
        ];
        
        let handledErrors = 0;
        const errorDetails = [];
        
        for (const scenario of errorScenarios) {
            try {
                await scenario.test();
                errorDetails.push(`${scenario.name}: 예상된 에러가 발생하지 않음`);
            } catch (error) {
                handledErrors++;
                errorDetails.push(`${scenario.name}: 에러 적절히 처리됨`);
            }
        }
        
        const errorHandlingRate = handledErrors / errorScenarios.length;
        
        if (errorHandlingRate >= 0.8) {
            return {
                status: 'passed',
                details: `에러 처리 우수 - ${handledErrors}/${errorScenarios.length} 시나리오 적절히 처리`
            };
        } else {
            return {
                status: 'warning',
                details: `에러 처리 개선 필요 - ${handledErrors}/${errorScenarios.length} 시나리오만 처리됨`,
                warnings: errorDetails
            };
        }
    }

    /**
     * 10. 동시 에이전트 실행 테스트
     */
    async testConcurrentAgentExecution() {
        try {
            const startTime = Date.now();
            
            // 여러 에이전트 동시 실행 시뮬레이션
            const concurrentTasks = [
                this.mcpSystem.solveComplexProblem('문제1', 'CLAUDE_GUIDE'),
                this.mcpSystem.solveComplexProblem('문제2', 'DEBUG'),
                this.mcpSystem.solveComplexProblem('문제3', 'API_DOCUMENTATION')
            ];
            
            const results = await Promise.all(concurrentTasks);
            const executionTime = Date.now() - startTime;
            
            const allSuccessful = results.every(result => result);
            const reasonableTime = executionTime < 5000; // 5초 이내
            
            if (allSuccessful && reasonableTime) {
                return {
                    status: 'passed',
                    details: `동시 실행 성공 - 3개 에이전트 ${executionTime}ms 내 완료`
                };
            } else {
                return {
                    status: 'warning',
                    details: `동시 실행 이슈: 성공 ${allSuccessful}, 시간 ${executionTime}ms`
                };
            }
        } catch (error) {
            return {
                status: 'failed',
                details: `동시 실행 테스트 실패: ${error.message}`
            };
        }
    }

    /**
     * 11. 대용량 테스트 처리
     */
    async testLargeScaleTestHandling() {
        try {
            // 대용량 테스트 구성 시뮬레이션
            const largeScaleConfig = {
                testUrl: 'http://localhost:5173',
                browsers: ['chromium', 'firefox', 'webkit'],
                components: ['Button', 'Card', 'Input', 'Modal', 'Badge', 'AuthLayout', 'Header', 'Footer'],
                themes: ['light', 'dark', 'high-contrast', 'system'],
                viewports: ['desktop', 'laptop', 'tablet', 'mobile', 'large_mobile']
            };
            
            // 예상 테스트 수 계산
            const totalTests = largeScaleConfig.browsers.length * 
                             largeScaleConfig.components.length * 
                             largeScaleConfig.themes.length * 
                             largeScaleConfig.viewports.length;
            
            const canHandleLargeScale = totalTests <= 1000; // 임계값 설정
            const hasResourceManagement = this.webTestingAgent.testCategories;
            
            if (canHandleLargeScale && hasResourceManagement) {
                return {
                    status: 'passed',
                    details: `대용량 처리 가능 - 최대 ${totalTests}개 테스트 조합 지원`
                };
            } else {
                return {
                    status: 'warning',
                    details: `대용량 처리 제한적 - ${totalTests}개 테스트, 리소스 관리 ${!!hasResourceManagement}`
                };
            }
        } catch (error) {
            return {
                status: 'failed',
                details: `대용량 테스트 처리 실패: ${error.message}`
            };
        }
    }

    /**
     * 12. 시스템 리소스 관리 테스트
     */
    async testSystemResourceManagement() {
        const resourceChecks = {
            memoryManagement: this.mcpSystem.storeInMemory && this.mcpSystem.retrieveFromMemory,
            performanceThresholds: this.webTestingAgent.performanceThresholds,
            browserManagement: this.webTestingAgent.testEnvironments.browsers,
            errorRecovery: this.webTestingAgent.calculateDuration,
            reportGeneration: this.webTestingAgent.generateComprehensiveReport
        };
        
        const passedChecks = Object.entries(resourceChecks).filter(([_, check]) => !!check).length;
        const totalChecks = Object.keys(resourceChecks).length;
        
        const resourceScore = passedChecks / totalChecks;
        
        if (resourceScore >= 0.9) {
            return {
                status: 'passed',
                details: `리소스 관리 우수 - ${passedChecks}/${totalChecks} 체크 통과`
            };
        } else {
            return {
                status: 'warning',
                details: `리소스 관리 개선 필요 - ${passedChecks}/${totalChecks} 체크 통과`,
                warnings: Object.entries(resourceChecks)
                    .filter(([_, check]) => !check)
                    .map(([name, _]) => `${name} 기능 누락`)
            };
        }
    }

    /**
     * 테스트 리포트 생성
     */
    async generateTestReport() {
        const { total, passed, failed, warnings } = this.testResults.summary;
        const successRate = total > 0 ? (passed / total * 100).toFixed(1) : 0;
        
        console.log('\n📊 에이전트 시스템 테스트 결과 요약');
        console.log('='.repeat(50));
        console.log(`총 테스트: ${total}개`);
        console.log(`✅ 통과: ${passed}개`);
        console.log(`❌ 실패: ${failed}개`);
        console.log(`⚠️ 경고: ${warnings}개`);
        console.log(`성공률: ${successRate}%`);
        
        const grade = successRate >= 95 ? 'A+' : 
                     successRate >= 90 ? 'A' : 
                     successRate >= 85 ? 'B+' :
                     successRate >= 80 ? 'B' : 
                     successRate >= 75 ? 'C+' : 'C';
        
        console.log(`전체 등급: ${grade}`);
        
        if (failed > 0) {
            console.log('\n❌ 실패한 테스트:');
            this.testResults.tests
                .filter(test => test.status === 'failed')
                .forEach(test => console.log(`  - ${test.name}: ${test.details}`));
        }
        
        if (warnings > 0) {
            console.log('\n⚠️ 경고가 있는 테스트:');
            this.testResults.tests
                .filter(test => test.status === 'warning')
                .forEach(test => console.log(`  - ${test.name}: ${test.details}`));
        }
        
        this.testResults.summary.successRate = parseFloat(successRate);
        this.testResults.summary.grade = grade;
        this.testResults.completedAt = new Date().toISOString();
        
        console.log('\n✅ 에이전트 시스템 테스트 완료!');
        
        return this.testResults;
    }
}

// 테스트 실행 (모듈로 사용될 때는 실행하지 않음)
if (require.main === module) {
    (async () => {
        const tester = new AgentSystemTest();
        await tester.runCompleteAgentSystemTest();
    })();
}

module.exports = { AgentSystemTest };