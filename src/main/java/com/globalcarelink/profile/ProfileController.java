package com.globalcarelink.profile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 프로필 관리 컨트롤러
 */
@Tag(name = "프로필 관리", description = "사용자 프로필 관련 API")
@Slf4j
@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class ProfileController {

    @Operation(
        summary = "사용자 프로필 조회",
        description = "현재 로그인한 사용자의 프로필을 조회합니다."
    )
    @GetMapping("/domestic/member/{memberId}")
    public ResponseEntity<Map<String, Object>> getDomesticProfile(
            @PathVariable Long memberId,
            Authentication authentication) {
        
        log.info("국내 회원 프로필 조회 요청: memberId={}, user={}", memberId, authentication.getName());
        
        // 임시 더미 데이터 반환
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", memberId);
        profile.put("name", "김테스트");
        profile.put("email", authentication.getName());
        profile.put("profileType", "DOMESTIC");
        profile.put("completionRate", 75);
        profile.put("skills", new String[]{"간병", "치매케어", "재활보조"});
        profile.put("experience", "5년");
        profile.put("region", "서울특별시");
        profile.put("availableStartDate", "2025-08-01");
        profile.put("status", "ACTIVE");
        
        return ResponseEntity.ok(profile);
    }

    @Operation(
        summary = "해외 회원 프로필 조회",
        description = "해외 회원의 프로필을 조회합니다."
    )
    @GetMapping("/overseas/member/{memberId}")
    public ResponseEntity<Map<String, Object>> getOverseasProfile(
            @PathVariable Long memberId,
            Authentication authentication) {
        
        log.info("해외 회원 프로필 조회 요청: memberId={}, user={}", memberId, authentication.getName());
        
        // 임시 더미 데이터 반환
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", memberId);
        profile.put("name", "John Smith");
        profile.put("email", authentication.getName());
        profile.put("profileType", "OVERSEAS");
        profile.put("completionRate", 85);
        profile.put("languages", new String[]{"English", "Korean", "Japanese"});
        profile.put("visaStatus", "F-4");
        profile.put("workExperience", "3 years in elderly care");
        profile.put("currentLocation", "New York, USA");
        profile.put("availableStartDate", "2025-09-01");
        profile.put("status", "ACTIVE");
        
        return ResponseEntity.ok(profile);
    }

    @Operation(
        summary = "시설 프로필 조회",
        description = "시설의 프로필을 조회합니다."
    )
    @GetMapping("/facility/{facilityId}")
    public ResponseEntity<Map<String, Object>> getFacilityProfile(
            @PathVariable Long facilityId,
            Authentication authentication) {
        
        log.info("시설 프로필 조회 요청: facilityId={}, user={}", facilityId, authentication.getName());
        
        // 임시 더미 데이터 반환
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", facilityId);
        profile.put("facilityName", "서울요양원");
        profile.put("facilityType", "노인요양시설");
        profile.put("address", "서울시 강남구 테스트로 123");
        profile.put("region", "서울특별시");
        profile.put("totalCapacity", 50);
        profile.put("currentOccupancy", 35);
        profile.put("facilityGrade", "A");
        profile.put("contact", "02-1234-5678");
        profile.put("services", new String[]{"24시간 간병", "치매전문케어", "재활치료"});
        profile.put("isActive", true);
        
        return ResponseEntity.ok(profile);
    }

    @Operation(
        summary = "프로필 검색",
        description = "프로필을 검색합니다."
    )
    @GetMapping("/search")
    public ResponseEntity<Page<Map<String, Object>>> searchProfiles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String profileType) {
        
        log.info("프로필 검색 요청: keyword={}, profileType={}, page={}, size={}", keyword, profileType, page, size);
        
        // 임시 더미 데이터 생성
        List<Map<String, Object>> profiles = List.of(
            Map.of(
                "id", 1L,
                "name", "김테스트",
                "profileType", "DOMESTIC",
                "experience", "5년",
                "region", "서울특별시",
                "skills", new String[]{"간병", "치매케어"},
                "completionRate", 85,
                "status", "ACTIVE",
                "updatedAt", LocalDateTime.now().minusDays(1)
            ),
            Map.of(
                "id", 2L,
                "name", "John Smith",
                "profileType", "OVERSEAS",
                "experience", "3년",
                "region", "New York",
                "skills", new String[]{"eldercare", "rehabilitation"},
                "completionRate", 90,
                "status", "ACTIVE",
                "updatedAt", LocalDateTime.now().minusDays(2)
            )
        );
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Map<String, Object>> profilePage = new PageImpl<>(profiles, pageable, profiles.size());
        
        return ResponseEntity.ok(profilePage);
    }

    @Operation(
        summary = "프로필 통계",
        description = "프로필 관련 통계를 조회합니다."
    )
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getProfileStatistics() {
        
        log.info("프로필 통계 조회 요청");
        
        // 임시 통계 데이터
        Map<String, Object> profileTypes = new HashMap<>();
        profileTypes.put("DOMESTIC", 789);
        profileTypes.put("OVERSEAS", 445);
        
        Map<String, Object> monthlyRegistrations = new HashMap<>();
        monthlyRegistrations.put("current", 45);
        monthlyRegistrations.put("previous", 38);
        monthlyRegistrations.put("growth", 18.4);
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalProfiles", 1234);
        statistics.put("activeProfiles", 987);
        statistics.put("completedProfiles", 856);
        statistics.put("profileTypes", profileTypes);
        statistics.put("averageCompletionRate", 78.5);
        statistics.put("monthlyRegistrations", monthlyRegistrations);
        statistics.put("topSkills", new String[]{"간병", "치매케어", "재활보조", "응급처치", "약물관리"});
        
        return ResponseEntity.ok(statistics);
    }
}