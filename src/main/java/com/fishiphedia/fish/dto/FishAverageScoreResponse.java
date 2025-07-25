package com.fishiphedia.fish.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FishAverageScoreResponse {
    private Long fishId;
    private String fishName;
    private Double averageScore;
    private Integer totalLogs;
    private String message;
}