package com.fishiphedia.classification.service;

import com.fishiphedia.classification.dto.ClassificationLogRequest;
import com.fishiphedia.classification.dto.ClassificationLogResponse;
import com.fishiphedia.classification.entity.ClassificationLog;

import java.util.List;

public interface ClassificationLogService {
    
    /**
     * 분류 로그 저장 (모든 분류 시도 기록)
     */
    ClassificationLog saveClassificationLog(Long userId, ClassificationLogRequest request);
    
    /**
     * 사용자별 분류 로그 조회
     */
    List<ClassificationLogResponse> getUserClassificationLogs(Long userId);
    
    /**
     * 오답노트 조회
     */
    List<ClassificationLogResponse> getWrongPredictions(Long userId);
    
    /**
     * 사용자 피드백 업데이트 (정답/오답 표시)
     */
    ClassificationLog updateUserFeedback(Long logId, String correctedFishName, Boolean isCorrect, String reason);
    
    /**
     * 낚시 일지와 연결
     */
    ClassificationLog linkToFishLog(Long logId, Long fishLogId);
    
    /**
     * 사용자가 최종 선택한 물고기로 피드백 업데이트 (낚시 일지 등록 시)
     */
    ClassificationLog updateUserSelectedFish(Long logId, String selectedFishName);
    
    /**
     * 분류 로그 상세 조회
     */
    ClassificationLogResponse getClassificationLog(Long logId);
    
    /**
     * 모델 성능 통계
     */
    Object[] getModelPerformanceStats();
    
    /**
     * 오답 패턴 분석
     */
    List<Object[]> getWrongPredictionPatterns();
}