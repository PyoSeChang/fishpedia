package com.fishiphedia.ranking.service;

import com.fishiphedia.ranking.dto.FisherRankingResponse;
import com.fishiphedia.ranking.dto.FishCollectionRankingResponse;
import com.fishiphedia.user.entity.UserInfo;
import com.fishiphedia.user.repository.UserInfoRepository;
import com.fishiphedia.fish.entity.FishCollection;
import com.fishiphedia.fish.repository.FishCollectionRepository;
import com.fishiphedia.fish.entity.Fish;
import com.fishiphedia.fish.repository.FishRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RankingServiceImpl implements RankingService {

    private final UserInfoRepository userInfoRepository;
    private final FishCollectionRepository fishCollectionRepository;
    private final FishRepository fishRepository;

    // 낚시꾼 전체 랭킹 (UserInfo.totalScore)
    @Override
    public List<FisherRankingResponse> getFisherRanking() {
        return userInfoRepository.findAll().stream()
                .sorted(Comparator.comparingInt((UserInfo u) -> u.getTotalScore() != null ? u.getTotalScore() : 0).reversed())
                .map(u -> {
                    FisherRankingResponse dto = new FisherRankingResponse();
                    dto.setUserId(u.getUser().getId());
                    dto.setName(u.getName());
                    dto.setTotalScore(u.getTotalScore() != null ? u.getTotalScore() : 0);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // FishCollection 전체 랭킹 (totalScore)
    @Override
    public List<FishCollectionRankingResponse> getFishCollectionRanking() {
        return fishCollectionRepository.findAll().stream()
                .sorted(Comparator.comparingInt((FishCollection fc) -> fc.getTotalScore() != null ? fc.getTotalScore() : 0).reversed())
                .map(fc -> {
                    FishCollectionRankingResponse dto = new FishCollectionRankingResponse();
                    dto.setUserId(fc.getUser().getId());
                    dto.setName(fc.getUser().getUserInfo().getName());
                    dto.setFishId(fc.getFish().getId());
                    dto.setFishName(fc.getFish().getName());
                    dto.setTotalScore(fc.getTotalScore() != null ? fc.getTotalScore() : 0);
                    dto.setHighestScore(fc.getHighestScore());
                    dto.setHighestLength(fc.getHighestLength());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // 물고기별 전체 랭킹 (highestScore, 전체 물고기)
    @Override
    public List<FishCollectionRankingResponse> getFishRankingAllFish() {
        List<FishCollectionRankingResponse> result = new ArrayList<>();
        List<Fish> fishList = fishRepository.findAll();
        for (Fish fish : fishList) {
            List<FishCollection> collections = fishCollectionRepository.findByFishIdOrderByHighestScoreDesc(fish.getId());
            for (FishCollection fc : collections) {
                FishCollectionRankingResponse dto = new FishCollectionRankingResponse();
                dto.setUserId(fc.getUser().getId());
                dto.setName(fc.getUser().getUserInfo().getName());
                dto.setFishId(fish.getId());
                dto.setFishName(fish.getName());
                dto.setTotalScore(fc.getTotalScore());
                dto.setHighestScore(fc.getHighestScore());
                dto.setHighestLength(fc.getHighestLength());
                result.add(dto);
            }
        }
        return result;
    }

    // 특정 물고기별 랭킹 (highestScore)
    @Override
    public List<FishCollectionRankingResponse> getFishRankingByFish(Long fishId) {
        return fishCollectionRepository.findByFishIdOrderByHighestScoreDesc(fishId).stream()
                .map(fc -> {
                    FishCollectionRankingResponse dto = new FishCollectionRankingResponse();
                    dto.setUserId(fc.getUser().getId());
                    dto.setName(fc.getUser().getUserInfo().getName());
                    dto.setFishId(fc.getFish().getId());
                    dto.setFishName(fc.getFish().getName());
                    dto.setTotalScore(fc.getTotalScore());
                    dto.setHighestScore(fc.getHighestScore());
                    dto.setHighestLength(fc.getHighestLength());
                    return dto;
                })
                .collect(Collectors.toList());
    }
} 