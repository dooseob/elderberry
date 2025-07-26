/**
 * Snyk 보안 분석 서비스
 * 
 * 보안 취약점 분석 및 의존성 보안 검사
 * 실제 Snyk API 없이도 패턴 기반 보안 분석 수행
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('./DocumentLearningService').logger;

class SnykSecurityAnalysisService {
    constructor() {
        this.initialized = false;
        this.projectRoot = process.cwd();
        this.knownVulnerabilities = this.loadKnownVulnerabilities();
    }

    async initialize() {
        try {
            logger.info('Snyk 보안 분석 서비스 초기화');
            this.initialized = true;
        } catch (error) {
            logger.error('Snyk 보안 분석 서비스 초기화 실패', error);
        }
    }

    /**
     * 프로젝트 보안 취약점 분석
     */
    async analyzeProject(projectPath, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        logger.info('Snyk 보안 분석 시작', { projectPath });

        try {
            // 1. 의존성 보안 분석
            const dependencyVulns = await this.analyzeDependencies(projectPath);
            
            // 2. 코드 보안 패턴 분석
            const codeVulns = await this.analyzeCodeSecurity(projectPath);
            
            // 3. 설정 보안 분석
            const configVulns = await this.analyzeConfiguration(projectPath);
            
            // 4. 인증/인가 보안 분석
            const authVulns = await this.analyzeAuthentication(projectPath);

            const allVulnerabilities = [
                ...dependencyVulns,
                ...codeVulns,
                ...configVulns,
                ...authVulns
            ];

            const result = {
                available: true,
                projectPath,
                timestamp: new Date().toISOString(),
                vulnerabilities: allVulnerabilities,
                summary: this.generateSummary(allVulnerabilities),
                recommendations: this.generateSecurityRecommendations(allVulnerabilities)
            };

            logger.info('Snyk 보안 분석 완료', {
                total: result.vulnerabilities.length,
                critical: result.summary.critical,
                high: result.summary.high
            });

            return result;

        } catch (error) {
            logger.error('Snyk 보안 분석 실패', error);
            return this.createEmptyResult(`분석 실패: ${error.message}`);
        }
    }

    /**
     * 의존성 보안 취약점 분석
     */
    async analyzeDependencies(projectPath) {
        const vulnerabilities = [];

        try {
            // Gradle 의존성 분석
            await this.analyzeGradleDependencies(projectPath, vulnerabilities);
            
            // npm 의존성 분석 (프론트엔드)
            await this.analyzeNpmDependencies(projectPath, vulnerabilities);

        } catch (error) {
            logger.warn('의존성 분석 실패', error);
        }

        return vulnerabilities;
    }

    /**
     * Gradle 의존성 보안 분석
     */
    async analyzeGradleDependencies(projectPath, vulnerabilities) {
        try {
            const gradlePath = path.join(projectPath, 'build.gradle.kts');
            const content = await fs.readFile(gradlePath, 'utf8');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                // 알려진 취약한 라이브러리 패턴 검사
                if (line.includes('implementation(') || line.includes('compile(')) {
                    this.knownVulnerabilities.gradle.forEach(vuln => {
                        if (line.includes(vuln.package)) {
                            const version = this.extractVersion(line);
                            if (this.isVulnerableVersion(version, vuln.affectedVersions)) {
                                vulnerabilities.push({
                                    severity: vuln.severity,
                                    title: `${vuln.package} 취약점`,
                                    description: vuln.description,
                                    file: gradlePath,
                                    line: index + 1,
                                    cve: vuln.cve,
                                    package: vuln.package,
                                    installedVersion: version,
                                    fixedVersion: vuln.fixedVersion,
                                    recommendation: `버전을 ${vuln.fixedVersion} 이상으로 업그레이드하세요`
                                });
                            }
                        }
                    });

                    // 스프링 시큐리티 관련 체크
                    if (line.includes('spring-security') && !line.includes('6.')) {
                        vulnerabilities.push({
                            severity: 'medium',
                            title: 'Spring Security 버전 업그레이드 권장',
                            description: '최신 보안 패치가 적용된 Spring Security 6.x 사용을 권장합니다',
                            file: gradlePath,
                            line: index + 1,
                            recommendation: 'Spring Security 6.x로 업그레이드'
                        });
                    }
                }
            });

        } catch (error) {
            // 파일 없음 - 정상
        }
    }

    /**
     * npm 의존성 보안 분석
     */
    async analyzeNpmDependencies(projectPath, vulnerabilities) {
        try {
            const packagePath = path.join(projectPath, 'frontend', 'package.json');
            const content = await fs.readFile(packagePath, 'utf8');
            const packageJson = JSON.parse(content);

            const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

            Object.keys(dependencies).forEach(packageName => {
                const version = dependencies[packageName];
                
                this.knownVulnerabilities.npm.forEach(vuln => {
                    if (packageName === vuln.package) {
                        if (this.isVulnerableVersion(version, vuln.affectedVersions)) {
                            vulnerabilities.push({
                                severity: vuln.severity,
                                title: `${vuln.package} 취약점`,
                                description: vuln.description,
                                file: packagePath,
                                cve: vuln.cve,
                                package: vuln.package,
                                installedVersion: version,
                                fixedVersion: vuln.fixedVersion,
                                recommendation: `npm update ${vuln.package}@${vuln.fixedVersion}`
                            });
                        }
                    }
                });
            });

        } catch (error) {
            // 파일 없음 - 정상
        }
    }

    /**
     * 코드 보안 패턴 분석
     */
    async analyzeCodeSecurity(projectPath) {
        const vulnerabilities = [];

        try {
            const javaFiles = await this.findJavaFiles(projectPath);
            
            for (const filePath of javaFiles) {
                const codeVulns = await this.analyzeJavaFileSecurity(filePath);
                vulnerabilities.push(...codeVulns);
            }

            // React/JavaScript 파일 분석
            const jsFiles = await this.findJavaScriptFiles(projectPath);
            for (const filePath of jsFiles) {
                const codeVulns = await this.analyzeJavaScriptFileSecurity(filePath);
                vulnerabilities.push(...codeVulns);
            }

        } catch (error) {
            logger.warn('코드 보안 분석 실패', error);
        }

        return vulnerabilities;
    }

    /**
     * Java 파일 보안 분석
     */
    async analyzeJavaFileSecurity(filePath) {
        const vulnerabilities = [];

        try {
            const content = await fs.readFile(filePath, 'utf8');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                const lineNumber = index + 1;

                // SQL Injection 패턴
                if (this.hasSqlInjectionRisk(line)) {
                    vulnerabilities.push({
                        severity: 'high',
                        title: 'SQL Injection 위험',
                        description: '사용자 입력이 직접 SQL 쿼리에 사용되고 있습니다',
                        file: filePath,
                        line: lineNumber,
                        cve: 'CWE-89',
                        recommendation: 'PreparedStatement 또는 JPA 파라미터 바인딩 사용'
                    });
                }

                // 하드코딩된 시크릿
                if (this.hasHardcodedSecrets(line)) {
                    vulnerabilities.push({
                        severity: 'critical',
                        title: '하드코딩된 시크릿',
                        description: '소스코드에 민감한 정보가 하드코딩되어 있습니다',
                        file: filePath,
                        line: lineNumber,
                        cve: 'CWE-798',
                        recommendation: '환경변수 또는 설정 파일로 분리'
                    });
                }

                // 취약한 암호화
                if (this.hasWeakCrypto(line)) {
                    vulnerabilities.push({
                        severity: 'medium',
                        title: '취약한 암호화 알고리즘',
                        description: '보안이 약한 암호화 알고리즘이 사용되고 있습니다',
                        file: filePath,
                        line: lineNumber,
                        cve: 'CWE-327',
                        recommendation: 'AES-256, RSA-2048 이상 사용'
                    });
                }

                // 입력 검증 부족
                if (this.lacksInputValidation(line)) {
                    vulnerabilities.push({
                        severity: 'medium',
                        title: '입력 검증 부족',
                        description: '사용자 입력에 대한 검증이 부족합니다',
                        file: filePath,
                        line: lineNumber,
                        cve: 'CWE-20',
                        recommendation: '@Valid, @NotNull 등 Bean Validation 사용'
                    });
                }

                // 로그 인젝션
                if (this.hasLogInjectionRisk(line)) {
                    vulnerabilities.push({
                        severity: 'low',
                        title: '로그 인젝션 위험',
                        description: '검증되지 않은 데이터가 로그에 기록되고 있습니다',
                        file: filePath,
                        line: lineNumber,
                        cve: 'CWE-117',
                        recommendation: '로그 출력 전 입력값 sanitization'
                    });
                }
            });

        } catch (error) {
            logger.warn(`Java 파일 보안 분석 실패: ${filePath}`, error);
        }

        return vulnerabilities;
    }

    /**
     * JavaScript 파일 보안 분석
     */
    async analyzeJavaScriptFileSecurity(filePath) {
        const vulnerabilities = [];

        try {
            const content = await fs.readFile(filePath, 'utf8');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                const lineNumber = index + 1;

                // XSS 위험
                if (this.hasXssRisk(line)) {
                    vulnerabilities.push({
                        severity: 'high',
                        title: 'XSS 취약점 위험',
                        description: '사용자 입력이 검증 없이 DOM에 삽입되고 있습니다',
                        file: filePath,
                        line: lineNumber,
                        cve: 'CWE-79',
                        recommendation: 'DOMPurify 라이브러리 사용 또는 React의 JSX 이스케이핑 활용'
                    });
                }

                // eval() 사용
                if (line.includes('eval(')) {
                    vulnerabilities.push({
                        severity: 'critical',
                        title: 'eval() 사용 금지',
                        description: 'eval() 함수는 코드 인젝션 공격에 취약합니다',
                        file: filePath,
                        line: lineNumber,
                        cve: 'CWE-95',
                        recommendation: 'JSON.parse() 또는 안전한 대안 사용'
                    });
                }

                // 민감 정보 콘솔 출력
                if (this.hasSensitiveLogging(line)) {
                    vulnerabilities.push({
                        severity: 'medium',
                        title: '민감 정보 로깅',
                        description: '민감한 정보가 콘솔에 출력되고 있습니다',
                        file: filePath,
                        line: lineNumber,
                        recommendation: '프로덕션 환경에서 민감 정보 로그 제거'
                    });
                }
            });

        } catch (error) {
            logger.warn(`JavaScript 파일 보안 분석 실패: ${filePath}`, error);
        }

        return vulnerabilities;
    }

    /**
     * 설정 보안 분석
     */
    async analyzeConfiguration(projectPath) {
        const vulnerabilities = [];

        try {
            // Spring Boot 설정 분석
            await this.analyzeSpringBootConfig(projectPath, vulnerabilities);
            
            // CORS 설정 분석
            await this.analyzeCorsConfig(projectPath, vulnerabilities);
            
            // JWT 설정 분석
            await this.analyzeJwtConfig(projectPath, vulnerabilities);

        } catch (error) {
            logger.warn('설정 보안 분석 실패', error);
        }

        return vulnerabilities;
    }

    /**
     * Spring Boot 설정 보안 분석
     */
    async analyzeSpringBootConfig(projectPath, vulnerabilities) {
        try {
            const configPath = path.join(projectPath, 'src/main/resources/application.yml');
            const content = await fs.readFile(configPath, 'utf8');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                // 개발 모드 프로덕션 사용
                if (line.includes('debug: true') || line.includes('profile: dev')) {
                    vulnerabilities.push({
                        severity: 'medium',
                        title: '개발 설정 프로덕션 사용 위험',
                        description: '개발용 설정이 프로덕션에서 사용될 수 있습니다',
                        file: configPath,
                        line: index + 1,
                        recommendation: '프로덕션 환경별 설정 분리'
                    });
                }

                // 기본 시크릿 사용
                if (line.includes('change-immediately') || line.includes('default')) {
                    vulnerabilities.push({
                        severity: 'high',
                        title: '기본 시크릿 키 사용',
                        description: '기본 시크릿 키가 사용되고 있습니다',
                        file: configPath,
                        line: index + 1,
                        recommendation: '강력한 임의 시크릿 키로 변경'
                    });
                }

                // HTTPS 비활성화
                if (line.includes('ssl.enabled: false')) {
                    vulnerabilities.push({
                        severity: 'high',
                        title: 'HTTPS 비활성화',
                        description: 'SSL/TLS가 비활성화되어 있습니다',
                        file: configPath,
                        line: index + 1,
                        recommendation: '프로덕션에서 HTTPS 활성화'
                    });
                }
            });

        } catch (error) {
            // 파일 없음 - 정상
        }
    }

    /**
     * CORS 설정 분석
     */
    async analyzeCorsConfig(projectPath, vulnerabilities) {
        try {
            const corsFiles = await this.findFilesWithPattern(projectPath, /cors|Cors|CORS/);
            
            for (const filePath of corsFiles) {
                const content = await fs.readFile(filePath, 'utf8');
                
                if (content.includes('allowedOrigins("*")') || content.includes('allowedOriginPatterns("*")')) {
                    vulnerabilities.push({
                        severity: 'high',
                        title: '과도한 CORS 허용',
                        description: '모든 도메인에서의 요청을 허용하고 있습니다',
                        file: filePath,
                        cve: 'CWE-346',
                        recommendation: '특정 신뢰할 수 있는 도메인만 허용'
                    });
                }

                if (content.includes('allowCredentials(true)') && content.includes('allowedOrigins("*")')) {
                    vulnerabilities.push({
                        severity: 'critical',
                        title: '위험한 CORS 설정',
                        description: '자격증명과 함께 모든 도메인 허용은 매우 위험합니다',
                        file: filePath,
                        cve: 'CWE-346',
                        recommendation: '자격증명 사용 시 특정 도메인만 허용'
                    });
                }
            }

        } catch (error) {
            logger.warn('CORS 설정 분석 실패', error);
        }
    }

    /**
     * JWT 설정 분석
     */
    async analyzeJwtConfig(projectPath, vulnerabilities) {
        try {
            const jwtFiles = await this.findFilesWithPattern(projectPath, /jwt|Jwt|JWT/);
            
            for (const filePath of jwtFiles) {
                const content = await fs.readFile(filePath, 'utf8');
                
                // 약한 JWT 시크릿
                if (this.hasWeakJwtSecret(content)) {
                    vulnerabilities.push({
                        severity: 'high',
                        title: '약한 JWT 시크릿',
                        description: 'JWT 서명에 사용되는 시크릿이 너무 약합니다',
                        file: filePath,
                        cve: 'CWE-326',
                        recommendation: '최소 256비트 이상의 강력한 시크릿 사용'
                    });
                }

                // JWT 만료시간 미설정
                if (!content.includes('expiration') && !content.includes('exp')) {
                    vulnerabilities.push({
                        severity: 'medium',
                        title: 'JWT 만료시간 미설정',
                        description: 'JWT 토큰의 만료시간이 설정되지 않았습니다',
                        file: filePath,
                        recommendation: '적절한 만료시간 설정 (예: 1시간)'
                    });
                }
            }

        } catch (error) {
            logger.warn('JWT 설정 분석 실패', error);
        }
    }

    /**
     * 인증/인가 보안 분석
     */
    async analyzeAuthentication(projectPath) {
        const vulnerabilities = [];

        try {
            const securityFiles = await this.findFilesWithPattern(projectPath, /Security|Auth|Login/);
            
            for (const filePath of securityFiles) {
                const content = await fs.readFile(filePath, 'utf8');
                
                // 기본 인증 사용
                if (content.includes('httpBasic()') && !content.includes('disable()')) {
                    vulnerabilities.push({
                        severity: 'medium',
                        title: 'HTTP Basic Authentication 사용',
                        description: 'Basic Auth는 보안이 약할 수 있습니다',
                        file: filePath,
                        recommendation: 'JWT 또는 OAuth2 사용 권장'
                    });
                }

                // CSRF 비활성화
                if (content.includes('csrf().disable()')) {
                    vulnerabilities.push({
                        severity: 'medium',
                        title: 'CSRF 보호 비활성화',
                        description: 'CSRF 공격에 취약할 수 있습니다',
                        file: filePath,
                        cve: 'CWE-352',
                        recommendation: 'API가 아닌 경우 CSRF 보호 활성화'
                    });
                }

                // 세션 고정 공격 대응 부족
                if (!content.includes('sessionManagement()') || !content.includes('SessionCreationPolicy')) {
                    vulnerabilities.push({
                        severity: 'low',
                        title: '세션 관리 설정 부족',
                        description: '세션 관리 정책이 명확하지 않습니다',
                        file: filePath,
                        recommendation: '적절한 세션 관리 정책 설정'
                    });
                }
            }

        } catch (error) {
            logger.warn('인증/인가 분석 실패', error);
        }

        return vulnerabilities;
    }

    // ===== 유틸리티 메서드 =====

    loadKnownVulnerabilities() {
        return {
            gradle: [
                {
                    package: 'spring-web',
                    severity: 'high',
                    description: 'Spring Web MVC 경로 순회 취약점',
                    cve: 'CVE-2023-20860',
                    affectedVersions: ['< 6.0.7'],
                    fixedVersion: '6.0.7'
                },
                {
                    package: 'jackson-databind',
                    severity: 'critical',
                    description: 'Jackson 역직렬화 취약점',
                    cve: 'CVE-2023-35116',
                    affectedVersions: ['< 2.15.2'],
                    fixedVersion: '2.15.2'
                }
            ],
            npm: [
                {
                    package: 'axios',
                    severity: 'medium',
                    description: 'Axios CSRF 보호 우회',
                    cve: 'CVE-2023-45857',
                    affectedVersions: ['< 1.6.1'],
                    fixedVersion: '1.6.1'
                },
                {
                    package: 'semver',
                    severity: 'high',
                    description: 'Semver 정규식 DoS',
                    cve: 'CVE-2022-25883',
                    affectedVersions: ['< 7.5.2'],
                    fixedVersion: '7.5.2'
                }
            ]
        };
    }

    async findJavaFiles(dir) {
        const files = [];
        
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
                    const subFiles = await this.findJavaFiles(fullPath);
                    files.push(...subFiles);
                } else if (entry.isFile() && entry.name.endsWith('.java')) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // 디렉터리 접근 실패 - 무시
        }

        return files;
    }

    async findJavaScriptFiles(dir) {
        const files = [];
        
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
                    const subFiles = await this.findJavaScriptFiles(fullPath);
                    files.push(...subFiles);
                } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // 디렉터리 접근 실패 - 무시
        }

        return files;
    }

    async findFilesWithPattern(dir, pattern) {
        const files = [];
        
        try {
            const allFiles = await this.findJavaFiles(dir);
            return allFiles.filter(file => pattern.test(path.basename(file)));
        } catch (error) {
            return [];
        }
    }

    shouldSkipDirectory(name) {
        const skipDirs = ['node_modules', '.git', 'build', 'target', '.gradle', 'dist', 'logs'];
        return skipDirs.includes(name) || name.startsWith('.');
    }

    // 보안 패턴 검사 메서드들
    hasSqlInjectionRisk(line) {
        return (line.includes('createQuery(') || line.includes('executeQuery(')) && 
               line.includes('+') && 
               !line.includes('//');
    }

    hasHardcodedSecrets(line) {
        const secretPatterns = [
            /password\s*=\s*["\'].{8,}["\']/i,
            /secret\s*=\s*["\'].{16,}["\']/i,
            /token\s*=\s*["\'][A-Za-z0-9+/]{20,}["\']/i,
            /key\s*=\s*["\'][A-Za-z0-9+/]{16,}["\']/i
        ];
        
        return secretPatterns.some(pattern => pattern.test(line)) && 
               !line.includes('${') && 
               !line.includes('getProperty');
    }

    hasWeakCrypto(line) {
        const weakAlgorithms = ['MD5', 'SHA1', 'DES', 'RC4'];
        return weakAlgorithms.some(algo => line.includes(algo));
    }

    lacksInputValidation(line) {
        return (line.includes('@RequestParam') || line.includes('@PathVariable')) && 
               !line.includes('@Valid') && 
               !line.includes('@NotNull') && 
               !line.includes('@NotBlank');
    }

    hasLogInjectionRisk(line) {
        return line.includes('log.') && 
               (line.includes('request.') || line.includes('param')) && 
               !line.includes('sanitize');
    }

    hasXssRisk(line) {
        return (line.includes('innerHTML') || line.includes('dangerouslySetInnerHTML')) && 
               !line.includes('DOMPurify') && 
               !line.includes('sanitize');
    }

    hasSensitiveLogging(line) {
        return line.includes('console.log') && 
               (line.includes('password') || line.includes('token') || line.includes('secret'));
    }

    hasWeakJwtSecret(content) {
        const secretMatches = content.match(/secret["\s]*[:=]["\s]*([^"'\s]+)/gi);
        if (secretMatches) {
            return secretMatches.some(match => {
                const secret = match.split(/[:=]/)[1].replace(/["\s]/g, '');
                return secret.length < 32 || secret === 'secret' || secret === 'mysecret';
            });
        }
        return false;
    }

    extractVersion(line) {
        const versionMatch = line.match(/["']:([0-9]+\.[0-9]+\.[0-9]+)/);
        return versionMatch ? versionMatch[1] : '0.0.0';
    }

    isVulnerableVersion(installedVersion, affectedVersions) {
        // 간단한 버전 비교 (실제로는 더 정교한 semver 비교 필요)
        return affectedVersions.some(affected => {
            if (affected.startsWith('< ')) {
                const targetVersion = affected.substring(2);
                return this.compareVersions(installedVersion, targetVersion) < 0;
            }
            return false;
        });
    }

    compareVersions(version1, version2) {
        const v1Parts = version1.split('.').map(Number);
        const v2Parts = version2.split('.').map(Number);
        
        for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
            const v1Part = v1Parts[i] || 0;
            const v2Part = v2Parts[i] || 0;
            
            if (v1Part < v2Part) return -1;
            if (v1Part > v2Part) return 1;
        }
        
        return 0;
    }

    generateSummary(vulnerabilities) {
        const summary = {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            total: vulnerabilities.length
        };

        vulnerabilities.forEach(vuln => {
            summary[vuln.severity] = (summary[vuln.severity] || 0) + 1;
        });

        return summary;
    }

    generateSecurityRecommendations(vulnerabilities) {
        const recommendations = [];

        // 심각도별 권장사항
        const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical');
        if (criticalVulns.length > 0) {
            recommendations.push({
                priority: 'critical',
                title: '치명적 보안 취약점 즉시 해결',
                description: `${criticalVulns.length}개의 치명적 보안 취약점이 발견되었습니다. 즉시 해결이 필요합니다.`,
                actions: criticalVulns.slice(0, 3).map(v => v.title)
            });
        }

        // 의존성 업데이트 권장
        const depVulns = vulnerabilities.filter(v => v.package);
        if (depVulns.length > 0) {
            recommendations.push({
                priority: 'high',
                title: '의존성 보안 업데이트',
                description: `${depVulns.length}개의 취약한 의존성이 발견되었습니다.`,
                actions: [...new Set(depVulns.map(v => `${v.package} → ${v.fixedVersion}`))]
            });
        }

        // 코드 보안 개선
        const codeVulns = vulnerabilities.filter(v => !v.package);
        if (codeVulns.length > 0) {
            recommendations.push({
                priority: 'medium',
                title: '코드 보안 개선',
                description: `${codeVulns.length}개의 코드 레벨 보안 이슈가 발견되었습니다.`,
                actions: ['입력 검증 강화', '안전한 암호화 사용', '로그 보안 강화']
            });
        }

        return recommendations;
    }

    createEmptyResult(reason) {
        return {
            available: false,
            reason,
            vulnerabilities: [],
            summary: {
                critical: 0,
                high: 0,
                medium: 0,
                low: 0,
                total: 0
            },
            recommendations: []
        };
    }
}

module.exports = SnykSecurityAnalysisService;