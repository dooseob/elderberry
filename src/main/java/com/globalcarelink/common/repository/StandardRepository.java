package com.globalcarelink.common.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * 표준화된 Repository 인터페이스
 * 목적: 1) 모든 Repository의 메서드 시그니처 통일
 *      2) 페이징 지원 기본 메서드 제공
 *      3) 공통 검색 패턴 표준화
 *      4) 67개 컴파일 에러 해결
 */
@NoRepositoryBean
public interface StandardRepository<T, ID> extends JpaRepository<T, ID> {
    
    // ===== 기본 조회 메서드 (페이징 지원) =====
    
    /**
     * 모든 엔티티 조회 (페이징) - JpaRepository에서 상속받음
     */
    // @Override 제거 - JpaRepository에서 이미 제공하는 메서드
    
    /**
     * 활성 상태 엔티티만 조회 (페이징)
     * 대부분의 엔티티가 active/enabled 필드를 가지고 있어 공통 패턴으로 제공
     */
    @Query("SELECT e FROM #{#entityName} e WHERE " +
           "(e.active = true OR e.enabled = true OR " +
           " (e.active IS NULL AND e.enabled IS NULL))")
    Page<T> findAllActive(Pageable pageable);
    
    /**
     * 활성 상태 엔티티만 조회 (리스트)
     */
    @Query("SELECT e FROM #{#entityName} e WHERE " +
           "(e.active = true OR e.enabled = true OR " +
           " (e.active IS NULL AND e.enabled IS NULL))")
    List<T> findAllActiveList();
    
    // ===== 검색 메서드 (페이징 지원) =====
    
    /**
     * 키워드 기반 검색 (페이징)
     * name, title, description 필드에서 검색
     */
    @Query("SELECT e FROM #{#entityName} e WHERE " +
           "(LOWER(e.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<T> findByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    /**
     * 키워드 기반 검색 (리스트)
     */
    @Query("SELECT e FROM #{#entityName} e WHERE " +
           "(LOWER(e.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<T> findByKeywordList(@Param("keyword") String keyword);
    
    /**
     * 활성 엔티티에서 키워드 검색 (페이징)
     */
    @Query("SELECT e FROM #{#entityName} e WHERE " +
           "(e.active = true OR e.enabled = true OR " +
           " (e.active IS NULL AND e.enabled IS NULL)) AND " +
           "(LOWER(e.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<T> findActiveByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    // ===== 날짜 범위 검색 =====
    
    /**
     * 생성일 기준 범위 검색 (페이징)
     */
    @Query("SELECT e FROM #{#entityName} e WHERE " +
           "e.createdAt >= :startDate AND e.createdAt <= :endDate")
    Page<T> findByCreatedAtBetween(@Param("startDate") java.time.LocalDateTime startDate,
                                   @Param("endDate") java.time.LocalDateTime endDate,
                                   Pageable pageable);
    
    /**
     * 수정일 기준 범위 검색 (페이징)
     */
    @Query("SELECT e FROM #{#entityName} e WHERE " +
           "e.updatedAt >= :startDate AND e.updatedAt <= :endDate")
    Page<T> findByUpdatedAtBetween(@Param("startDate") java.time.LocalDateTime startDate,
                                   @Param("endDate") java.time.LocalDateTime endDate,
                                   Pageable pageable);
    
    // ===== 통계 및 집계 메서드 =====
    
    /**
     * 활성 엔티티 수 조회
     */
    @Query("SELECT COUNT(e) FROM #{#entityName} e WHERE " +
           "(e.active = true OR e.enabled = true OR " +
           " (e.active IS NULL AND e.enabled IS NULL))")
    long countActive();
    
    /**
     * 전체 엔티티 수 조회 - JpaRepository에서 상속받음
     */
    // @Override 제거 - JpaRepository에서 이미 제공하는 메서드
    
    /**
     * 키워드 매칭 엔티티 수 조회
     */
    @Query("SELECT COUNT(e) FROM #{#entityName} e WHERE " +
           "(LOWER(e.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    long countByKeyword(@Param("keyword") String keyword);
    
    // ===== 정렬 및 제한 조회 =====
    
    /**
     * 최신 엔티티 조회 (페이징)
     */
    @Query("SELECT e FROM #{#entityName} e ORDER BY e.createdAt DESC")
    Page<T> findLatest(Pageable pageable);
    
    /**
     * 최신 N개 엔티티 조회 (리스트)
     */
    @Query("SELECT e FROM #{#entityName} e ORDER BY e.createdAt DESC")
    List<T> findTop10ByOrderByCreatedAtDesc();
    
    /**
     * 최근 업데이트된 엔티티 조회 (페이징)
     */
    @Query("SELECT e FROM #{#entityName} e ORDER BY e.updatedAt DESC")
    Page<T> findRecentlyUpdated(Pageable pageable);
    
    // ===== 존재 여부 확인 =====
    
    /**
     * 키워드로 엔티티 존재 여부 확인
     */
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM #{#entityName} e WHERE " +
           "(LOWER(e.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    boolean existsByKeyword(@Param("keyword") String keyword);
    
    /**
     * 활성 상태로 존재하는지 확인
     */
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM #{#entityName} e WHERE " +
           "e.id = :id AND (e.active = true OR e.enabled = true OR " +
           " (e.active IS NULL AND e.enabled IS NULL))")
    boolean existsActiveById(@Param("id") ID id);
    
    // ===== 조건부 조회 메서드 =====
    
    /**
     * 조건부 활성 엔티티 조회
     */
    default Optional<T> findActiveById(ID id) {
        return findById(id).filter(entity -> {
            // 리플렉션을 통해 active/enabled 필드 체크
            try {
                java.lang.reflect.Field activeField = entity.getClass().getDeclaredField("active");
                activeField.setAccessible(true);
                Boolean active = (Boolean) activeField.get(entity);
                return active == null || active;
            } catch (NoSuchFieldException e) {
                try {
                    java.lang.reflect.Field enabledField = entity.getClass().getDeclaredField("enabled");
                    enabledField.setAccessible(true);
                    Boolean enabled = (Boolean) enabledField.get(entity);
                    return enabled == null || enabled;
                } catch (NoSuchFieldException | IllegalAccessException ex) {
                    // active/enabled 필드가 없으면 항상 활성으로 간주
                    return true;
                }
            } catch (IllegalAccessException e) {
                return true;
            }
        });
    }
    
    /**
     * 안전한 삭제 (soft delete)
     */
    default void softDelete(ID id) {
        findById(id).ifPresent(entity -> {
            try {
                // active 필드를 false로 설정
                java.lang.reflect.Field activeField = entity.getClass().getDeclaredField("active");
                activeField.setAccessible(true);
                activeField.set(entity, false);
                save(entity);
            } catch (NoSuchFieldException e) {
                try {
                    // enabled 필드를 false로 설정
                    java.lang.reflect.Field enabledField = entity.getClass().getDeclaredField("enabled");
                    enabledField.setAccessible(true);
                    enabledField.set(entity, false);
                    save(entity);
                } catch (NoSuchFieldException | IllegalAccessException ex) {
                    // soft delete 불가능한 경우 하드 삭제
                    deleteById(id);
                }
            } catch (IllegalAccessException e) {
                deleteById(id);
            }
        });
    }
    
    /**
     * 배치 안전한 삭제
     */
    default void softDeleteAll(Iterable<? extends T> entities) {
        entities.forEach(entity -> {
            try {
                java.lang.reflect.Method getIdMethod = entity.getClass().getMethod("getId");
                @SuppressWarnings("unchecked")
                ID id = (ID) getIdMethod.invoke(entity);
                softDelete(id);
            } catch (Exception e) {
                // ID 조회 실패 시 스킵
            }
        });
    }
}