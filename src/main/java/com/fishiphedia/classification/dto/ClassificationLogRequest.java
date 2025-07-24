package com.fishiphedia.classification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassificationLogRequest {
    private String predictedFishName;
    private BigDecimal confidence;
    private Boolean isFishDetected;
    private String originalFilename;
    private byte[] imageData; // 선택적
    
    // 사용자 피드백용
    private String userCorrectedFishName;
    private Boolean isCorrect;
    private String correctionReason;
}