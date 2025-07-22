package com.globalcarelink.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    
    Optional<Member> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    List<Member> findByRole(MemberRole role);
    
    List<Member> findByRoleAndIsActive(MemberRole role, Boolean isActive);
    
    List<Member> findByIsJobSeekerAndIsActive(Boolean isJobSeeker, Boolean isActive);
    
    @Query("SELECT m FROM Member m WHERE m.role IN :roles AND m.isActive = :isActive")
    List<Member> findByRolesAndIsActive(@Param("roles") List<MemberRole> roles, @Param("isActive") Boolean isActive);
    
    @Query("SELECT m FROM Member m WHERE m.role = :role AND m.region = :region AND m.isActive = true")
    List<Member> findActiveByRoleAndRegion(@Param("role") MemberRole role, @Param("region") String region);
    
    @Query("SELECT m FROM Member m WHERE m.name LIKE %:keyword% OR m.email LIKE %:keyword%")
    List<Member> searchByKeyword(@Param("keyword") String keyword);
    
    long countByRole(MemberRole role);
    
    long countByRoleAndIsActive(MemberRole role, Boolean isActive);
}