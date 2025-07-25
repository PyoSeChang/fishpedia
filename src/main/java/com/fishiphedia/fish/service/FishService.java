package com.fishiphedia.fish.service;

import com.fishiphedia.fish.dto.FishRequest;
import com.fishiphedia.fish.dto.FishResponse;
import com.fishiphedia.fish.dto.FishAverageScoreResponse;
import com.fishiphedia.fish.entity.Fish;

import java.util.List;

public interface FishService {
    
    // 물고기 목록 조회
    List<FishResponse> getAllFish();
    
    // 물고기 상세 조회
    FishResponse getFishById(Long id);
    
    // 물고기 등록
    FishResponse createFish(FishRequest request);
    
    // 물고기 수정
    FishResponse updateFish(Long id, FishRequest request);
    
    // 물고기 삭제
    void deleteFish(Long id);

    // 컬렉션으로 복사
    void copyFishToCollection(Long userId);
    
    // 이름으로 물고기 조회
    Fish findByName(String name);
    
    // 어종별 평균 점수 조회
    FishAverageScoreResponse getAverageScore(Long fishId);
} 