package com.fishiphedia.ranking.service;

import com.fishiphedia.fish.entity.Fish;
import com.fishiphedia.fish.entity.FishLog;
import com.fishiphedia.fish.repository.FishLogRepository;
import com.fishiphedia.ranking.entity.RankingCollection;
import com.fishiphedia.ranking.repository.RankingCollectionRepository;
import com.fishiphedia.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class RankingCollectionServiceImpl implements RankingCollectionService {
    
    private final RankingCollectionRepository rankingCollectionRepository;
    private final FishLogRepository fishLogRepository;
    
    @Override
    public void updateRankingCollection(FishLog fishLog) {
        if (!fishLog.getCertified()) {
            log.warn("FishLog ID {}는 certified=false 상태입니다.", fishLog.getId());
            return;
        }
        
        User user = fishLog.getUser();
        Fish fish = fishLog.getFish();
        
        // RankingCollection 조회 또는 생성
        RankingCollection rankingCollection = getOrCreateRankingCollection(user, fish);
        
        // certified=true인 모든 FishLog로 재계산
        recalculateRankingCollection(user, fish);
        
        log.info("RankingCollection 업데이트 완료 - User: {}, Fish: {}", user.getLoginId(), fish.getName());
    }
    
    @Override
    public RankingCollection getOrCreateRankingCollection(User user, Fish fish) {
        return rankingCollectionRepository.findByUserAndFish(user, fish)
                .orElseGet(() -> {
                    RankingCollection newCollection = new RankingCollection();
                    newCollection.setUser(user);
                    newCollection.setFish(fish);
                    newCollection.setHighestScore(0);
                    newCollection.setHighestLength(0.0);
                    newCollection.setTotalScore(0);
                    newCollection.setCatchCount(0);
                    return rankingCollectionRepository.save(newCollection);
                });
    }
    
    @Override
    public void recalculateRankingCollection(User user, Fish fish) {
        RankingCollection rankingCollection = getOrCreateRankingCollection(user, fish);
        
        // certified=true인 FishLog들만 조회
        List<FishLog> certifiedLogs = fishLogRepository.findByUserAndFishIdAndCertifiedTrueOrderByCollectAtDesc(user, fish.getId());
        
        if (certifiedLogs.isEmpty()) {
            // certified 로그가 없으면 모든 값을 0으로 초기화
            rankingCollection.setHighestScore(0);
            rankingCollection.setHighestLength(0.0);
            rankingCollection.setTotalScore(0);
            rankingCollection.setCatchCount(0);
        } else {
            // 최고 점수 계산
            int highestScore = certifiedLogs.stream()
                    .mapToInt(FishLog::getScore)
                    .max()
                    .orElse(0);
            
            // 최고 길이 계산
            double highestLength = certifiedLogs.stream()
                    .mapToDouble(FishLog::getLength)
                    .max()
                    .orElse(0.0);
            
            // 총 점수 계산
            int totalScore = certifiedLogs.stream()
                    .mapToInt(FishLog::getScore)
                    .sum();
            
            // 잡은 횟수
            int catchCount = certifiedLogs.size();
            
            rankingCollection.setHighestScore(highestScore);
            rankingCollection.setHighestLength(highestLength);
            rankingCollection.setTotalScore(totalScore);
            rankingCollection.setCatchCount(catchCount);
        }
        
        rankingCollectionRepository.save(rankingCollection);
        log.info("RankingCollection 재계산 완료 - User: {}, Fish: {}, 점수: {}, 길이: {}, 총점: {}, 횟수: {}", 
                user.getLoginId(), fish.getName(), 
                rankingCollection.getHighestScore(), rankingCollection.getHighestLength(), 
                rankingCollection.getTotalScore(), rankingCollection.getCatchCount());
    }
}