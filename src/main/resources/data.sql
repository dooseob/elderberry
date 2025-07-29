-- 개발 환경용 초기 데이터
-- 애플리케이션 시작 시 자동으로 로드됨

-- 기본 테스트용 회원 데이터
-- 비밀번호: Password123!
INSERT INTO members (id, email, password, name, phone_number, role, is_job_seeker, is_active, email_verified, language, region, created_at, updated_at) VALUES
(1, 'test.domestic@example.com', '$2a$12$LQv3c1yqBaTVfGduKTK9F.K3h3G7r1wSBxthPiDuqNWGOZT/dw41q', '김테스트', '010-1234-5678', 'USER_DOMESTIC', false, true, true, 'ko', '서울특별시', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'test.overseas@example.com', '$2a$12$LQv3c1yqBaTVfGduKTK9F.K3h3G7r1wSBxthPiDuqNWGOZT/dw41q', 'John Test', '010-2345-6789', 'USER_OVERSEAS', false, true, true, 'en', 'New York', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'test.coordinator@example.com', '$2a$12$LQv3c1yqBaTVfGduKTK9F.K3h3G7r1wSBxthPiDuqNWGOZT/dw41q', '이코디', '010-3456-7890', 'COORDINATOR', false, true, true, 'ko', '서울특별시', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'test.facility@example.com', '$2a$12$LQv3c1yqBaTVfGduKTK9F.K3h3G7r1wSBxthPiDuqNWGOZT/dw41q', '시설관리자', '010-4567-8901', 'FACILITY', false, true, true, 'ko', '부산광역시', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'test.admin@example.com', '$2a$12$LQv3c1yqBaTVfGduKTK9F.K3h3G7r1wSBxthPiDuqNWGOZT/dw41q', '관리자', '010-5678-9012', 'ADMIN', false, true, true, 'ko', '서울특별시', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 테스트용 시설 프로필 데이터 (필수 컬럼 포함)
INSERT INTO facility_profiles (id, facility_name, facility_type, address, region, district, total_capacity, current_occupancy, facility_grade, is_active, created_at, updated_at) VALUES
(1, '서울요양원', '노인요양시설', '서울시 강남구 테스트로 123', '서울특별시', '강남구', 50, 35, 'A', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, '부산실버케어', '주야간보호시설', '부산시 해운대구 해변로 456', '부산광역시', '해운대구', 30, 25, 'B', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, '대구케어센터', '노인요양공동생활가정', '대구시 중구 중앙로 789', '대구광역시', '중구', 20, 15, 'B', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, '인천노인복지관', '주야간보호시설', '인천시 남동구 구월로 101', '인천광역시', '남동구', 100, 80, 'A', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 건강 평가 테스트 데이터
INSERT INTO health_assessments (id, member_id, mobility_level, eating_level, toilet_level, communication_level, ltci_grade, care_target_status, meal_type, final_care_grade, created_at, updated_at) VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 2, 1, 2, 2, 2, 1, 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 3, 3, 2, 3, 2, 3, 1, 1, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 코디네이터 케어 설정
INSERT INTO coordinator_care_settings (id, coordinator_id, base_care_level, max_care_level, experience_years, customer_satisfaction, performance_score, working_regions, specialty_areas, available_weekends, available_emergency, created_at, updated_at) VALUES
(1, 3, 1, 5, 8, 4.8, 4.9, '서울특별시,경기도', '치매전문,중증케어', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 코디네이터 언어 스킬
INSERT INTO coordinator_language_skills (id, coordinator_id, language_code, proficiency_level, certified, certification_level, created_at, updated_at) VALUES
(1, 3, 'KO', 'NATIVE', true, 'NATIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 3, 'EN', 'ADVANCED', true, 'TOEIC_900', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 리뷰 테스트 데이터
INSERT INTO reviews (id, reviewer_id, facility_id, title, content, overall_rating, status, anonymous, helpful_count, not_helpful_count, created_at, updated_at) VALUES
(1, 1, 1, '서울요양원 이용 후기', '시설이 깨끗하고 직원분들이 친절하십니다. 아버지께서 만족해하시네요.', 4.5, 'ACTIVE', false, 12, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 2, '부산실버케어 주간보호', '주간보호 서비스가 정말 좋습니다. 프로그램도 다양하고요.', 4.8, 'ACTIVE', false, 15, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 시설 매칭 히스토리
INSERT INTO facility_matching_history (id, health_assessment_id, facility_id, matching_score, matching_type, matching_factors, user_feedback, completion_status, created_at, updated_at) VALUES
(1, 1, 1, 95.5, 'AUTOMATIC', '케어등급일치,지역근접,전문성', '매우 만족합니다. 추천해주신 시설이 완벽해요.', 'COMPLETED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 2, 87.3, 'MANUAL', '전문성,비용적정성', '코디네이터님 추천으로 방문했는데 좋네요.', 'COMPLETED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);