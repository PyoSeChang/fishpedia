package com.fishiphedia.fish.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FishLogResponse {
    private Long id;
    private Long fishId;
    private String fishName;
    private LocalDate collectAt;
    private Double length;
    private Integer score;
    private String place;
    private String review;
    private String imgPath;
    private Boolean certified;
}