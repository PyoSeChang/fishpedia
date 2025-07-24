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
public class ClassificationStorageRequest {
    private String predictedFishName;
    private BigDecimal confidence;
    private String originalFilename;
    private byte[] imageData; // Base64 디코딩된 이미지 데이터
}