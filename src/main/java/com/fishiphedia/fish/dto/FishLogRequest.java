package com.fishiphedia.fish.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class FishLogRequest {
    private Long fishId;
    private Double length;
    private String place;
    private String review;
    private String imgPath;
    private Long classificationLogId; // 추가: 분류 로그 ID
} 