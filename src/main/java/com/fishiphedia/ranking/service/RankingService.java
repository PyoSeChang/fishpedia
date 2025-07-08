package com.fishiphedia.ranking.service;

import com.fishiphedia.ranking.dto.FisherRankingResponse;
import com.fishiphedia.ranking.dto.FishCollectionRankingResponse;
import java.util.List;

public interface RankingService {
    List<FisherRankingResponse> getFisherRanking();
    List<FishCollectionRankingResponse> getFishCollectionRanking();
    List<FishCollectionRankingResponse> getFishRankingAllFish();
    List<FishCollectionRankingResponse> getFishRankingByFish(Long fishId);
} 