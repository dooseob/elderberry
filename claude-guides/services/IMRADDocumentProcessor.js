/**
 * IMRAD + 육하원칙 문서 처리 시스템
 * 모든 문서를 학술 논문 수준의 체계적 구조로 변환
 * 
 * @author 김두섭 기반 시스템 설계
 * @date 2025-07-30
 * @version 1.0.0
 */

class IMRADDocumentProcessor {
    constructor() {
        this.supportedFormats = ['.md', '.txt', '.doc', '.docx'];
        this.commands = {
            '/imrad': 'IMRAD 구조 적용',
            '/6w1h': '육하원칙 적용', 
            '/academic': 'IMRAD + 육하원칙 통합 적용',
            '/structure': '문서 구조화',
            '/format': '학술 형식 변환'
        };
        
        // 작성자 및 날짜 정보 기본값
        this.defaultAuthor = '김두섭';
        this.currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '/').substring(2); // 25/07/30 형식
    }

    /**
     * 육하원칙 정보 추출 및 구조화
     * @param {string} content - 원본 문서 내용
     * @param {object} metadata - 메타데이터 (작성자, 날짜 등)
     * @returns {object} 육하원칙 구조화된 정보
     */
    extractSixWOneH(content, metadata = {}) {
        const author = metadata.author || this.defaultAuthor;
        const date = metadata.date || this.currentDate;
        
        // 문서 내용에서 육하원칙 요소 자동 추출
        const titleMatch = content.match(/^#\s*(.+)/m);
        const title = titleMatch ? titleMatch[1].replace(/[🏆🔥📊⚡🎯]/g, '').trim() : '문서 제목';
        
        return {
            who: author,
            what: title,
            when: date,
            where: this.extractContext(content),
            why: this.extractPurpose(content),
            how: this.extractMethod(content)
        };
    }

    /**
     * 문서 컨텍스트 추출
     */
    extractContext(content) {
        // 기술 분야, 시장, 영역 등 컨텍스트 키워드 검색
        const contextKeywords = [
            '시장', '분야', '영역', '환경', '산업', '서비스',
            'market', 'field', 'domain', 'industry', 'service'
        ];
        
        for (const keyword of contextKeywords) {
            const regex = new RegExp(`([^\\n]*${keyword}[^\\n]*)`, 'i');
            const match = content.match(regex);
            if (match) {
                return match[1].trim();
            }
        }
        
        return '해당 기술/서비스 적용 분야';
    }

    /**
     * 문서 목적 추출
     */
    extractPurpose(content) {
        // 목적, 배경, 필요성 등 키워드 검색
        const purposeKeywords = [
            '목적', '배경', '필요성', '문제', '해결', '과제',
            'purpose', 'background', 'problem', 'solution', 'objective'
        ];
        
        for (const keyword of purposeKeywords) {
            const regex = new RegExp(`([^\\n]*${keyword}[^\\n]*)`, 'i');
            const match = content.match(regex);
            if (match) {
                return match[1].trim();
            }
        }
        
        return '해당 문제 해결 및 기술 혁신 실현';
    }

    /**
     * 방법론 추출
     */
    extractMethod(content) {
        // 방법, 시스템, 알고리즘 등 키워드 검색
        const methodKeywords = [
            '방법', '시스템', '알고리즘', '기술', '구조', '설계',
            'method', 'system', 'algorithm', 'technology', 'structure', 'design'
        ];
        
        for (const keyword of methodKeywords) {
            const regex = new RegExp(`([^\\n]*${keyword}[^\\n]*)`, 'i');
            const match = content.match(regex);
            if (match) {
                return match[1].trim();
            }
        }
        
        return '체계적 방법론 및 기술적 접근';
    }

    /**
     * IMRAD 구조 적용
     * @param {string} content - 원본 문서 내용
     * @param {object} metadata - 메타데이터
     * @returns {string} IMRAD 구조로 변환된 문서
     */
    applyIMRADStructure(content, metadata = {}) {
        const sixWOneH = this.extractSixWOneH(content, metadata);
        const sections = this.parseContentSections(content);
        
        let imradDoc = this.buildDocumentHeader(sixWOneH);
        imradDoc += this.buildIntroduction(sections, sixWOneH);
        imradDoc += this.buildMethods(sections);
        imradDoc += this.buildResults(sections);
        imradDoc += this.buildDiscussion(sections);
        imradDoc += this.buildConclusion(sections);
        imradDoc += this.buildDocumentFooter(sixWOneH);
        
        return imradDoc;
    }

    /**
     * 문서 헤더 생성 (육하원칙 포함)
     */
    buildDocumentHeader(sixWOneH) {
        return `# ${sixWOneH.what}
## [IMRAD 구조 기반 문서 - 육하원칙 적용]

---

## 📋 **문서 정보 (육하원칙 기반)**

| 구분 | 내용 |
|------|------|
| **Who (누가)** | ${sixWOneH.who} |
| **What (무엇을)** | ${sixWOneH.what} |
| **When (언제)** | ${sixWOneH.when} |
| **Where (어디서)** | ${sixWOneH.where} |
| **Why (왜)** | ${sixWOneH.why} |
| **How (어떻게)** | ${sixWOneH.how} |

**작성자**: ${sixWOneH.who}  
**작성일**: ${sixWOneH.when}  
**문서 유형**: IMRAD 구조 적용 문서  
**버전**: 체계화 완성판

---

`;
    }

    /**
     * Introduction 섹션 생성
     */
    buildIntroduction(sections, sixWOneH) {
        return `# 🔬 **I. INTRODUCTION (서론) - 배경 및 목적**

## 1.1 **주제 개요**
${sixWOneH.what}

## 1.2 **연구/작업 동기 및 필요성**
${sixWOneH.why}

## 1.3 **문서 목적 및 범위**
본 문서는 ${sixWOneH.what}에 대한 체계적인 분석과 제안을 통해 다음을 달성하고자 한다:

1. **현재 상황 분석**: 기존 방식의 한계점 및 개선 필요성 파악
2. **해결 방안 제시**: ${sixWOneH.how}를 통한 체계적 접근
3. **실행 계획 수립**: 구체적이고 실현 가능한 실행 방안 도출
4. **효과 검증**: 예상 결과 및 성과 지표 제시

## 1.4 **연구/분석 가설**
> **"${sixWOneH.how}를 적용하면 기존 방식 대비 효율성과 효과성이 유의미하게 향상될 것이다."**

---

`;
    }

    /**
     * Methods 섹션 생성
     */
    buildMethods(sections) {
        return `# 📚 **II. METHODS (방법론) - 접근 방식 및 실행 방법**

## 2.1 **현황 분석 방법론**

### **2.1.1 문제점 식별 프로세스**
1. **현재 상태 진단**: 기존 방식의 한계점 및 문제점 분석
2. **원인 분석**: 근본 원인 및 구조적 문제 파악
3. **개선 요구사항 도출**: 해결해야 할 핵심 과제 정의

### **2.1.2 해결 방안 설계 원칙**
1. **체계성**: 논리적이고 단계적인 접근
2. **실용성**: 실제 적용 가능한 현실적 방안
3. **효율성**: 최소 비용으로 최대 효과 달성
4. **지속성**: 장기적으로 유지 가능한 시스템

## 2.2 **핵심 방법론 및 기술**

### **2.2.1 접근 방식**
${this.extractMethodDetails(sections)}

### **2.2.2 구현 단계**
1. **1단계**: 기초 설계 및 프레임워크 구축
2. **2단계**: 핵심 기능 개발 및 구현
3. **3단계**: 테스트 및 검증
4. **4단계**: 최적화 및 완성

---

`;
    }

    /**
     * Results 섹션 생성
     */
    buildResults(sections) {
        return `# 📊 **III. RESULTS (결과) - 분석 결과 및 제안 사항**

## 3.1 **현황 분석 결과**

### **3.1.1 주요 발견사항**
${this.extractKeyFindings(sections)}

### **3.1.2 핵심 문제점 및 개선 포인트**
${this.extractProblems(sections)}

## 3.2 **제안 사항 및 해결책**

### **3.2.1 핵심 제안사항**
${this.extractProposals(sections)}

### **3.2.2 구체적 실행 방안**
${this.extractActionPlans(sections)}

---

`;
    }

    /**
     * Discussion 섹션 생성
     */
    buildDiscussion(sections) {
        return `# 🔍 **IV. DISCUSSION (고찰) - 의의 및 활용 전망**

## 4.1 **결과 해석 및 의의**

### **4.1.1 주요 성과**
본 분석을 통해 다음과 같은 성과를 도출하였다:

1. **체계적 접근**: 기존의 단편적 접근을 넘어선 통합적 분석
2. **실용적 해결책**: 즉시 적용 가능한 구체적 방안 제시
3. **효과성 검증**: 정량적 지표를 통한 개선 효과 입증

### **4.1.2 기존 방식 대비 장점**
${this.extractAdvantages(sections)}

## 4.2 **한계점 및 개선 방향**

### **4.2.1 현재 한계점**
${this.extractLimitations(sections)}

### **4.2.2 향후 개선 방향**
1. **단기 개선사항** (1-3개월): 즉시 적용 가능한 개선
2. **중기 발전방향** (3-12개월): 체계적 고도화 및 확장
3. **장기 전략** (1년 이상): 지속적 발전 및 혁신

---

`;
    }

    /**
     * Conclusion 섹션 생성
     */
    buildConclusion(sections) {
        return `# 📋 **V. CONCLUSION (결론) - 요약 및 제언**

## 5.1 **종합 요약**

### **5.1.1 주요 결론**
본 분석을 통해 다음과 같은 결론을 도출하였다:

1. **현황 진단**: 기존 방식의 한계점과 개선 필요성 확인
2. **해결방안 도출**: 체계적이고 실용적인 개선 방안 제시
3. **효과 검증**: 예상 개선 효과와 성과 지표 제시
4. **실행 계획**: 단계별 구현 로드맵 완성

### **5.1.2 핵심 가치**
${this.extractCoreValue(sections)}

## 5.2 **최종 제언 및 권고사항**

### **5.2.1 즉시 실행 권고**
1. **우선순위 1**: 가장 중요하고 시급한 개선사항
2. **우선순위 2**: 중기적 관점에서 필요한 사항
3. **우선순위 3**: 장기적 발전을 위한 전략적 사항

### **5.2.2 성공을 위한 핵심 요소**
1. **체계적 접근**: 단계적이고 논리적인 실행
2. **지속적 모니터링**: 진행상황 추적 및 조치
3. **유연한 대응**: 변화하는 상황에 맞는 적응

---

`;
    }

    /**
     * 문서 푸터 생성
     */
    buildDocumentFooter(sixWOneH) {
        return `**📝 작성자**: ${sixWOneH.who}  
**📅 작성일**: ${sixWOneH.when}  
**📄 문서 유형**: IMRAD 구조 기반 체계화 문서  
**🏷️ 버전**: 육하원칙 적용 완성판

---

**🎯 IMRAD 구조 적용 완료**: Introduction → Methods → Results → Discussion → Conclusion 체계적 논리 구성으로 문서의 가독성과 설득력을 극대화한 전문 문서입니다.**`;
    }

    /**
     * 내용 섹션 파싱
     */
    parseContentSections(content) {
        const sections = {
            problems: [],
            solutions: [],
            methods: [],
            results: [],
            advantages: [],
            limitations: []
        };

        // 각 섹션별 키워드를 통한 내용 분류
        const lines = content.split('\n');
        
        lines.forEach(line => {
            const cleanLine = line.trim();
            if (cleanLine.length < 10) return; // 너무 짧은 줄 제외
            
            // 문제점 관련
            if (this.containsKeywords(cleanLine, ['문제', '한계', '부족', '어려움', 'problem', 'limitation', 'issue'])) {
                sections.problems.push(cleanLine);
            }
            
            // 해결책 관련
            if (this.containsKeywords(cleanLine, ['해결', '개선', '제안', '방안', 'solution', 'improvement', 'proposal'])) {
                sections.solutions.push(cleanLine);
            }
            
            // 방법론 관련
            if (this.containsKeywords(cleanLine, ['방법', '기술', '시스템', '알고리즘', 'method', 'technology', 'system'])) {
                sections.methods.push(cleanLine);
            }
            
            // 결과 관련
            if (this.containsKeywords(cleanLine, ['결과', '성과', '효과', '개선', 'result', 'effect', 'improvement'])) {
                sections.results.push(cleanLine);
            }
        });

        return sections;
    }

    /**
     * 키워드 포함 여부 확인
     */
    containsKeywords(text, keywords) {
        return keywords.some(keyword => 
            text.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    /**
     * 방법론 세부사항 추출
     */
    extractMethodDetails(sections) {
        if (sections.methods.length > 0) {
            return sections.methods.slice(0, 3).join('\n\n');
        }
        return '체계적 분석 및 단계적 접근을 통한 문제 해결';
    }

    /**
     * 주요 발견사항 추출
     */
    extractKeyFindings(sections) {
        const findings = [];
        
        if (sections.problems.length > 0) {
            findings.push('**현재 한계점**: ' + sections.problems[0]);
        }
        
        if (sections.solutions.length > 0) {
            findings.push('**개선 방향**: ' + sections.solutions[0]);
        }
        
        if (findings.length === 0) {
            findings.push('**종합 분석**: 현재 상황에 대한 체계적 분석 및 개선 방향 도출');
        }
        
        return findings.join('\n\n');
    }

    /**
     * 문제점 추출
     */
    extractProblems(sections) {
        if (sections.problems.length > 0) {
            return sections.problems.slice(0, 3).map((problem, index) => 
                `${index + 1}. ${problem}`
            ).join('\n');
        }
        return '1. 기존 방식의 체계성 부족\n2. 효율성 개선 필요\n3. 통합적 접근 부재';
    }

    /**
     * 제안사항 추출
     */
    extractProposals(sections) {
        if (sections.solutions.length > 0) {
            return sections.solutions.slice(0, 3).map((solution, index) => 
                `${index + 1}. ${solution}`
            ).join('\n');
        }
        return '1. 체계적 프로세스 구축\n2. 효율성 극대화 방안\n3. 통합 관리 시스템 도입';
    }

    /**
     * 실행 방안 추출
     */
    extractActionPlans(sections) {
        return `### **단계별 실행 계획**

**1단계 (즉시 실행)**: 핵심 문제점 해결을 위한 긴급 조치
**2단계 (1-3개월)**: 체계적 개선 방안 적용 및 검증
**3단계 (3-6개월)**: 전면적 시스템 구축 및 최적화
**4단계 (6-12개월)**: 지속적 개선 및 발전 체계 확립`;
    }

    /**
     * 장점 추출
     */
    extractAdvantages(sections) {
        return `1. **체계성**: 논리적이고 단계적인 접근 방식
2. **효율성**: 기존 대비 시간과 비용 절약
3. **확장성**: 다양한 상황에 적용 가능한 유연성
4. **지속성**: 장기적으로 유지 가능한 시스템`;
    }

    /**
     * 한계점 추출
     */
    extractLimitations(sections) {
        return `1. **초기 구축 비용**: 시스템 도입 시 초기 투자 필요
2. **학습 곡선**: 새로운 방식에 대한 적응 시간 소요
3. **변화 관리**: 기존 방식에서 전환 시 저항 요소 존재`;
    }

    /**
     * 핵심 가치 추출
     */
    extractCoreValue(sections) {
        return `본 제안의 핵심 가치는 **체계적이고 지속 가능한 개선**을 통해 **효율성과 효과성을 동시에 달성**하는 것이다. 이를 통해 기존의 단편적 접근을 넘어선 **통합적 솔루션**을 제공할 수 있다.`;
    }

    /**
     * 명령어 처리 메인 함수
     */
    processCommand(command, content, metadata = {}) {
        switch (command.toLowerCase()) {
            case '/imrad':
                return this.applyIMRADStructure(content, metadata);
            
            case '/6w1h':
                const sixWOneH = this.extractSixWOneH(content, metadata);
                return this.buildSixWOneHDocument(sixWOneH, content);
            
            case '/academic':
                return this.applyIMRADStructure(content, metadata);
            
            case '/structure':
                return this.structureDocument(content, metadata);
            
            case '/format':
                return this.formatDocument(content, metadata);
            
            default:
                throw new Error(`지원하지 않는 명령어: ${command}`);
        }
    }

    /**
     * 육하원칙만 적용한 문서 생성
     */
    buildSixWOneHDocument(sixWOneH, originalContent) {
        return `# ${sixWOneH.what}
## [육하원칙 적용 문서]

---

## 📋 **문서 정보 (육하원칙 기반)**

| 구분 | 내용 |
|------|------|
| **Who (누가)** | ${sixWOneH.who} |
| **What (무엇을)** | ${sixWOneH.what} |
| **When (언제)** | ${sixWOneH.when} |
| **Where (어디서)** | ${sixWOneH.where} |
| **Why (왜)** | ${sixWOneH.why} |
| **How (어떻게)** | ${sixWOneH.how} |

---

${originalContent}

---

**📝 작성자**: ${sixWOneH.who}  
**📅 작성일**: ${sixWOneH.when}  
**🏷️ 버전**: 육하원칙 적용 완성판`;
    }

    /**
     * 문서 구조화
     */
    structureDocument(content, metadata) {
        const sections = this.parseContentSections(content);
        const sixWOneH = this.extractSixWOneH(content, metadata);
        
        return `# ${sixWOneH.what}
## [구조화 적용 문서]

## 📋 기본 정보
- **작성자**: ${sixWOneH.who}
- **작성일**: ${sixWOneH.when}

## 🎯 개요
${sixWOneH.what}

## 🔍 현황 분석
${sections.problems.length > 0 ? sections.problems.join('\n\n') : '현재 상황에 대한 체계적 분석'}

## 💡 해결 방안
${sections.solutions.length > 0 ? sections.solutions.join('\n\n') : '체계적 개선 방안'}

## 📊 기대 효과
${sections.results.length > 0 ? sections.results.join('\n\n') : '예상되는 개선 효과 및 성과'}

---

**구조화 완료**: 체계적 문서 구성으로 가독성과 이해도를 향상시킨 문서입니다.`;
    }

    /**
     * 문서 포맷 적용
     */
    formatDocument(content, metadata) {
        const sixWOneH = this.extractSixWOneH(content, metadata);
        
        // 기본적인 마크다운 포맷팅 적용
        let formattedContent = content;
        
        // 제목 계층 구조 정리
        formattedContent = formattedContent.replace(/^#{4,}/gm, '###');
        
        // 목록 형식 통일
        formattedContent = formattedContent.replace(/^[\*\-]\s/gm, '- ');
        
        // 강조 표시 통일
        formattedContent = formattedContent.replace(/\*\*([^*]+)\*\*/g, '**$1**');
        
        return `# ${sixWOneH.what}
## [포맷 적용 문서]

**📝 작성자**: ${sixWOneH.who}  
**📅 작성일**: ${sixWOneH.when}

---

${formattedContent}

---

**포맷 적용 완료**: 일관된 마크다운 형식으로 정리된 문서입니다.`;
    }
}

module.exports = { IMRADDocumentProcessor };