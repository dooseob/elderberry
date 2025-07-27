package com.globalcarelink.profile;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface OverseasProfileRepository extends JpaRepository<OverseasProfile, Long> {
    
    Optional<OverseasProfile> findByMemberId(Long memberId);
    
    boolean existsByMemberId(Long memberId);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.residenceCountry = :country")
    List<OverseasProfile> findByResidenceCountry(@Param("country") String country);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.residenceCountry = :country")
    Page<OverseasProfile> findByResidenceCountry(@Param("country") String country, Pageable pageable);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.residenceCountry = :country AND o.residenceCity = :city")
    List<OverseasProfile> findByResidenceCountryAndCity(@Param("country") String country, @Param("city") String city);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.residenceCountry = :country AND o.residenceCity = :city")
    Page<OverseasProfile> findByResidenceCountryAndCity(@Param("country") String country, @Param("city") String city, Pageable pageable);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.profileCompletionPercentage >= :percentage")
    List<OverseasProfile> findByProfileCompletionPercentageGreaterThanEqual(@Param("percentage") Integer percentage);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.profileCompletionPercentage >= :percentage")
    Page<OverseasProfile> findByProfileCompletionPercentageGreaterThanEqual(@Param("percentage") Integer percentage, Pageable pageable);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.coordinatorRequired = true")
    List<OverseasProfile> findRequiringCoordinator();
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.coordinatorRequired = true")
    Page<OverseasProfile> findRequiringCoordinator(Pageable pageable);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.coordinatorRequired = true AND o.profileCompletionPercentage >= :percentage")
    List<OverseasProfile> findRequiringCoordinatorWithCompletion(@Param("percentage") Integer percentage);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.coordinatorRequired = true AND o.profileCompletionPercentage >= :percentage")
    Page<OverseasProfile> findRequiringCoordinatorWithCompletion(@Param("percentage") Integer percentage, Pageable pageable);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.passportExpiryDate <= :date")
    List<OverseasProfile> findByPassportExpiryDateBefore(@Param("date") LocalDate date);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.passportExpiryDate <= :date")
    Page<OverseasProfile> findByPassportExpiryDateBefore(@Param("date") LocalDate date, Pageable pageable);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.visaExpiryDate <= :date")
    List<OverseasProfile> findByVisaExpiryDateBefore(@Param("date") LocalDate date);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.visaExpiryDate <= :date")
    Page<OverseasProfile> findByVisaExpiryDateBefore(@Param("date") LocalDate date, Pageable pageable);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.preferredRegionInKorea = :region")
    List<OverseasProfile> findByPreferredRegionInKorea(@Param("region") String region);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.preferredRegionInKorea = :region")
    Page<OverseasProfile> findByPreferredRegionInKorea(@Param("region") String region, Pageable pageable);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.budgetRange = :budgetRange")
    List<OverseasProfile> findByBudgetRange(@Param("budgetRange") String budgetRange);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.budgetRange = :budgetRange")
    Page<OverseasProfile> findByBudgetRange(@Param("budgetRange") String budgetRange, Pageable pageable);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.careLevel = :careLevel")
    List<OverseasProfile> findByCareLevel(@Param("careLevel") String careLevel);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.careLevel = :careLevel")
    Page<OverseasProfile> findByCareLevel(@Param("careLevel") String careLevel, Pageable pageable);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.entryPurpose = :purpose")
    List<OverseasProfile> findByEntryPurpose(@Param("purpose") String purpose);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.entryPurpose = :purpose")
    Page<OverseasProfile> findByEntryPurpose(@Param("purpose") String purpose, Pageable pageable);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.expectedStayDuration = :duration")
    List<OverseasProfile> findByExpectedStayDuration(@Param("duration") String duration);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.expectedStayDuration = :duration")
    Page<OverseasProfile> findByExpectedStayDuration(@Param("duration") String duration, Pageable pageable);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.preferredCommunicationMethod = :method")
    List<OverseasProfile> findByPreferredCommunicationMethod(@Param("method") String method);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.preferredCommunicationMethod = :method")
    Page<OverseasProfile> findByPreferredCommunicationMethod(@Param("method") String method, Pageable pageable);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.timeZonePreference = :timeZone")
    List<OverseasProfile> findByTimeZonePreference(@Param("timeZone") String timeZone);
    
    @Query("SELECT o FROM OverseasProfile o WHERE o.timeZonePreference = :timeZone")
    Page<OverseasProfile> findByTimeZonePreference(@Param("timeZone") String timeZone, Pageable pageable);
    
    @Query("SELECT o FROM OverseasProfile o JOIN o.member m WHERE m.isJobSeeker = true AND o.profileCompletionPercentage >= :percentage")
    List<OverseasProfile> findJobSeekersWithProfileCompletion(@Param("percentage") Integer percentage);
    
    @Query("SELECT o FROM OverseasProfile o JOIN o.member m WHERE m.isJobSeeker = true AND o.profileCompletionPercentage >= :percentage")
    Page<OverseasProfile> findJobSeekersWithProfileCompletion(@Param("percentage") Integer percentage, Pageable pageable);
    
    @Query("SELECT COUNT(o) FROM OverseasProfile o WHERE o.profileCompletionPercentage >= 70")
    long countCompleteProfiles();
    
    @Query("SELECT COUNT(o) FROM OverseasProfile o WHERE o.coordinatorRequired = true")
    long countRequiringCoordinator();
    
    @Query("SELECT o.residenceCountry, COUNT(o) FROM OverseasProfile o GROUP BY o.residenceCountry ORDER BY COUNT(o) DESC")
    List<Object[]> getResidenceCountryStatistics();
    
    @Query("SELECT o.careLevel, COUNT(o) FROM OverseasProfile o WHERE o.careLevel IS NOT NULL GROUP BY o.careLevel")
    List<Object[]> getCareLevelStatistics();
    
    @Query("SELECT o.budgetRange, COUNT(o) FROM OverseasProfile o WHERE o.budgetRange IS NOT NULL GROUP BY o.budgetRange")
    List<Object[]> getBudgetRangeStatistics();
    
    @Query("SELECT o.entryPurpose, COUNT(o) FROM OverseasProfile o WHERE o.entryPurpose IS NOT NULL GROUP BY o.entryPurpose")
    List<Object[]> getEntryPurposeStatistics();
    
    @Query("SELECT AVG(o.profileCompletionPercentage) FROM OverseasProfile o")
    Double getAverageProfileCompletion();
    
    @Query("SELECT COUNT(o) FROM OverseasProfile o WHERE o.passportExpiryDate <= :threeMonthsLater")
    long countExpiringPassports(@Param("threeMonthsLater") LocalDate threeMonthsLater);
    
    @Query("SELECT COUNT(o) FROM OverseasProfile o WHERE o.visaExpiryDate <= :oneMonthLater")
    long countExpiringVisas(@Param("oneMonthLater") LocalDate oneMonthLater);
}