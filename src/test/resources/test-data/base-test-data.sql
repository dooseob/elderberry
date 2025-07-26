-- 기본 테스트 데이터 (Phase 2.4 강화)
-- 모든 테스트에서 공통으로 사용하는 기본 데이터

-- 테스트용 회원 데이터
INSERT INTO test_members (id, email, password, name, role, is_active, email_verified) VALUES
(1, 'test.domestic@example.com', '$2a$12$encrypted.password.hash', '김테스트', 'USER_DOMESTIC', true, true),
(2, 'test.overseas@example.com', '$2a$12$encrypted.password.hash', 'John Test', 'USER_OVERSEAS', true, true),
(3, 'test.coordinator@example.com', '$2a$12$encrypted.password.hash', '이코디', 'COORDINATOR', true, true),
(4, 'test.facility@example.com', '$2a$12$encrypted.password.hash', '시설관리자', 'FACILITY', true, true),
(5, 'test.admin@example.com', '$2a$12$encrypted.password.hash', '관리자', 'ADMIN', true, true),
(6, 'inactive.user@example.com', '$2a$12$encrypted.password.hash', '비활성사용자', 'USER_DOMESTIC', false, true),
(7, 'unverified.user@example.com', '$2a$12$encrypted.password.hash', '미인증사용자', 'USER_DOMESTIC', true, false);

-- 테스트용 시설 프로필 데이터
INSERT INTO test_facility_profiles (id, name, type, address, capacity, current_occupancy, rating, is_active) VALUES
(1, '서울요양원', 'NURSING_HOME', '서울시 강남구 테스트로 123', 50, 35, 4.2, true),
(2, '부산실버케어', 'DAY_CARE', '부산시 해운대구 해변로 456', 30, 25, 4.5, true),
(3, '대구케어센터', 'HOME_CARE', '대구시 중구 중앙로 789', 20, 15, 3.8, true),
(4, '인천노인복지관', 'COMMUNITY_CENTER', '인천시 남동구 구월로 101', 100, 80, 4.0, true),
(5, '폐쇄된시설', 'NURSING_HOME', '서울시 종로구 폐쇄로 999', 40, 0, 2.5, false);

-- 테스트 시나리오별 기본 설정값
INSERT INTO test_members (id, email, password, name, role, is_active, email_verified) VALUES
(100, 'scenario.domestic.1@test.com', '$2a$12$test.hash', '시나리오국내1', 'USER_DOMESTIC', true, true),
(101, 'scenario.overseas.1@test.com', '$2a$12$test.hash', 'Scenario User 1', 'USER_OVERSEAS', true, true),
(102, 'scenario.employer.1@test.com', '$2a$12$test.hash', '시나리오고용주1', 'FACILITY', true, true);

-- 테스트 성능 검증용 대용량 데이터 샘플
-- (실제 성능 테스트에서는 더 많은 데이터 생성)
INSERT INTO test_members (email, password, name, role, is_active, email_verified)
SELECT 
    'perf.test.' || CAST(ROW_NUMBER() OVER() AS VARCHAR) || '@example.com',
    '$2a$12$performance.test.hash',
    'PerfUser' || CAST(ROW_NUMBER() OVER() AS VARCHAR),
    'USER_DOMESTIC',
    true,
    true
FROM (
    SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 
    UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
) AS numbers;

-- 테스트 데이터 무결성 검증을 위한 참조 데이터
COMMENT ON TABLE test_members IS 'Phase 2.4 강화된 테스트 전략: 실제 DB 상호작용 검증용 기본 회원 데이터';
COMMENT ON TABLE test_facility_profiles IS 'Phase 2.4 강화: Mock 객체 대신 실제 시설 데이터로 테스트';