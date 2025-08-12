/**
 * API 테스트 스위트 - curl 기반 자동화 테스트 시스템
 * 엘더베리 프로젝트 백엔드 API 자동화 테스트
 * @version 1.0.0
 * @date 2025-08-12
 * @features curl 자동화, API 검증, 성능 측정, 보안 테스트
 */

class ApiTestingSuite {
    constructor() {
        this.version = '1.0.0';
        this.description = '엘더베리 API curl 기반 자동화 테스트 시스템';
        this.baseUrl = process.env.API_BASE_URL || 'http://localhost:8080/api';
        
        this.endpoints = {
            auth: {
                login: '/auth/login',
                register: '/auth/register',
                refresh: '/auth/refresh',
                logout: '/auth/logout',
                me: '/auth/me'
            },
            facilities: {
                search: '/facilities/search',
                detail: '/facilities/{id}',
                recommendations: '/facilities/recommendations'
            },
            health: {
                assessments: '/health/assessments',
                create: '/health/assessments',
                history: '/health/assessments/history'
            },
            admin: {
                users: '/admin/users',
                facilities: '/admin/facilities',
                system: '/admin/system/status'
            }
        };
        
        this.testData = {
            validUser: {
                email: 'test.domestic@example.com',
                password: 'Password123!'
            },
            newUser: {
                email: `test.${Date.now()}@example.com`,
                password: 'NewPassword123!',
                name: '테스트 사용자',
                role: 'domestic'
            },
            facilitySearch: {
                location: '서울',
                type: 'nursing_home',
                maxDistance: 10
            },
            healthAssessment: {
                age: 75,
                gender: 'female',
                conditions: ['diabetes', 'hypertension'],
                mobility: 'limited'
            }
        };
        
        this.authToken = null;
        this.refreshToken = null;
    }

    /**
     * 🚀 전체 API 테스트 스위트 실행
     */
    async runCompleteApiTestSuite(options = {}) {
        console.log('🚀 엘더베리 API 테스트 스위트 시작...');
        
        const testResults = {
            startTime: new Date().toISOString(),
            baseUrl: this.baseUrl,
            results: {},
            summary: {
                totalTests: 0,
                passedTests: 0,
                failedTests: 0,
                skippedTests: 0
            },
            performance: {},
            security: {},
            coverage: {}
        };

        try {
            // 1. 인증 API 테스트
            console.log('🔐 인증 API 테스트 실행...');
            testResults.results.auth = await this.testAuthenticationEndpoints();

            // 2. 시설 API 테스트
            console.log('🏢 시설 API 테스트 실행...');
            testResults.results.facilities = await this.testFacilityEndpoints();

            // 3. 건강평가 API 테스트
            console.log('💊 건강평가 API 테스트 실행...');
            testResults.results.health = await this.testHealthEndpoints();

            // 4. 성능 테스트
            if (options.includePerformance) {
                console.log('⚡ API 성능 테스트 실행...');
                testResults.performance = await this.runPerformanceTests();
            }

            // 5. 보안 테스트
            if (options.includeSecurity) {
                console.log('🔒 API 보안 테스트 실행...');
                testResults.security = await this.runSecurityTests();
            }

            // 6. 결과 집계
            testResults.summary = this.calculateTestSummary(testResults.results);
            testResults.coverage = this.calculateApiCoverage(testResults.results);

        } catch (error) {
            console.error('❌ API 테스트 스위트 실행 중 오류:', error.message);
            testResults.error = error.message;
        }

        testResults.endTime = new Date().toISOString();
        testResults.duration = this.calculateDuration(testResults.startTime, testResults.endTime);

        console.log('✅ API 테스트 스위트 완료');
        return testResults;
    }

    /**
     * 🔐 인증 API 엔드포인트 테스트
     */
    async testAuthenticationEndpoints() {
        const authResults = {
            login: null,
            register: null,
            refresh: null,
            logout: null,
            profile: null
        };

        try {
            // 로그인 테스트
            authResults.login = await this.testLogin();
            
            // 프로필 조회 테스트 (로그인 성공 시)
            if (authResults.login.success && this.authToken) {
                authResults.profile = await this.testGetProfile();
            }

            // 회원가입 테스트
            authResults.register = await this.testRegister();

            // 토큰 갱신 테스트
            if (this.refreshToken) {
                authResults.refresh = await this.testTokenRefresh();
            }

            // 로그아웃 테스트
            if (this.authToken) {
                authResults.logout = await this.testLogout();
            }

        } catch (error) {
            console.error('❌ 인증 테스트 실행 중 오류:', error.message);
        }

        return authResults;
    }

    /**
     * 🔑 로그인 API 테스트
     */
    async testLogin() {
        console.log('  🔑 로그인 API 테스트...');
        
        const curlCommand = `curl -X POST "${this.baseUrl}/auth/login" \\
            -H "Content-Type: application/json" \\
            -d '${JSON.stringify(this.testData.validUser)}' \\
            -w "\\n%{http_code}\\n%{time_total}\\n" \\
            -s`;

        try {
            const result = await this.executeCurlCommand(curlCommand);
            const response = this.parseCurlResponse(result);

            if (response.statusCode === 200 && response.data.success) {
                this.authToken = response.data.data.token;
                this.refreshToken = response.data.data.refreshToken;
                
                return {
                    success: true,
                    statusCode: response.statusCode,
                    responseTime: response.responseTime,
                    data: response.data,
                    message: '로그인 성공'
                };
            } else {
                return {
                    success: false,
                    statusCode: response.statusCode,
                    responseTime: response.responseTime,
                    error: response.data.error || '로그인 실패',
                    message: '로그인 실패'
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: '로그인 요청 실패'
            };
        }
    }

    /**
     * 👤 프로필 조회 API 테스트
     */
    async testGetProfile() {
        console.log('  👤 프로필 조회 API 테스트...');
        
        const curlCommand = `curl -X GET "${this.baseUrl}/auth/me" \\
            -H "Authorization: Bearer ${this.authToken}" \\
            -H "Content-Type: application/json" \\
            -w "\\n%{http_code}\\n%{time_total}\\n" \\
            -s`;

        try {
            const result = await this.executeCurlCommand(curlCommand);
            const response = this.parseCurlResponse(result);

            return {
                success: response.statusCode === 200,
                statusCode: response.statusCode,
                responseTime: response.responseTime,
                data: response.data,
                message: response.statusCode === 200 ? '프로필 조회 성공' : '프로필 조회 실패'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: '프로필 조회 요청 실패'
            };
        }
    }

    /**
     * 📝 회원가입 API 테스트
     */
    async testRegister() {
        console.log('  📝 회원가입 API 테스트...');
        
        const curlCommand = `curl -X POST "${this.baseUrl}/auth/register" \\
            -H "Content-Type: application/json" \\
            -d '${JSON.stringify(this.testData.newUser)}' \\
            -w "\\n%{http_code}\\n%{time_total}\\n" \\
            -s`;

        try {
            const result = await this.executeCurlCommand(curlCommand);
            const response = this.parseCurlResponse(result);

            return {
                success: response.statusCode === 201,
                statusCode: response.statusCode,
                responseTime: response.responseTime,
                data: response.data,
                message: response.statusCode === 201 ? '회원가입 성공' : '회원가입 실패'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: '회원가입 요청 실패'
            };
        }
    }

    /**
     * 🔄 토큰 갱신 API 테스트
     */
    async testTokenRefresh() {
        console.log('  🔄 토큰 갱신 API 테스트...');
        
        const curlCommand = `curl -X POST "${this.baseUrl}/auth/refresh" \\
            -H "Content-Type: application/json" \\
            -d '{"refreshToken": "${this.refreshToken}"}' \\
            -w "\\n%{http_code}\\n%{time_total}\\n" \\
            -s`;

        try {
            const result = await this.executeCurlCommand(curlCommand);
            const response = this.parseCurlResponse(result);

            if (response.statusCode === 200 && response.data.data?.token) {
                this.authToken = response.data.data.token;
            }

            return {
                success: response.statusCode === 200,
                statusCode: response.statusCode,
                responseTime: response.responseTime,
                data: response.data,
                message: response.statusCode === 200 ? '토큰 갱신 성공' : '토큰 갱신 실패'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: '토큰 갱신 요청 실패'
            };
        }
    }

    /**
     * 🚪 로그아웃 API 테스트
     */
    async testLogout() {
        console.log('  🚪 로그아웃 API 테스트...');
        
        const curlCommand = `curl -X POST "${this.baseUrl}/auth/logout" \\
            -H "Authorization: Bearer ${this.authToken}" \\
            -H "Content-Type: application/json" \\
            -w "\\n%{http_code}\\n%{time_total}\\n" \\
            -s`;

        try {
            const result = await this.executeCurlCommand(curlCommand);
            const response = this.parseCurlResponse(result);

            return {
                success: response.statusCode === 200,
                statusCode: response.statusCode,
                responseTime: response.responseTime,
                data: response.data,
                message: response.statusCode === 200 ? '로그아웃 성공' : '로그아웃 실패'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: '로그아웃 요청 실패'
            };
        }
    }

    /**
     * 🏢 시설 관련 API 엔드포인트 테스트
     */
    async testFacilityEndpoints() {
        const facilityResults = {
            search: null,
            detail: null,
            recommendations: null
        };

        try {
            // 시설 검색 테스트
            facilityResults.search = await this.testFacilitySearch();

            // 시설 상세 조회 테스트
            facilityResults.detail = await this.testFacilityDetail();

            // 시설 추천 테스트 (인증 필요)
            if (this.authToken) {
                facilityResults.recommendations = await this.testFacilityRecommendations();
            }

        } catch (error) {
            console.error('❌ 시설 테스트 실행 중 오류:', error.message);
        }

        return facilityResults;
    }

    /**
     * 🔍 시설 검색 API 테스트
     */
    async testFacilitySearch() {
        console.log('  🔍 시설 검색 API 테스트...');
        
        const queryParams = new URLSearchParams(this.testData.facilitySearch).toString();
        const curlCommand = `curl -X GET "${this.baseUrl}/facilities/search?${queryParams}" \\
            -H "Content-Type: application/json" \\
            -w "\\n%{http_code}\\n%{time_total}\\n" \\
            -s`;

        try {
            const result = await this.executeCurlCommand(curlCommand);
            const response = this.parseCurlResponse(result);

            return {
                success: response.statusCode === 200,
                statusCode: response.statusCode,
                responseTime: response.responseTime,
                data: response.data,
                resultCount: response.data.data?.length || 0,
                message: response.statusCode === 200 ? '시설 검색 성공' : '시설 검색 실패'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: '시설 검색 요청 실패'
            };
        }
    }

    /**
     * 🏥 시설 상세 조회 API 테스트
     */
    async testFacilityDetail() {
        console.log('  🏥 시설 상세 조회 API 테스트...');
        
        const facilityId = '1'; // 테스트용 시설 ID
        const curlCommand = `curl -X GET "${this.baseUrl}/facilities/${facilityId}" \\
            -H "Content-Type: application/json" \\
            -w "\\n%{http_code}\\n%{time_total}\\n" \\
            -s`;

        try {
            const result = await this.executeCurlCommand(curlCommand);
            const response = this.parseCurlResponse(result);

            return {
                success: response.statusCode === 200,
                statusCode: response.statusCode,
                responseTime: response.responseTime,
                data: response.data,
                facilityId: facilityId,
                message: response.statusCode === 200 ? '시설 상세 조회 성공' : '시설 상세 조회 실패'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: '시설 상세 조회 요청 실패'
            };
        }
    }

    /**
     * 💡 시설 추천 API 테스트
     */
    async testFacilityRecommendations() {
        console.log('  💡 시설 추천 API 테스트...');
        
        const curlCommand = `curl -X POST "${this.baseUrl}/facilities/recommendations" \\
            -H "Authorization: Bearer ${this.authToken}" \\
            -H "Content-Type: application/json" \\
            -d '${JSON.stringify(this.testData.facilitySearch)}' \\
            -w "\\n%{http_code}\\n%{time_total}\\n" \\
            -s`;

        try {
            const result = await this.executeCurlCommand(curlCommand);
            const response = this.parseCurlResponse(result);

            return {
                success: response.statusCode === 200,
                statusCode: response.statusCode,
                responseTime: response.responseTime,
                data: response.data,
                recommendationCount: response.data.data?.length || 0,
                message: response.statusCode === 200 ? '시설 추천 성공' : '시설 추천 실패'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: '시설 추천 요청 실패'
            };
        }
    }

    /**
     * 💊 건강평가 관련 API 엔드포인트 테스트
     */
    async testHealthEndpoints() {
        const healthResults = {
            create: null,
            list: null,
            history: null
        };

        if (!this.authToken) {
            return {
                error: '인증 토큰이 없어 건강평가 테스트를 건너뜁니다.',
                skipped: true
            };
        }

        try {
            // 건강평가 생성 테스트
            healthResults.create = await this.testCreateHealthAssessment();

            // 건강평가 목록 조회 테스트
            healthResults.list = await this.testGetHealthAssessments();

            // 건강평가 이력 조회 테스트
            healthResults.history = await this.testGetHealthAssessmentHistory();

        } catch (error) {
            console.error('❌ 건강평가 테스트 실행 중 오류:', error.message);
        }

        return healthResults;
    }

    /**
     * 📝 건강평가 생성 API 테스트
     */
    async testCreateHealthAssessment() {
        console.log('  📝 건강평가 생성 API 테스트...');
        
        const curlCommand = `curl -X POST "${this.baseUrl}/health/assessments" \\
            -H "Authorization: Bearer ${this.authToken}" \\
            -H "Content-Type: application/json" \\
            -d '${JSON.stringify(this.testData.healthAssessment)}' \\
            -w "\\n%{http_code}\\n%{time_total}\\n" \\
            -s`;

        try {
            const result = await this.executeCurlCommand(curlCommand);
            const response = this.parseCurlResponse(result);

            return {
                success: response.statusCode === 201,
                statusCode: response.statusCode,
                responseTime: response.responseTime,
                data: response.data,
                assessmentId: response.data.data?.id || null,
                message: response.statusCode === 201 ? '건강평가 생성 성공' : '건강평가 생성 실패'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: '건강평가 생성 요청 실패'
            };
        }
    }

    /**
     * 📋 건강평가 목록 조회 API 테스트
     */
    async testGetHealthAssessments() {
        console.log('  📋 건강평가 목록 조회 API 테스트...');
        
        const curlCommand = `curl -X GET "${this.baseUrl}/health/assessments" \\
            -H "Authorization: Bearer ${this.authToken}" \\
            -H "Content-Type: application/json" \\
            -w "\\n%{http_code}\\n%{time_total}\\n" \\
            -s`;

        try {
            const result = await this.executeCurlCommand(curlCommand);
            const response = this.parseCurlResponse(result);

            return {
                success: response.statusCode === 200,
                statusCode: response.statusCode,
                responseTime: response.responseTime,
                data: response.data,
                assessmentCount: response.data.data?.length || 0,
                message: response.statusCode === 200 ? '건강평가 목록 조회 성공' : '건강평가 목록 조회 실패'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: '건강평가 목록 조회 요청 실패'
            };
        }
    }

    /**
     * 📊 건강평가 이력 조회 API 테스트
     */
    async testGetHealthAssessmentHistory() {
        console.log('  📊 건강평가 이력 조회 API 테스트...');
        
        const curlCommand = `curl -X GET "${this.baseUrl}/health/assessments/history" \\
            -H "Authorization: Bearer ${this.authToken}" \\
            -H "Content-Type: application/json" \\
            -w "\\n%{http_code}\\n%{time_total}\\n" \\
            -s`;

        try {
            const result = await this.executeCurlCommand(curlCommand);
            const response = this.parseCurlResponse(result);

            return {
                success: response.statusCode === 200,
                statusCode: response.statusCode,
                responseTime: response.responseTime,
                data: response.data,
                historyCount: response.data.data?.length || 0,
                message: response.statusCode === 200 ? '건강평가 이력 조회 성공' : '건강평가 이력 조회 실패'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: '건강평가 이력 조회 요청 실패'
            };
        }
    }

    /**
     * ⚡ API 성능 테스트
     */
    async runPerformanceTests() {
        console.log('⚡ API 성능 테스트 실행...');
        
        const performanceResults = {
            responseTimeThresholds: {
                excellent: 200,   // 200ms 이하
                good: 500,        // 500ms 이하
                acceptable: 1000, // 1초 이하
                slow: 2000        // 2초 이하
            },
            results: {}
        };

        // 주요 엔드포인트 성능 테스트
        const endpoints = [
            { name: 'login', url: '/auth/login', method: 'POST' },
            { name: 'facilitySearch', url: '/facilities/search', method: 'GET' },
            { name: 'facilityDetail', url: '/facilities/1', method: 'GET' }
        ];

        for (const endpoint of endpoints) {
            performanceResults.results[endpoint.name] = await this.measureEndpointPerformance(endpoint);
        }

        return performanceResults;
    }

    /**
     * 🔒 API 보안 테스트
     */
    async runSecurityTests() {
        console.log('🔒 API 보안 테스트 실행...');
        
        const securityResults = {
            authRequired: await this.testUnauthorizedAccess(),
            tokenValidation: await this.testInvalidTokens(),
            inputValidation: await this.testInputValidation(),
            rateLimiting: await this.testRateLimiting()
        };

        return securityResults;
    }

    /**
     * 🚫 무인증 접근 테스트
     */
    async testUnauthorizedAccess() {
        console.log('  🚫 무인증 접근 테스트...');
        
        const protectedEndpoints = [
            '/auth/me',
            '/health/assessments',
            '/facilities/recommendations'
        ];

        const results = {};
        
        for (const endpoint of protectedEndpoints) {
            const curlCommand = `curl -X GET "${this.baseUrl}${endpoint}" \\
                -H "Content-Type: application/json" \\
                -w "%{http_code}" \\
                -s -o /dev/null`;

            try {
                const result = await this.executeCurlCommand(curlCommand);
                const statusCode = parseInt(result.trim());
                
                results[endpoint] = {
                    statusCode: statusCode,
                    success: statusCode === 401 || statusCode === 403,
                    message: statusCode === 401 || statusCode === 403 ? '인증 필요함 (정상)' : '보안 취약점 발견'
                };
            } catch (error) {
                results[endpoint] = {
                    success: false,
                    error: error.message
                };
            }
        }

        return results;
    }

    /**
     * 🔑 잘못된 토큰 테스트
     */
    async testInvalidTokens() {
        console.log('  🔑 잘못된 토큰 테스트...');
        
        const invalidTokens = [
            'invalid-token',
            'Bearer invalid-token',
            'expired-token-would-be-here'
        ];

        const results = {};
        
        for (const token of invalidTokens) {
            const curlCommand = `curl -X GET "${this.baseUrl}/auth/me" \\
                -H "Authorization: Bearer ${token}" \\
                -H "Content-Type: application/json" \\
                -w "%{http_code}" \\
                -s -o /dev/null`;

            try {
                const result = await this.executeCurlCommand(curlCommand);
                const statusCode = parseInt(result.trim());
                
                results[token.substring(0, 10)] = {
                    statusCode: statusCode,
                    success: statusCode === 401 || statusCode === 403,
                    message: statusCode === 401 || statusCode === 403 ? '토큰 검증 정상' : '토큰 검증 취약점'
                };
            } catch (error) {
                results[token.substring(0, 10)] = {
                    success: false,
                    error: error.message
                };
            }
        }

        return results;
    }

    /**
     * 📝 입력 검증 테스트
     */
    async testInputValidation() {
        console.log('  📝 입력 검증 테스트...');
        
        const maliciousInputs = [
            { email: "'; DROP TABLE users; --", password: "password" },
            { email: "<script>alert('xss')</script>", password: "password" },
            { email: "test@example.com", password: "" },
            { email: "", password: "password" }
        ];

        const results = {};
        
        for (let i = 0; i < maliciousInputs.length; i++) {
            const input = maliciousInputs[i];
            const curlCommand = `curl -X POST "${this.baseUrl}/auth/login" \\
                -H "Content-Type: application/json" \\
                -d '${JSON.stringify(input)}' \\
                -w "%{http_code}" \\
                -s -o /dev/null`;

            try {
                const result = await this.executeCurlCommand(curlCommand);
                const statusCode = parseInt(result.trim());
                
                results[`input_${i + 1}`] = {
                    input: input,
                    statusCode: statusCode,
                    success: statusCode === 400 || statusCode === 422,
                    message: statusCode === 400 || statusCode === 422 ? '입력 검증 정상' : '입력 검증 취약점 가능'
                };
            } catch (error) {
                results[`input_${i + 1}`] = {
                    success: false,
                    error: error.message
                };
            }
        }

        return results;
    }

    /**
     * 🚦 Rate Limiting 테스트
     */
    async testRateLimiting() {
        console.log('  🚦 Rate Limiting 테스트...');
        
        // 짧은 시간에 다수 요청으로 rate limiting 테스트
        const requests = [];
        const testEndpoint = `${this.baseUrl}/facilities/search?location=서울`;
        
        for (let i = 0; i < 20; i++) {
            const curlCommand = `curl -X GET "${testEndpoint}" \\
                -H "Content-Type: application/json" \\
                -w "%{http_code}" \\
                -s -o /dev/null`;
            
            requests.push(this.executeCurlCommand(curlCommand));
        }

        try {
            const results = await Promise.all(requests);
            const statusCodes = results.map(result => parseInt(result.trim()));
            
            const rateLimitedCount = statusCodes.filter(code => code === 429).length;
            
            return {
                totalRequests: 20,
                rateLimitedCount: rateLimitedCount,
                success: rateLimitedCount > 0,
                message: rateLimitedCount > 0 ? 'Rate Limiting 정상 작동' : 'Rate Limiting 미적용',
                statusCodes: statusCodes
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Rate Limiting 테스트 실패'
            };
        }
    }

    /**
     * 🏃‍♂️ 엔드포인트 성능 측정
     */
    async measureEndpointPerformance(endpoint) {
        const iterations = 5;
        const responseTimes = [];
        
        for (let i = 0; i < iterations; i++) {
            const curlCommand = `curl -X ${endpoint.method} "${this.baseUrl}${endpoint.url}" \\
                -H "Content-Type: application/json" \\
                -w "%{time_total}" \\
                -s -o /dev/null`;

            try {
                const result = await this.executeCurlCommand(curlCommand);
                const responseTime = parseFloat(result.trim()) * 1000; // 초를 밀리초로 변환
                responseTimes.push(responseTime);
            } catch (error) {
                console.error(`성능 측정 실패 (${endpoint.name}):`, error.message);
            }
        }

        if (responseTimes.length === 0) {
            return { success: false, error: '성능 측정 불가' };
        }

        const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const minResponseTime = Math.min(...responseTimes);
        const maxResponseTime = Math.max(...responseTimes);

        return {
            success: true,
            averageResponseTime: Math.round(avgResponseTime),
            minResponseTime: Math.round(minResponseTime),
            maxResponseTime: Math.round(maxResponseTime),
            iterations: iterations,
            performanceGrade: this.calculatePerformanceGrade(avgResponseTime)
        };
    }

    /**
     * 📊 성능 등급 계산
     */
    calculatePerformanceGrade(responseTime) {
        if (responseTime <= 200) return 'Excellent';
        if (responseTime <= 500) return 'Good';
        if (responseTime <= 1000) return 'Acceptable';
        if (responseTime <= 2000) return 'Slow';
        return 'Very Slow';
    }

    /**
     * 🖥️ curl 명령어 실행
     */
    async executeCurlCommand(command) {
        return new Promise((resolve, reject) => {
            const { exec } = require('child_process');
            
            exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`curl 실행 실패: ${error.message}`));
                    return;
                }
                
                if (stderr) {
                    console.warn('curl stderr:', stderr);
                }
                
                resolve(stdout);
            });
        });
    }

    /**
     * 📝 curl 응답 파싱
     */
    parseCurlResponse(curlOutput) {
        const lines = curlOutput.trim().split('\\n');
        
        // 응답 시간과 상태 코드는 마지막 두 줄
        const responseTime = parseFloat(lines[lines.length - 1]) * 1000; // 초를 밀리초로
        const statusCode = parseInt(lines[lines.length - 2]);
        
        // JSON 응답은 나머지 부분
        const jsonResponse = lines.slice(0, -2).join('\\n');
        
        let data = {};
        try {
            if (jsonResponse.trim()) {
                data = JSON.parse(jsonResponse);
            }
        } catch (error) {
            console.warn('JSON 파싱 실패:', error.message);
            data = { rawResponse: jsonResponse };
        }

        return {
            statusCode: statusCode,
            responseTime: Math.round(responseTime),
            data: data
        };
    }

    /**
     * 📊 테스트 결과 집계
     */
    calculateTestSummary(results) {
        let totalTests = 0;
        let passedTests = 0;
        let failedTests = 0;
        let skippedTests = 0;

        const countResults = (obj) => {
            for (const key in obj) {
                const result = obj[key];
                if (result === null) {
                    skippedTests++;
                    totalTests++;
                } else if (result.skipped) {
                    skippedTests++;
                    totalTests++;
                } else if (typeof result === 'object' && result.success !== undefined) {
                    totalTests++;
                    if (result.success) {
                        passedTests++;
                    } else {
                        failedTests++;
                    }
                } else if (typeof result === 'object') {
                    countResults(result);
                }
            }
        };

        countResults(results);

        return {
            totalTests,
            passedTests,
            failedTests,
            skippedTests,
            successRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
        };
    }

    /**
     * 📈 API 커버리지 계산
     */
    calculateApiCoverage(results) {
        const totalEndpoints = Object.keys(this.endpoints.auth).length + 
                              Object.keys(this.endpoints.facilities).length + 
                              Object.keys(this.endpoints.health).length;
        
        let testedEndpoints = 0;
        
        // 실제 테스트된 엔드포인트 수 계산
        if (results.auth) {
            testedEndpoints += Object.values(results.auth).filter(result => result !== null && !result.skipped).length;
        }
        if (results.facilities) {
            testedEndpoints += Object.values(results.facilities).filter(result => result !== null && !result.skipped).length;
        }
        if (results.health && !results.health.skipped) {
            testedEndpoints += Object.values(results.health).filter(result => result !== null && !result.skipped).length;
        }

        return {
            totalEndpoints,
            testedEndpoints,
            coveragePercentage: Math.round((testedEndpoints / totalEndpoints) * 100)
        };
    }

    /**
     * ⏱️ 시간 계산
     */
    calculateDuration(startTime, endTime) {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const durationMs = end - start;
        return Math.round(durationMs / 1000); // 초 단위
    }

    /**
     * 📋 테스트 실행 스크립트 생성
     */
    generateTestScript() {
        return {
            filename: 'test-backend-api.sh',
            content: `#!/bin/bash

# 엘더베리 백엔드 API 자동화 테스트 스크립트
# 생성일: ${new Date().toISOString()}

echo "🚀 엘더베리 API 테스트 시작..."

# 환경 변수 설정
API_BASE_URL="\${API_BASE_URL:-http://localhost:8080/api}"
TEST_EMAIL="\${TEST_EMAIL:-test.domestic@example.com}"
TEST_PASSWORD="\${TEST_PASSWORD:-Password123!}"

# 색상 정의
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# 성공/실패 카운터
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

# 테스트 함수
run_test() {
    local test_name="\$1"
    local curl_command="\$2"
    local expected_code="\$3"
    
    echo -n "  📊 \${test_name}... "
    TESTS_TOTAL=\$((TESTS_TOTAL + 1))
    
    response=\$(eval "\$curl_command" 2>/dev/null)
    actual_code=\$(echo "\$response" | tail -n1)
    
    if [ "\$actual_code" = "\$expected_code" ]; then
        echo -e "\${GREEN}✅ 성공\${NC} (\$actual_code)"
        TESTS_PASSED=\$((TESTS_PASSED + 1))
    else
        echo -e "\${RED}❌ 실패\${NC} (예상: \$expected_code, 실제: \$actual_code)"
        TESTS_FAILED=\$((TESTS_FAILED + 1))
    fi
}

# JWT 토큰 추출 함수
extract_token() {
    local response="\$1"
    echo "\$response" | head -n-2 | jq -r '.data.token' 2>/dev/null
}

echo "🔐 인증 API 테스트..."

# 로그인 테스트
login_cmd="curl -X POST '\${API_BASE_URL}/auth/login' \\
    -H 'Content-Type: application/json' \\
    -d '{\"email\":\"\${TEST_EMAIL}\",\"password\":\"\${TEST_PASSWORD}\"}' \\
    -w '\\\\n%{http_code}\\\\n' -s"

echo "  🔑 로그인 테스트 실행 중..."
login_response=\$(eval "\$login_cmd" 2>/dev/null)
login_code=\$(echo "\$login_response" | tail -n1)

if [ "\$login_code" = "200" ]; then
    echo -e "  \${GREEN}✅ 로그인 성공\${NC}"
    JWT_TOKEN=\$(extract_token "\$login_response")
    TESTS_PASSED=\$((TESTS_PASSED + 1))
else
    echo -e "  \${RED}❌ 로그인 실패\${NC} (코드: \$login_code)"
    TESTS_FAILED=\$((TESTS_FAILED + 1))
    JWT_TOKEN=""
fi
TESTS_TOTAL=\$((TESTS_TOTAL + 1))

# 프로필 조회 테스트 (로그인 성공 시만)
if [ -n "\$JWT_TOKEN" ] && [ "\$JWT_TOKEN" != "null" ]; then
    run_test "프로필 조회" \\
        "curl -X GET '\${API_BASE_URL}/auth/me' \\
         -H 'Authorization: Bearer \${JWT_TOKEN}' \\
         -w '\\\\n%{http_code}\\\\n' -s -o /dev/null" \\
        "200"
else
    echo -e "  \${YELLOW}⏭️ 프로필 조회 테스트 건너뜀 (토큰 없음)\${NC}"
fi

echo ""
echo "🏢 시설 API 테스트..."

# 시설 검색 테스트
run_test "시설 검색" \\
    "curl -X GET '\${API_BASE_URL}/facilities/search?location=서울' \\
     -w '\\\\n%{http_code}\\\\n' -s -o /dev/null" \\
    "200"

# 시설 상세 조회 테스트
run_test "시설 상세 조회" \\
    "curl -X GET '\${API_BASE_URL}/facilities/1' \\
     -w '\\\\n%{http_code}\\\\n' -s -o /dev/null" \\
    "200"

echo ""
echo "💊 건강평가 API 테스트..."

if [ -n "\$JWT_TOKEN" ] && [ "\$JWT_TOKEN" != "null" ]; then
    # 건강평가 생성 테스트
    run_test "건강평가 생성" \\
        "curl -X POST '\${API_BASE_URL}/health/assessments' \\
         -H 'Authorization: Bearer \${JWT_TOKEN}' \\
         -H 'Content-Type: application/json' \\
         -d '{\"age\":75,\"gender\":\"female\",\"conditions\":[\"diabetes\"]}' \\
         -w '\\\\n%{http_code}\\\\n' -s -o /dev/null" \\
        "201"

    # 건강평가 목록 조회 테스트
    run_test "건강평가 목록 조회" \\
        "curl -X GET '\${API_BASE_URL}/health/assessments' \\
         -H 'Authorization: Bearer \${JWT_TOKEN}' \\
         -w '\\\\n%{http_code}\\\\n' -s -o /dev/null" \\
        "200"
else
    echo -e "  \${YELLOW}⏭️ 건강평가 테스트 건너뜀 (인증 필요)\${NC}"
fi

echo ""
echo "🔒 보안 테스트..."

# 무인증 접근 테스트
run_test "무인증 접근 차단" \\
    "curl -X GET '\${API_BASE_URL}/auth/me' \\
     -w '\\\\n%{http_code}\\\\n' -s -o /dev/null" \\
    "401"

# 잘못된 토큰 테스트
run_test "잘못된 토큰 차단" \\
    "curl -X GET '\${API_BASE_URL}/auth/me' \\
     -H 'Authorization: Bearer invalid-token' \\
     -w '\\\\n%{http_code}\\\\n' -s -o /dev/null" \\
    "401"

echo ""
echo "📊 테스트 결과 요약"
echo "================================"
echo -e "전체 테스트: \${BLUE}\${TESTS_TOTAL}\${NC}"
echo -e "성공: \${GREEN}\${TESTS_PASSED}\${NC}"
echo -e "실패: \${RED}\${TESTS_FAILED}\${NC}"

if [ \$TESTS_TOTAL -gt 0 ]; then
    SUCCESS_RATE=\$(( TESTS_PASSED * 100 / TESTS_TOTAL ))
    echo -e "성공률: \${BLUE}\${SUCCESS_RATE}%\${NC}"
fi

if [ \$TESTS_FAILED -eq 0 ]; then
    echo -e "\\n\${GREEN}🎉 모든 테스트가 성공했습니다!\${NC}"
    exit 0
else
    echo -e "\\n\${RED}❌ \${TESTS_FAILED}개의 테스트가 실패했습니다.\${NC}"
    exit 1
fi
            `.trim()
        };
    }
}

module.exports = { ApiTestingSuite };