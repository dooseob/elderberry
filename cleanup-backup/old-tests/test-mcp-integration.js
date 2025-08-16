/**
 * MCP 통합 에이전트 시스템 테스트
 */

const { EnhancedAgentOrchestrator } = require('./services/EnhancedAgentOrchestrator');

async function testMCPIntegration() {
    console.log('🚀 MCP 통합 에이전트 시스템 테스트 시작');
    
    const orchestrator = new EnhancedAgentOrchestrator();
    
    try {
        // 1. 시스템 상태 확인
        console.log('\n📊 시스템 상태 확인...');
        const status = await orchestrator.getSystemStatus();
        console.log('시스템 상태:', JSON.stringify(status, null, 2));
        
        // 2. 마스터 에이전트 - 종합 분석 테스트
        console.log('\n🤖 마스터 에이전트 - 종합 프로젝트 분석...');
        const analysis = await orchestrator.executeMasterAgentTask('comprehensive-analysis', {
            technology: 'spring-boot',
            focus: 'architecture'
        });
        console.log('분석 결과:', JSON.stringify(analysis, null, 2));
        
        // 3. Debug Agent 테스트
        console.log('\n🔧 Debug Agent - 지능형 디버깅...');
        const debugResult = await orchestrator.executeSubAgent('DEBUG', 'analyze-compilation-errors', {
            errorType: 'repository-method-signature',
            context: 'Spring Boot 3.x 호환성'
        });
        console.log('디버깅 결과:', JSON.stringify(debugResult, null, 2));
        
        // 4. Context7 기반 개발 테스트
        console.log('\n📚 Context-Aware Development...');
        const contextDev = await orchestrator.executeMasterAgentTask('context-aware-development', {
            developmentTask: 'JWT 인증 시스템 개선',
            technology: 'spring-security'
        });
        console.log('컨텍스트 개발 결과:', JSON.stringify(contextDev, null, 2));
        
        // 5. API Documentation Agent 테스트  
        console.log('\n📖 API Documentation Agent...');
        const apiDoc = await orchestrator.executeSubAgent('API_DOCUMENTATION', 'generate-api-docs', {
            controllers: ['AuthController', 'HealthController'],
            format: 'OpenAPI'
        });
        console.log('API 문서화 결과:', JSON.stringify(apiDoc, null, 2));
        
        // 6. Google SEO Agent 테스트
        console.log('\n🔍 Google SEO Agent...');
        const seoResult = await orchestrator.executeSubAgent('GOOGLE_SEO', 'optimize-seo', {
            focus: 'comprehensive',
            pages: ['/', '/health', '/auth']
        });
        console.log('SEO 최적화 결과:', JSON.stringify(seoResult, null, 2));
        
        console.log('\n✅ MCP 통합 테스트 완료!');
        
        return {
            success: true,
            systemStatus: status,
            testResults: {
                masterAnalysis: analysis,
                debugAgent: debugResult,
                contextDevelopment: contextDev,
                apiDocumentation: apiDoc,
                seoOptimization: seoResult
            }
        };
        
    } catch (error) {
        console.error('❌ MCP 통합 테스트 실패:', error);
        return {
            success: false,
            error: error.message,
            stack: error.stack
        };
    }
}

// 실행
if (require.main === module) {
    testMCPIntegration().then(result => {
        console.log('\n📋 최종 테스트 결과:');
        console.log(JSON.stringify(result, null, 2));
        process.exit(result.success ? 0 : 1);
    });
}

module.exports = { testMCPIntegration };