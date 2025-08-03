/**
 * FSD 지원 에이전트 시스템 통합 테스트
 * @version 1.0.0
 * @date 2025-08-03
 */

const { 
    AGENT_MCP_OPTIMIZATION_CONFIG,
    getFSDLayerOptimization,
    validateFSDDependency,
    validatePublicAPIPattern,
    suggestFSDCodeStructure,
    validateSystemConfiguration
} = require('./AgentMCPMappingConfig');

class FSDAgentIntegrationTester {
    constructor() {
        this.testResults = {
            total: 0,
            passed: 0,
            failed: 0,
            details: []
        };
    }

    /**
     * 테스트 실행
     */
    runTest(testName, testFunction) {
        this.testResults.total++;
        try {
            const result = testFunction();
            if (result.success) {
                this.testResults.passed++;
                console.log(`✅ ${testName}: PASSED`);
            } else {
                this.testResults.failed++;
                console.log(`❌ ${testName}: FAILED - ${result.message}`);
            }
            this.testResults.details.push({
                name: testName,
                success: result.success,
                message: result.message,
                data: result.data
            });
        } catch (error) {
            this.testResults.failed++;
            console.log(`❌ ${testName}: ERROR - ${error.message}`);
            this.testResults.details.push({
                name: testName,
                success: false,
                message: error.message,
                data: null
            });
        }
    }

    /**
     * FSD 레이어 최적화 테스트
     */
    testFSDLayerOptimization() {
        return this.runTest('FSD Layer Optimization', () => {
            try {
                // widgets 레이어 테스트
                const widgetsOptimization = getFSDLayerOptimization('widgets');
                if (!widgetsOptimization.primary_agent || !widgetsOptimization.mcp_tools) {
                    return { success: false, message: 'widgets 레이어 최적화 설정 누락' };
                }

                // entities 레이어 테스트
                const entitiesOptimization = getFSDLayerOptimization('entities');
                if (!entitiesOptimization.focus.includes('도메인 모델')) {
                    return { success: false, message: 'entities 레이어 포커스 설정 오류' };
                }

                // features 레이어 테스트
                const featuresOptimization = getFSDLayerOptimization('features');
                if (featuresOptimization.primary_agent !== 'DEBUG') {
                    return { success: false, message: 'features 레이어 주력 에이전트 설정 오류' };
                }

                // shared 레이어 테스트
                const sharedOptimization = getFSDLayerOptimization('shared');
                if (!sharedOptimization.mcp_tools.includes('mcp__github__search_repositories')) {
                    return { success: false, message: 'shared 레이어 MCP 도구 설정 오류' };
                }

                return {
                    success: true,
                    message: '모든 FSD 레이어 최적화 설정 정상',
                    data: {
                        widgets: widgetsOptimization,
                        entities: entitiesOptimization,
                        features: featuresOptimization,
                        shared: sharedOptimization
                    }
                };
            } catch (error) {
                return { success: false, message: `FSD 레이어 최적화 오류: ${error.message}` };
            }
        });
    }

    /**
     * FSD 의존성 검증 테스트
     */
    testFSDDependencyValidation() {
        return this.runTest('FSD Dependency Validation', () => {
            try {
                // 올바른 의존성 테스트
                const validDep1 = validateFSDDependency('widgets', 'entities');
                const validDep2 = validateFSDDependency('features', 'shared');
                const validDep3 = validateFSDDependency('pages', 'widgets');

                if (!validDep1.valid || !validDep2.valid || !validDep3.valid) {
                    return { success: false, message: '올바른 의존성이 잘못 검증됨' };
                }

                // 잘못된 의존성 테스트
                const invalidDep1 = validateFSDDependency('shared', 'entities');
                const invalidDep2 = validateFSDDependency('entities', 'features');
                const invalidDep3 = validateFSDDependency('shared', 'widgets');

                if (invalidDep1.valid || invalidDep2.valid || invalidDep3.valid) {
                    return { success: false, message: '잘못된 의존성이 유효하다고 검증됨' };
                }

                return {
                    success: true,
                    message: 'FSD 의존성 검증 규칙 정상 작동',
                    data: {
                        valid_dependencies: [validDep1, validDep2, validDep3],
                        invalid_dependencies: [invalidDep1, invalidDep2, invalidDep3]
                    }
                };
            } catch (error) {
                return { success: false, message: `FSD 의존성 검증 오류: ${error.message}` };
            }
        });
    }

    /**
     * Public API 패턴 검증 테스트
     */
    testPublicAPIValidation() {
        return this.runTest('Public API Pattern Validation', () => {
            try {
                // 올바른 Public API 패턴
                const validAPI = validatePublicAPIPattern(
                    'widgets/header/index.ts',
                    [
                        { type: 'named', name: 'Header' },
                        { type: 'type', name: 'HeaderProps' }
                    ]
                );

                if (!validAPI.hasIndexFile || !validAPI.hasNamedExports) {
                    return { success: false, message: '올바른 Public API 패턴이 잘못 검증됨' };
                }

                // 잘못된 Public API 패턴
                const invalidAPI = validatePublicAPIPattern(
                    'widgets/header/ui/Header.tsx',
                    []
                );

                if (invalidAPI.hasIndexFile) {
                    return { success: false, message: '잘못된 Public API 패턴이 유효하다고 검증됨' };
                }

                return {
                    success: true,
                    message: 'Public API 패턴 검증 정상 작동',
                    data: {
                        valid_pattern: validAPI,
                        invalid_pattern: invalidAPI
                    }
                };
            } catch (error) {
                return { success: false, message: `Public API 검증 오류: ${error.message}` };
            }
        });
    }

    /**
     * FSD 코드 구조 제안 테스트
     */
    testFSDCodeStructureSuggestion() {
        return this.runTest('FSD Code Structure Suggestion', () => {
            try {
                // widgets 레이어 구조 제안
                const widgetSuggestion = suggestFSDCodeStructure('component', 'widgets', 'Navigation');
                if (!widgetSuggestion.directory_structure.includes('widgets/Navigation/')) {
                    return { success: false, message: 'widgets 구조 제안 오류' };
                }

                // entities 레이어 구조 제안
                const entitySuggestion = suggestFSDCodeStructure('component', 'entities', 'Product');
                if (!entitySuggestion.file_templates['model/types.ts']) {
                    return { success: false, message: 'entities 구조 제안 오류' };
                }

                // features 레이어 구조 제안
                const featureSuggestion = suggestFSDCodeStructure('component', 'features', 'Authentication');
                if (featureSuggestion.directory_structure.length === 0) {
                    return { success: false, message: 'features 구조 제안 오류' };
                }

                return {
                    success: true,
                    message: 'FSD 코드 구조 제안 정상 작동',
                    data: {
                        widget_suggestion: widgetSuggestion,
                        entity_suggestion: entitySuggestion,
                        feature_suggestion: featureSuggestion
                    }
                };
            } catch (error) {
                return { success: false, message: `FSD 구조 제안 오류: ${error.message}` };
            }
        });
    }

    /**
     * 시스템 구성 검증 테스트
     */
    testSystemConfiguration() {
        return this.runTest('System Configuration Validation', () => {
            try {
                const config = validateSystemConfiguration();
                
                if (!config.fsd_architecture_support) {
                    return { success: false, message: 'FSD 아키텍처 지원 설정 누락' };
                }

                if (config.fsd_layers_supported < 4) {
                    return { success: false, message: 'FSD 레이어 지원 개수 부족' };
                }

                if (config.status !== 'OPTIMIZED_WITH_FSD') {
                    return { success: false, message: 'FSD 최적화 상태 설정 오류' };
                }

                return {
                    success: true,
                    message: 'FSD 지원 시스템 구성 정상',
                    data: config
                };
            } catch (error) {
                return { success: false, message: `시스템 구성 검증 오류: ${error.message}` };
            }
        });
    }

    /**
     * FSD 레이어별 에이전트 매핑 테스트
     */
    testFSDAgentMapping() {
        return this.runTest('FSD Agent Mapping', () => {
            try {
                const layerMapping = AGENT_MCP_OPTIMIZATION_CONFIG.FSD_ARCHITECTURE_SUPPORT.LAYER_AGENT_MAPPING;
                
                // 필수 레이어 존재 확인
                const requiredLayers = ['widgets', 'entities', 'features', 'shared'];
                for (const layer of requiredLayers) {
                    if (!layerMapping[layer]) {
                        return { success: false, message: `${layer} 레이어 매핑 누락` };
                    }

                    if (!layerMapping[layer].primary_agent || !layerMapping[layer].mcp_tools) {
                        return { success: false, message: `${layer} 레이어 설정 불완전` };
                    }
                }

                // 에이전트별 특화 설정 확인
                if (layerMapping.widgets.primary_agent !== 'CLAUDE_GUIDE') {
                    return { success: false, message: 'widgets 레이어 주력 에이전트 설정 오류' };
                }

                if (layerMapping.entities.primary_agent !== 'API_DOCUMENTATION') {
                    return { success: false, message: 'entities 레이어 주력 에이전트 설정 오류' };
                }

                return {
                    success: true,
                    message: 'FSD 레이어별 에이전트 매핑 정상',
                    data: layerMapping
                };
            } catch (error) {
                return { success: false, message: `FSD 에이전트 매핑 오류: ${error.message}` };
            }
        });
    }

    /**
     * 전체 테스트 실행
     */
    runAllTests() {
        console.log('🧪 FSD 지원 에이전트 시스템 통합 테스트 시작...\n');

        this.testFSDLayerOptimization();
        this.testFSDDependencyValidation();
        this.testPublicAPIValidation();
        this.testFSDCodeStructureSuggestion();
        this.testSystemConfiguration();
        this.testFSDAgentMapping();

        return this.generateReport();
    }

    /**
     * 테스트 결과 리포트 생성
     */
    generateReport() {
        const successRate = (this.testResults.passed / this.testResults.total * 100).toFixed(1);
        
        console.log('\n📊 FSD 에이전트 시스템 테스트 결과');
        console.log('='.repeat(50));
        console.log(`총 테스트: ${this.testResults.total}`);
        console.log(`성공: ${this.testResults.passed}`);
        console.log(`실패: ${this.testResults.failed}`);
        console.log(`성공률: ${successRate}%`);
        
        if (this.testResults.failed > 0) {
            console.log('\n❌ 실패한 테스트:');
            this.testResults.details
                .filter(test => !test.success)
                .forEach(test => {
                    console.log(`  - ${test.name}: ${test.message}`);
                });
        }

        const overallStatus = this.testResults.failed === 0 ? 'SUCCESS' : 'PARTIAL_SUCCESS';
        
        console.log(`\n🏆 전체 결과: ${overallStatus}`);
        console.log(`📅 테스트 완료 시간: ${new Date().toISOString()}`);

        return {
            status: overallStatus,
            success_rate: successRate,
            details: this.testResults,
            timestamp: new Date().toISOString()
        };
    }
}

// 테스트 실행
if (require.main === module) {
    const tester = new FSDAgentIntegrationTester();
    const results = tester.runAllTests();
    
    // 결과를 파일로 저장
    const fs = require('fs');
    const resultFilename = `fsd-agent-test-results-${Date.now()}.json`;
    fs.writeFileSync(resultFilename, JSON.stringify(results, null, 2));
    console.log(`\n💾 테스트 결과 저장: ${resultFilename}`);
}

module.exports = FSDAgentIntegrationTester;