/**
 * 엘더베리 에이전트 시스템 통합 테스트 v2.2.0
 * WebTestingMasterAgent 통합 + 커스텀 명령어 시스템 검증
 * @date 2025-08-01
 */

const { MCPIntegratedAgentSystem } = require('./MCPIntegratedAgentSystem');
const { WebTestingMasterAgent } = require('./WebTestingMasterAgent');
const { PlaywrightMCPAgent } = require('./PlaywrightMCPAgent');
const { CustomCommandHandler } = require('./CustomCommandHandler');

class AgentSystemIntegrationTest {
    constructor() {
        this.testResults = {
            startTime: new Date().toISOString(),
            version: '2.2.0',
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            results: {},
            errors: [],
            recommendations: []
        };
        
        // 테스트 대상 시스템들
        this.mcpSystem = new MCPIntegratedAgentSystem();
        this.webTestingAgent = new WebTestingMasterAgent();
        this.playwrightAgent = new PlaywrightMCPAgent();
        this.commandHandler = new CustomCommandHandler();
    }

    /**
     * 🚀 전체 통합 테스트 실행
     */
    async runFullIntegrationTest() {
        console.log('🎯 엘더베리 에이전트 시스템 v2.2.0 통합 테스트 시작...');
        console.log('📋 테스트 범위: WebTestingMasterAgent + 7개 서브에이전트 + 6개 MCP 도구');
        
        try {
            // 1. MCPIntegratedAgentSystem 테스트
            console.log('\n🧠 1. MCPIntegratedAgentSystem 테스트...');
            this.testResults.results.mcpSystem = await this.testMCPIntegratedSystem();
            
            // 2. WebTestingMasterAgent 테스트
            console.log('\n🎭 2. WebTestingMasterAgent 테스트...');
            this.testResults.results.webTestingMaster = await this.testWebTestingMasterAgent();
            
            // 3. PlaywrightMCPAgent 테스트
            console.log('\n🎪 3. PlaywrightMCPAgent 테스트...');
            this.testResults.results.playwrightAgent = await this.testPlaywrightMCPAgent();
            
            // 4. CustomCommandHandler 테스트
            console.log('\n🔧 4. CustomCommandHandler 테스트...');
            this.testResults.results.customCommandHandler = await this.testCustomCommandHandler();
            
            // 5. 커스텀 명령어 통합 테스트
            console.log('\n⚡ 5. 커스텀 명령어 통합 테스트...');
            this.testResults.results.customCommands = await this.testCustomCommandsIntegration();
            
            // 6. 에이전트 간 협업 테스트
            console.log('\n🤝 6. 에이전트 간 협업 테스트...');
            this.testResults.results.agentCollaboration = await this.testAgentCollaboration();
            
            // 7. MCP 도구 통합 테스트
            console.log('\n🔗 7. MCP 도구 통합 테스트...');
            this.testResults.results.mcpToolsIntegration = await this.testMCPToolsIntegration();
            
            // 8. 엘더베리 프로젝트 특화 테스트
            console.log('\n🏥 8. 엘더베리 프로젝트 특화 테스트...');
            this.testResults.results.elderberrySpecific = await this.testElderberrySpecificFeatures();
            
            // 결과 분석
            this.analyzeTestResults();
            
        } catch (error) {
            console.error('❌ 통합 테스트 실행 중 오류:', error);
            this.testResults.errors.push({
                type: 'INTEGRATION_TEST_ERROR',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
        
        this.testResults.endTime = new Date().toISOString();
        return this.testResults;
    }

    /**
     * MCPIntegratedAgentSystem 테스트
     */
    async testMCPIntegratedSystem() {
        const tests = [];
        
        // 에이전트 능력 확인
        tests.push(await this.runTest('MCP 에이전트 능력 검증', async () => {
            const agents = Object.keys(this.mcpSystem.agentCapabilities);
            if (agents.length === 7 && agents.includes('WEB_TESTING_MASTER')) {
                return { success: true, agentCount: agents.length, webTestingIncluded: true };
            }
            throw new Error(`에이전트 수 불일치: 예상 7개, 실제 ${agents.length}개`);
        }));
        
        // MCP 도구 매핑 확인
        tests.push(await this.runTest('MCP 도구 매핑 검증', async () => {
            const mcpTools = Object.keys(this.mcpSystem.mcpTools);
            if (mcpTools.length === 6 && mcpTools.includes('playwright')) {
                return { success: true, toolCount: mcpTools.length, playwrightIncluded: true };
            }
            throw new Error(`MCP 도구 수 불일치: 예상 6개, 실제 ${mcpTools.length}개`);
        }));
        
        // 마스터 명령어 실행 테스트
        tests.push(await this.runTest('마스터 명령어 실행', async () => {
            const result = await this.mcpSystem.executeMasterCommand('execute-custom-command', {
                command: '/test',
                task: '엘더베리 프로젝트 종합 테스트'
            });
            return { success: true, commandExecuted: true, result: result };
        }));
        
        return {
            totalTests: tests.length,
            passedTests: tests.filter(t => t.success).length,
            failedTests: tests.filter(t => !t.success).length,
            tests: tests
        };
    }

    /**
     * WebTestingMasterAgent 테스트
     */
    async testWebTestingMasterAgent() {
        const tests = [];
        
        // 에이전트 초기화 테스트
        tests.push(await this.runTest('WebTestingMasterAgent 초기화', async () => {
            if (this.webTestingAgent.agentType === 'WEB_TESTING_MASTER' && 
                this.webTestingAgent.version === '2.0.0') {
                return { success: true, agentType: this.webTestingAgent.agentType, version: this.webTestingAgent.version };
            }
            throw new Error('WebTestingMasterAgent 초기화 실패');
        }));
        
        // 테스트 능력 검증
        tests.push(await this.runTest('테스트 능력 검증', async () => {
            const capabilities = this.webTestingAgent.capabilities;
            const requiredCapabilities = [
                'playwright-mcp-integration',
                'e2e-testing-automation',
                'visual-regression-testing',
                'web-performance-analysis',
                'accessibility-validation'
            ];
            
            const hasAll = requiredCapabilities.every(cap => capabilities.includes(cap));
            if (hasAll) {
                return { success: true, capabilityCount: capabilities.length, allRequired: true };
            }
            throw new Error('필수 테스트 능력 누락');
        }));
        
        // 엘더베리 종합 테스트 시뮬레이션
        tests.push(await this.runTest('엘더베리 종합 테스트 시뮬레이션', async () => {
            const config = {
                testUrl: 'http://localhost:5173',
                includeAuth: true,
                includeFacilities: true,
                includeHealth: true,
                includeLinearDesign: true,
                browsers: ['chromium'],
                generateDetailedReport: false // 시뮬레이션이므로 false
            };
            
            const result = await this.webTestingAgent.runElderberryComprehensiveTestSuite(config);
            return { 
                success: true, 
                testExecuted: true, 
                projectName: result.projectName,
                summary: result.summary 
            };
        }));
        
        return {
            totalTests: tests.length,
            passedTests: tests.filter(t => t.success).length,
            failedTests: tests.filter(t => !t.success).length,
            tests: tests
        };
    }

    /**
     * PlaywrightMCPAgent 테스트
     */
    async testPlaywrightMCPAgent() {
        const tests = [];
        
        // 에이전트 초기화 테스트
        tests.push(await this.runTest('PlaywrightMCPAgent 초기화', async () => {
            if (this.playwrightAgent.agentType === 'PLAYWRIGHT_MCP_SPECIALIST') {
                return { success: true, agentType: this.playwrightAgent.agentType };
            }
            throw new Error('PlaywrightMCPAgent 초기화 실패');
        }));
        
        // E2E 테스트 스위트 실행
        tests.push(await this.runTest('E2E 테스트 스위트 실행', async () => {
            const config = {
                targetUrl: 'http://localhost:5173',
                testScenarios: ['login', 'navigation'],
                browsers: ['chromium'],
                generateReport: false
            };
            
            const result = await this.playwrightAgent.executeE2ETestSuite(config);
            return { success: true, testResults: result.summary };
        }));
        
        // Linear Design System 테스트
        tests.push(await this.runTest('Linear Design System 테스트', async () => {
            const config = {
                components: ['Button', 'Card'],
                themes: ['light', 'dark'],
                testInteractions: true,
                generateSnapshots: false
            };
            
            const result = await this.playwrightAgent.testLinearDesignSystem(config);
            return { success: true, designSystemScore: result.overallScore };
        }));
        
        return {
            totalTests: tests.length,
            passedTests: tests.filter(t => t.success).length,
            failedTests: tests.filter(t => !t.success).length,
            tests: tests
        };
    }

    /**
     * CustomCommandHandler 테스트
     */
    async testCustomCommandHandler() {
        const tests = [];
        
        // 커스텀 명령어 지원 확인
        tests.push(await this.runTest('커스텀 명령어 지원 확인', async () => {
            const supportedCommands = this.commandHandler.getSupportedCommands();
            if (supportedCommands.totalCommands === 7 && 
                supportedCommands.commands.includes('/test')) {
                return { 
                    success: true, 
                    totalCommands: supportedCommands.totalCommands,
                    testCommandIncluded: true 
                };
            }
            throw new Error('커스텀 명령어 지원 확인 실패');
        }));
        
        // /test 명령어 실행
        tests.push(await this.runTest('/test 명령어 실행', async () => {
            const result = await this.commandHandler.handleCommand('/test', '엘더베리 프로젝트 종합 테스트');
            if (result.success && result.result.webTestingMasterActive) {
                return { success: true, commandExecuted: true, webTestingActive: true };
            }
            throw new Error('/test 명령어 실행 실패');
        }));
        
        // /max 명령어 실행 (WebTestingMaster 포함)
        tests.push(await this.runTest('/max 명령어 실행', async () => {
            const result = await this.commandHandler.handleCommand('/max', '최대 성능 모드 테스트');
            if (result.success && result.result.webTestingIntegrated) {
                return { 
                    success: true, 
                    commandExecuted: true, 
                    agentsDeployed: result.result.agentsDeployed,
                    webTestingIntegrated: true 
                };
            }
            throw new Error('/max 명령어 실행 실패');
        }));
        
        return {
            totalTests: tests.length,
            passedTests: tests.filter(t => t.success).length,
            failedTests: tests.filter(t => !t.success).length,
            tests: tests
        };
    }

    /**
     * 커스텀 명령어 통합 테스트
     */
    async testCustomCommandsIntegration() {
        const tests = [];
        const commands = ['/max', '/auto', '/smart', '/test'];
        
        for (const command of commands) {
            tests.push(await this.runTest(`${command} 명령어 통합 테스트`, async () => {
                const task = `${command} 모드로 엘더베리 프로젝트 작업`;
                const result = await this.commandHandler.handleCommand(command, task);
                
                if (result.success && result.agentsInvolved.length > 0 && result.mcpToolsUsed.length > 0) {
                    return { 
                        success: true, 
                        command: command,
                        agentCount: result.agentsInvolved.length,
                        mcpToolCount: result.mcpToolsUsed.length,
                        executionTime: result.executionTime
                    };
                }
                throw new Error(`${command} 명령어 통합 실패`);
            }));
        }
        
        return {
            totalTests: tests.length,
            passedTests: tests.filter(t => t.success).length,
            failedTests: tests.filter(t => !t.success).length,
            tests: tests
        };
    }

    /**
     * 에이전트 간 협업 테스트
     */
    async testAgentCollaboration() {
        const tests = [];
        
        // 에이전트 간 MCP 도구 공유 테스트
        tests.push(await this.runTest('에이전트 간 MCP 도구 공유', async () => {
            const webTestingTools = this.mcpSystem.getAgentMCPTools('WEB_TESTING_MASTER');
            const claudeGuideTools = this.mcpSystem.getAgentMCPTools('CLAUDE_GUIDE');
            
            // 공통 도구 확인 (playwright, memory 등)
            const commonTools = webTestingTools.filter(tool => claudeGuideTools.includes(tool));
            
            if (commonTools.length > 0) {
                return { 
                    success: true, 
                    commonToolsCount: commonTools.length,
                    webTestingTools: webTestingTools.length,
                    claudeGuideTools: claudeGuideTools.length
                };
            }
            throw new Error('에이전트 간 MCP 도구 공유 실패');
        }));
        
        // 통합 학습 시스템 테스트
        tests.push(await this.runTest('통합 학습 시스템', async () => {
            await this.mcpSystem.learnFromExperience(
                'WEB_TESTING_MASTER', 
                '엘더베리 테스트 실행', 
                { status: 'success', score: 95 }, 
                true
            );
            
            return { success: true, learningSystemActive: true };
        }));
        
        return {
            totalTests: tests.length,
            passedTests: tests.filter(t => t.success).length,
            failedTests: tests.filter(t => !t.success).length,
            tests: tests
        };
    }

    /**
     * MCP 도구 통합 테스트
     */
    async testMCPToolsIntegration() {
        const tests = [];
        
        // Playwright MCP 도구 통합 확인
        tests.push(await this.runTest('Playwright MCP 도구 통합', async () => {
            const mcpTools = this.mcpSystem.mcpTools;
            if (mcpTools.playwright && mcpTools.playwright === 'playwright') {
                return { success: true, playwrightIntegrated: true };
            }
            throw new Error('Playwright MCP 도구 통합 실패');
        }));
        
        // 전체 MCP 도구 활용 테스트
        tests.push(await this.runTest('전체 MCP 도구 활용', async () => {
            const allTools = Object.keys(this.mcpSystem.mcpTools);
            const expectedTools = [
                'sequentialThinking', 
                'context7', 
                'filesystem', 
                'memory', 
                'github', 
                'playwright'
            ];
            
            const hasAllTools = expectedTools.every(tool => allTools.includes(tool));
            if (hasAllTools) {
                return { success: true, allToolsAvailable: true, toolCount: allTools.length };
            }
            throw new Error('MCP 도구 누락');
        }));
        
        return {
            totalTests: tests.length,
            passedTests: tests.filter(t => t.success).length,
            failedTests: tests.filter(t => !t.success).length,
            tests: tests
        };
    }

    /**
     * 엘더베리 프로젝트 특화 기능 테스트
     */
    async testElderberrySpecificFeatures() {
        const tests = [];
        
        // 엘더베리 도메인 특화 테스트 확인
        tests.push(await this.runTest('엘더베리 도메인 특화 테스트', async () => {
            const webTestingAgent = this.webTestingAgent;
            const testCategories = webTestingAgent.testCategories;
            
            // 필수 테스트 카테고리 확인
            const requiredCategories = ['functional', 'performance', 'accessibility', 'security'];
            const hasAllCategories = requiredCategories.every(cat => testCategories[cat]);
            
            if (hasAllCategories) {
                return { 
                    success: true, 
                    elderberryOptimized: true,
                    categoryCount: Object.keys(testCategories).length
                };
            }
            throw new Error('엘더베리 특화 테스트 카테고리 누락');
        }));
        
        // Linear Design System 지원 확인
        tests.push(await this.runTest('Linear Design System 지원', async () => {
            const playwrightAgent = this.playwrightAgent;
            const componentVariants = playwrightAgent.getComponentVariants('Button');
            
            if (componentVariants.length >= 5) {
                return { 
                    success: true, 
                    linearDesignSupported: true,
                    buttonVariants: componentVariants.length
                };
            }
            throw new Error('Linear Design System 지원 부족');
        }));
        
        return {
            totalTests: tests.length,
            passedTests: tests.filter(t => t.success).length,
            failedTests: tests.filter(t => !t.success).length,
            tests: tests
        };
    }

    /**
     * 개별 테스트 실행 헬퍼
     */
    async runTest(testName, testFunction) {
        this.testResults.totalTests++;
        
        try {
            console.log(`  🧪 ${testName}...`);
            const result = await testFunction();
            
            this.testResults.passedTests++;
            console.log(`    ✅ 통과`);
            
            return {
                name: testName,
                success: true,
                result: result,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            this.testResults.failedTests++;
            console.log(`    ❌ 실패: ${error.message}`);
            
            this.testResults.errors.push({
                testName: testName,
                error: error.message,
                timestamp: new Date().toISOString()
            });
            
            return {
                name: testName,
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * 테스트 결과 분석
     */
    analyzeTestResults() {
        const { totalTests, passedTests, failedTests } = this.testResults;
        const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : 0;
        
        console.log('\n📊 통합 테스트 결과 분석:');
        console.log(`  총 테스트: ${totalTests}개`);
        console.log(`  통과: ${passedTests}개`);
        console.log(`  실패: ${failedTests}개`);
        console.log(`  성공률: ${successRate}%`);
        
        // 권장사항 생성
        this.testResults.recommendations = this.generateRecommendations(successRate, failedTests);
        
        // 전체 등급 계산
        this.testResults.overallGrade = this.calculateOverallGrade(successRate);
        
        console.log(`  전체 등급: ${this.testResults.overallGrade}`);
        
        if (this.testResults.recommendations.length > 0) {
            console.log('\n💡 권장사항:');
            this.testResults.recommendations.forEach((rec, index) => {
                console.log(`  ${index + 1}. ${rec}`);
            });
        }
    }

    /**
     * 권장사항 생성
     */
    generateRecommendations(successRate, failedTests) {
        const recommendations = [];
        
        if (successRate >= 95) {
            recommendations.push('🎉 우수한 통합 테스트 결과입니다! 현재 품질을 유지하세요.');
        } else if (successRate >= 85) {
            recommendations.push('👍 양호한 통합 상태입니다. 일부 개선이 필요합니다.');
        } else if (successRate >= 70) {
            recommendations.push('⚠️ 통합 품질 개선이 필요합니다. 실패한 테스트를 우선 수정하세요.');
        } else {
            recommendations.push('🚨 심각한 통합 문제가 있습니다. 시스템 전반적인 점검이 필요합니다.');
        }
        
        if (failedTests > 0) {
            recommendations.push(`🔧 ${failedTests}개의 실패한 테스트를 분석하고 수정하세요.`);
        }
        
        recommendations.push('📈 정기적인 통합 테스트를 통해 품질을 지속적으로 모니터링하세요.');
        recommendations.push('🤖 WebTestingMasterAgent를 활용하여 실제 웹 테스팅을 정기적으로 수행하세요.');
        
        return recommendations;
    }

    /**
     * 전체 등급 계산
     */
    calculateOverallGrade(successRate) {
        if (successRate >= 95) return 'A+';
        if (successRate >= 90) return 'A';
        if (successRate >= 85) return 'B+';
        if (successRate >= 80) return 'B';
        if (successRate >= 75) return 'C+';
        if (successRate >= 70) return 'C';
        if (successRate >= 60) return 'D';
        return 'F';
    }
}

// 테스트 실행
async function runIntegrationTest() {
    console.log('🎯 엘더베리 에이전트 시스템 v2.2.0 통합 테스트');
    console.log('=' * 60);
    
    const tester = new AgentSystemIntegrationTest();
    const results = await tester.runFullIntegrationTest();
    
    console.log('\n' + '=' * 60);
    console.log('✅ 통합 테스트 완료!');
    
    // 결과를 JSON 파일로 저장
    const fs = require('fs');
    const path = require('path');
    
    const reportPath = path.join(__dirname, `agent-integration-test-results-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    
    console.log(`📄 상세 결과 저장: ${reportPath}`);
    
    return results;
}

// 직접 실행 시
if (require.main === module) {
    runIntegrationTest().catch(console.error);
}

module.exports = { AgentSystemIntegrationTest, runIntegrationTest };