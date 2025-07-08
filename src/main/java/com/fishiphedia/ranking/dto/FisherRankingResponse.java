package com.fishiphedia.ranking.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FisherRankingResponse {
    private Long userId;
    private String name;
    private Integer totalScore;
} 