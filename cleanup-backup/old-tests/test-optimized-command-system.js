/**
 * 최적화된 커스텀 명령어 시스템 테스트 v2.3.0
 * 지능형 에이전트 선택 + 작업별 최적화 + 효율성 검증
 * @date 2025-08-01
 */

const { CustomCommandHandler } = require('./CustomCommandHandler');
const { MCPIntegratedAgentSystem } = require('./MCPIntegratedAgentSystem');

class OptimizedCommandSystemTest {
    constructor() {
        this.commandHandler = new CustomCommandHandler();
        this.mcpSystem = new MCPIntegratedAgentSystem();
        
        this.testResults = {
            startTime: new Date().toISOString(),
            version: '2.3.0',
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            optimizationResults: [],
            errors: []
        };
    }
    
    /**
     * 🧪 전체 최적화 테스트 실행
     */
    async runOptimizationTests() {
        console.log('🚀 최적화된 커스텀 명령어 시스템 테스트 시작 v2.3.0');
        console.log('=' * 70);
        
        try {
            // 1. 작업 컨텍스트 분석 테스트
            await this.testTaskContextAnalysis();
            
            // 2. 지능형 에이전트 선택 테스트
            await this.testIntelligentAgentSelection();
            
            // 3. MCP 도구 최적화 테스트
            await this.testMcpToolOptimization();
            
            // 4. 효율성 개선 테스트
            await this.testEfficiencyImprovements();
            
            // 5. 실제 명령어 시뮬레이션 테스트
            await this.testRealCommandSimulation();
            
            // 결과 분석
            this.analyzeTestResults();
            
        } catch (error) {
            console.error('❌ 테스트 실행 중 오류:', error);
            this.testResults.errors.push({
                type: 'TEST_EXECUTION_ERROR',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
        
        this.testResults.endTime = new Date().toISOString();
        return this.testResults;
    }
    
    /**
     * 1. 작업 컨텍스트 분석 테스트
     */
    async testTaskContextAnalysis() {
        console.log('\n🧠 1. 작업 컨텍스트 분석 테스트...');
        
        const testCases = [
            { task: '웹 프론트엔드 성능 최적화', expected: { isWebRelated: true, isPerformanceRelated: true } },
            { task: '보안 감사 및 취약점 검사', expected: { isSecurityRelated: true } },
            { task: 'API 문서 자동 생성', expected: { isDocumentationRelated: true } },
            { task: '버그 수정 및 디버깅', expected: { isTroubleshootingRelated: true } },
            { task: 'SEO 최적화 작업', expected: { isSEORelated: true } },
            { task: '일반적인 코드 리팩토링', expected: {} } // 특별한 컨텍스트 없음
        ];
        
        for (const testCase of testCases) {
            await this.runTest(`컨텍스트 분석: "${testCase.task}"`, async () => {
                const context = this.commandHandler.analyzeTaskContext(testCase.task);
                
                for (const [key, expectedValue] of Object.entries(testCase.expected)) {
                    if (context[key] !== expectedValue) {
                        throw new Error(`${key} 예상값: ${expectedValue}, 실제값: ${context[key]}`);
                    }
                }
                
                return { success: true, context: context, matched: Object.keys(testCase.expected).length };
            });
        }
    }
    
    /**
     * 2. 지능형 에이전트 선택 테스트
     */
    async testIntelligentAgentSelection() {
        console.log('\n⚡ 2. 지능형 에이전트 선택 테스트...');
        
        const testCases = [
            {
                command: '/max',
                task: '웹 애플리케이션 보안 테스트',
                expectedAgents: ['CLAUDE_GUIDE', 'DEBUG', 'API_DOCUMENTATION', 'TROUBLESHOOTING', 'GOOGLE_SEO', 'WEB_TESTING_MASTER', 'SECURITY_AUDIT']
            },
            {
                command: '/auto',
                task: '코드 리팩토링',
                expectedAgentsCount: 3, // 웹 관련이 아니므로 WEB_TESTING_MASTER 제외
                notExpected: ['WEB_TESTING_MASTER']
            },
            {
                command: '/smart',
                task: '성능 문제 분석',
                expectedAgents: ['CLAUDE_GUIDE', 'DEBUG'] // 성능 관련 작업
            },
            {
                command: '/rapid',
                task: '빠른 버그 수정',
                expectedAgents: ['CLAUDE_GUIDE', 'DEBUG'] // 기본 + 디버그
            }
        ];
        
        for (const testCase of testCases) {
            await this.runTest(`에이전트 선택: ${testCase.command} "${testCase.task}"`, async () => {
                const selectedAgents = this.commandHandler.getOptimizedAgentsForCommand(testCase.command, testCase.task);
                const oldAgents = this.commandHandler.getAgentsForCommand(testCase.command);
                
                let validationResult = { success: true, selectedAgents, oldAgents };
                
                if (testCase.expectedAgents) {
                    const hasAllExpected = testCase.expectedAgents.every(agent => selectedAgents.includes(agent));
                    if (!hasAllExpected) {
                        throw new Error(`예상 에이전트 누락: ${testCase.expectedAgents.join(', ')}`);
                    }
                }
                
                if (testCase.expectedAgentsCount) {
                    if (selectedAgents.length !== testCase.expectedAgentsCount) {
                        throw new Error(`에이전트 수 불일치: 예상 ${testCase.expectedAgentsCount}, 실제 ${selectedAgents.length}`);
                    }
                }
                
                if (testCase.notExpected) {
                    const hasUnexpected = testCase.notExpected.some(agent => selectedAgents.includes(agent));
                    if (hasUnexpected) {
                        throw new Error(`불필요한 에이전트 포함: ${testCase.notExpected.join(', ')}`);
                    }
                    validationResult.optimizationSuccess = true;
                }
                
                return validationResult;
            });
        }
    }
    
    /**
     * 3. MCP 도구 최적화 테스트
     */
    async testMcpToolOptimization() {
        console.log('\n🛠️ 3. MCP 도구 최적화 테스트...');
        
        const testCases = [
            {
                command: '/auto',
                task: '웹 UI 컴포넌트 테스트',
                expectedTools: ['playwright'], // 웹 관련 작업이므로 playwright 추가
                checkContains: true
            },
            {
                command: '/smart',
                task: '일반적인 코드 분석',
                notExpectedTools: ['playwright'], // 웹 관련이 아니므로 playwright 제외
                checkExcludes: true
            },
            {
                command: '/test',
                task: 'E2E 테스팅',
                expectedTools: ['playwright', 'sequential-thinking', 'memory', 'filesystem', 'github'],
                checkContains: true
            }
        ];
        
        for (const testCase of testCases) {
            await this.runTest(`MCP 도구 선택: ${testCase.command} "${testCase.task}"`, async () => {
                const selectedTools = this.commandHandler.getOptimizedMcpToolsForCommand(testCase.command, testCase.task);
                const oldTools = this.commandHandler.getMcpToolsForCommand(testCase.command);
                
                if (testCase.checkContains && testCase.expectedTools) {
                    const hasAllExpected = testCase.expectedTools.every(tool => selectedTools.includes(tool));
                    if (!hasAllExpected) {
                        throw new Error(`예상 도구 누락: ${testCase.expectedTools.join(', ')}`);
                    }
                }
                
                if (testCase.checkExcludes && testCase.notExpectedTools) {
                    const hasUnexpected = testCase.notExpectedTools.some(tool => selectedTools.includes(tool));
                    if (hasUnexpected) {
                        throw new Error(`불필요한 도구 포함: ${testCase.notExpectedTools.join(', ')}`);
                    }
                }
                
                return { 
                    success: true, 
                    selectedTools, 
                    oldTools,
                    optimization: selectedTools.length <= oldTools.length ? '최적화됨' : '확장됨'
                };
            });
        }
    }
    
    /**
     * 4. 효율성 개선 테스트
     */
    async testEfficiencyImprovements() {
        console.log('\n📈 4. 효율성 개선 테스트...');
        
        const commands = ['/max', '/auto', '/smart', '/rapid', '/deep', '/sync', '/test'];
        
        for (const command of commands) {
            await this.runTest(`효율성 메트릭: ${command}`, async () => {
                const task = '샘플 작업 테스트';
                
                const agentReduction = this.commandHandler.calculateAgentReduction(command, task);
                const relevanceScore = this.commandHandler.calculateRelevanceScore(command, task);
                const efficiencyGain = this.commandHandler.calculateEfficiencyGain(command);
                
                // 최소 품질 기준 검증
                if (relevanceScore < 70) {
                    throw new Error(`관련성 점수가 너무 낮음: ${relevanceScore}% (최소 70% 필요)`);
                }
                
                return {
                    success: true,
                    agentReduction: agentReduction,
                    relevanceScore: relevanceScore,
                    efficiencyGain: efficiencyGain,
                    qualityCheck: relevanceScore >= 80 ? '우수' : '양호'
                };
            });
        }
    }
    
    /**
     * 5. 실제 명령어 시뮬레이션 테스트
     */
    async testRealCommandSimulation() {
        console.log('\n🎯 5. 실제 명령어 시뮬레이션 테스트...');
        
        const simulationCases = [
            { command: '/max', task: '엘더베리 프로젝트 웹 성능 최적화' },
            { command: '/auto', task: 'React 컴포넌트 자동 테스트' },
            { command: '/smart', task: 'API 문서 업데이트' },
            { command: '/test', task: '엘더베리 E2E 테스팅' }
        ];
        
        for (const testCase of simulationCases) {
            await this.runTest(`실제 시뮬레이션: ${testCase.command} "${testCase.task}"`, async () => {
                // MCPIntegratedAgentSystem을 통한 실제 실행 시뮬레이션
                const result = await this.mcpSystem.executeCustomCommandIntegration({
                    command: testCase.command,
                    task: testCase.task,
                    options: { simulation: true }
                });
                
                if (!result || !result.agentsInvolved || !result.mcpToolsUsed) {
                    throw new Error('시뮬레이션 결과가 불완전함');
                }
                
                return {
                    success: true,
                    agentsUsed: result.agentsInvolved.length,
                    toolsUsed: result.mcpToolsUsed.length,
                    optimizationMetrics: result.optimizationMetrics,
                    version: result.version || '2.3.0'
                };
            });
        }
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
            
            if (result.optimizationMetrics || result.agentReduction) {
                this.testResults.optimizationResults.push({
                    testName: testName,
                    metrics: result.optimizationMetrics || result,
                    timestamp: new Date().toISOString()
                });
            }
            
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
        
        console.log('\n📊 최적화 시스템 테스트 결과:');
        console.log(`  총 테스트: ${totalTests}개`);
        console.log(`  통과: ${passedTests}개`);
        console.log(`  실패: ${failedTests}개`);
        console.log(`  성공률: ${successRate}%`);
        
        // 최적화 효과 분석
        if (this.testResults.optimizationResults.length > 0) {
            console.log('\n🚀 최적화 효과 요약:');
            
            const avgEfficiency = this.calculateAverageOptimization();
            console.log(`  평균 효율성 향상: ${avgEfficiency.efficiency}%`);
            console.log(`  평균 리소스 절약: ${avgEfficiency.resourceSaving}%`);
            console.log(`  평균 관련성 점수: ${avgEfficiency.relevance}%`);
        }
        
        // 전체 등급 계산
        const grade = this.calculateTestGrade(successRate);
        this.testResults.overallGrade = grade;
        
        console.log(`  전체 등급: ${grade}`);
        
        if (successRate >= 90) {
            console.log('\n🎉 우수한 최적화 시스템 구축 완료!');
        } else if (successRate >= 80) {
            console.log('\n👍 양호한 최적화 시스템, 일부 개선 가능');
        }
    }
    
    /**
     * 평균 최적화 효과 계산
     */
    calculateAverageOptimization() {
        const results = this.testResults.optimizationResults;
        if (results.length === 0) return { efficiency: 0, resourceSaving: 0, relevance: 0 };
        
        let totalEfficiency = 0;
        let totalResourceSaving = 0;
        let totalRelevance = 0;
        let count = 0;
        
        results.forEach(result => {
            const metrics = result.metrics;
            if (metrics.efficiencyGain) {
                totalEfficiency += parseFloat(metrics.efficiencyGain.speedGain?.replace('%', '') || 0);
            }
            if (metrics.agentReduction) {
                totalResourceSaving += parseFloat(metrics.agentReduction.reductionPercentage || 0);
            }
            if (metrics.relevanceScore) {
                totalRelevance += metrics.relevanceScore;
            }
            count++;
        });
        
        return {
            efficiency: (totalEfficiency / count).toFixed(1),
            resourceSaving: (totalResourceSaving / count).toFixed(1),
            relevance: (totalRelevance / count).toFixed(1)
        };
    }
    
    /**
     * 테스트 등급 계산
     */
    calculateTestGrade(successRate) {
        if (successRate >= 95) return 'A+';
        if (successRate >= 90) return 'A';
        if (successRate >= 85) return 'B+';
        if (successRate >= 80) return 'B';
        if (successRate >= 75) return 'C+';
        return 'C';
    }
}

// 테스트 실행
async function runOptimizationTest() {
    console.log('🎯 최적화된 커스텀 명령어 시스템 테스트 v2.3.0');
    console.log('지능형 에이전트 선택 + 작업별 최적화 + 효율성 검증');
    
    const tester = new OptimizedCommandSystemTest();
    const results = await tester.runOptimizationTests();
    
    console.log('\n' + '=' * 70);
    console.log('✅ 최적화 시스템 테스트 완료!');
    
    // 결과를 JSON 파일로 저장
    const fs = require('fs');
    const path = require('path');
    
    const reportPath = path.join(__dirname, `optimized-system-test-results-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    
    console.log(`📄 상세 결과 저장: ${reportPath}`);
    
    return results;
}

// 직접 실행 시
if (require.main === module) {
    runOptimizationTest().catch(console.error);
}

module.exports = { OptimizedCommandSystemTest, runOptimizationTest };