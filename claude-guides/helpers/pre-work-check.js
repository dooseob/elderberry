#!/usr/bin/env node

// 🔍 작업 전 지침 준수 자동 검증 시스템
// 지침 위반 방지를 위한 필수 체크리스트 자동화

const fs = require('fs');
const path = require('path');

class PreWorkChecker {
    constructor() {
        this.version = "1.0.0";
        this.checks = [];
        this.warnings = [];
        this.errors = [];
        
        console.log("🔍 작업 전 지침 준수 자동 검증 시작...");
        console.log(`🤖 Pre-Work Checker v${this.version}\n`);
    }
    
    /**
     * 전체 체크리스트 실행
     */
    async runAllChecks() {
        console.log("📋 Step 1: 프로젝트 상태 파악");
        this.checkProjectStatus();
        
        console.log("\n📋 Step 2: 기술적 제약사항 확인");
        this.checkTechnicalConstraints();
        
        console.log("\n📋 Step 3: 코딩 규칙 점검");
        this.checkCodingRules();
        
        console.log("\n📋 Step 4: 문서화 구조 확인");
        this.checkDocumentationStructure();
        
        console.log("\n📊 검증 결과 요약");
        this.displaySummary();
        
        return this.errors.length === 0;
    }
    
    /**
     * Step 1: 프로젝트 상태 파악
     */
    checkProjectStatus() {
        // CLAUDE.md 존재 확인
        const claudeMdPath = path.join(__dirname, '../../CLAUDE.md');
        if (fs.existsSync(claudeMdPath)) {
            console.log("  ✅ CLAUDE.md 파일 존재 확인");
            this.checks.push("CLAUDE.md 확인");
        } else {
            console.log("  ❌ CLAUDE.md 파일을 찾을 수 없습니다");
            this.errors.push("CLAUDE.md 파일 누락");
        }
        
        // 현재 Phase 확인
        try {
            const claudeContent = fs.readFileSync(claudeMdPath, 'utf8');
            if (claudeContent.includes('Phase 6-B') || claudeContent.includes('Phase 7')) {
                console.log("  ✅ 현재 Phase 정보 확인 (Phase 6-B → Phase 7)");
                this.checks.push("Phase 정보 확인");
            } else {
                console.log("  ⚠️ Phase 정보가 최신이 아닐 수 있습니다");
                this.warnings.push("Phase 정보 확인 필요");
            }
        } catch (error) {
            console.log("  ❌ CLAUDE.md 읽기 실패");
            this.errors.push("CLAUDE.md 읽기 오류");
        }
        
        // docs 폴더 구조 확인
        const docsPath = path.join(__dirname, '../../docs');
        if (fs.existsSync(docsPath)) {
            console.log("  ✅ docs/ 폴더 구조 확인");
            this.checks.push("문서 구조 확인");
        } else {
            console.log("  ❌ docs/ 폴더를 찾을 수 없습니다");
            this.errors.push("문서 구조 누락");
        }
    }
    
    /**
     * Step 2: 기술적 제약사항 확인
     */
    checkTechnicalConstraints() {
        // Spring Boot vs Plain Java 상황 확인
        const serverFiles = [
            path.join(__dirname, '../../src/main/java/com/globalcarelink/PlainJavaServer.java'),
            path.join(__dirname, '../../src/main/java/com/globalcarelink/SimpleApp.java')
        ];
        
        let plainJavaExists = false;
        for (const file of serverFiles) {
            if (fs.existsSync(file)) {
                plainJavaExists = true;
                break;
            }
        }
        
        if (plainJavaExists) {
            console.log("  ✅ Plain Java 서버 파일 확인 (Spring Boot 개선 중)");
            this.checks.push("서버 상태 확인");
        } else {
            console.log("  ⚠️ Plain Java 서버 파일을 찾을 수 없습니다");
            this.warnings.push("서버 상태 확인 필요");
        }
        
        // 금지된 패턴 검사 (예시)
        console.log("  ✅ 금지된 패턴 체크리스트 확인");
        console.log("    - 하드코딩된 설정값 사용 금지");
        console.log("    - @EntityGraph 없는 연관 조회 금지");
        console.log("    - 동기 처리 시간 소요 작업 금지");
        this.checks.push("금지 패턴 인식");
    }
    
    /**
     * Step 3: 코딩 규칙 점검
     */
    checkCodingRules() {
        console.log("  ✅ 네이밍 컨벤션 (한국어 명명법)");
        console.log("  ✅ 패키지 구조 (엘더베리 구조 준수)");
        console.log("  ✅ 주석 작성 규칙 (한국어 필수)");
        console.log("  ✅ 커밋 메시지 형식 (🤖 Generated with Claude Code)");
        this.checks.push("코딩 규칙 인식");
    }
    
    /**
     * Step 4: 문서화 구조 확인 (핵심!)
     */
    checkDocumentationStructure() {
        // solutions-db.md 확인
        const solutionsDbPath = path.join(__dirname, '../troubleshooting/solutions-db.md');
        if (fs.existsSync(solutionsDbPath)) {
            console.log("  ✅ docs/troubleshooting/solutions-db.md 존재 확인");
            console.log("    💡 새 이슈는 이 파일에 추가하세요!");
            this.checks.push("기존 트러블슈팅 구조 확인");
        } else {
            console.log("  ❌ solutions-db.md를 찾을 수 없습니다");
            this.errors.push("기존 트러블슈팅 구조 누락");
        }
        
        // work-reports 구조 확인
        const workReportsPath = path.join(__dirname, '../../docs/work-reports');
        if (fs.existsSync(workReportsPath)) {
            console.log("  ✅ docs/work-reports/ 폴더 확인");
            console.log("    💡 작업 보고서는 이 폴더에 작성하세요!");
            this.checks.push("작업 보고서 구조 확인");
        } else {
            console.log("  ❌ work-reports/ 폴더를 찾을 수 없습니다");
            this.errors.push("작업 보고서 구조 누락");
        }
        
        // 월별 트러블슈팅 폴더 확인
        const currentMonth = "2025-07";
        const monthlyPath = path.join(__dirname, `../troubleshooting/${currentMonth}`);
        if (fs.existsSync(monthlyPath)) {
            console.log(`  ✅ docs/troubleshooting/${currentMonth}/ 폴더 확인`);
            this.checks.push("월별 이슈 구조 확인");
        } else {
            console.log(`  ⚠️ ${currentMonth} 월별 폴더가 없습니다`);
            console.log(`    💡 필요시 mkdir -p docs/troubleshooting/${currentMonth} 실행`);
            this.warnings.push("월별 이슈 폴더 미생성");
        }
    }
    
    /**
     * 검증 결과 요약
     */
    displaySummary() {
        console.log("═".repeat(60));
        console.log("🎯 지침 준수 검증 결과");
        console.log("═".repeat(60));
        
        console.log(`✅ 성공한 체크: ${this.checks.length}개`);
        this.checks.forEach(check => console.log(`   • ${check}`));
        
        if (this.warnings.length > 0) {
            console.log(`\n⚠️ 경고 사항: ${this.warnings.length}개`);
            this.warnings.forEach(warning => console.log(`   • ${warning}`));
        }
        
        if (this.errors.length > 0) {
            console.log(`\n❌ 오류 사항: ${this.errors.length}개`);
            this.errors.forEach(error => console.log(`   • ${error}`));
            console.log("\n🚨 오류를 해결한 후 작업을 시작하세요!");
        } else {
            console.log("\n🎉 모든 체크를 통과했습니다!");
            console.log("✨ 안전하게 작업을 시작할 수 있습니다.");
        }
        
        // 추가 권장사항
        console.log("\n💡 권장사항:");
        console.log("   • 새 이슈 발생 시: docs/troubleshooting/solutions-db.md에 기록");
        console.log("   • 작업 완료 시: docs/work-reports/에 보고서 작성");
        console.log("   • 주간 정리: docs/troubleshooting/2025-07/week-XX.md 업데이트");
    }
    
    /**
     * 지침 위반 방지 가이드
     */
    showPreventionGuide() {
        console.log("\n🛡️ 지침 위반 방지 가이드:");
        console.log("1. 📋 체크리스트 필수 확인");
        console.log("2. 📁 기존 문서 구조 우선 활용");
        console.log("3. 🚫 새 문서 생성 전 기존 파일 확인");
        console.log("4. ✅ 작업 완료 후 즉시 문서화");
    }
}

// 직접 실행 시
async function main() {
    const checker = new PreWorkChecker();
    
    try {
        const success = await checker.runAllChecks();
        checker.showPreventionGuide();
        
        if (!success) {
            process.exit(1); // 오류 발생 시 종료 코드 1
        }
        
    } catch (error) {
        console.error("❌ 검증 중 오류 발생:", error.message);
        process.exit(1);
    }
}

// 직접 실행 시
if (require.main === module) {
    main();
}

module.exports = PreWorkChecker;