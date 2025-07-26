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

-- 국내 프로필 테이블
CREATE TABLE IF NOT EXISTS test_domestic_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    age INTEGER,
    gender VARCHAR(10),
    phone VARCHAR(20),
    address VARCHAR(300),
    care_level VARCHAR(20),
    completion_percentage INTEGER DEFAULT 0,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES test_members(id)
);

-- 해외 프로필 테이블
CREATE TABLE IF NOT EXISTS test_overseas_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    age INTEGER,
    gender VARCHAR(10),
    residence_country VARCHAR(50) NOT NULL,
    nationality VARCHAR(50) NOT NULL,
    passport_number VARCHAR(20),
    visa_status VARCHAR(20),
    needs_coordinator BOOLEAN DEFAULT FALSE,
    completion_percentage INTEGER DEFAULT 0,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES test_members(id)
);

-- 구인공고 테이블
CREATE TABLE IF NOT EXISTS test_jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employer_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    work_location VARCHAR(300) NOT NULL,
    category VARCHAR(50) NOT NULL,
    salary_type VARCHAR(20) NOT NULL,
    min_salary DECIMAL(12,2),
    max_salary DECIMAL(12,2),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    view_count BIGINT DEFAULT 0,
    is_urgent BOOLEAN DEFAULT FALSE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES test_members(id)
);

-- 지원서 테이블
CREATE TABLE IF NOT EXISTS test_job_applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT NOT NULL,
    applicant_id BIGINT NOT NULL,
    cover_letter TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES test_jobs(id),
    FOREIGN KEY (applicant_id) REFERENCES test_members(id)
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
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewer_id) REFERENCES test_members(id),
    FOREIGN KEY (facility_id) REFERENCES test_facility_profiles(id)
);

-- 테스트 성능 모니터링을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_test_members_email ON test_members(email);
CREATE INDEX IF NOT EXISTS idx_test_members_role ON test_members(role);
CREATE INDEX IF NOT EXISTS idx_test_domestic_profiles_member_id ON test_domestic_profiles(member_id);
CREATE INDEX IF NOT EXISTS idx_test_overseas_profiles_member_id ON test_overseas_profiles(member_id);
CREATE INDEX IF NOT EXISTS idx_test_overseas_profiles_country ON test_overseas_profiles(residence_country);
CREATE INDEX IF NOT EXISTS idx_test_jobs_status ON test_jobs(status);
CREATE INDEX IF NOT EXISTS idx_test_jobs_category ON test_jobs(category);
CREATE INDEX IF NOT EXISTS idx_test_job_applications_job_id ON test_job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_test_job_applications_applicant_id ON test_job_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_test_facility_profiles_type ON test_facility_profiles(type);
CREATE INDEX IF NOT EXISTS idx_test_reviews_facility_id ON test_reviews(facility_id);
CREATE INDEX IF NOT EXISTS idx_test_reviews_status ON test_reviews(status);

COMMENT ON TABLE test_members IS '테스트용 회원 테이블 - Phase 2.4 강화된 테스트 전략 지원';
COMMENT ON TABLE test_domestic_profiles IS '테스트용 국내 프로필 테이블';
COMMENT ON TABLE test_overseas_profiles IS '테스트용 해외 프로필 테이블';
COMMENT ON TABLE test_jobs IS '테스트용 구인공고 테이블';
COMMENT ON TABLE test_job_applications IS '테스트용 지원서 테이블';
COMMENT ON TABLE test_facility_profiles IS '테스트용 시설 프로필 테이블';
COMMENT ON TABLE test_reviews IS '테스트용 리뷰 테이블';