package com.globalcarelink.profile;

import com.globalcarelink.external.dto.EntranceVisaRequirement;
import com.globalcarelink.profile.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
@Tag(name = "프로필 관리", description = "국내/해외 사용자 프로필 관리 API")
public class ProfileController {
    
    private final DomesticProfileService domesticProfileService;
    private final OverseasProfileService overseasProfileService;
    private final ProfileExternalService profileExternalService;
    
    @Operation(
        summary = "국내 프로필 생성",
        description = "국내 사용자를 위한 프로필을 생성합니다."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "프로필 생성 성공",
                    content = @Content(schema = @Schema(implementation = DomesticProfileResponse.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "404", description = "회원을 찾을 수 없음"),
        @ApiResponse(responseCode = "409", description = "이미 프로필이 존재함")
    })
    @PostMapping("/domestic/{memberId}")
    public ResponseEntity<DomesticProfileResponse> createDomesticProfile(
            @Parameter(description = "회원 ID", example = "1")
            @PathVariable Long memberId,
            @Valid @RequestBody DomesticProfileRequest request) {
        
        DomesticProfileResponse response = domesticProfileService.createProfile(memberId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @Operation(
        summary = "해외 프로필 생성",
        description = "해외 사용자를 위한 프로필을 생성합니다."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "프로필 생성 성공",
                    content = @Content(schema = @Schema(implementation = OverseasProfileResponse.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "404", description = "회원을 찾을 수 없음"),
        @ApiResponse(responseCode = "409", description = "이미 프로필이 존재함")
    })
    @PostMapping("/overseas/{memberId}")
    public ResponseEntity<OverseasProfileResponse> createOverseasProfile(
            @Parameter(description = "회원 ID", example = "1")
            @PathVariable Long memberId,
            @Valid @RequestBody OverseasProfileRequest request) {
        
        OverseasProfileResponse response = overseasProfileService.createProfile(memberId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @Operation(
        summary = "국내 프로필 조회",
        description = "회원 ID로 국내 프로필을 조회합니다."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "프로필 조회 성공",
                    content = @Content(schema = @Schema(implementation = DomesticProfileResponse.class))),
        @ApiResponse(responseCode = "404", description = "프로필을 찾을 수 없음")
    })
    @GetMapping("/domestic/{memberId}")
    public ResponseEntity<DomesticProfileResponse> getDomesticProfile(
            @Parameter(description = "회원 ID", example = "1")
            @PathVariable Long memberId) {
        
        DomesticProfileResponse response = domesticProfileService.getProfile(memberId);
        return ResponseEntity.ok(response);
    }
    
    @Operation(
        summary = "해외 프로필 조회",
        description = "회원 ID로 해외 프로필을 조회합니다."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "프로필 조회 성공",
                    content = @Content(schema = @Schema(implementation = OverseasProfileResponse.class))),
        @ApiResponse(responseCode = "404", description = "프로필을 찾을 수 없음")
    })
    @GetMapping("/overseas/{memberId}")
    public ResponseEntity<OverseasProfileResponse> getOverseasProfile(
            @Parameter(description = "회원 ID", example = "1")
            @PathVariable Long memberId) {
        
        OverseasProfileResponse response = overseasProfileService.getProfile(memberId);
        return ResponseEntity.ok(response);
    }
    
    @Operation(
        summary = "국내 프로필 수정",
        description = "국내 프로필 정보를 수정합니다."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "프로필 수정 성공",
                    content = @Content(schema = @Schema(implementation = DomesticProfileResponse.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "404", description = "프로필을 찾을 수 없음")
    })
    @PutMapping("/domestic/{memberId}")
    public ResponseEntity<DomesticProfileResponse> updateDomesticProfile(
            @Parameter(description = "회원 ID", example = "1")
            @PathVariable Long memberId,
            @Valid @RequestBody DomesticProfileRequest request) {
        
        DomesticProfileResponse response = domesticProfileService.updateProfile(memberId, request);
        return ResponseEntity.ok(response);
    }
    
    @Operation(
        summary = "해외 프로필 수정",
        description = "해외 프로필 정보를 수정합니다."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "프로필 수정 성공",
                    content = @Content(schema = @Schema(implementation = OverseasProfileResponse.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "404", description = "프로필을 찾을 수 없음")
    })
    @PutMapping("/overseas/{memberId}")
    public ResponseEntity<OverseasProfileResponse> updateOverseasProfile(
            @Parameter(description = "회원 ID", example = "1")
            @PathVariable Long memberId,
            @Valid @RequestBody OverseasProfileRequest request) {
        
        OverseasProfileResponse response = overseasProfileService.updateProfile(memberId, request);
        return ResponseEntity.ok(response);
    }
    
    @Operation(
        summary = "국내 프로필 삭제",
        description = "국내 프로필을 삭제합니다."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "프로필 삭제 성공"),
        @ApiResponse(responseCode = "404", description = "프로필을 찾을 수 없음")
    })
    @DeleteMapping("/domestic/{memberId}")
    public ResponseEntity<Void> deleteDomesticProfile(
            @Parameter(description = "회원 ID", example = "1")
            @PathVariable Long memberId) {
        
        domesticProfileService.deleteProfile(memberId);
        return ResponseEntity.noContent().build();
    }
    
    @Operation(
        summary = "해외 프로필 삭제",
        description = "해외 프로필을 삭제합니다."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "프로필 삭제 성공"),
        @ApiResponse(responseCode = "404", description = "프로필을 찾을 수 없음")
    })
    @DeleteMapping("/overseas/{memberId}")
    public ResponseEntity<Void> deleteOverseasProfile(
            @Parameter(description = "회원 ID", example = "1")
            @PathVariable Long memberId) {
        
        overseasProfileService.deleteProfile(memberId);
        return ResponseEntity.noContent().build();
    }
    
    @Operation(
        summary = "완성도별 국내 프로필 조회",
        description = "지정한 완성도 이상의 국내 프로필 목록을 조회합니다."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 완성도 값 (0-100)")
    })
    @GetMapping("/domestic")
    public ResponseEntity<List<DomesticProfileResponse>> getDomesticProfilesByCompletion(
            @Parameter(description = "최소 완성도 (%)", example = "80")
            @RequestParam(value = "minCompletion", defaultValue = "80") int minCompletion) {
        
        List<DomesticProfileResponse> profiles = domesticProfileService.getProfilesByCompletion(minCompletion);
        return ResponseEntity.ok(profiles);
    }
    
    @Operation(
        summary = "국가별 해외 프로필 조회",
        description = "지정한 국가의 해외 프로필 목록을 조회합니다."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "400", description = "국가명이 필요함")
    })
    @GetMapping("/overseas")
    public ResponseEntity<List<OverseasProfileResponse>> getOverseasProfilesByCountry(
            @Parameter(description = "거주 국가", example = "미국")
            @RequestParam("country") String country) {
        
        List<OverseasProfileResponse> profiles = overseasProfileService.getProfilesByCountry(country);
        return ResponseEntity.ok(profiles);
    }
    
    @Operation(
        summary = "코디네이터 필요 해외 프로필 조회",
        description = "코디네이터 서비스가 필요한 해외 프로필 목록을 조회합니다."
    )
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping("/overseas/coordinator-required")
    public ResponseEntity<List<OverseasProfileResponse>> getOverseasProfilesRequiringCoordinator() {
        
        List<OverseasProfileResponse> profiles = overseasProfileService.getProfilesRequiringCoordinator();
        return ResponseEntity.ok(profiles);
    }
    
    @Operation(
        summary = "서류 만료 예정 해외 프로필 조회",
        description = "여권/비자 만료가 임박한 해외 프로필 목록을 조회합니다. (여권 3개월, 비자 1개월 이내)"
    )
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping("/overseas/expiring-documents")
    public ResponseEntity<List<OverseasProfileResponse>> getOverseasProfilesWithExpiringDocuments() {
        
        // TODO: ProfileService에 구현 필요
        return ResponseEntity.ok(List.of());
    }

    // ===== 입국허가요건 관련 API =====

    @Operation(
        summary = "해외 프로필 입국허가요건 조회",
        description = "해외 프로필의 거주 국가에 대한 입국허가요건을 조회합니다."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "입국허가요건 조회 성공"),
        @ApiResponse(responseCode = "404", description = "해외 프로필을 찾을 수 없음"),
        @ApiResponse(responseCode = "500", description = "외부 API 호출 실패")
    })
    @GetMapping("/overseas/{memberId}/visa-requirements")
    public Mono<ResponseEntity<List<EntranceVisaRequirement>>> getVisaRequirementsForProfile(
            @Parameter(description = "회원 ID", example = "1")
            @PathVariable Long memberId) {
        
        log.info("해외 프로필 입국허가요건 조회 API 호출 - 회원: {}", memberId);
        
        // TODO: 비자 요건 조회 로직을 ProfileExternalService로 이동 필요
        OverseasProfileResponse profile = overseasProfileService.getProfile(memberId);
        return profileExternalService.getVisaRequirements(profile.getNationality(), profile.getResidenceCountry())
                .map(requirements -> {
                    log.info("해외 프로필 입국허가요건 조회 완료 - 회원: {}, 결과 수: {}", memberId, requirements.size());
                    return ResponseEntity.ok(requirements);
                })
                .onErrorReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .<List<EntranceVisaRequirement>>body(List.of()));
    }

    @Operation(
        summary = "맞춤형 입국허가요건 조회",
        description = "해외 프로필의 거주 국가와 입국 목적에 따른 맞춤형 입국허가요건을 조회합니다."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "맞춤형 입국허가요건 조회 성공"),
        @ApiResponse(responseCode = "404", description = "해외 프로필을 찾을 수 없음"),
        @ApiResponse(responseCode = "500", description = "외부 API 호출 실패")
    })
    @GetMapping("/overseas/{memberId}/visa-requirements/customized")
    public Mono<ResponseEntity<List<EntranceVisaRequirement>>> getCustomizedVisaRequirements(
            @Parameter(description = "회원 ID", example = "1")
            @PathVariable Long memberId,
            @Parameter(description = "입국 목적", example = "의료")
            @RequestParam(value = "purpose", required = false) String entryPurpose) {
        
        log.info("맞춤형 입국허가요건 조회 API 호출 - 회원: {}, 목적: {}", memberId, entryPurpose);
        
        // TODO: 맞춤형 비자 요건 조회 로직을 ProfileExternalService로 이동 필요
        OverseasProfileResponse profile = overseasProfileService.getProfile(memberId);
        return profileExternalService.getCustomVisaInfo(profile.getNationality(), profile.getResidenceCountry(), entryPurpose, 30)
                .map(requirements -> {
                    log.info("맞춤형 입국허가요건 조회 완료 - 회원: {}, 목적: {}, 결과 수: {}", 
                            memberId, entryPurpose, requirements.size());
                    return ResponseEntity.ok(requirements);
                })
                .onErrorReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .<List<EntranceVisaRequirement>>body(List.of()));
    }

    @Operation(
        summary = "프로필 개선 제안 조회",
        description = "입국허가요건을 기반으로 한 프로필 개선 제안 사항을 조회합니다."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "프로필 개선 제안 조회 성공"),
        @ApiResponse(responseCode = "404", description = "해외 프로필을 찾을 수 없음"),
        @ApiResponse(responseCode = "500", description = "제안 생성 실패")
    })
    @GetMapping("/overseas/{memberId}/improvement-suggestions")
    public Mono<ResponseEntity<List<String>>> getProfileImprovementSuggestions(
            @Parameter(description = "회원 ID", example = "1")
            @PathVariable Long memberId) {
        
        log.info("프로필 개선 제안 조회 API 호출 - 회원: {}", memberId);
        
        // TODO: 프로필 개선 제안 로직을 별도 서비스로 분리 필요
        return Mono.just(List.of("TODO: 프로필 개선 제안 기능 구현 예정"))
                .map(suggestions -> {
                    log.info("프로필 개선 제안 조회 완료 - 회원: {}, 제안 수: {}", memberId, suggestions.size());
                    return ResponseEntity.ok(suggestions);
                })
                .onErrorReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .<List<String>>body(List.of("제안을 생성할 수 없습니다")));
    }

    @Operation(
        summary = "입국허가요건 변경 알림 대상 조회",
        description = "특정 국가의 입국허가요건 변경 시 알림이 필요한 해외 프로필 목록을 조회합니다."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "알림 대상 조회 성공"),
        @ApiResponse(responseCode = "400", description = "국가명이 필요함")
    })
    @GetMapping("/overseas/visa-update-notification")
    public ResponseEntity<List<OverseasProfileResponse>> getProfilesRequiringVisaUpdateNotification(
            @Parameter(description = "국가명", example = "미국")
            @RequestParam("country") String countryName) {
        
        log.info("입국허가요건 변경 알림 대상 조회 API 호출 - 국가: {}", countryName);
        
        // TODO: 비자 업데이트 알림 로직을 별도 서비스로 분리 필요
        List<OverseasProfileResponse> profiles = overseasProfileService.getProfilesByCountry(countryName);
        
        log.info("입국허가요건 변경 알림 대상 조회 완료 - 국가: {}, 대상 수: {}", countryName, profiles.size());
        return ResponseEntity.ok(profiles);
    }
}