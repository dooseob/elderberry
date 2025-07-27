-- 테스트용 스키마 정의 (Phase 2.4 강화)
-- H2 파일 모드에서 실제 DB 상호작용 테스트를 위한 스키마

-- 회원 테이블 (간소화된 버전)
CREATE TABLE IF NOT EXISTS test_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER_DOMESTIC',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 비활성화된 엔티티들은 temp-disabled 폴더에 있으므로 테스트 스키마에서 제거
-- test_domestic_profiles, test_overseas_profiles, test_jobs, test_job_applications

-- 건강 평가 테이블 (현재 활성 엔티티)
CREATE TABLE IF NOT EXISTS test_health_assessments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    mobility_level INTEGER NOT NULL,
    eating_level INTEGER NOT NULL,
    toilet_level INTEGER NOT NULL,
    communication_level INTEGER NOT NULL,
    ltci_grade INTEGER,
    care_target_status INTEGER,
    meal_type INTEGER,
    final_care_grade INTEGER,
    assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES test_members(id)
);

-- 코디네이터 케어 설정 테이블 (현재 활성 엔티티)
CREATE TABLE IF NOT EXISTS test_coordinator_care_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coordinator_id BIGINT NOT NULL,
    base_care_level INTEGER DEFAULT 1,
    max_care_level INTEGER DEFAULT 5,
    experience_years INTEGER DEFAULT 0,
    customer_satisfaction DECIMAL(3,2) DEFAULT 0.0,
    performance_score DECIMAL(3,2) DEFAULT 0.0,
    working_regions VARCHAR(500),
    specialty_areas VARCHAR(500),
    available_weekends BOOLEAN DEFAULT FALSE,
    available_emergency BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coordinator_id) REFERENCES test_members(id)
);

-- 코디네이터 언어 스킬 테이블 (현재 활성 엔티티)
CREATE TABLE IF NOT EXISTS test_coordinator_language_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coordinator_id BIGINT NOT NULL,
    language_code VARCHAR(10) NOT NULL,
    proficiency_level VARCHAR(20) NOT NULL DEFAULT 'BASIC',
    certified BOOLEAN DEFAULT FALSE,
    certification_level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coordinator_id) REFERENCES test_members(id),
    UNIQUE KEY unique_coordinator_language (coordinator_id, language_code)
);

-- 시설 프로필 테이블
CREATE TABLE IF NOT EXISTS test_facility_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    address VARCHAR(300) NOT NULL,
    capacity INTEGER,
    current_occupancy INTEGER DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 리뷰 테이블
CREATE TABLE IF NOT EXISTS test_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reviewer_id BIGINT NOT NULL,
    facility_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    overall_rating DECIMAL(2,1) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    anonymous BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewer_id) REFERENCES test_members(id),
    FOREIGN KEY (facility_id) REFERENCES test_facility_profiles(id)
);

-- 리뷰 신고 테이블 (현재 활성 엔티티)
CREATE TABLE IF NOT EXISTS test_review_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    review_id BIGINT NOT NULL,
    reporter_id BIGINT NOT NULL,
    reason VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    resolver_id BIGINT,
    resolved_at TIMESTAMP,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES test_reviews(id),
    FOREIGN KEY (reporter_id) REFERENCES test_members(id),
    FOREIGN KEY (resolver_id) REFERENCES test_members(id)
);

-- 리뷰 투표 테이블 (현재 활성 엔티티)
CREATE TABLE IF NOT EXISTS test_review_votes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    review_id BIGINT NOT NULL,
    voter_id BIGINT NOT NULL,
    vote_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES test_reviews(id),
    FOREIGN KEY (voter_id) REFERENCES test_members(id),
    UNIQUE KEY unique_review_voter (review_id, voter_id)
);

-- 시설 매칭 히스토리 테이블 (현재 활성 엔티티)
CREATE TABLE IF NOT EXISTS test_facility_matching_histories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    health_assessment_id BIGINT NOT NULL,
    facility_id BIGINT NOT NULL,
    matching_score DECIMAL(5,2) NOT NULL,
    matching_type VARCHAR(50) NOT NULL DEFAULT 'AUTOMATIC',
    matching_factors TEXT,
    user_feedback TEXT,
    completion_status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (health_assessment_id) REFERENCES test_health_assessments(id),
    FOREIGN KEY (facility_id) REFERENCES test_facility_profiles(id)
);

-- 테스트 성능 모니터링을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_test_members_email ON test_members(email);
CREATE INDEX IF NOT EXISTS idx_test_members_role ON test_members(role);

-- 건강 평가 인덱스
CREATE INDEX IF NOT EXISTS idx_test_health_assessments_member_id ON test_health_assessments(member_id);
CREATE INDEX IF NOT EXISTS idx_test_health_assessments_final_care_grade ON test_health_assessments(final_care_grade);

-- 코디네이터 설정 인덱스
CREATE INDEX IF NOT EXISTS idx_test_coordinator_care_settings_coordinator_id ON test_coordinator_care_settings(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_test_coordinator_care_settings_care_level ON test_coordinator_care_settings(base_care_level, max_care_level);

-- 코디네이터 언어 스킬 인덱스
CREATE INDEX IF NOT EXISTS idx_test_coordinator_language_skills_coordinator_id ON test_coordinator_language_skills(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_test_coordinator_language_skills_language ON test_coordinator_language_skills(language_code);

-- 시설 프로필 인덱스
CREATE INDEX IF NOT EXISTS idx_test_facility_profiles_type ON test_facility_profiles(type);
CREATE INDEX IF NOT EXISTS idx_test_facility_profiles_active ON test_facility_profiles(is_active);

-- 리뷰 인덱스
CREATE INDEX IF NOT EXISTS idx_test_reviews_facility_id ON test_reviews(facility_id);
CREATE INDEX IF NOT EXISTS idx_test_reviews_status ON test_reviews(status);
CREATE INDEX IF NOT EXISTS idx_test_reviews_reviewer_id ON test_reviews(reviewer_id);

-- 리뷰 신고 인덱스
CREATE INDEX IF NOT EXISTS idx_test_review_reports_review_id ON test_review_reports(review_id);
CREATE INDEX IF NOT EXISTS idx_test_review_reports_status ON test_review_reports(status);
CREATE INDEX IF NOT EXISTS idx_test_review_reports_reporter_id ON test_review_reports(reporter_id);

-- 리뷰 투표 인덱스
CREATE INDEX IF NOT EXISTS idx_test_review_votes_review_id ON test_review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_test_review_votes_voter_id ON test_review_votes(voter_id);

-- 시설 매칭 히스토리 인덱스
CREATE INDEX IF NOT EXISTS idx_test_facility_matching_histories_health_assessment_id ON test_facility_matching_histories(health_assessment_id);
CREATE INDEX IF NOT EXISTS idx_test_facility_matching_histories_facility_id ON test_facility_matching_histories(facility_id);
CREATE INDEX IF NOT EXISTS idx_test_facility_matching_histories_status ON test_facility_matching_histories(completion_status);

COMMENT ON TABLE test_members IS '테스트용 회원 테이블 - 현실적 테스트 데이터 지원';
COMMENT ON TABLE test_health_assessments IS '테스트용 건강 평가 테이블 - 다양한 케어 등급 시나리오 지원';
COMMENT ON TABLE test_coordinator_care_settings IS '테스트용 코디네이터 케어 설정 테이블';
COMMENT ON TABLE test_coordinator_language_skills IS '테스트용 코디네이터 언어 스킬 테이블';
COMMENT ON TABLE test_facility_profiles IS '테스트용 시설 프로필 테이블';
COMMENT ON TABLE test_reviews IS '테스트용 리뷰 테이블';
COMMENT ON TABLE test_review_reports IS '테스트용 리뷰 신고 테이블';
COMMENT ON TABLE test_review_votes IS '테스트용 리뷰 투표 테이블';
COMMENT ON TABLE test_facility_matching_histories IS '테스트용 시설 매칭 히스토리 테이블';