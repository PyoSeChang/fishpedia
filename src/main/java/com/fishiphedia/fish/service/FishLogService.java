package com.fishiphedia.fish.service;

import java.util.List;

import com.fishiphedia.fish.dto.FishLogCreateResponse;
import com.fishiphedia.fish.dto.FishLogRequest;
import com.fishiphedia.fish.entity.FishLog;
import com.fishiphedia.user.entity.User;

public interface FishLogService {
    
    // 낚시 일지 생성
    FishLog createFishLog(FishLogRequest request, User user);
    
    // 낚시 일지 생성 (레벨 업데이트 포함)
    FishLogCreateResponse createFishLogWithLevel(FishLogRequest request, User user);
    
    // 사용자의 낚시 일지 목록 조회
    List<FishLog> getUserFishLogs(User user);
    
    // 특정 물고기의 일지 목록 조회
    List<FishLog> getUserFishLogsByFish(User user, Long fishId);
    
    // 특정 낚시 일지 조회
    FishLog getFishLogById(Long id, User user);
    
    // 낚시 일지 검증
    boolean verifyFishLog(Long fishLogId, User user);
} 