package com.fishiphedia.fish.service;

import com.fishiphedia.common.util.LevelCalculator;
import com.fishiphedia.fish.dto.FishCollectionResponse;
import com.fishiphedia.fish.dto.LevelUpdateResult;
import com.fishiphedia.fish.entity.Fish;
import com.fishiphedia.fish.entity.FishCollection;
import com.fishiphedia.fish.repository.FishCollectionRepository;
import com.fishiphedia.fish.repository.FishRepository;
import com.fishiphedia.user.entity.User;
import com.fishiphedia.user.entity.UserInfo;
import com.fishiphedia.user.repository.UserInfoRepository;
import com.fishiphedia.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FishCollectionServiceImpl implements FishCollectionService {

    private final FishCollectionRepository fishCollectionRepository;
    private final UserInfoRepository userInfoRepository;
    private final UserRepository userRepository;
    private final FishRepository fishRepository;

    @Override
    public List<FishCollectionResponse> getMyCollection() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String loginId = authentication.getName();
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
        List<FishCollection> collections = fishCollectionRepository.findByUser(user);
        return collections.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public FishCollectionResponse getFishCollectionByFish(Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String loginId = authentication.getName();


        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        Fish fish = fishRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
        FishCollection collection=fishCollectionRepository.findByUserAndFish(user, fish).orElse(null);
        return toResponse(collection);
    }

    @Override
    @Transactional
    public void updateFishCollection(User user, Fish fish, int score, Double length) {
        FishCollection fishCollection = fishCollectionRepository.findByUserAndFish(user, fish)
                .orElseGet(() -> {
                    // 새로운 수집 기록 생성
                    FishCollection newCollection = new FishCollection();
                    newCollection.setUser(user);
                    newCollection.setFish(fish);
                    newCollection.setIsCollect(true);
                    newCollection.setCollectAt(LocalDate.now());
                    newCollection.setHighestScore(score);
                    newCollection.setHighestLength(length);
                    return newCollection;
                });

        // 기존 기록이 있는 경우 최고 기록 갱신
        if (fishCollection.getId() != null) {
            if (score > fishCollection.getHighestScore()) {
                fishCollection.setHighestScore(score);
            }
            if (length > fishCollection.getHighestLength()) {
                fishCollection.setHighestLength(length);
            }
        }

        fishCollectionRepository.save(fishCollection);
    }

    @Override
    @Transactional
    public LevelUpdateResult updateFishCollectionWithLevel(User user, Fish fish, int score, Double length) {
        // 1. FishCollection 조회 또는 생성
        FishCollection fishCollection = fishCollectionRepository.findByUserAndFish(user, fish)
                .orElseGet(() -> {
                    // 새로운 수집 기록 생성
                    FishCollection newCollection = new FishCollection();
                    newCollection.setUser(user);
                    newCollection.setFish(fish);
                    newCollection.setIsCollect(true);
                    newCollection.setCollectAt(LocalDate.now());
                    newCollection.setHighestScore(score);
                    newCollection.setHighestLength(length);
                    newCollection.setTotalScore(score);
                    newCollection.setLevel(1);
                    newCollection.setCurrentLevelProgress(0.0);
                    return newCollection;
                });

        // 2. 기존 값 저장
        int oldTotalScore = fishCollection.getTotalScore() != null ? fishCollection.getTotalScore() : 0;
        int oldLevel = fishCollection.getLevel() != null ? fishCollection.getLevel() : 1;
        double oldProgress = fishCollection.getCurrentLevelProgress() != null ? fishCollection.getCurrentLevelProgress() : 0.0;

        // 3. totalScore에 score 추가
        int newTotalScore = oldTotalScore + score;
        fishCollection.setTotalScore(newTotalScore);

        // 4. 레벨 계산 및 업데이트
        LevelCalculator.LevelInfo levelInfo = LevelCalculator.calculateLevel(newTotalScore);
        fishCollection.setLevel(levelInfo.level);
        fishCollection.setCurrentLevelProgress(levelInfo.progress);

        // 5. 최고 기록 갱신 (score > highest_score)
        if (score > fishCollection.getHighestScore()) {
            fishCollection.setHighestScore(score);
            fishCollection.setHighestLength(length);
        }

        // 6. FishCollection 저장
        fishCollectionRepository.save(fishCollection);

        // 7. UserInfo도 업데이트 (전체 레벨)
        UserInfo userInfo = user.getUserInfo();
        if (userInfo != null) {
            int userOldTotalScore = userInfo.getTotalScore() != null ? userInfo.getTotalScore() : 0;
            int userOldLevel = userInfo.getLevel() != null ? userInfo.getLevel() : 1;
            double userOldProgress = userInfo.getCurrentLevelProgress() != null ? userInfo.getCurrentLevelProgress() : 0.0;

            int userNewTotalScore = userOldTotalScore + score;
            LevelCalculator.LevelInfo userLevelInfo = LevelCalculator.calculateLevel(userNewTotalScore);

            userInfo.setTotalScore(userNewTotalScore);
            userInfo.setLevel(userLevelInfo.level);
            userInfo.setCurrentLevelProgress(userLevelInfo.progress);

            userInfoRepository.save(userInfo);
        }

        // 8. 레벨 업데이트 결과 반환
        boolean isLevelUp = levelInfo.level > oldLevel;
        
        // progress를 백분율로 변환 (0.0~1.0 → 0~100)
        int prevProgress = (int) Math.round(oldProgress * 100);
        int newProgress = (int) Math.round(levelInfo.progress * 100);
        
        // increment 계산
        int increment;
        if (!isLevelUp) {
            // 레벨업 없음: newProgress - prevProgress
            increment = newProgress - prevProgress;
        } else {
            // 레벨업 발생: (100 - prevProgress) + newProgress + 100 * (newLevel - prevLevel - 1)
            increment = (100 - prevProgress) + newProgress + 100 * (levelInfo.level - oldLevel - 1);
        }
        
        return LevelUpdateResult.builder()
                .prevLevel(oldLevel)
                .prevProgress(prevProgress)
                .newLevel(levelInfo.level)
                .newProgress(newProgress)
                .isLevelUp(isLevelUp)
                .increment(increment)
                .build();
    }

    private FishCollectionResponse toResponse(FishCollection entity) {
        FishCollectionResponse dto = new FishCollectionResponse();
        dto.setFishId(entity.getFish().getId());
        dto.setIsCollect(entity.getIsCollect());
        dto.setHighestScore(entity.getHighestScore());
        dto.setHighestLength(entity.getHighestLength());
        dto.setCollectAt(entity.getCollectAt());
        dto.setTotalScore(entity.getTotalScore());
        dto.setLevel(entity.getLevel());
        dto.setCurrentLevelProgress(entity.getCurrentLevelProgress());
        return dto;
    }
} 