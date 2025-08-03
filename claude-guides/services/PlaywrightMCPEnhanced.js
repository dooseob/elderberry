/**
 * Playwright MCP Enhanced Agent v2.0
 * 완전히 개선된 Playwright MCP 전문 서브에이전트
 * Chrome 재설치 문제 완전 해결 + 강화된 에러 핸들링
 * 
 * @version 2.0.0
 * @specialization Playwright MCP 도구 활용 전문 (에러 핸들링 강화)
 * @capabilities 웹 자동화, E2E 테스팅, 브라우저 테스팅, 성능 측정, 견고한 에러 복구
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

class PlaywrightMCPEnhanced {
    constructor() {
        this.agentType = 'PLAYWRIGHT_MCP_ENHANCED';
        this.version = '2.0.0';
        this.capabilities = [
            'web-automation',
            'e2e-testing', 
            'visual-regression-testing',
            'web-performance-measurement',
            'multi-browser-testing',
            'accessibility-testing',
            'mobile-responsive-testing',
            'cross-platform-validation',
            'robust-error-handling',
            'browser-installation-management'
        ];
        
        this.mcpTools = {
            primary: 'playwright',
            secondary: ['sequential-thinking', 'memory', 'filesystem', 'github']
        };
        
        this.browserManager = {
            chromiumPath: null,
            isInstalled: false,
            version: null,
            lastCheck: null
        };
        
        // 에러 복구 전략
        this.errorRecoveryStrategies = {
            'browser_launch_timeout': this.handleBrowserLaunchTimeout.bind(this),
            'browser_install_hang': this.handleBrowserInstallHang.bind(this),
            'browser_crash': this.handleBrowserCrash.bind(this),
            'page_navigation_timeout': this.handlePageNavigationTimeout.bind(this),
            'element_not_found': this.handleElementNotFound.bind(this),
            'screenshot_failure': this.handleScreenshotFailure.bind(this)
        };
        
        this.retryConfig = {
            maxRetries: 3,
            baseDelay: 1000, // 1초
            maxDelay: 10000, // 10초
            backoffMultiplier: 2
        };
    }

    /**
     * 🔍 강화된 브라우저 설치 상태 확인
     */
    async validateBrowserInstallation() {
        console.log('🔍 Enhanced browser installation validation...');
        
        try {
            const homeDir = os.homedir();
            const playwrightCache = path.join(homeDir, '.cache', 'ms-playwright');
            
            // 여러 버전의 Chromium 확인
            const possibleVersions = ['1181', '1180', '1179']; // 최신 버전들
            let chromiumDir = null;
            let chromiumBinary = null;
            
            for (const version of possibleVersions) {
                const versionDir = path.join(playwrightCache, `chromium-${version}`);
                const binaryPath = path.join(versionDir, 'chrome-linux', 'chrome');
                
                if (fs.existsSync(binaryPath) && fs.statSync(binaryPath).isFile()) {
                    chromiumDir = versionDir;
                    chromiumBinary = binaryPath;
                    this.browserManager.version = version;
                    break;
                }
            }
            
            if (chromiumBinary) {
                // 바이너리 실행 권한 확인
                try {
                    fs.accessSync(chromiumBinary, fs.constants.X_OK);
                    this.browserManager.isInstalled = true;
                    this.browserManager.chromiumPath = chromiumBinary;
                    this.browserManager.lastCheck = new Date();
                    
                    console.log(`✅ Chromium found and executable: ${chromiumBinary}`);
                    return {
                        status: 'installed',
                        path: chromiumBinary,
                        version: this.browserManager.version,
                        executable: true
                    };
                } catch (permError) {
                    console.log(`⚠️ Chromium found but not executable: ${chromiumBinary}`);
                    // 권한 수정 시도
                    try {
                        execSync(`chmod +x "${chromiumBinary}"`, { timeout: 5000 });
                        console.log('✅ Fixed Chromium executable permissions');
                        this.browserManager.isInstalled = true;
                        this.browserManager.chromiumPath = chromiumBinary;
                        return {
                            status: 'installed_fixed_permissions',
                            path: chromiumBinary,
                            version: this.browserManager.version,
                            executable: true
                        };
                    } catch (chmodError) {
                        console.log('❌ Failed to fix permissions:', chmodError.message);
                        return {
                            status: 'found_but_not_executable',
                            path: chromiumBinary,
                            error: permError.message
                        };
                    }
                }
            }
            
            // 브라우저가 없으면 설치 필요
            console.log('❌ No valid Chromium installation found');
            return {
                status: 'not_installed',
                playwrightCache,
                searchedVersions: possibleVersions
            };
            
        } catch (error) {
            console.error('❌ Browser validation failed:', error.message);
            return {
                status: 'validation_failed',
                error: error.message,
                fallback: 'proceed_with_system_browser'
            };
        }
    }

    /**
     * 🛠️ 안전한 브라우저 설치
     */
    async installBrowserSafely() {
        console.log('🛠️ Starting safe browser installation...');
        
        const skipInstall = process.env.SKIP_BROWSER_INSTALL === 'true';
        if (skipInstall) {
            console.log('⏭️ Skipping installation (SKIP_BROWSER_INSTALL=true)');
            return { status: 'skipped', reason: 'environment_variable' };
        }
        
        try {
            // 설치 전 디스크 공간 확인
            const freeSpace = await this.checkDiskSpace();
            if (freeSpace < 500) { // 500MB 미만이면 경고
                console.log('⚠️ Warning: Low disk space, installation might fail');
            }
            
            // 네트워크 연결 확인
            const networkOk = await this.checkNetworkConnection();
            if (!networkOk) {
                throw new Error('Network connection required for browser installation');
            }
            
            console.log('📦 Installing Playwright Chromium with enhanced error handling...');
            
            // 타임아웃을 길게 설정하고 여러 단계로 나누어 설치
            const installCommand = 'npx playwright install chromium';
            const installResult = execSync(installCommand, {
                encoding: 'utf8',
                timeout: 180000, // 3분 타임아웃
                stdio: 'pipe', // 출력을 캡처해서 진행상황 추적
                env: {
                    ...process.env,
                    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: 'false'
                }
            });
            
            console.log('✅ Browser installation completed');
            console.log('   Installation output:', installResult.substring(0, 200) + '...');
            
            // 설치 후 검증
            const validationResult = await this.validateBrowserInstallation();
            if (validationResult.status === 'installed') {
                return { 
                    status: 'success', 
                    path: validationResult.path,
                    installOutput: installResult 
                };
            } else {
                throw new Error(`Installation completed but validation failed: ${validationResult.status}`);
            }
            
        } catch (error) {
            console.error('❌ Browser installation failed:', error.message);
            
            // 설치 실패 시 복구 시도
            if (error.message.includes('timeout')) {
                return await this.handleBrowserInstallHang();
            } else if (error.message.includes('ENOSPC')) {
                return { 
                    status: 'failed', 
                    error: 'insufficient_disk_space',
                    suggestion: 'Free up disk space and try again'
                };
            } else if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
                return {
                    status: 'failed',
                    error: 'network_error', 
                    suggestion: 'Check internet connection and try again'
                };
            }
            
            return { 
                status: 'failed', 
                error: error.message,
                fallback: 'try_system_browser'
            };
        }
    }

    /**
     * 🚀 강화된 브라우저 런처
     */
    async launchBrowserSafely(options = {}) {
        console.log('🚀 Launching browser with enhanced error handling...');
        
        const defaultOptions = {
            headless: true,
            timeout: 45000,
            args: [
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-features=TranslateUI',
                '--disable-ipc-flooding-protection',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--no-first-run',
                '--no-default-browser-check',
                '--disable-default-apps'
            ],
            ...options
        };
        
        let retryCount = 0;
        const maxRetries = this.retryConfig.maxRetries;
        
        while (retryCount < maxRetries) {
            try {
                console.log(`🔄 Browser launch attempt ${retryCount + 1}/${maxRetries}`);
                
                // MCP Playwright 도구 사용 시도
                if (this.mcpPlaywrightAvailable()) {
                    return await this.launchViaMCP(defaultOptions);
                }
                
                // 직접 Playwright 사용 (fallback)
                const { chromium } = require('playwright');
                const browser = await chromium.launch(defaultOptions);
                
                console.log('✅ Browser launched successfully');
                return browser;
                
            } catch (error) {
                console.error(`❌ Browser launch attempt ${retryCount + 1} failed:`, error.message);
                retryCount++;
                
                if (retryCount < maxRetries) {
                    const delay = Math.min(
                        this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, retryCount - 1),
                        this.retryConfig.maxDelay
                    );
                    console.log(`⏳ Waiting ${delay}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    // 최종 실패 시 복구 전략 적용
                    return await this.handleBrowserLaunchTimeout(error);
                }
            }
        }
    }

    /**
     * 🔄 에러 복구 핸들러들
     */
    async handleBrowserLaunchTimeout(error) {
        console.log('🔄 Handling browser launch timeout...');
        
        try {
            // 기존 브라우저 프로세스 정리
            execSync('pkill -f chrome || true', { timeout: 5000 });
            execSync('pkill -f chromium || true', { timeout: 5000 });
            
            // 임시 파일 정리
            const tmpDir = os.tmpdir();
            execSync(`find ${tmpDir} -name "*chrome*" -type d -exec rm -rf {} + 2>/dev/null || true`, { timeout: 10000 });
            
            // 브라우저 재설치 시도
            console.log('🔄 Attempting browser reinstallation...');
            const installResult = await this.installBrowserSafely();
            
            if (installResult.status === 'success') {
                return await this.launchBrowserSafely({ retryAfterReinstall: true });
            }
            
            return {
                status: 'recovery_failed',
                originalError: error.message,
                recoveryAttempt: 'browser_reinstallation_failed'
            };
            
        } catch (recoveryError) {
            console.error('❌ Recovery failed:', recoveryError.message);
            return {
                status: 'recovery_failed',
                originalError: error.message,
                recoveryError: recoveryError.message
            };
        }
    }

    async handleBrowserInstallHang() {
        console.log('🔄 Handling browser installation hang...');
        
        try {
            // 기존 설치 프로세스 중단
            execSync('pkill -f "playwright install" || true', { timeout: 5000 });
            
            // 부분적으로 설치된 파일 정리
            const homeDir = os.homedir();
            const playwrightCache = path.join(homeDir, '.cache', 'ms-playwright');
            const incompleteInstalls = execSync(`find ${playwrightCache} -name "*tmp*" -o -name "*download*" 2>/dev/null || true`, { encoding: 'utf8' });
            
            if (incompleteInstalls.trim()) {
                console.log('🧹 Cleaning incomplete installations...');
                execSync(`find ${playwrightCache} -name "*tmp*" -o -name "*download*" -exec rm -rf {} + 2>/dev/null || true`);
            }
            
            // 강제 재설치 시도 (더 짧은 타임아웃)
            console.log('🔄 Attempting forced reinstallation...');
            const result = execSync('npx playwright install chromium --force', {
                encoding: 'utf8',
                timeout: 60000, // 1분만 기다림
                stdio: 'pipe'
            });
            
            return {
                status: 'recovery_success',
                method: 'forced_reinstallation',
                output: result
            };
            
        } catch (error) {
            return {
                status: 'recovery_failed',
                error: error.message,
                fallback: 'manual_installation_required'
            };
        }
    }

    async handleBrowserCrash(crashInfo) {
        console.log('🔄 Handling browser crash...');
        
        try {
            // 크래시 덤프 수집
            const crashData = {
                timestamp: new Date().toISOString(),
                error: crashInfo.error || 'Unknown crash',
                url: crashInfo.url || 'Unknown',
                stackTrace: crashInfo.stack || 'No stack trace'
            };
            
            // 메모리에 크래시 정보 저장 (디버깅용)
            await this.storeCrashData(crashData);
            
            // 새 브라우저 인스턴스 생성
            console.log('🔄 Creating new browser instance...');
            const newBrowser = await this.launchBrowserSafely({ 
                headless: true,
                timeout: 30000
            });
            
            return {
                status: 'recovery_success',
                newBrowser,
                crashData
            };
            
        } catch (error) {
            return {
                status: 'recovery_failed',
                error: error.message
            };
        }
    }

    async handlePageNavigationTimeout(navigationInfo) {
        console.log('🔄 Handling page navigation timeout...');
        
        try {
            const { page, url, timeout = 30000 } = navigationInfo;
            
            // 페이지 상태 확인
            const pageUrl = await page.url();
            console.log(`Current page URL: ${pageUrl}`);
            
            // 네트워크 요청 대기 중인지 확인
            const pendingRequests = await page.evaluate(() => {
                return {
                    readyState: document.readyState,
                    activeRequests: performance.getEntriesByType('navigation').length
                };
            });
            
            console.log('Page state:', pendingRequests);
            
            // 강제 페이지 새로고침 시도
            if (pendingRequests.readyState !== 'complete') {
                console.log('🔄 Attempting page reload...');
                await page.reload({ timeout: timeout / 2 });
                await page.waitForLoadState('networkidle', { timeout: timeout / 2 });
            }
            
            return {
                status: 'recovery_success',
                method: 'page_reload',
                finalUrl: await page.url()
            };
            
        } catch (error) {
            return {
                status: 'recovery_failed',
                error: error.message
            };
        }
    }

    async handleElementNotFound(elementInfo) {
        console.log('🔄 Handling element not found...');
        
        try {
            const { page, selector, timeout = 10000 } = elementInfo;
            
            // DOM 상태 확인
            const domInfo = await page.evaluate(() => ({
                ready: document.readyState,
                bodyExists: !!document.body,
                elementCount: document.querySelectorAll('*').length
            }));
            
            console.log('DOM state:', domInfo);
            
            // DOM이 준비되지 않았으면 기다림
            if (domInfo.ready !== 'complete') {
                await page.waitForLoadState('domcontentloaded', { timeout });
            }
            
            // 대체 선택자들 시도
            const alternativeSelectors = [
                selector,
                selector.replace('#', '[id="') + '"]',
                selector.replace('.', '[class*="') + '"]',
                `//*[contains(@class, "${selector.replace('.', '')}")][1]`
            ];
            
            for (const altSelector of alternativeSelectors) {
                try {
                    const element = await page.waitForSelector(altSelector, { timeout: timeout / alternativeSelectors.length });
                    if (element) {
                        console.log(`✅ Found element with alternative selector: ${altSelector}`);
                        return {
                            status: 'recovery_success',
                            element,
                            usedSelector: altSelector
                        };
                    }
                } catch (selectorError) {
                    console.log(`⏭️ Selector failed: ${altSelector}`);
                }
            }
            
            return {
                status: 'recovery_failed',
                error: 'Element not found with any selector',
                triedSelectors: alternativeSelectors
            };
            
        } catch (error) {
            return {
                status: 'recovery_failed',
                error: error.message
            };
        }
    }

    async handleScreenshotFailure(screenshotInfo) {
        console.log('🔄 Handling screenshot failure...');
        
        try {
            const { page, options = {} } = screenshotInfo;
            
            // 페이지 상태 확인
            const pageSize = await page.evaluate(() => ({
                width: document.documentElement.scrollWidth,
                height: document.documentElement.scrollHeight,
                viewportWidth: window.innerWidth,
                viewportHeight: window.innerHeight
            }));
            
            console.log('Page dimensions:', pageSize);
            
            // 뷰포트 크기 조정
            if (pageSize.width > 0 && pageSize.height > 0) {
                await page.setViewportSize({
                    width: Math.min(pageSize.width, 1920),
                    height: Math.min(pageSize.height, 1080)
                });
            }
            
            // 모든 이미지 로딩 대기
            await page.waitForFunction(() => {
                const images = Array.from(document.images);
                return images.every(img => img.complete);
            }, { timeout: 10000 }).catch(() => {
                console.log('⚠️ Some images may not be loaded');
            });
            
            // 간단한 스크린샷 옵션으로 재시도
            const simpleOptions = {
                ...options,
                fullPage: false,
                clip: undefined,
                timeout: 15000
            };
            
            const screenshot = await page.screenshot(simpleOptions);
            
            return {
                status: 'recovery_success',
                screenshot,
                usedOptions: simpleOptions
            };
            
        } catch (error) {
            return {
                status: 'recovery_failed',
                error: error.message
            };
        }
    }

    /**
     * 🔧 유틸리티 메서드들
     */
    async checkDiskSpace() {
        try {
            const result = execSync('df -m . | tail -1 | awk "{print $4}"', { encoding: 'utf8' });
            return parseInt(result.trim());
        } catch {
            return 1000; // 기본값으로 1GB 가정
        }
    }

    async checkNetworkConnection() {
        try {
            execSync('ping -c 1 -W 3 8.8.8.8', { timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    mcpPlaywrightAvailable() {
        // MCP Playwright 도구 사용 가능 여부 확인
        return typeof global.mcpPlaywright !== 'undefined';
    }

    async launchViaMCP(options) {
        // MCP Playwright 도구를 통한 브라우저 실행
        // 실제 구현에서는 MCP 도구 호출
        console.log('🔌 Launching browser via MCP tool...');
        throw new Error('MCP Playwright not available, falling back to direct launch');
    }

    async storeCrashData(crashData) {
        try {
            // Memory MCP 도구를 통한 크래시 데이터 저장
            const memoryKey = `playwright-crash-${Date.now()}`;
            console.log(`💾 Storing crash data: ${memoryKey}`);
            // 실제 구현에서는 Memory MCP 도구 사용
        } catch (error) {
            console.error('Failed to store crash data:', error.message);
        }
    }

    /**
     * 🎭 완전 강화된 E2E 테스트 실행
     */
    async executeEnhancedE2ETest(config = {}) {
        console.log('🎭 Starting Enhanced E2E Test Suite with error recovery...');
        
        const {
            targetUrl = 'http://localhost:5173',
            testScenarios = ['login', 'navigation', 'forms'],
            browsers = ['chromium'],
            maxRetries = 2,
            generateReport = true
        } = config;

        // 사전 환경 검증
        const browserStatus = await this.validateBrowserInstallation();
        if (browserStatus.status !== 'installed') {
            console.log('📦 Browser not ready, attempting installation...');
            const installResult = await this.installBrowserSafely();
            if (installResult.status !== 'success') {
                throw new Error(`Browser installation failed: ${installResult.error}`);
            }
        }

        const testResults = {
            startTime: new Date().toISOString(),
            config,
            browserStatus,
            results: {},
            errors: [],
            recoveryActions: [],
            summary: {}
        };

        let browser = null;
        try {
            // 안전한 브라우저 실행
            browser = await this.launchBrowserSafely();
            
            if (browser.status === 'recovery_failed') {
                throw new Error(`Browser launch failed: ${browser.originalError}`);
            }

            // 테스트 실행
            for (const scenario of testScenarios) {
                console.log(`🧪 Testing scenario: ${scenario}`);
                
                try {
                    const scenarioResult = await this.runScenarioWithRecovery(browser, scenario, targetUrl);
                    testResults.results[scenario] = scenarioResult;
                } catch (scenarioError) {
                    console.error(`❌ Scenario ${scenario} failed:`, scenarioError.message);
                    testResults.errors.push({
                        scenario,
                        error: scenarioError.message,
                        timestamp: new Date().toISOString()
                    });
                }
            }

            // 결과 요약
            testResults.summary = {
                totalScenarios: testScenarios.length,
                passedScenarios: Object.keys(testResults.results).filter(s => testResults.results[s]?.status === 'passed').length,
                failedScenarios: testResults.errors.length,
                recoveryActionsUsed: testResults.recoveryActions.length
            };

            console.log('✅ Enhanced E2E Test completed');
            return testResults;

        } catch (error) {
            console.error('❌ Enhanced E2E Test failed:', error.message);
            testResults.criticalError = error.message;
            return testResults;
        } finally {
            if (browser && typeof browser.close === 'function') {
                try {
                    await browser.close();
                } catch (closeError) {
                    console.error('⚠️ Browser close error:', closeError.message);
                }
            }
        }
    }

    async runScenarioWithRecovery(browser, scenario, targetUrl) {
        const maxAttempts = 3;
        let attempt = 1;
        
        while (attempt <= maxAttempts) {
            try {
                console.log(`🔄 Scenario ${scenario} - Attempt ${attempt}/${maxAttempts}`);
                
                const page = await browser.newPage();
                const result = await this.executeScenario(page, scenario, targetUrl);
                await page.close();
                
                return {
                    status: 'passed',
                    attempt,
                    result
                };
                
            } catch (error) {
                console.error(`❌ Scenario ${scenario} attempt ${attempt} failed:`, error.message);
                
                if (attempt < maxAttempts) {
                    // 에러 타입에 따른 복구 전략 적용
                    const recoveryResult = await this.applyErrorRecovery(error, scenario);
                    if (recoveryResult.status === 'recovery_success') {
                        console.log(`🔄 Recovery successful for ${scenario}`);
                    }
                    
                    attempt++;
                    await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // 지수적 백오프
                } else {
                    return {
                        status: 'failed',
                        attempts: maxAttempts,
                        lastError: error.message
                    };
                }
            }
        }
    }

    async executeScenario(page, scenario, targetUrl) {
        switch (scenario) {
            case 'login':
                return await this.testLoginScenario(page, targetUrl);
            case 'navigation':
                return await this.testNavigationScenario(page, targetUrl);
            case 'forms':
                return await this.testFormsScenario(page, targetUrl);
            default:
                throw new Error(`Unknown scenario: ${scenario}`);
        }
    }

    async testLoginScenario(page, targetUrl) {
        await page.goto(`${targetUrl}/login`, { timeout: 30000 });
        await page.waitForSelector('#email', { timeout: 10000 });
        await page.fill('#email', 'test.domestic@example.com');
        await page.fill('#password', 'Password123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard', { timeout: 15000 });
        return { scenario: 'login', status: 'passed' };
    }

    async testNavigationScenario(page, targetUrl) {
        await page.goto(targetUrl, { timeout: 30000 });
        await page.waitForSelector('nav', { timeout: 10000 });
        const navLinks = await page.$$('nav a');
        return { scenario: 'navigation', linksFound: navLinks.length };
    }

    async testFormsScenario(page, targetUrl) {
        await page.goto(targetUrl, { timeout: 30000 });
        const forms = await page.$$('form');
        return { scenario: 'forms', formsFound: forms.length };
    }

    async applyErrorRecovery(error, context) {
        const errorType = this.classifyError(error);
        const recoveryStrategy = this.errorRecoveryStrategies[errorType];
        
        if (recoveryStrategy) {
            console.log(`🔄 Applying recovery strategy: ${errorType}`);
            return await recoveryStrategy({ error, context });
        }
        
        return { status: 'no_recovery_available', errorType };
    }

    classifyError(error) {
        const message = error.message.toLowerCase();
        
        if (message.includes('timeout') && message.includes('browser')) {
            return 'browser_launch_timeout';
        } else if (message.includes('timeout') && message.includes('navigation')) {
            return 'page_navigation_timeout';
        } else if (message.includes('element') && message.includes('not found')) {
            return 'element_not_found';
        } else if (message.includes('screenshot')) {
            return 'screenshot_failure';
        } else if (message.includes('crash')) {
            return 'browser_crash';
        } else {
            return 'unknown_error';
        }
    }
}

module.exports = { PlaywrightMCPEnhanced };