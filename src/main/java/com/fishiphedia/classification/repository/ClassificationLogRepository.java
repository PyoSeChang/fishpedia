package com.fishiphedia.classification.repository;

import com.fishiphedia.classification.entity.ClassificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ClassificationLogRepository extends JpaRepository<ClassificationLog, Long> {
    
    // 사용자별 분류 로그 조회
    List<ClassificationLog> findByUserIdOrderByClassificationDateDesc(Long userId);
    
    // 특정 물고기 예측 결과 조회
    List<ClassificationLog> findByPredictedFishName(String predictedFishName);
    
    // 신뢰도 범위별 조회
    List<ClassificationLog> findByConfidenceBetween(BigDecimal minConfidence, BigDecimal maxConfidence);
    
    // 오답노트 조회 (사용자가 수정한 케이스)
    List<ClassificationLog> findByUserCorrectedFishNameIsNotNull();
    
    // 특정 사용자의 오답노트
    List<ClassificationLog> findByUserIdAndUserCorrectedFishNameIsNotNullOrderByUserFeedbackDateDesc(Long userId);
    
    // 정답/오답 피드백별 조회
    List<ClassificationLog> findByIsCorrect(Boolean isCorrect);
    
    // 낚시 일지에 연결되지 않은 분류 로그
    List<ClassificationLog> findByFishLogIsNull();
    
    // 기간별 분류 통계
    @Query("SELECT cl.predictedFishName, COUNT(cl), AVG(cl.confidence) " +
           "FROM ClassificationLog cl " +
           "WHERE cl.classificationDate BETWEEN :startDate AND :endDate " +
           "GROUP BY cl.predictedFishName")
    List<Object[]> getClassificationStatsByDateRange(@Param("startDate") LocalDateTime startDate, 
                                                    @Param("endDate") LocalDateTime endDate);
    
    // 오답 분석 통계
    @Query("SELECT cl.predictedFishName, cl.userCorrectedFishName, COUNT(cl) " +
           "FROM ClassificationLog cl " +
           "WHERE cl.userCorrectedFishName IS NOT NULL " +
           "AND cl.predictedFishName != cl.userCorrectedFishName " +
           "GROUP BY cl.predictedFishName, cl.userCorrectedFishName " +
           "ORDER BY COUNT(cl) DESC")
    List<Object[]> getWrongPredictionStats();
    
    // 모델 성능 분석
    @Query("SELECT " +
           "AVG(CASE WHEN cl.isCorrect = true THEN 1.0 ELSE 0.0 END) as accuracy, " +
           "AVG(cl.confidence) as avgConfidence, " +
           "COUNT(cl) as totalCount " +
           "FROM ClassificationLog cl " +
           "WHERE cl.isCorrect IS NOT NULL")
    Object[] getModelPerformanceStats();
}