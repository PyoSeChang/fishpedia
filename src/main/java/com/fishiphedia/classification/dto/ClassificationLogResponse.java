package com.fishiphedia.classification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassificationLogResponse {
    private Long id;
    private Long userId;
    private String predictedFishName;
    private BigDecimal confidence;
    private Boolean isFishDetected;
    private String imagePath;
    private String originalFilename;
    private LocalDateTime classificationDate;
    
    // 사용자 피드백
    private String userCorrectedFishName;
    private Boolean isCorrect;
    private LocalDateTime userFeedbackDate;
    
    // 낚시 일지 연결
    private Long fishLogId;
    
    // 계산된 필드
    private Boolean isHighConfidence; // 90%/99% 기준
    private Boolean needsReview; // 사용자 피드백 필요
}