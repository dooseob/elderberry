-- 강화된 현실적 테스트 데이터
-- 새로 추가된 활성 엔티티들을 위한 구체적인 테스트 시나리오 데이터

-- 건강 평가 테스트 데이터 (다양한 케어 등급 시나리오)
-- 1등급 (최중증) 시나리오
INSERT INTO test_health_assessments (id, member_id, mobility_level, eating_level, toilet_level, communication_level, ltci_grade, care_target_status, meal_type, final_care_grade) VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 1, 1);

-- 2등급 (중증) 시나리오  
INSERT INTO test_health_assessments (id, member_id, mobility_level, eating_level, toilet_level, communication_level, ltci_grade, care_target_status, meal_type, final_care_grade) VALUES
(2, 2, 2, 1, 2, 2, 2, 1, 1, 2);

-- 3등급 (중등도) 시나리오
INSERT INTO test_health_assessments (id, member_id, mobility_level, eating_level, toilet_level, communication_level, ltci_grade, care_target_status, meal_type, final_care_grade) VALUES
(3, 100, 3, 2, 3, 2, 3, 1, 1, 3);

-- 4등급 (경중증) 시나리오
INSERT INTO test_health_assessments (id, member_id, mobility_level, eating_level, toilet_level, communication_level, ltci_grade, care_target_status, meal_type, final_care_grade) VALUES
(4, 101, 4, 3, 4, 3, 4, 2, 2, 4);

-- 5등급 (경증) 시나리오
INSERT INTO test_health_assessments (id, member_id, mobility_level, eating_level, toilet_level, communication_level, ltci_grade, care_target_status, meal_type, final_care_grade) VALUES
(5, 102, 4, 4, 4, 3, 5, 2, 2, 5);

-- 인지등급 (치매) 시나리오
INSERT INTO test_health_assessments (id, member_id, mobility_level, eating_level, toilet_level, communication_level, ltci_grade, care_target_status, meal_type, final_care_grade) VALUES
(6, 6, 3, 3, 3, 1, 6, 1, 1, 3);

-- 코디네이터 케어 설정 테스트 데이터
-- 경험 많은 시니어 코디네이터
INSERT INTO test_coordinator_care_settings (id, coordinator_id, base_care_level, max_care_level, experience_years, customer_satisfaction, performance_score, working_regions, specialty_areas, available_weekends, available_emergency) VALUES
(1, 3, 1, 5, 8, 4.8, 4.9, '서울특별시,경기도', '치매전문,중증케어', true, true);

-- 신입 코디네이터
INSERT INTO test_coordinator_care_settings (id, coordinator_id, base_care_level, max_care_level, experience_years, customer_satisfaction, performance_score, working_regions, specialty_areas, available_weekends, available_emergency) VALUES
(2, 5, 3, 5, 1, 4.2, 4.1, '부산광역시', '일반케어', false, false);

-- 지역 전문 코디네이터
INSERT INTO test_coordinator_care_settings (id, coordinator_id, base_care_level, max_care_level, experience_years, customer_satisfaction, performance_score, working_regions, specialty_areas, available_weekends, available_emergency) VALUES
(3, 4, 2, 4, 5, 4.6, 4.7, '대구광역시,경상북도', '재활전문,호스피스', true, false);

-- 코디네이터 언어 스킬 테스트 데이터
-- 다국어 가능 코디네이터 (해외동포 전문)
INSERT INTO test_coordinator_language_skills (id, coordinator_id, language_code, proficiency_level, certified, certification_level) VALUES
(1, 3, 'KO', 'NATIVE', true, 'NATIVE'),
(2, 3, 'EN', 'ADVANCED', true, 'TOEIC_900'),
(3, 3, 'JA', 'INTERMEDIATE', true, 'JLPT_N2'),
(4, 3, 'ZH', 'BASIC', false, null);

-- 영어 전문 코디네이터
INSERT INTO test_coordinator_language_skills (id, coordinator_id, language_code, proficiency_level, certified, certification_level) VALUES
(5, 5, 'KO', 'NATIVE', true, 'NATIVE'),
(6, 5, 'EN', 'ADVANCED', true, 'IELTS_7_5');

-- 일반 코디네이터 (한국어만)
INSERT INTO test_coordinator_language_skills (id, coordinator_id, language_code, proficiency_level, certified, certification_level) VALUES
(7, 4, 'KO', 'NATIVE', true, 'NATIVE');

-- 리뷰 테스트 데이터 (기존 시설에 대한)
INSERT INTO test_reviews (id, reviewer_id, facility_id, title, content, overall_rating, status, anonymous, helpful_count, not_helpful_count) VALUES
(1, 1, 1, '서울요양원 이용 후기', '시설이 깨끗하고 직원분들이 친절하십니다. 아버지께서 만족해하시네요.', 4.5, 'ACTIVE', false, 12, 1),
(2, 2, 1, '가족이 추천한 곳', '가족의 추천으로 방문했는데 시설 관리가 잘 되어있어 좋았습니다.', 4.0, 'ACTIVE', false, 8, 2),
(3, 100, 2, '부산실버케어 주간보호', '주간보호 서비스가 정말 좋습니다. 프로그램도 다양하고요.', 4.8, 'ACTIVE', false, 15, 0),
(4, 101, 3, '대구케어센터 방문케어', '방문케어 서비스 만족합니다. 케어매니저님이 전문적이세요.', 4.2, 'ACTIVE', true, 6, 1),
(5, 6, 1, '불만족 후기', '기대했던 것보다 서비스가 아쉬웠습니다.', 2.5, 'ACTIVE', false, 2, 8);

-- 리뷰 신고 테스트 데이터
-- 부적절한 내용 신고
INSERT INTO test_review_reports (id, review_id, reporter_id, reason, description, status, resolver_id, resolved_at, admin_notes) VALUES
(1, 5, 1, 'INAPPROPRIATE_CONTENT', '사실과 다른 내용이 포함되어 있습니다.', 'UNDER_REVIEW', null, null, null);

-- 스팸 신고
INSERT INTO test_review_reports (id, review_id, reporter_id, reason, description, status, resolver_id, resolved_at, admin_notes) VALUES
(2, 2, 4, 'SPAM', '광고성 내용으로 보입니다.', 'PENDING', null, null, null);

-- 해결된 신고
INSERT INTO test_review_reports (id, review_id, reporter_id, reason, description, status, resolver_id, resolved_at, admin_notes) VALUES
(3, 1, 5, 'FALSE_INFORMATION', '허위 정보가 포함되어 있다는 신고가 있었습니다.', 'RESOLVED', 5, CURRENT_TIMESTAMP, '검토 결과 문제없음 확인');

-- 리뷰 투표 테스트 데이터
-- 긍정적 리뷰에 대한 도움됨 투표
INSERT INTO test_review_votes (id, review_id, voter_id, vote_type) VALUES
(1, 1, 2, 'HELPFUL'),
(2, 1, 100, 'HELPFUL'),
(3, 1, 101, 'HELPFUL'),
(4, 1, 102, 'NOT_HELPFUL');

-- 다양한 리뷰에 대한 투표들
INSERT INTO test_review_votes (id, review_id, voter_id, vote_type) VALUES
(5, 2, 1, 'HELPFUL'),
(6, 2, 3, 'HELPFUL'),
(7, 3, 1, 'HELPFUL'),
(8, 3, 2, 'HELPFUL'),
(9, 4, 2, 'HELPFUL'),
(10, 5, 3, 'NOT_HELPFUL');

-- 시설 매칭 히스토리 테스트 데이터
-- 자동 매칭 성공 케이스
INSERT INTO test_facility_matching_histories (id, health_assessment_id, facility_id, matching_score, matching_type, matching_factors, user_feedback, completion_status) VALUES
(1, 1, 1, 95.5, 'AUTOMATIC', '케어등급일치,지역근접,전문성', '매우 만족합니다. 추천해주신 시설이 완벽해요.', 'COMPLETED');

-- 수동 매칭 케이스  
INSERT INTO test_facility_matching_histories (id, health_assessment_id, facility_id, matching_score, matching_type, matching_factors, user_feedback, completion_status) VALUES
(2, 2, 2, 87.3, 'MANUAL', '전문성,비용적정성', '코디네이터님 추천으로 방문했는데 좋네요.', 'COMPLETED');

-- 매칭 진행 중 케이스
INSERT INTO test_facility_matching_histories (id, health_assessment_id, facility_id, matching_score, matching_type, matching_factors, user_feedback, completion_status) VALUES
(3, 3, 3, 78.9, 'AUTOMATIC', '지역근접,케어등급', null, 'IN_PROGRESS');

-- 매칭 취소 케이스
INSERT INTO test_facility_matching_histories (id, health_assessment_id, facility_id, matching_score, matching_type, matching_factors, user_feedback, completion_status) VALUES
(4, 4, 1, 82.1, 'AUTOMATIC', '케어등급일치', '다른 곳으로 결정했습니다.', 'CANCELLED');

-- 낮은 점수 매칭 케이스
INSERT INTO test_facility_matching_histories (id, health_assessment_id, facility_id, matching_score, matching_type, matching_factors, user_feedback, completion_status) VALUES
(5, 5, 4, 65.2, 'MANUAL', '지역근접', '거리는 가까운데 시설이 아쉬워요.', 'COMPLETED');

-- 코디네이터 전문성 매칭 케이스
INSERT INTO test_facility_matching_histories (id, health_assessment_id, facility_id, matching_score, matching_type, matching_factors, user_feedback, completion_status) VALUES
(6, 6, 1, 91.8, 'COORDINATOR_SPECIALIZED', '치매전문,코디네이터추천', '치매 전문 케어가 정말 좋습니다.', 'COMPLETED');

-- 테스트 데이터 품질 검증을 위한 추가 샘플
-- 다양한 언어 스킬 조합 테스트용 추가 데이터
INSERT INTO test_members (id, email, password, name, role, is_active, email_verified) VALUES
(200, 'multilang.coordinator@test.com', '$2a$12$test.hash', '다국어코디', 'COORDINATOR', true, true);

INSERT INTO test_coordinator_care_settings (id, coordinator_id, base_care_level, max_care_level, experience_years, customer_satisfaction, performance_score, working_regions, specialty_areas, available_weekends, available_emergency) VALUES
(4, 200, 1, 5, 10, 4.9, 5.0, '서울특별시,경기도,인천광역시', '해외동포전문,다국어지원,중증케어', true, true);

INSERT INTO test_coordinator_language_skills (id, coordinator_id, language_code, proficiency_level, certified, certification_level) VALUES
(8, 200, 'KO', 'NATIVE', true, 'NATIVE'),
(9, 200, 'EN', 'ADVANCED', true, 'TOEFL_110'),
(10, 200, 'JA', 'ADVANCED', true, 'JLPT_N1'),
(11, 200, 'ZH', 'INTERMEDIATE', true, 'HSK_5'),
(12, 200, 'RU', 'BASIC', false, null);

COMMENT ON TABLE test_health_assessments IS '현실적 테스트: 1-5등급 및 인지등급 다양한 케어 시나리오 포함';
COMMENT ON TABLE test_coordinator_care_settings IS '현실적 테스트: 경험수준별, 전문분야별 다양한 코디네이터 설정';
COMMENT ON TABLE test_coordinator_language_skills IS '현실적 테스트: 해외동포 지원을 위한 다국어 스킬 시나리오';
COMMENT ON TABLE test_review_reports IS '현실적 테스트: 신고 처리 워크플로우 검증용 다양한 상태 데이터';
COMMENT ON TABLE test_review_votes IS '현실적 테스트: 리뷰 유용성 평가 시스템 검증용';
COMMENT ON TABLE test_facility_matching_histories IS '현실적 테스트: 매칭 알고리즘 및 사용자 피드백 분석용 데이터';