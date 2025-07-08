package com.fishiphedia.fish.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FishResponse {
    private Long id;
    private String name;
    private Double avgLength;
    private Double stdDeviation;
    private Integer rarityScore;
} 