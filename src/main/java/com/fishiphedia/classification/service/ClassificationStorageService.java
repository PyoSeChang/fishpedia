package com.fishiphedia.classification.service;

import com.fishiphedia.classification.dto.ClassificationStorageRequest;
import com.fishiphedia.classification.entity.ClassificationStorage;

import java.math.BigDecimal;
import java.util.List;

public interface ClassificationStorageService {
    
    /**
     * 고신뢰도 분류 결과 저장
     */
    ClassificationStorage saveHighConfidenceClassification(
            Long userId, 
            ClassificationStorageRequest request
    );
    
    /**
     * 특정 어종의 저장된 분류 결과 조회
     */
    List<ClassificationStorage> getClassificationsByFishName(String fishName);
    
    /**
     * 특정 신뢰도 이상의 분류 결과 조회
     */
    List<ClassificationStorage> getClassificationsByConfidence(BigDecimal minConfidence);
    
    /**
     * 사용자별 분류 결과 조회
     */
    List<ClassificationStorage> getUserClassifications(Long userId);
    
    /**
     * 어종별 분류 결과 통계 조회
     */
    List<Object[]> getClassificationStatsByFish();
    
    /**
     * 신뢰도별 분류 결과 통계 조회
     */
    Object[] getConfidenceStatistics();
    
    /**
     * 분류 결과가 저장 가능한 신뢰도인지 확인
     */
    boolean isHighConfidence(BigDecimal confidence);
}