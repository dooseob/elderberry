package com.globalcarelink.profile;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DomesticProfileRepository extends JpaRepository<DomesticProfile, Long> {
    
    Optional<DomesticProfile> findByMemberId(Long memberId);
    
    boolean existsByMemberId(Long memberId);
    
    @Query("SELECT d FROM DomesticProfile d WHERE d.profileCompletionPercentage >= :percentage")
    List<DomesticProfile> findByProfileCompletionPercentageGreaterThanEqual(@Param("percentage") Integer percentage);
    
    @Query("SELECT d FROM DomesticProfile d WHERE d.ltciGrade = :grade")
    List<DomesticProfile> findByLtciGrade(@Param("grade") Integer grade);
    
    @Query("SELECT d FROM DomesticProfile d WHERE d.careLevel = :careLevel")
    List<DomesticProfile> findByCareLevel(@Param("careLevel") String careLevel);
    
    @Query("SELECT d FROM DomesticProfile d WHERE d.preferredRegion = :region")
    List<DomesticProfile> findByPreferredRegion(@Param("region") String region);
    
    @Query("SELECT d FROM DomesticProfile d WHERE d.budgetRange = :budgetRange")
    List<DomesticProfile> findByBudgetRange(@Param("budgetRange") String budgetRange);
    
    @Query("SELECT d FROM DomesticProfile d JOIN d.member m WHERE m.isJobSeeker = true AND d.profileCompletionPercentage >= :percentage")
    List<DomesticProfile> findJobSeekersWithProfileCompletion(@Param("percentage") Integer percentage);
    
    @Query("SELECT d FROM DomesticProfile d WHERE d.address LIKE %:city%")
    List<DomesticProfile> findByCity(@Param("city") String city);
    
    @Query("SELECT COUNT(d) FROM DomesticProfile d WHERE d.profileCompletionPercentage >= 80")
    long countCompleteProfiles();
    
    @Query("SELECT COUNT(d) FROM DomesticProfile d WHERE d.emergencyContactName IS NOT NULL AND d.emergencyContactPhone IS NOT NULL")
    long countProfilesWithEmergencyContact();
    
    @Query("SELECT COUNT(d) FROM DomesticProfile d WHERE d.ltciGrade IS NOT NULL")
    long countProfilesWithLtciGrade();
    
    @Query("SELECT d.careLevel, COUNT(d) FROM DomesticProfile d WHERE d.careLevel IS NOT NULL GROUP BY d.careLevel")
    List<Object[]> getCareeLevelStatistics();
    
    @Query("SELECT d.budgetRange, COUNT(d) FROM DomesticProfile d WHERE d.budgetRange IS NOT NULL GROUP BY d.budgetRange")
    List<Object[]> getBudgetRangeStatistics();
    
    @Query("SELECT AVG(d.profileCompletionPercentage) FROM DomesticProfile d")
    Double getAverageProfileCompletion();
}