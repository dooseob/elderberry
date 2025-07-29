-- 테스트용 시설 데이터 삽입 (H2 Database용)
-- FacilityRecommendationServiceIntegrationTest에서 사용

-- 우수한 A급 시설들 (서울특별시)
INSERT INTO facility_profiles (
    facility_name, facility_grade, evaluation_score, region, district, address, 
    phone_number, employee_count, created_date, last_modified_date
) VALUES 
('서울우수요양원', 'A', 95, '서울특별시', '강남구', '서울특별시 강남구 테헤란로 123', '02-1111-1111', 25, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('강남프리미엄케어센터', 'A', 92, '서울특별시', '강남구', '서울특별시 강남구 역삼로 456', '02-2222-2222', 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('서초시니어홈', 'A', 90, '서울특별시', '서초구', '서울특별시 서초구 서초대로 789', '02-3333-3333', 28, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 일반적인 B급 시설들 (서울특별시)
INSERT INTO facility_profiles (
    facility_name, facility_grade, evaluation_score, region, district, address, 
    phone_number, employee_count, created_date, last_modified_date
) VALUES 
('서울일반요양원', 'B', 78, '서울특별시', '마포구', '서울특별시 마포구 마포대로 111', '02-4444-4444', 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('종로케어센터', 'B', 75, '서울특별시', '종로구', '서울특별시 종로구 종로 222', '02-5555-5555', 18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('영등포시니어케어', 'B', 72, '서울특별시', '영등포구', '서울특별시 영등포구 여의대로 333', '02-6666-6666', 22, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 기본적인 C급 시설들 (서울특별시)
INSERT INTO facility_profiles (
    facility_name, facility_grade, evaluation_score, region, district, address, 
    phone_number, employee_count, created_date, last_modified_date
) VALUES 
('서울기본요양원', 'C', 65, '서울특별시', '성북구', '서울특별시 성북구 성북로 444', '02-7777-7777', 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('노원실버홈', 'C', 62, '서울특별시', '노원구', '서울특별시 노원구 노원로 555', '02-8888-8888', 16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 다른 지역 시설들 (비교 테스트용)
INSERT INTO facility_profiles (
    facility_name, facility_grade, evaluation_score, region, district, address, 
    phone_number, employee_count, created_date, last_modified_date
) VALUES 
('부산우수요양원', 'A', 88, '부산광역시', '해운대구', '부산광역시 해운대구 해운대해변로 100', '051-1111-1111', 24, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('대구표준케어센터', 'B', 70, '대구광역시', '수성구', '대구광역시 수성구 수성로 200', '053-2222-2222', 19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('인천기본요양원', 'C', 58, '인천광역시', '연수구', '인천광역시 연수구 연수로 300', '032-3333-3333', 14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 테스트용 회원 데이터 (건강 평가 작성자)
INSERT INTO members (
    username, password, name, email, phone_number, role, 
    created_date, last_modified_date
) VALUES 
('test_user_1', '$2a$10$dummyhashedpassword1', '테스트사용자1', 'test1@example.com', '010-1111-1111', 'MEMBER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('test_user_2', '$2a$10$dummyhashedpassword2', '테스트사용자2', 'test2@example.com', '010-2222-2222', 'MEMBER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('admin_user', '$2a$10$dummyhashedpassword3', '관리자', 'admin@example.com', '010-9999-9999', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 테스트용 건강 평가 데이터
INSERT INTO health_assessments (
    member_id, mobility_level, eating_level, toilet_level, communication_level, 
    ltci_grade, care_target_status, meal_type, final_care_grade,
    created_date, last_modified_date
) VALUES 
((SELECT id FROM members WHERE username = 'test_user_1'), 3, 2, 3, 2, 3, 1, 1, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM members WHERE username = 'test_user_2'), 1, 1, 1, 1, 1, 1, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 테스트용 매칭 히스토리 데이터
INSERT INTO facility_matching_histories (
    health_assessment_id, facility_id, matching_score, matching_date, matching_type,
    created_date, last_modified_date
) VALUES 
(
    (SELECT id FROM health_assessments WHERE member_id = (SELECT id FROM members WHERE username = 'test_user_1')),
    (SELECT id FROM facility_profiles WHERE facility_name = '서울우수요양원'),
    92.5, CURRENT_TIMESTAMP, 'HEALTH_BASED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    (SELECT id FROM health_assessments WHERE member_id = (SELECT id FROM members WHERE username = 'test_user_2')),
    (SELECT id FROM facility_profiles WHERE facility_name = '강남프리미엄케어센터'),
    89.0, CURRENT_TIMESTAMP, 'LOCATION_BASED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);