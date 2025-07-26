#!/usr/bin/env node
// 🔧 Spring Boot 에러 해결 도우미

const ElderberryGuideSystem = require('../elderberry-intelligent-guide.js');

async function springBootHelper() {
    const system = new ElderberryGuideSystem();
    
    console.log('\n🔧 Spring Boot 에러 해결 도우미');
    console.log('='.repeat(50));
    
    // Spring Boot 에러 해결 가이드 생성
    const guide = system.getSpringBootErrorGuide(
        "Repository 메서드 컴파일 에러 해결 필요", 
        ["Repository.java", "Service.java"]
    );
    
    if (guide) {
        console.log(`\n📋 ${guide.title}`);
        console.log(`현재 에러 수: ${guide.currentErrorCount}개`);
        console.log(`예상 해결 시간: ${guide.resolutionPlan.totalEstimatedTime}`);
        
        console.log('\n🎯 해결 우선순위:');
        Object.entries(guide.commonErrorTypes).forEach(([type, info], index) => {
            console.log(`${index + 1}. ${type} (${info.priority} 우선순위)`);
            console.log(`   예상 시간: ${info.estimatedTime}`);
            console.log(`   설명: ${info.description}`);
        });
        
        console.log('\n📝 단계별 해결 계획:');
        console.log(`1단계: ${guide.resolutionPlan.step1}`);
        console.log(`2단계: ${guide.resolutionPlan.step2}`);
        console.log(`3단계: ${guide.resolutionPlan.step3}`);
        console.log(`4단계: ${guide.resolutionPlan.step4}`);
        
        console.log('\n✅ 검증 체크리스트:');
        guide.resolutionPlan.verificationChecklist.forEach(item => {
            console.log(`  ${item}`);
        });
        
        console.log('\n🛡️ 안전 조치:');
        guide.safeguards.forEach(safeguard => {
            console.log(`  • ${safeguard}`);
        });
        
        console.log('\n⚡ 즉시 시작하기:');
        console.log('1. git status 확인 후 현재 브랜치 커밋');
        console.log('2. Repository 클래스들 일괄 수정 시작');
        console.log('3. 각 단계마다 gradlew compileJava 실행');
        console.log('4. Plain Java 서버 정상 동작 확인');
        
    } else {
        console.log('\n✅ 현재 Spring Boot 관련 이슈가 감지되지 않았습니다.');
    }
}

if (require.main === module) {
    springBootHelper().catch(console.error);
}

module.exports = springBootHelper;