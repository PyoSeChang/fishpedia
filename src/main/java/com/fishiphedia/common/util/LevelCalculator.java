package com.fishiphedia.common.util;

import com.fishiphedia.fish.dto.LevelUpdateResult;
import lombok.experimental.UtilityClass;

@UtilityClass
public class LevelCalculator {
    
    /**
     * 레벨 계산 알고리즘
     * 레벨 1: 0-99점
     * 레벨 2: 100-299점
     * 레벨 3: 300-599점
     * 레벨 4: 600-999점
     * 레벨 5: 1000-1499점
     * ...
     * 레벨 N: (N-1)*100 + (N-1)*(N-2)*50 ~ (N*100 + N*(N-1)*50 - 1)
     */
    
    /**
     * 총 점수로부터 레벨과 진행률을 계산
     */
    public static LevelInfo calculateLevel(int totalScore) {
        if (totalScore < 0) totalScore = 0;
        
        int level = 1;
        int currentLevelMinScore = 0;
        int nextLevelMinScore = 100;
        
        // 레벨 계산
        while (totalScore >= nextLevelMinScore) {
            level++;
            currentLevelMinScore = nextLevelMinScore;
            nextLevelMinScore = level * 100 + level * (level - 1) * 50;
        }
        
        // 현재 레벨에서의 진행률 계산 (0.0 ~ 1.0)
        double progress = 0.0;
        if (level > 1) {
            int levelScoreRange = nextLevelMinScore - currentLevelMinScore;
            int currentLevelScore = totalScore - currentLevelMinScore;
            progress = (double) currentLevelScore / levelScoreRange;
        } else {
            progress = (double) totalScore / 100.0;
        }
        
        return new LevelInfo(level, progress);
    }
    
    /**
     * 기존 레벨 정보와 새로운 점수로 레벨 업데이트 결과 계산
     */
//    public static LevelUpdateResult calculateLevelUpdate(int oldTotalScore, int newTotalScore, int oldLevel, double oldProgress) {
//        LevelInfo newLevelInfo = calculateLevel(newTotalScore);
//
//        double progressIncrease = newLevelInfo.progress - oldProgress;
//        boolean isLevelUp = newLevelInfo.level > oldLevel;
//
//        return LevelUpdateResult.builder()
//                .progressIncrease(progressIncrease)
//                .isLevelUp(isLevelUp)
//                .build();
//    }
    
    /**
     * 레벨 정보를 담는 내부 클래스
     */
    public static class LevelInfo {
        public final int level;
        public final double progress;
        
        public LevelInfo(int level, double progress) {
            this.level = level;
            this.progress = progress;
        }
    }
} 