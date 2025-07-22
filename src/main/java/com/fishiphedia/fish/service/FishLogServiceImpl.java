package com.fishiphedia.fish.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fishiphedia.fish.dto.FishLogCreateResponse;
import com.fishiphedia.fish.dto.FishLogRequest;
import com.fishiphedia.fish.dto.FishLogResponse;
import com.fishiphedia.fish.dto.LevelUpdateResult;
import com.fishiphedia.fish.entity.Fish;
import com.fishiphedia.fish.entity.FishLog;
import com.fishiphedia.fish.repository.FishLogRepository;
import com.fishiphedia.fish.repository.FishRepository;
import com.fishiphedia.user.entity.User;
import com.fishiphedia.ranking.service.RankingCollectionService;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
@Transactional
public class FishLogServiceImpl implements FishLogService {

    private final FishLogRepository fishLogRepository;
    private final FishRepository fishRepository;
    private final FishCollectionService fishCollectionService;
    private final RankingCollectionService rankingCollectionService;
    private static final Logger log = LoggerFactory.getLogger(FishLogServiceImpl.class);

    @Override
    public FishLog createFishLog(FishLogRequest request, User user) {
        // 물고기 조회
        Fish fish = fishRepository.findById(request.getFishId())
                .orElseThrow(() -> new RuntimeException("물고기를 찾을 수 없습니다."));

        // 점수 계산
        int score = calculateScore(fish, request.getLength());

        // FishLog 생성
        FishLog fishLog = new FishLog();
        fishLog.setUser(user);
        fishLog.setFish(fish);
        fishLog.setCollectAt(LocalDate.now());
        fishLog.setLength(request.getLength());
        fishLog.setScore(score);
        fishLog.setPlace(request.getPlace());
        fishLog.setReview(request.getReview());
        fishLog.setImgPath(request.getImgPath());
        fishLog.setCertified(false); // 기본값: 검증되지 않음

        FishLog savedFishLog = fishLogRepository.save(fishLog);

        // FishCollection 업데이트 (FishCollectionService 사용)
        fishCollectionService.updateFishCollection(user, fish, score, request.getLength());

        return savedFishLog;
    }

    @Override
    public FishLogCreateResponse createFishLogWithLevel(FishLogRequest request, User user) {
        // 물고기 조회
        Fish fish = fishRepository.findById(request.getFishId())
                .orElseThrow(() -> new RuntimeException("물고기를 찾을 수 없습니다."));

        // 점수 계산
        int score = calculateScore(fish, request.getLength());

        // FishLog 생성
        FishLog fishLog = new FishLog();
        fishLog.setUser(user);
        fishLog.setFish(fish);
        fishLog.setCollectAt(LocalDate.now());
        fishLog.setLength(request.getLength());
        fishLog.setScore(score);
        fishLog.setPlace(request.getPlace());
        fishLog.setReview(request.getReview());
        fishLog.setImgPath(request.getImgPath());
        fishLog.setCertified(false); // 기본값: 검증되지 않음

        FishLog savedFishLog = fishLogRepository.save(fishLog);

        // FishCollection 업데이트 (레벨 포함)
        var levelUpdateResult = fishCollectionService.updateFishCollectionWithLevel(user, fish, score, request.getLength());

        // 응답 생성
        FishLogResponse fishLogResponse = convertToResponse(savedFishLog);
        
        return FishLogCreateResponse.builder()
                .fishLog(fishLogResponse)
                .levelUpdateResult(levelUpdateResult)
                .fishId(fish.getId().intValue())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FishLog> getUserFishLogs(User user) {
        return fishLogRepository.findByUserOrderByCollectAtDesc(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FishLog> getUserFishLogsByFish(User user, Long fishId) {
        log.info("특정 물고기 일지 조회 - 사용자: {}, fishId: {}", user.getLoginId(), fishId);
        List<FishLog> fishLogs = fishLogRepository.findByUserAndFishIdOrderByCollectAtDesc(user, fishId);
        log.info("조회된 일지 개수: {}", fishLogs.size());
        return fishLogs;
    }

    @Override
    @Transactional(readOnly = true)
    public FishLog getFishLogById(Long id, User user) {
        return fishLogRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("낚시 일지를 찾을 수 없습니다."));
    }

    @Override
    @Transactional
    public boolean verifyFishLog(Long fishLogId, User user) {
        // 낚시 일지 조회
        FishLog fishLog = fishLogRepository.findByIdAndUser(fishLogId, user)
                .orElseThrow(() -> new RuntimeException("낚시 일지를 찾을 수 없습니다."));
        
        // TODO: 실제 검증 로직 구현 (AI 분석, 관리자 검토 등)
        // 현재는 항상 true로 설정하고 certified 필드 업데이트
        fishLog.setCertified(true);
        FishLog savedFishLog = fishLogRepository.save(fishLog);
        
        // RankingCollection 업데이트
        rankingCollectionService.updateRankingCollection(savedFishLog);
        
        log.info("FishLog 검증 완료 - ID: {}, User: {}, Fish: {}", 
                fishLogId, user.getLoginId(), fishLog.getFish().getName());
        
        return true;
    }

    // 점수 계산 로직
    private int calculateScore(Fish fish, Double length) {
        // 기본 점수 (희귀도 기반)
        int baseScore = 100;
        
        // 길이에 따른 가중치 계산
        double avgLength = fish.getAvgLength();
        double stdDeviation = fish.getStdDeviation();
        
        // 평균 대비 길이 비율
        double lengthRatio = length / avgLength;
        
        // 표준편차를 고려한 점수 계산
        double zScore = (length - avgLength) / stdDeviation;
        double lengthBonus = Math.max(0, zScore * 50); // 표준편차당 50점 보너스
        
        int totalScore = (int) (baseScore + lengthBonus);
        
        return Math.max(1, totalScore); // 최소 1점 보장
    }

    // FishLogResponse 변환 메서드
    private FishLogResponse convertToResponse(FishLog fishLog) {
        return FishLogResponse.builder()
                .id(fishLog.getId())
                .fishId(fishLog.getFish().getId())
                .fishName(fishLog.getFish().getName())
                .collectAt(fishLog.getCollectAt())
                .length(fishLog.getLength())
                .score(fishLog.getScore())
                .place(fishLog.getPlace())
                .review(fishLog.getReview())
                .imgPath(fishLog.getImgPath())
                .build();
    }
} 