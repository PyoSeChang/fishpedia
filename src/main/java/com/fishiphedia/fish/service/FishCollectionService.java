package com.fishiphedia.fish.service;

import com.fishiphedia.fish.dto.FishCollectionResponse;
import com.fishiphedia.fish.dto.LevelUpdateResult;
import com.fishiphedia.fish.entity.Fish;
import com.fishiphedia.user.entity.User;
import java.util.List;

public interface FishCollectionService {
    List<FishCollectionResponse> getMyCollection();

    FishCollectionResponse getFishCollectionByFish(Long id);
    
    // FishCollection 업데이트 메서드 (기존)
    void updateFishCollection(User user, Fish fish, int score, Double length);
    
    // FishCollection 업데이트 메서드 (새로운 알고리즘)
    LevelUpdateResult updateFishCollectionWithLevel(User user, Fish fish, int score, Double length);
} 