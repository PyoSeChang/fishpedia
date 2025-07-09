package com.fishiphedia.fish.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FishLogCreateResponse {
    private FishLogResponse fishLog;
    private LevelUpdateResult levelUpdateResult;
    private Integer fishId;
} 