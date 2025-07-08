package com.fishiphedia.ranking.controller;

import com.fishiphedia.ranking.dto.FisherRankingResponse;
import com.fishiphedia.ranking.dto.FishCollectionRankingResponse;
import com.fishiphedia.ranking.service.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ranking")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RankingController {

    private final RankingService rankingService;

    // 낚시꾼 전체 랭킹 (UserInfo.totalScore)
    @GetMapping("/fisher")
    public ResponseEntity<List<FisherRankingResponse>> getFisherRanking() {
        return ResponseEntity.ok(rankingService.getFisherRanking());
    }

    // FishCollection 전체 랭킹 (totalScore)
    @GetMapping("/fish-collection")
    public ResponseEntity<List<FishCollectionRankingResponse>> getFishCollectionRanking() {
        return ResponseEntity.ok(rankingService.getFishCollectionRanking());
    }

    // 물고기별 전체 랭킹 (highestScore)
    @GetMapping("/fish")
    public ResponseEntity<List<FishCollectionRankingResponse>> getFishRanking() {
        return ResponseEntity.ok(rankingService.getFishRankingAllFish());
    }

    // 특정 물고기별 랭킹 (highestScore)
    @GetMapping("/fish/{fishId}")
    public ResponseEntity<List<FishCollectionRankingResponse>> getFishRankingByFish(@PathVariable Long fishId) {
        return ResponseEntity.ok(rankingService.getFishRankingByFish(fishId));
    }
} 