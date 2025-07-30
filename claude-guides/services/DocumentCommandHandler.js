/**
 * 문서 관련 명령어 통합 처리 시스템
 * IMRAD, 육하원칙, 구조화 등 모든 문서 처리 명령어 관리
 * 
 * @author 에이전트 시스템 통합
 * @date 2025-07-30
 * @version 1.0.0
 */

const { IMRADDocumentProcessor } = require('./IMRADDocumentProcessor');

class DocumentCommandHandler {
    constructor() {
        this.imradProcessor = new IMRADDocumentProcessor();
        
        // 지원되는 모든 문서 관련 명령어
        this.documentCommands = {
            // IMRAD 관련 명령어
            '/imrad': {
                description: 'IMRAD 구조 적용 (Introduction-Methods-Results-Discussion)',
                usage: '/imrad [파일경로] --author [작성자] --date [날짜]',
                processor: 'imrad',
                priority: 'high'
            },
            
            // 육하원칙 명령어  
            '/6w1h': {
                description: '육하원칙 적용 (Who-What-When-Where-Why-How)',
                usage: '/6w1h [파일경로] --author [작성자] --date [날짜]',
                processor: 'sixWOneH',
                priority: 'high'
            },
            
            // 통합 학술 문서화
            '/academic': {
                description: 'IMRAD + 육하원칙 통합 적용 (학술 논문 수준)',
                usage: '/academic [파일경로] --author [작성자] --date [날짜]',
                processor: 'academic',
                priority: 'high'
            },
            
            // 문서 구조화
            '/structure': {
                description: '문서 체계적 구조화 (섹션별 정리)',
                usage: '/structure [파일경로]',
                processor: 'structure',
                priority: 'medium'
            },
            
            // 포맷 정리
            '/format': {
                description: '마크다운 포맷 정리 및 통일',
                usage: '/format [파일경로]',
                processor: 'format',
                priority: 'medium'
            },
            
            // 특허 문서 전용
            '/patent': {
                description: '특허 명세서 형식 적용 (IMRAD + 설득력 강화)',
                usage: '/patent [파일경로] --author [작성자]',
                processor: 'patent',
                priority: 'high'
            },
            
            // 보고서 형식
            '/report': {
                description: '업무 보고서 형식 적용',
                usage: '/report [파일경로] --author [작성자] --type [보고서유형]',
                processor: 'report',
                priority: 'medium'
            },
            
            // 제안서 형식
            '/proposal': {
                description: '제안서/기획서 형식 적용',
                usage: '/proposal [파일경로] --author [작성자]',
                processor: 'proposal',
                priority: 'medium'
            }
        };
        
        // 자동 감지 패턴
        this.autoDetectionPatterns = {
            patent: ['특허', '청구항', '발명', 'patent', 'claim', 'invention'],
            academic: ['연구', '논문', '분석', 'research', 'study', 'analysis'],
            report: ['보고서', '현황', '결과', 'report', 'status', 'result'],
            proposal: ['제안', '기획', '계획', 'proposal', 'plan', 'project']
        };
    }

    /**
     * 문서 명령어 처리 메인 함수
     * @param {string} command - 실행할 명령어
     * @param {string} filePath - 대상 파일 경로
     * @param {object} options - 명령어 옵션
     * @returns {object} 처리 결과
     */
    async processDocumentCommand(command, filePath, options = {}) {
        try {
            // 명령어 유효성 검사
            if (!this.documentCommands[command]) {
                throw new Error(`지원하지 않는 문서 명령어: ${command}`);
            }

            // 파일 내용 읽기
            const fs = require('fs');
            const path = require('path');
            
            if (!fs.existsSync(filePath)) {
                throw new Error(`파일을 찾을 수 없습니다: ${filePath}`);
            }

            const originalContent = fs.readFileSync(filePath, 'utf-8');
            
            // 메타데이터 추출
            const metadata = this.extractMetadata(originalContent, options);
            
            // 명령어별 처리
            let processedContent;
            const commandInfo = this.documentCommands[command];
            
            switch (commandInfo.processor) {
                case 'imrad':
                    processedContent = this.imradProcessor.applyIMRADStructure(originalContent, metadata);
                    break;
                    
                case 'sixWOneH':
                    processedContent = this.imradProcessor.processCommand('/6w1h', originalContent, metadata);
                    break;
                    
                case 'academic':
                    processedContent = this.imradProcessor.applyIMRADStructure(originalContent, metadata);
                    break;
                    
                case 'structure':
                    processedContent = this.imradProcessor.processCommand('/structure', originalContent, metadata);
                    break;
                    
                case 'format':
                    processedContent = this.imradProcessor.processCommand('/format', originalContent, metadata);
                    break;
                    
                case 'patent':
                    processedContent = this.processPatentDocument(originalContent, metadata);
                    break;
                    
                case 'report':
                    processedContent = this.processReportDocument(originalContent, metadata);
                    break;
                    
                case 'proposal':
                    processedContent = this.processProposalDocument(originalContent, metadata);
                    break;
                    
                default:
                    throw new Error(`처리기를 찾을 수 없습니다: ${commandInfo.processor}`);
            }

            // 결과 파일 저장
            const outputPath = this.generateOutputPath(filePath, command);
            fs.writeFileSync(outputPath, processedContent, 'utf-8');

            return {
                success: true,
                command: command,
                inputFile: filePath,
                outputFile: outputPath,
                processor: commandInfo.processor,
                metadata: metadata,
                message: `${commandInfo.description} 적용 완료`
            };

        } catch (error) {
            return {
                success: false,
                command: command,
                error: error.message,
                message: `문서 처리 실패: ${error.message}`
            };
        }
    }

    /**
     * 메타데이터 추출
     */
    extractMetadata(content, options) {
        return {
            author: options.author || '김두섭',
            date: options.date || new Date().toISOString().split('T')[0].replace(/-/g, '/').substring(2),
            type: options.type || 'document',
            version: options.version || '1.0.0'
        };
    }

    /**
     * 특허 문서 처리
     */
    processPatentDocument(content, metadata) {
        // 특허 특화 IMRAD 구조 적용
        let patentDoc = this.imradProcessor.applyIMRADStructure(content, metadata);
        
        // 특허 특화 요소 추가
        patentDoc = patentDoc.replace(
            '# 🔬 **I. INTRODUCTION (서론) - 배경 및 목적**',
            '# 🔬 **I. INTRODUCTION (서론) - 발명의 배경 및 목적**\n\n## 1.0 **발명의 명칭**\n발명의 명칭을 여기에 기입\n'
        );
        
        // 청구항 섹션 추가
        patentDoc = patentDoc.replace(
            '# 📊 **III. RESULTS (결과) - 분석 결과 및 제안 사항**',
            '# 📊 **III. RESULTS (결과) - 특허 청구범위**\n\n## 3.0 **청구항별 가치 평가**\n\n### **청구항 우선순위 매트릭스**\n| 청구항 | 기술혁신도 | 특허성 | 차별화도 | 구현가능성 | 종합점수 |\n|--------|------------|--------|----------|------------|----------|\n| 청구항 1 | - | - | - | - | - |\n\n'
        );
        
        return patentDoc;
    }

    /**
     * 보고서 문서 처리
     */
    processReportDocument(content, metadata) {
        const reportType = metadata.type || '업무보고서';
        
        return `# ${reportType}
## [${reportType} - 체계화 적용]

---

## 📋 **보고서 정보**

| 구분 | 내용 |
|------|------|
| **보고서 유형** | ${reportType} |
| **작성자** | ${metadata.author} |
| **작성일** | ${metadata.date} |
| **버전** | ${metadata.version} |

---

## 📊 **요약 (Executive Summary)**
보고서 핵심 내용 요약

## 🔍 **현황 분석**
현재 상황에 대한 체계적 분석

## 📈 **주요 성과**
달성한 성과 및 결과

## ⚠️ **문제점 및 이슈**
발견된 문제점과 해결이 필요한 이슈

## 💡 **개선 방안**
제안하는 개선 사항 및 해결책

## 📋 **향후 계획**
다음 단계 실행 계획

---

${content}

---

**📝 작성자**: ${metadata.author}  
**📅 작성일**: ${metadata.date}  
**📄 문서 유형**: ${reportType}  
**🏷️ 버전**: 체계화 완성판`;
    }

    /**
     * 제안서 문서 처리
     */
    processProposalDocument(content, metadata) {
        return `# 제안서
## [기획/제안서 - 체계화 적용]

---

## 📋 **제안서 정보**

| 구분 | 내용 |
|------|------|
| **제안자** | ${metadata.author} |
| **제안일** | ${metadata.date} |
| **버전** | ${metadata.version} |

---

## 🎯 **제안 개요**
제안의 핵심 내용 및 목적

## 📊 **현황 및 필요성**
현재 상황 분석 및 제안 필요성

## 💡 **제안 내용**
구체적인 제안 사항 및 해결책

## 📈 **기대 효과**
예상되는 효과 및 성과

## 💰 **소요 예산**
필요한 예산 및 자원

## 📅 **추진 일정**
단계별 실행 계획 및 일정

## 🔧 **실행 방안**
구체적인 실행 방법 및 체계

---

${content}

---

**📝 제안자**: ${metadata.author}  
**📅 제안일**: ${metadata.date}  
**📄 문서 유형**: 기획/제안서  
**🏷️ 버전**: 체계화 완성판`;
    }

    /**
     * 출력 파일 경로 생성
     */
    generateOutputPath(inputPath, command) {
        const path = require('path');
        const fs = require('fs');
        
        const dir = path.dirname(inputPath);
        const name = path.basename(inputPath, path.extname(inputPath));
        const ext = path.extname(inputPath);
        
        // 명령어별 접미사
        const suffixes = {
            '/imrad': '_IMRAD구조',
            '/6w1h': '_육하원칙',
            '/academic': '_학술논문형식',
            '/structure': '_구조화',
            '/format': '_포맷정리',
            '/patent': '_특허명세서',
            '/report': '_보고서형식',
            '/proposal': '_제안서형식'
        };
        
        const suffix = suffixes[command] || '_처리완료';
        return path.join(dir, `${name}${suffix}${ext}`);
    }

    /**
     * 문서 유형 자동 감지
     */
    detectDocumentType(content) {
        const contentLower = content.toLowerCase();
        
        for (const [type, patterns] of Object.entries(this.autoDetectionPatterns)) {
            if (patterns.some(pattern => contentLower.includes(pattern))) {
                return type;
            }
        }
        
        return 'general';
    }

    /**
     * 지원 명령어 목록 반환
     */
    getSupportedCommands() {
        return Object.keys(this.documentCommands).map(cmd => ({
            command: cmd,
            description: this.documentCommands[cmd].description,
            usage: this.documentCommands[cmd].usage,
            priority: this.documentCommands[cmd].priority
        }));
    }

    /**
     * 도움말 텍스트 생성
     */
    getHelpText() {
        let helpText = `# 📚 문서 처리 명령어 도움말\n\n`;
        helpText += `## 지원되는 명령어\n\n`;
        
        for (const [cmd, info] of Object.entries(this.documentCommands)) {
            helpText += `### ${cmd}\n`;
            helpText += `- **설명**: ${info.description}\n`;
            helpText += `- **사용법**: ${info.usage}\n`;
            helpText += `- **우선순위**: ${info.priority}\n\n`;
        }
        
        helpText += `## 사용 예시\n\n`;
        helpText += `\`\`\`bash\n`;
        helpText += `/academic /path/to/document.md --author "김두섭" --date "25/07/30"\n`;
        helpText += `/imrad /path/to/research.md\n`;
        helpText += `/patent /path/to/patent.md --author "발명자"\n`;
        helpText += `\`\`\`\n\n`;
        
        return helpText;
    }
}

module.exports = { DocumentCommandHandler };