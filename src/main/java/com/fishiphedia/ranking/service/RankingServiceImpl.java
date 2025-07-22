package com.fishiphedia.ranking.service;

import com.fishiphedia.ranking.dto.FisherRankingResponse;
import com.fishiphedia.ranking.dto.FishCollectionRankingResponse;
import com.fishiphedia.user.entity.UserInfo;
import com.fishiphedia.user.repository.UserInfoRepository;
import com.fishiphedia.fish.entity.FishCollection;
import com.fishiphedia.fish.repository.FishCollectionRepository;
import com.fishiphedia.fish.entity.Fish;
import com.fishiphedia.fish.repository.FishRepository;
import com.fishiphedia.fish.repository.FishLogRepository;
import com.fishiphedia.user.entity.User;
import com.fishiphedia.ranking.entity.RankingCollection;
import com.fishiphedia.ranking.repository.RankingCollectionRepository;
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
    private final RankingCollectionRepository rankingCollectionRepository;

    // 낚시꾼 전체 랭킹 (RankingCollection 기반, certified=true만)
    @Override
    public List<FisherRankingResponse> getFisherRanking() {
        List<Object[]> results = rankingCollectionRepository.findUserTotalScoreRanking();
        return results.stream()
                .map(result -> {
                    User user = (User) result[0];
                    Long totalScore = (Long) result[1];
                    
                    FisherRankingResponse dto = new FisherRankingResponse();
                    dto.setUserId(user.getId());
                    dto.setName(user.getUserInfo() != null ? user.getUserInfo().getName() : user.getLoginId());
                    dto.setTotalScore(totalScore != null ? totalScore.intValue() : 0);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // RankingCollection 전체 랭킹 (totalScore, certified=true만)
    @Override
    public List<FishCollectionRankingResponse> getFishCollectionRanking() {
        return rankingCollectionRepository.findAllByOrderByTotalScoreDesc().stream()
                .map(rc -> {
                    FishCollectionRankingResponse dto = new FishCollectionRankingResponse();
                    dto.setUserId(rc.getUser().getId());
                    dto.setName(rc.getUser().getUserInfo() != null ? rc.getUser().getUserInfo().getName() : rc.getUser().getLoginId());
                    dto.setFishId(rc.getFish().getId());
                    dto.setFishName(rc.getFish().getName());
                    dto.setTotalScore(rc.getTotalScore());
                    dto.setHighestScore(rc.getHighestScore());
                    dto.setHighestLength(rc.getHighestLength());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // 물고기별 전체 랭킹 (highestScore, 전체 물고기, certified=true만)
    @Override
    public List<FishCollectionRankingResponse> getFishRankingAllFish() {
        return rankingCollectionRepository.findAllByOrderByHighestScoreDesc().stream()
                .map(rc -> {
                    FishCollectionRankingResponse dto = new FishCollectionRankingResponse();
                    dto.setUserId(rc.getUser().getId());
                    dto.setName(rc.getUser().getUserInfo() != null ? rc.getUser().getUserInfo().getName() : rc.getUser().getLoginId());
                    dto.setFishId(rc.getFish().getId());
                    dto.setFishName(rc.getFish().getName());
                    dto.setTotalScore(rc.getTotalScore());
                    dto.setHighestScore(rc.getHighestScore());
                    dto.setHighestLength(rc.getHighestLength());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // 특정 물고기별 랭킹 (highestScore, certified=true만)
    @Override
    public List<FishCollectionRankingResponse> getFishRankingByFish(Long fishId) {
        return rankingCollectionRepository.findByFishIdOrderByHighestScoreDesc(fishId).stream()
                .map(rc -> {
                    FishCollectionRankingResponse dto = new FishCollectionRankingResponse();
                    dto.setUserId(rc.getUser().getId());
                    dto.setName(rc.getUser().getUserInfo() != null ? rc.getUser().getUserInfo().getName() : rc.getUser().getLoginId());
                    dto.setFishId(rc.getFish().getId());
                    dto.setFishName(rc.getFish().getName());
                    dto.setTotalScore(rc.getTotalScore());
                    dto.setHighestScore(rc.getHighestScore());
                    dto.setHighestLength(rc.getHighestLength());
                    return dto;
                })
                .collect(Collectors.toList());
    }
} 