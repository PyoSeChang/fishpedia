package com.fishiphedia.ranking.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FishCollectionRankingResponse {
    private Long userId;
    private String name;
    private Long fishId;
    private String fishName;
    private Integer totalScore;
    private Integer highestScore;
    private Double highestLength;
} 