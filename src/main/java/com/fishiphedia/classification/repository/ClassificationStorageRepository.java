package com.fishiphedia.classification.repository;

import com.fishiphedia.classification.entity.ClassificationStorage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ClassificationStorageRepository extends JpaRepository<ClassificationStorage, Long> {
    
    // 특정 어종의 분류 결과 조회
    List<ClassificationStorage> findByPredictedFishName(String fishName);
    
    // 특정 신뢰도 이상의 분류 결과 조회
    List<ClassificationStorage> findByConfidenceGreaterThanEqual(BigDecimal minConfidence);
    
    // 특정 사용자의 분류 결과 조회
    List<ClassificationStorage> findByUserId(Long userId);
    
    // 어종별 분류 결과 개수 조회
    @Query("SELECT cs.predictedFishName, COUNT(cs) FROM ClassificationStorage cs GROUP BY cs.predictedFishName")
    List<Object[]> countByFishName();
    
    // 신뢰도별 분류 결과 개수 조회
    @Query("SELECT " +
           "SUM(CASE WHEN cs.confidence >= 99 THEN 1 ELSE 0 END) as highConfidence, " +
           "SUM(CASE WHEN cs.confidence >= 90 AND cs.confidence < 99 THEN 1 ELSE 0 END) as mediumConfidence " +
           "FROM ClassificationStorage cs")
    Object[] getConfidenceStatistics();
}