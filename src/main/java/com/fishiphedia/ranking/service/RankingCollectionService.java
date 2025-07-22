package com.fishiphedia.ranking.service;

import com.fishiphedia.fish.entity.Fish;
import com.fishiphedia.fish.entity.FishLog;
import com.fishiphedia.ranking.entity.RankingCollection;
import com.fishiphedia.user.entity.User;

public interface RankingCollectionService {
    
    /**
     * FishLog가 검증될 때 RankingCollection을 업데이트
     */
    void updateRankingCollection(FishLog fishLog);
    
    /**
     * 사용자와 물고기에 대한 RankingCollection 조회 또는 생성
     */
    RankingCollection getOrCreateRankingCollection(User user, Fish fish);
    
    /**
     * 특정 사용자의 모든 certified FishLog를 기반으로 RankingCollection 재계산
     */
    void recalculateRankingCollection(User user, Fish fish);
}