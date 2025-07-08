package com.fishiphedia.fish.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class FishCollectionResponse {
    private Long fishId;
    private Boolean isCollect;
    private Integer highestScore;
    private Double highestLength;
    private LocalDate collectAt;
} 