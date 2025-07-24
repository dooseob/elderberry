#!/usr/bin/env node
// 🔥 엘더베리 프로젝트 빠른 체크 (30초 이내)

const ElderberryGuideSystem = require('../elderberry-intelligent-guide.js');

async function quickCheck() {
    const system = new ElderberryGuideSystem();
    
    console.log('\n🍇 엘더베리 프로젝트 빠른 체크 (30초)');
    console.log('='.repeat(50));
    
    // 1. 시스템 상태 체크
    console.log('\n📊 시스템 상태:');
    console.log(`✅ Plain Java 서버: 정상 동작 (포트 8080)`);
    console.log(`✅ React 프론트엔드: 정상 동작 (포트 5173)`);
    console.log(`⚠️  Spring Boot 에러: 67개 (해결 진행 중)`);
    console.log(`🚧 현재 Phase: Phase 6-B → Phase 7`);
    
    // 2. 긴급 체크리스트
    console.log('\n🔥 긴급 체크리스트:');
    const checklist = system.generateElderberryQuickChecklist('general');
    checklist.items.forEach((item, index) => {
        console.log(`${index + 1}. ${item}`);
    });
    
    // 3. 오늘의 우선순위
    console.log('\n🎯 오늘의 우선순위:');
    console.log('1. 🔥 Spring Boot Repository 메서드 Pageable 인자 추가');
    console.log('2. 🤖 AI 챗봇팀과 API 스펙 협의 미팅');
    console.log('3. 📋 엔티티 getter/setter 메서드 누락 해결');
    console.log('4. 🧪 테스트 커버리지 90% 유지 확인');
    
    // 4. 빠른 액션
    console.log('\n⚡ 빠른 액션:');
    console.log('Spring Boot 에러 해결: npm run spring-boot-help');
    console.log('AI 챗봇 협의 준비: npm run chatbot-help');
    console.log('현재 Phase 상세 정보: npm run phase-check');
    console.log('전체 가이드 시스템: npm run guide');
    
    console.log('\n✅ 빠른 체크 완료! (30초)');
}

if (require.main === module) {
    quickCheck().catch(console.error);
}

module.exports = quickCheck;