/**
 * 수동 테스트 가이드 - 브라우저 테스트 체크리스트 시스템
 * 엘더베리 프로젝트 사용자 시나리오 기반 수동 테스트
 * @version 1.0.0
 * @date 2025-08-12
 * @features 사용자 시나리오, 접근성 테스트, 크로스 브라우저, 반응형 디자인
 */

class ManualTestingGuide {
    constructor() {
        this.version = '1.0.0';
        this.description = '엘더베리 프로젝트 수동 테스트 가이드 시스템';
        
        this.testEnvironments = {
            browsers: {
                desktop: ['Chrome 최신버전', 'Firefox 최신버전', 'Safari 최신버전', 'Edge 최신버전'],
                mobile: ['Mobile Chrome', 'Mobile Safari', 'Samsung Internet']
            },
            devices: {
                desktop: ['1920x1080 (Full HD)', '1366x768 (HD)', '2560x1440 (QHD)'],
                tablet: ['768x1024 (iPad)', '1024x768 (iPad Landscape)', '800x1280 (Android Tablet)'],
                mobile: ['375x667 (iPhone SE)', '414x896 (iPhone 11)', '360x640 (Galaxy S)']
            },
            themes: ['라이트 모드', '다크 모드', '고대비 모드', '시스템 설정 따름']
        };
        
        this.userRoles = {
            domestic: '국내 거주 노인',
            overseas: '해외 거주 노인',
            coordinator: '케어 코디네이터',
            facility_admin: '시설 관리자',
            admin: '시스템 관리자'
        };
        
        this.criticalUserFlows = [
            '회원가입 → 로그인 → 시설 검색 → 상세 조회',
            '건강평가 생성 → 결과 확인 → 시설 추천',
            '알림 설정 → 프로필 수정 → 로그아웃',
            '시설 리뷰 작성 → 평점 등록 → 공유'
        ];
    }

    /**
     * 🚀 전체 수동 테스트 가이드 생성
     */
    generateCompleteManualTestGuide() {
        return {
            title: '엘더베리 프로젝트 수동 테스트 가이드',
            version: this.version,
            lastUpdated: new Date().toISOString(),
            
            overview: {
                purpose: '사용자 중심의 수동 테스트를 통한 품질 보증',
                scope: '프론트엔드 UI/UX, 사용자 시나리오, 접근성, 성능',
                testTypes: ['기능 테스트', '사용성 테스트', '접근성 테스트', '호환성 테스트', '성능 테스트'],
                estimatedTime: '전체: 4-6시간, 핵심 기능: 2-3시간'
            },
            
            preparation: this.generateTestPreparation(),
            userScenarios: this.generateUserScenarios(),
            functionalTests: this.generateFunctionalTests(),
            usabilityTests: this.generateUsabilityTests(),
            accessibilityTests: this.generateAccessibilityTests(),
            compatibilityTests: this.generateCompatibilityTests(),
            performanceTests: this.generatePerformanceTests(),
            securityTests: this.generateSecurityTests(),
            
            checklist: this.generateMasterChecklist(),
            reportTemplate: this.generateTestReportTemplate()
        };
    }

    /**
     * 🛠️ 테스트 준비 사항
     */
    generateTestPreparation() {
        return {
            title: '테스트 준비 사항',
            requirements: {
                environment: [
                    '✅ 엘더베리 서버 실행 (http://localhost:5173)',
                    '✅ 백엔드 API 서버 실행 (http://localhost:8080)',
                    '✅ 테스트 계정 준비 (test.domestic@example.com)',
                    '✅ 다양한 브라우저 설치',
                    '✅ 개발자 도구 사용법 숙지'
                ],
                testData: [
                    '테스트 사용자 계정 5개 (역할별)',
                    '샘플 시설 데이터',
                    '테스트용 이미지 파일',
                    '다양한 길이의 텍스트 데이터',
                    '특수 문자 포함 데이터'
                ],
                tools: [
                    '브라우저 개발자 도구',
                    'Lighthouse (성능 측정)',
                    'axe DevTools (접근성 검사)',
                    'Responsive Design Mode',
                    '스크린샷 캡처 도구'
                ]
            },
            testAccounts: {
                domestic: { email: 'test.domestic@example.com', password: 'Password123!' },
                overseas: { email: 'test.overseas@example.com', password: 'Password123!' },
                coordinator: { email: 'test.coordinator@example.com', password: 'Password123!' },
                facility_admin: { email: 'test.facility@example.com', password: 'Password123!' },
                admin: { email: 'test.admin@example.com', password: 'Password123!' }
            },
            browserSetup: {
                chrome: '개발자 도구 → Lighthouse 탭 활성화',
                firefox: '웹 콘솔 → 네트워크 탭 활성화',
                safari: '개발자 메뉴 → 반응형 디자인 모드',
                edge: '개발자 도구 → 접근성 트리 확인'
            }
        };
    }

    /**
     * 👥 사용자 시나리오 테스트
     */
    generateUserScenarios() {
        return {
            title: '사용자 시나리오 테스트',
            scenarios: {
                newUserJourney: {
                    title: '신규 사용자 여정',
                    persona: '75세 국내 거주 노인, 컴퓨터 초보',
                    steps: [
                        {
                            step: 1,
                            action: '홈페이지 방문',
                            expected: '명확한 서비스 소개와 회원가입 버튼',
                            checkpoints: [
                                '□ 로고가 명확히 보임',
                                '□ 메인 헤드라인이 이해하기 쉬움',
                                '□ 회원가입 버튼이 눈에 띔',
                                '□ 페이지 로딩이 3초 이내'
                            ]
                        },
                        {
                            step: 2,
                            action: '회원가입 진행',
                            expected: '간단하고 이해하기 쉬운 회원가입 폼',
                            checkpoints: [
                                '□ 필드별 설명이 명확함',
                                '□ 오류 메시지가 이해하기 쉬움',
                                '□ 비밀번호 강도 표시',
                                '□ 이메일 형식 실시간 검증'
                            ]
                        },
                        {
                            step: 3,
                            action: '이메일 인증 및 로그인',
                            expected: '이메일 인증 후 자동 로그인',
                            checkpoints: [
                                '□ 인증 이메일 발송 알림',
                                '□ 인증 완료 후 대시보드 이동',
                                '□ 환영 메시지 표시',
                                '□ 초기 설정 가이드 제공'
                            ]
                        },
                        {
                            step: 4,
                            action: '첫 시설 검색',
                            expected: '직관적인 검색 인터페이스',
                            checkpoints: [
                                '□ 검색 필터가 이해하기 쉬움',
                                '□ 지도 연동이 정상 작동',
                                '□ 검색 결과가 명확히 표시',
                                '□ 시설 상세 정보 접근 용이'
                            ]
                        }
                    ],
                    successCriteria: [
                        '전체 프로세스를 15분 이내 완료',
                        '도움 없이 회원가입부터 시설 검색까지 완료',
                        '사용자가 혼란스러워하지 않음',
                        '모든 기능이 직관적으로 이해됨'
                    ]
                },
                
                existingUserFlow: {
                    title: '기존 사용자 일반 사용 시나리오',
                    persona: '68세 국내 거주 노인, 서비스 익숙함',
                    steps: [
                        {
                            step: 1,
                            action: '로그인',
                            expected: '빠른 인증 및 대시보드 접근',
                            checkpoints: [
                                '□ 이메일/비밀번호 자동 완성',
                                '□ 로그인 상태 유지 옵션',
                                '□ 2초 이내 대시보드 로딩',
                                '□ 개인화된 콘텐츠 표시'
                            ]
                        },
                        {
                            step: 2,
                            action: '건강평가 업데이트',
                            expected: '기존 정보 기반 빠른 업데이트',
                            checkpoints: [
                                '□ 이전 평가 내역 표시',
                                '□ 변경된 부분만 업데이트 가능',
                                '□ 진행률 표시',
                                '□ 중간 저장 기능'
                            ]
                        },
                        {
                            step: 3,
                            action: '맞춤 시설 추천 확인',
                            expected: '개인화된 추천 결과',
                            checkpoints: [
                                '□ 건강 상태 기반 필터링',
                                '□ 거리 기반 정렬',
                                '□ 즐겨찾기 기능',
                                '□ 비교 기능'
                            ]
                        },
                        {
                            step: 4,
                            action: '알림 확인 및 설정',
                            expected: '개인화된 알림 관리',
                            checkpoints: [
                                '□ 읽지 않은 알림 구분',
                                '□ 알림 유형별 설정',
                                '□ 푸시 알림 권한 관리',
                                '□ 이메일 알림 설정'
                            ]
                        }
                    ]
                },
                
                coordinatorWorkflow: {
                    title: '코디네이터 업무 시나리오',
                    persona: '35세 케어 코디네이터, 업무 효율성 중시',
                    steps: [
                        {
                            step: 1,
                            action: '관리 대시보드 접근',
                            expected: '업무 현황 한눈에 파악',
                            checkpoints: [
                                '□ 담당 고객 현황 표시',
                                '□ 긴급 알림 우선 표시',
                                '□ 업무 통계 차트',
                                '□ 빠른 액션 버튼'
                            ]
                        },
                        {
                            step: 2,
                            action: '고객 매칭 작업',
                            expected: '효율적인 매칭 도구',
                            checkpoints: [
                                '□ 고객 조건 필터링',
                                '□ 시설 정보 비교',
                                '□ 매칭 근거 표시',
                                '□ 일괄 처리 기능'
                            ]
                        },
                        {
                            step: 3,
                            action: '리포트 생성',
                            expected: '자동화된 리포트 도구',
                            checkpoints: [
                                '□ 템플릿 기반 생성',
                                '□ 차트 및 그래프 포함',
                                '□ 내보내기 다양한 형식',
                                '□ 일정 기반 자동 생성'
                            ]
                        }
                    ]
                }
            }
        };
    }

    /**
     * ⚙️ 기능별 테스트
     */
    generateFunctionalTests() {
        return {
            title: '기능별 테스트',
            categories: {
                authentication: {
                    title: '인증 및 사용자 관리',
                    tests: [
                        {
                            feature: '회원가입',
                            testCases: [
                                '□ 유효한 정보로 회원가입 성공',
                                '□ 중복 이메일 검증',
                                '□ 비밀번호 강도 검증',
                                '□ 필수 필드 누락 시 오류 표시',
                                '□ 이메일 인증 프로세스',
                                '□ 소셜 로그인 연동 (Google, Kakao)',
                                '□ 이용약관 및 개인정보 동의'
                            ]
                        },
                        {
                            feature: '로그인/로그아웃',
                            testCases: [
                                '□ 올바른 계정 정보로 로그인',
                                '□ 잘못된 계정 정보 시 오류 메시지',
                                '□ 로그인 상태 유지 기능',
                                '□ 자동 로그아웃 (세션 만료)',
                                '□ 비밀번호 찾기/재설정',
                                '□ 계정 잠금 및 해제',
                                '□ 다중 디바이스 로그인 관리'
                            ]
                        },
                        {
                            feature: '프로필 관리',
                            testCases: [
                                '□ 개인정보 수정',
                                '□ 프로필 이미지 업로드',
                                '□ 알림 설정 변경',
                                '□ 비밀번호 변경',
                                '□ 계정 탈퇴',
                                '□ 개인정보 다운로드',
                                '□ 2단계 인증 설정'
                            ]
                        }
                    ]
                },
                
                facilitySearch: {
                    title: '시설 검색 및 관리',
                    tests: [
                        {
                            feature: '시설 검색',
                            testCases: [
                                '□ 키워드 검색 정확성',
                                '□ 지역별 필터링',
                                '□ 시설 유형별 필터링',
                                '□ 가격대별 필터링',
                                '□ 평점별 정렬',
                                '□ 거리순 정렬',
                                '□ 검색 결과 페이지네이션',
                                '□ 검색 히스토리 저장'
                            ]
                        },
                        {
                            feature: '시설 상세 정보',
                            testCases: [
                                '□ 시설 기본 정보 표시',
                                '□ 이미지 갤러리',
                                '□ 리뷰 및 평점',
                                '□ 위치 정보 및 지도',
                                '□ 연락처 정보',
                                '□ 시설 서비스 목록',
                                '□ 가격 정보',
                                '□ 즐겨찾기 추가/제거'
                            ]
                        },
                        {
                            feature: '시설 비교',
                            testCases: [
                                '□ 최대 3개 시설 비교',
                                '□ 비교 항목 표시',
                                '□ 장단점 하이라이트',
                                '□ 비교 결과 저장',
                                '□ 비교 결과 공유',
                                '□ 비교 기준 커스터마이징'
                            ]
                        }
                    ]
                },
                
                healthAssessment: {
                    title: '건강평가 시스템',
                    tests: [
                        {
                            feature: '건강평가 생성',
                            testCases: [
                                '□ 단계별 평가 진행',
                                '□ 중간 저장 기능',
                                '□ 이전/다음 네비게이션',
                                '□ 진행률 표시',
                                '□ 필수 항목 검증',
                                '□ 첨부 파일 업로드',
                                '□ 평가 완료 확인'
                            ]
                        },
                        {
                            feature: '평가 결과',
                            testCases: [
                                '□ 점수 및 등급 표시',
                                '□ 카테고리별 세부 점수',
                                '□ 개선 권장사항',
                                '□ 시설 추천 연동',
                                '□ 결과 차트 표시',
                                '□ PDF 다운로드',
                                '□ 의료진과 공유'
                            ]
                        },
                        {
                            feature: '평가 이력',
                            testCases: [
                                '□ 시간순 이력 표시',
                                '□ 점수 변화 그래프',
                                '□ 이전 평가와 비교',
                                '□ 이력 필터링',
                                '□ 특정 평가 재열람',
                                '□ 이력 데이터 내보내기'
                            ]
                        }
                    ]
                },
                
                notifications: {
                    title: '알림 시스템',
                    tests: [
                        {
                            feature: '알림 수신',
                            testCases: [
                                '□ 실시간 알림 표시',
                                '□ 알림 배지 카운트',
                                '□ 소리 알림 (설정시)',
                                '□ 푸시 알림 (모바일)',
                                '□ 이메일 알림',
                                '□ 알림 팝업 표시'
                            ]
                        },
                        {
                            feature: '알림 관리',
                            testCases: [
                                '□ 알림 읽음 처리',
                                '□ 알림 삭제',
                                '□ 알림 유형별 설정',
                                '□ 방해 금지 모드',
                                '□ 알림 이력 관리',
                                '□ 대량 처리 (읽음/삭제)'
                            ]
                        }
                    ]
                }
            }
        };
    }

    /**
     * 🎨 사용성 테스트
     */
    generateUsabilityTests() {
        return {
            title: '사용성 테스트',
            principles: [
                '직관적 네비게이션',
                '일관된 디자인',
                '빠른 로딩 시간',
                '명확한 피드백',
                '오류 방지 및 복구'
            ],
            tests: {
                navigation: {
                    title: '네비게이션 사용성',
                    checkpoints: [
                        '□ 메인 네비게이션이 모든 페이지에서 일관됨',
                        '□ 현재 위치를 명확히 표시 (breadcrumb)',
                        '□ 뒤로 가기 버튼이 예상대로 작동',
                        '□ 로고 클릭 시 홈으로 이동',
                        '□ 메뉴 구조가 논리적으로 구성됨',
                        '□ 검색 기능이 쉽게 찾을 수 있는 위치에 있음',
                        '□ 모바일에서 햄버거 메뉴가 정상 작동'
                    ]
                },
                
                forms: {
                    title: '폼 사용성',
                    checkpoints: [
                        '□ 폼 필드가 명확히 라벨링됨',
                        '□ 필수 필드가 시각적으로 구분됨',
                        '□ 실시간 유효성 검사',
                        '□ 오류 메시지가 구체적이고 도움됨',
                        '□ 자동 완성 기능 지원',
                        '□ Tab 키 네비게이션 순서가 논리적',
                        '□ 긴 폼의 경우 진행률 표시',
                        '□ 데이터 손실 방지 (자동 저장)'
                    ]
                },
                
                feedback: {
                    title: '피드백 및 상태 표시',
                    checkpoints: [
                        '□ 로딩 상태가 명확히 표시됨',
                        '□ 성공/실패 메시지가 적절히 표시됨',
                        '□ 사용자 행동에 즉각적인 피드백',
                        '□ 진행 중인 작업의 상태 표시',
                        '□ 오류 발생 시 복구 방법 제시',
                        '□ 확인 대화상자가 필요한 곳에만 사용',
                        '□ 툴팁이 도움이 되는 정보 제공'
                    ]
                },
                
                content: {
                    title: '콘텐츠 가독성',
                    checkpoints: [
                        '□ 텍스트가 충분히 큰 크기',
                        '□ 적절한 줄 간격과 문단 구분',
                        '□ 충분한 색상 대비',
                        '□ 중요한 정보가 강조됨',
                        '□ 스캔하기 쉬운 레이아웃',
                        '□ 적절한 여백 사용',
                        '□ 이미지에 대체 텍스트 제공'
                    ]
                }
            }
        };
    }

    /**
     * ♿ 접근성 테스트
     */
    generateAccessibilityTests() {
        return {
            title: '접근성 테스트 (WCAG 2.1 AA 준수)',
            guidelines: [
                '인식 가능성 (Perceivable)',
                '운용 가능성 (Operable)', 
                '이해 가능성 (Understandable)',
                '견고성 (Robust)'
            ],
            tests: {
                keyboard: {
                    title: '키보드 접근성',
                    checkpoints: [
                        '□ 모든 기능을 키보드로만 사용 가능',
                        '□ Tab 순서가 논리적',
                        '□ 포커스 표시가 명확함',
                        '□ 건너뛰기 링크 제공 (메인 콘텐츠로)',
                        '□ 키보드 트랩이 없음',
                        '□ 단축키가 충돌하지 않음',
                        '□ 모달 내에서 포커스가 적절히 관리됨'
                    ]
                },
                
                screenReader: {
                    title: '스크린 리더 호환성',
                    checkpoints: [
                        '□ 모든 이미지에 적절한 alt 속성',
                        '□ 헤딩 구조가 논리적 (h1 > h2 > h3)',
                        '□ 랜드마크 역할이 적절히 설정',
                        '□ 폼 요소에 라벨이 연결됨',
                        '□ 링크 텍스트가 목적을 설명',
                        '□ 표에 적절한 헤더 설정',
                        '□ ARIA 속성이 올바르게 사용됨',
                        '□ 동적 콘텐츠 변경사항이 알림됨'
                    ]
                },
                
                visual: {
                    title: '시각적 접근성',
                    checkpoints: [
                        '□ 색상 대비비가 4.5:1 이상',
                        '□ 색상에만 의존하지 않는 정보 전달',
                        '□ 텍스트 크기 조정 가능 (200%까지)',
                        '□ 깜빡이는 콘텐츠 없음 (3Hz 이하)',
                        '□ 자동 재생되는 미디어 제어 가능',
                        '□ 충분한 터치 타겟 크기 (44px 이상)',
                        '□ 가로/세로 스크롤 최소화'
                    ]
                },
                
                cognitive: {
                    title: '인지적 접근성',
                    checkpoints: [
                        '□ 페이지 제목이 명확하고 설명적',
                        '□ 일관된 네비게이션 구조',
                        '□ 오류 메시지가 구체적이고 도움됨',
                        '□ 복잡한 프로세스에 도움말 제공',
                        '□ 시간 제한이 있는 경우 연장 가능',
                        '□ 중요한 액션에 확인 단계',
                        '□ 명확하고 간단한 언어 사용'
                    ]
                }
            },
            tools: [
                'axe DevTools (Chrome 확장)',
                'WAVE Web Accessibility Evaluator',
                'Lighthouse Accessibility Audit',
                'NVDA 스크린 리더 (Windows)',
                'VoiceOver (macOS)',
                'Colour Contrast Analyser'
            ]
        };
    }

    /**
     * 🌐 호환성 테스트
     */
    generateCompatibilityTests() {
        return {
            title: '크로스 브라우저 & 디바이스 호환성 테스트',
            browsers: {
                desktop: {
                    chrome: {
                        versions: ['최신', '이전 버전'],
                        checkpoints: [
                            '□ 모든 기능 정상 작동',
                            '□ CSS 스타일 정상 렌더링',
                            '□ JavaScript 오류 없음',
                            '□ 개발자 도구 콘솔 확인',
                            '□ 성능 점수 확인 (Lighthouse)'
                        ]
                    },
                    firefox: {
                        versions: ['최신', '이전 버전'],
                        checkpoints: [
                            '□ Firefox 특화 CSS 속성 확인',
                            '□ 폰트 렌더링 차이 확인',
                            '□ JavaScript 호환성',
                            '□ 네트워크 탭에서 요청 확인',
                            '□ 확장 프로그램 호환성'
                        ]
                    },
                    safari: {
                        versions: ['최신 (macOS)', '이전 버전'],
                        checkpoints: [
                            '□ WebKit 엔진 호환성',
                            '□ iOS Safari와 일관성',
                            '□ 보안 정책 준수',
                            '□ 쿠키 및 로컬 스토리지',
                            '□ 비디오/오디오 재생'
                        ]
                    },
                    edge: {
                        versions: ['최신 (Chromium)', 'Legacy Edge'],
                        checkpoints: [
                            '□ Chromium 기반 기능',
                            '□ Microsoft 서비스 연동',
                            '□ Windows 통합 기능',
                            '□ 접근성 도구 호환성',
                            '□ 엔터프라이즈 기능'
                        ]
                    }
                },
                mobile: {
                    ios: {
                        devices: ['iPhone SE', 'iPhone 12', 'iPad'],
                        checkpoints: [
                            '□ 터치 제스처 정상 작동',
                            '□ 세로/가로 모드 전환',
                            '□ 주소 표시줄 숨김/표시',
                            '□ 홈 화면 추가 기능',
                            '□ 푸시 알림 권한'
                        ]
                    },
                    android: {
                        devices: ['Galaxy S 시리즈', '다양한 해상도'],
                        checkpoints: [
                            '□ Chrome 모바일 호환성',
                            '□ Samsung Internet 호환성',
                            '□ 다양한 화면 밀도 지원',
                            '□ 백 버튼 동작',
                            '□ PWA 설치 기능'
                        ]
                    }
                }
            },
            responsiveDesign: {
                breakpoints: [
                    { name: 'Mobile', width: '320px-767px' },
                    { name: 'Tablet', width: '768px-1023px' },
                    { name: 'Desktop', width: '1024px-1439px' },
                    { name: 'Large Desktop', width: '1440px+' }
                ],
                tests: [
                    '□ 모든 중단점에서 레이아웃 정상',
                    '□ 텍스트 가독성 유지',
                    '□ 터치 타겟 크기 적절',
                    '□ 이미지 반응형 로딩',
                    '□ 네비게이션 모바일 최적화',
                    '□ 폼 요소 모바일 친화적'
                ]
            }
        };
    }

    /**
     * ⚡ 성능 테스트
     */
    generatePerformanceTests() {
        return {
            title: '성능 테스트',
            metrics: {
                coreWebVitals: {
                    lcp: { target: '< 2.5초', description: 'Largest Contentful Paint' },
                    fid: { target: '< 100ms', description: 'First Input Delay' },
                    cls: { target: '< 0.1', description: 'Cumulative Layout Shift' }
                },
                additionalMetrics: {
                    fcp: { target: '< 1.8초', description: 'First Contentful Paint' },
                    ttfb: { target: '< 600ms', description: 'Time to First Byte' },
                    speedIndex: { target: '< 3.4초', description: 'Speed Index' }
                }
            },
            tests: {
                pageLoading: {
                    title: '페이지 로딩 성능',
                    checkpoints: [
                        '□ 홈페이지 로딩 시간 < 3초',
                        '□ 시설 검색 결과 < 2초',
                        '□ 이미지 지연 로딩 작동',
                        '□ 폰트 깜빡임 없음 (FOUT 방지)',
                        '□ 점진적 향상 적용',
                        '□ 오프라인 상태 처리'
                    ]
                },
                
                interaction: {
                    title: '상호작용 성능',
                    checkpoints: [
                        '□ 버튼 클릭 응답 < 100ms',
                        '□ 폼 입력 지연 없음',
                        '□ 스크롤 부드러움 (60fps)',
                        '□ 애니메이션 끊김 없음',
                        '□ 모달 열기/닫기 빠름',
                        '□ 검색 자동완성 즉시 반응'
                    ]
                },
                
                network: {
                    title: '네트워크 최적화',
                    checkpoints: [
                        '□ Gzip/Brotli 압축 적용',
                        '□ 이미지 최적화 (WebP)',
                        '□ CSS/JS 번들 크기 적절',
                        '□ CDN 활용',
                        '□ HTTP/2 사용',
                        '□ 캐시 전략 효과적'
                    ]
                },
                
                mobile: {
                    title: '모바일 성능',
                    checkpoints: [
                        '□ 3G 네트워크에서 사용 가능',
                        '□ 배터리 사용량 적절',
                        '□ 메모리 사용량 최적화',
                        '□ 터치 반응성 좋음',
                        '□ 백그라운드 실행 최적화'
                    ]
                }
            },
            tools: [
                'Lighthouse (Chrome DevTools)',
                'WebPageTest.org',
                'GTmetrix',
                'Chrome DevTools Performance Tab',
                'Network Tab 활용',
                'Mobile 시뮬레이션'
            ]
        };
    }

    /**
     * 🔒 보안 테스트
     */
    generateSecurityTests() {
        return {
            title: '보안 테스트',
            categories: {
                authentication: {
                    title: '인증 보안',
                    tests: [
                        '□ 강력한 비밀번호 정책 적용',
                        '□ 계정 잠금 정책 (무차별 대입 방지)',
                        '□ 세션 타임아웃 적절',
                        '□ 로그아웃 시 세션 완전 삭제',
                        '□ 다중 로그인 감지 및 알림',
                        '□ 비밀번호 재설정 보안',
                        '□ 2단계 인증 지원'
                    ]
                },
                
                dataProtection: {
                    title: '데이터 보호',
                    tests: [
                        '□ HTTPS 강제 적용',
                        '□ 민감한 정보 마스킹',
                        '□ 로컬 스토리지 보안',
                        '□ 쿠키 보안 플래그',
                        '□ CSRF 토큰 검증',
                        '□ XSS 방어',
                        '□ SQL 인젝션 방어'
                    ]
                },
                
                privacy: {
                    title: '개인정보 보호',
                    tests: [
                        '□ 개인정보 수집 동의',
                        '□ 데이터 처리 목적 명시',
                        '□ 개인정보 다운로드 기능',
                        '□ 개인정보 삭제 기능',
                        '□ 마케팅 수신 동의 별도',
                        '□ 쿠키 사용 동의',
                        '□ 제3자 데이터 공유 알림'
                    ]
                },
                
                clientSide: {
                    title: '클라이언트 사이드 보안',
                    tests: [
                        '□ 개발자 도구에 민감한 정보 노출 없음',
                        '□ API 키 하드코딩 없음',
                        '□ 디버그 정보 프로덕션에서 제거',
                        '□ Content Security Policy 설정',
                        '□ 악성 스크립트 차단',
                        '□ 피싱 방지 조치'
                    ]
                }
            }
        };
    }

    /**
     * 📋 마스터 체크리스트
     */
    generateMasterChecklist() {
        return {
            title: '수동 테스트 마스터 체크리스트',
            sections: {
                preparation: {
                    title: '🛠️ 테스트 준비',
                    items: [
                        '□ 테스트 환경 설정 완료',
                        '□ 테스트 계정 준비됨',
                        '□ 필요한 브라우저 설치',
                        '□ 접근성 도구 설치',
                        '□ 테스트 계획 검토'
                    ]
                },
                
                functional: {
                    title: '⚙️ 기능 테스트',
                    items: [
                        '□ 회원가입/로그인 정상',
                        '□ 프로필 관리 기능',
                        '□ 시설 검색 및 필터링',
                        '□ 시설 상세 정보 조회',
                        '□ 건강평가 생성/수정',
                        '□ 알림 시스템',
                        '□ 데이터 내보내기/가져오기'
                    ]
                },
                
                usability: {
                    title: '🎨 사용성 테스트',
                    items: [
                        '□ 네비게이션 직관적',
                        '□ 폼 사용성 우수',
                        '□ 피드백 적절',
                        '□ 콘텐츠 가독성',
                        '□ 오류 처리 적절',
                        '□ 도움말 시스템'
                    ]
                },
                
                accessibility: {
                    title: '♿ 접근성 테스트',
                    items: [
                        '□ 키보드 탐색 가능',
                        '□ 스크린 리더 호환',
                        '□ 색상 대비 충분',
                        '□ 텍스트 크기 조정 가능',
                        '□ ARIA 속성 적절',
                        '□ 인지적 부담 최소'
                    ]
                },
                
                compatibility: {
                    title: '🌐 호환성 테스트',
                    items: [
                        '□ Chrome 정상 작동',
                        '□ Firefox 정상 작동',
                        '□ Safari 정상 작동',
                        '□ 모바일 브라우저 정상',
                        '□ 반응형 디자인',
                        '□ 다양한 화면 크기'
                    ]
                },
                
                performance: {
                    title: '⚡ 성능 테스트',
                    items: [
                        '□ 페이지 로딩 빠름',
                        '□ 상호작용 반응성',
                        '□ Core Web Vitals 양호',
                        '□ 모바일 성능 최적',
                        '□ 네트워크 최적화',
                        '□ 메모리 사용량 적절'
                    ]
                },
                
                security: {
                    title: '🔒 보안 테스트',
                    items: [
                        '□ 인증 보안 적절',
                        '□ 데이터 보호',
                        '□ 개인정보 보호',
                        '□ 클라이언트 보안',
                        '□ 취약점 없음'
                    ]
                }
            }
        };
    }

    /**
     * 📊 테스트 리포트 템플릿
     */
    generateTestReportTemplate() {
        return {
            title: '수동 테스트 결과 리포트',
            template: `
# 엘더베리 프로젝트 수동 테스트 결과 리포트

**테스트 실행자**: [테스터 이름]
**테스트 일시**: [실행 일시]
**테스트 환경**: [브라우저, OS, 디바이스]
**테스트 버전**: [애플리케이션 버전]

## 📊 테스트 결과 요약

| 카테고리 | 테스트 수 | 통과 | 실패 | 보류 | 성공률 |
|---------|---------|------|------|------|--------|
| 기능 테스트 | [수] | [수] | [수] | [수] | [%] |
| 사용성 테스트 | [수] | [수] | [수] | [수] | [%] |
| 접근성 테스트 | [수] | [수] | [수] | [수] | [%] |
| 호환성 테스트 | [수] | [수] | [수] | [수] | [%] |
| 성능 테스트 | [수] | [수] | [수] | [수] | [%] |
| 보안 테스트 | [수] | [수] | [수] | [수] | [%] |
| **전체** | [수] | [수] | [수] | [수] | [%] |

## 🎯 핵심 발견사항

### ✅ 우수한 점
- [우수한 기능이나 특징 나열]

### ❌ 개선 필요사항
- [발견된 문제점과 개선안 나열]

### ⚠️ 주의사항
- [향후 고려해야 할 사항들]

## 📋 세부 테스트 결과

### 🔐 인증 기능
- 회원가입: [결과]
- 로그인/로그아웃: [결과]
- 프로필 관리: [결과]

### 🏢 시설 관리
- 시설 검색: [결과]
- 상세 정보: [결과]
- 즐겨찾기: [결과]

### 💊 건강평가
- 평가 생성: [결과]
- 결과 조회: [결과]
- 이력 관리: [결과]

### ♿ 접근성 검증
- 키보드 접근: [결과]
- 스크린 리더: [결과]
- 색상 대비: [결과]

### ⚡ 성능 지표
- LCP: [측정값]
- FID: [측정값]
- CLS: [측정값]
- 페이지 로딩: [측정값]

## 🔧 권장 조치사항

### 즉시 수정 필요 (High Priority)
1. [문제점과 해결 방안]

### 단기 개선 계획 (Medium Priority)
1. [개선사항과 계획]

### 장기 검토사항 (Low Priority)
1. [향후 고려사항]

## 📈 추가 테스트 권장사항

- [다음 테스트 라운드에서 고려할 사항]
- [추가로 필요한 테스트 유형]
- [자동화 가능한 테스트 항목]

---
*이 리포트는 [날짜]에 생성되었습니다.*
            `.trim()
        };
    }

    /**
     * 🔧 테스트 실행 헬퍼 함수들
     */
    generateTestHelpers() {
        return {
            browserConsoleCheck: `
// 브라우저 콘솔에서 실행할 JavaScript 코드들
// 접근성 검사
function checkAccessibility() {
    // 이미지 alt 속성 확인
    const imagesWithoutAlt = Array.from(document.images).filter(img => !img.alt);
    if (imagesWithoutAlt.length > 0) {
        console.warn('Alt 텍스트가 없는 이미지:', imagesWithoutAlt);
    }
    
    // 폼 라벨 확인
    const inputsWithoutLabels = Array.from(document.querySelectorAll('input, select, textarea'))
        .filter(input => !input.labels || input.labels.length === 0);
    if (inputsWithoutLabels.length > 0) {
        console.warn('라벨이 없는 폼 요소:', inputsWithoutLabels);
    }
    
    console.log('접근성 기본 검사 완료');
}

// 성능 측정
function measurePerformance() {
    const navigation = performance.getEntriesByType('navigation')[0];
    console.log('페이지 로딩 시간:', navigation.loadEventEnd - navigation.fetchStart, 'ms');
    
    const resources = performance.getEntriesByType('resource');
    console.log('리소스 로딩 통계:', {
        총개수: resources.length,
        평균시간: resources.reduce((sum, r) => sum + r.duration, 0) / resources.length
    });
}

// 색상 대비 확인 (간단한 버전)
function checkColorContrast() {
    const elements = document.querySelectorAll('*');
    let lowContrastElements = 0;
    
    elements.forEach(el => {
        const styles = getComputedStyle(el);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
            // 실제 대비비 계산은 복잡하므로 여기서는 기본 체크만
            if (color === backgroundColor) {
                lowContrastElements++;
            }
        }
    });
    
    console.log('색상 대비 기본 검사 완료. 의심 요소:', lowContrastElements);
}

// 전체 기본 검사 실행
function runBasicChecks() {
    checkAccessibility();
    measurePerformance();
    checkColorContrast();
    console.log('기본 검사 모두 완료');
}
            `.trim(),
            
            testUrls: [
                'http://localhost:5173/',
                'http://localhost:5173/login',
                'http://localhost:5173/register',
                'http://localhost:5173/dashboard',
                'http://localhost:5173/facilities',
                'http://localhost:5173/health',
                'http://localhost:5173/profile'
            ]
        };
    }
}

module.exports = { ManualTestingGuide };