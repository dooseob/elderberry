package com.globalcarelink.auth;

import com.globalcarelink.auth.dto.MemberResponse;
import com.globalcarelink.auth.dto.MemberUpdateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "회원 관리", description = "회원 프로필 관리 및 조회 API")
@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {
    
    private final MemberService memberService;
    
    @Operation(
        summary = "회원 정보 조회",
        description = "특정 회원의 정보를 조회합니다."
    )
    @GetMapping("/{id}")
    public ResponseEntity<MemberResponse> getMember(@PathVariable Long id) {
        MemberResponse response = memberService.findById(id);
        return ResponseEntity.ok(response);
    }
    
    @Operation(
        summary = "프로필 수정",
        description = "본인의 프로필 정보를 수정합니다."
    )
    @PutMapping("/{id}")
    @PreAuthorize("@memberService.findById(#id).email == authentication.name")
    public ResponseEntity<MemberResponse> updateProfile(
            @PathVariable Long id,
            @RequestBody @Valid MemberUpdateRequest request) {
        MemberResponse response = memberService.updateProfile(id, request);
        return ResponseEntity.ok(response);
    }
    
    @Operation(
        summary = "구직자 상태 변경",
        description = "구직자 여부를 토글합니다."
    )
    @PostMapping("/{id}/toggle-job-seeker")
    @PreAuthorize("@memberService.findById(#id).email == authentication.name")
    public ResponseEntity<Void> toggleJobSeekerStatus(@PathVariable Long id) {
        memberService.toggleJobSeekerStatus(id);
        return ResponseEntity.ok().build();
    }
    
    @Operation(
        summary = "계정 비활성화",
        description = "본인의 계정을 비활성화합니다."
    )
    @PostMapping("/{id}/deactivate")
    @PreAuthorize("@memberService.findById(#id).email == authentication.name or hasRole('ADMIN')")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        memberService.deactivate(id);
        return ResponseEntity.ok().build();
    }
    
    @Operation(
        summary = "역할별 회원 조회",
        description = "특정 역할의 회원 목록을 조회합니다. (관리자 전용)"
    )
    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MemberResponse>> getMembersByRole(@PathVariable MemberRole role) {
        List<MemberResponse> response = memberService.findByRole(role);
        return ResponseEntity.ok(response);
    }
    
    @Operation(
        summary = "구직자 목록 조회",
        description = "활성화된 구직자 목록을 조회합니다."
    )
    @GetMapping("/job-seekers")
    @PreAuthorize("hasAnyRole('FACILITY', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<MemberResponse>> getActiveJobSeekers() {
        List<MemberResponse> response = memberService.findActiveJobSeekers();
        return ResponseEntity.ok(response);
    }
    
    @Operation(
        summary = "역할별 회원 수 조회",
        description = "특정 역할의 회원 수를 조회합니다."
    )
    @GetMapping("/count/{role}")
    public ResponseEntity<Long> countByRole(@PathVariable MemberRole role) {
        long count = memberService.countByRole(role);
        return ResponseEntity.ok(count);
    }
}