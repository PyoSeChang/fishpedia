package com.fishiphedia.spots.repository;

import com.fishiphedia.spots.entity.Spot;
import com.fishiphedia.spots.entity.SpotType;
import com.fishiphedia.spots.entity.WaterFacilityType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpotRepository extends JpaRepository<Spot, Long> {
    
    Optional<Spot> findByName(String name);
    
    List<Spot> findBySpotType(SpotType spotType);
    
    @Query("SELECT s FROM Spot s WHERE s.latitude BETWEEN :minLat AND :maxLat AND s.longitude BETWEEN :minLng AND :maxLng")
    List<Spot> findByLocationRange(@Param("minLat") Double minLat, @Param("maxLat") Double maxLat, 
                                   @Param("minLng") Double minLng, @Param("maxLng") Double maxLng);
    
    @Query("SELECT s FROM Spot s WHERE s.name LIKE %:keyword% OR s.mainFishSpecies LIKE %:keyword%")
    List<Spot> findByKeyword(@Param("keyword") String keyword);
    
    // 지역별 낚시터 조회 (정확한 매칭, 2글자 region 필드 기준)
    List<Spot> findByRegion(String region);
    
    // 페이징 지원 버전들
    Page<Spot> findByRegion(String region, Pageable pageable);
    
    // 복합 검색을 위한 쿼리 메서드들
    @Query("SELECT s FROM Spot s WHERE " +
           "(:keyword IS NULL OR s.name LIKE %:keyword% OR s.mainFishSpecies LIKE %:keyword% OR s.roadAddress LIKE %:keyword% OR s.lotAddress LIKE %:keyword%) AND " +
           "(:spotType IS NULL OR s.spotType = :spotType) AND " +
           "(:region IS NULL OR s.region = :region) AND " +
           "(:fishSpecies IS NULL OR s.mainFishSpecies LIKE %:fishSpecies%)")
    List<Spot> findBySearchCriteria(@Param("keyword") String keyword,
                                   @Param("spotType") SpotType spotType,
                                   @Param("region") String region,
                                   @Param("fishSpecies") String fishSpecies);
    
    // 페이징 지원 복합 검색
    @Query("SELECT s FROM Spot s WHERE " +
           "(:keyword IS NULL OR s.name LIKE %:keyword% OR s.mainFishSpecies LIKE %:keyword% OR s.roadAddress LIKE %:keyword% OR s.lotAddress LIKE %:keyword%) AND " +
           "(:spotType IS NULL OR s.spotType = :spotType) AND " +
           "(:region IS NULL OR s.region = :region) AND " +
           "(:fishSpecies IS NULL OR s.mainFishSpecies LIKE %:fishSpecies%)")
    Page<Spot> findBySearchCriteria(@Param("keyword") String keyword,
                                   @Param("spotType") SpotType spotType,
                                   @Param("region") String region,
                                   @Param("fishSpecies") String fishSpecies,
                                   Pageable pageable);
    
    // 페이징을 위한 카운트 쿼리
    @Query("SELECT COUNT(s) FROM Spot s WHERE " +
           "(:keyword IS NULL OR s.name LIKE %:keyword% OR s.mainFishSpecies LIKE %:keyword% OR s.roadAddress LIKE %:keyword% OR s.lotAddress LIKE %:keyword%) AND " +
           "(:spotType IS NULL OR s.spotType = :spotType) AND " +
           "(:region IS NULL OR s.region = :region) AND " +
           "(:fishSpecies IS NULL OR s.mainFishSpecies LIKE %:fishSpecies%)")
    long countBySearchCriteria(@Param("keyword") String keyword,
                              @Param("spotType") SpotType spotType,
                              @Param("region") String region,
                              @Param("fishSpecies") String fishSpecies);
    
    // 세부 검색 쿼리 메서드 (간단한 버전)
    @Query("SELECT s FROM Spot s WHERE " +
           "(:region IS NULL OR s.region = :region) AND " +
           "(:keyword IS NULL OR s.name LIKE %:keyword% OR s.mainFishSpecies LIKE %:keyword% OR s.roadAddress LIKE %:keyword% OR s.lotAddress LIKE %:keyword%)")
    List<Spot> findByDetailSearchCriteria(@Param("region") String region,
                                         @Param("keyword") String keyword,
                                         @Param("spotTypes") List<SpotType> spotTypes,
                                         @Param("waterFacilityTypes") List<WaterFacilityType> waterFacilityTypes,
                                         @Param("minUsageFee") Integer minUsageFee,
                                         @Param("maxUsageFee") Integer maxUsageFee);
    
    // 어종 및 편의시설을 위한 추가 필터링은 Service 계층에서 Java 코드로 처리
}