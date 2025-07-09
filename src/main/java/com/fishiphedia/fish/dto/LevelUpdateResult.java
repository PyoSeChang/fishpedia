package com.fishiphedia.fish.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LevelUpdateResult {

    private final int prevLevel;        // Level before increment
    private final int prevProgress;     // Progress before increment (0~100, %)
    private final int newLevel;         // Level after increment
    private final int newProgress;      // Progress after increment (0~100, %)
    private final boolean isLevelUp;    // Whether a level up occurred
    private final int increment;        // Total progress increase (%)

}