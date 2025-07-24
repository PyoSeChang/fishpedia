package com.fishiphedia.fish.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Async;

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
import com.fishiphedia.classification.service.ClassificationLogService;

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
    private final ClassificationLogService classificationLogService;
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

        // 분류 로그와 연결 및 사용자 선택 물고기 업데이트 (분류 로그 ID가 있는 경우)
        if (request.getClassificationLogId() != null) {
            try {
                classificationLogService.linkToFishLog(request.getClassificationLogId(), savedFishLog.getId());
                log.info("분류 로그 {} 와 낚시 일지 {} 연결 완료", request.getClassificationLogId(), savedFishLog.getId());
                
                // 비동기로 사용자 선택 물고기 업데이트
                updateClassificationLogAsync(request.getClassificationLogId(), fish.getName());
            } catch (Exception e) {
                log.warn("분류 로그 연결 실패: {}", e.getMessage());
            }
        }

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

        // 분류 로그와 연결 및 사용자 선택 물고기 업데이트 (분류 로그 ID가 있는 경우)
        if (request.getClassificationLogId() != null) {
            try {
                classificationLogService.linkToFishLog(request.getClassificationLogId(), savedFishLog.getId());
                log.info("분류 로그 {} 와 낚시 일지 {} 연결 완료", request.getClassificationLogId(), savedFishLog.getId());
                
                // 비동기로 사용자 선택 물고기 업데이트
                updateClassificationLogAsync(request.getClassificationLogId(), fish.getName());
            } catch (Exception e) {
                log.warn("분류 로그 연결 실패: {}", e.getMessage());
            }
        }

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

    // 새로운 점수 계산 로직: rarity + 길이 백분율에 따른 가중치 * 길이 제곱근
    private int calculateScore(Fish fish, Double length) {
        if (length == null || length <= 0) {
            return 50; // 기본 점수
        }
        
        int rarity = fish.getRarityScore(); // 희귀도 점수
        double avgLength = fish.getAvgLength(); // 평균 길이
        double stdDeviation = fish.getStdDeviation(); // 표준편차
        
        // 길이 백분율 계산 (해당 어종에서 이 길이가 어느 정도 위치인지)
        double lengthPercentile = calculateLengthPercentile(length, avgLength, stdDeviation);
        
        // 비선형 가중치: 상위권은 큰 보상, 하위권은 완만한 감소
        double lengthWeight = calculateNonLinearWeight(lengthPercentile);
        
        // 새로운 공식: rarity + 길이가중치 * 길이 제곱근
        double score = rarity + (lengthWeight * Math.sqrt(length));
        
        // 점수 제한 없음 (최소 1점만 보장)
        int finalScore = Math.max(1, (int) Math.round(score));
        
        log.info("점수 계산 - 물고기: {}, 길이: {}cm, 희귀도: {}, 백분율: {:.1f}%, 가중치: {:.2f}, 최종점수: {}", 
                fish.getName(), length, rarity, lengthPercentile, lengthWeight, finalScore);
        
        return finalScore;
    }
    
    /**
     * 비선형 가중치 계산: 상위권 큰 보상, 하위권 완만한 감소
     * @param percentile 백분율 (0-100)
     * @return 가중치 (0.3 ~ 3.0)
     */
    private double calculateNonLinearWeight(double percentile) {
        if (percentile >= 99.0) {
            // 상위 1%: 최대 보상 (뽕맛)
            return 3.0;
        } else if (percentile >= 95.0) {
            // 상위 5%: 큰 보상
            return 2.0 + (percentile - 95.0) / 4.0; // 2.0 ~ 3.0
        } else if (percentile >= 90.0) {
            // 상위 10%: 중간 보상
            return 1.5 + (percentile - 90.0) / 10.0; // 1.5 ~ 2.0
        } else if (percentile >= 75.0) {
            // 상위 25%: 작은 보상
            return 1.2 + (percentile - 75.0) / 50.0; // 1.2 ~ 1.5
        } else if (percentile >= 50.0) {
            // 상위 50%: 기본 가중치 근처
            return 1.0 + (percentile - 50.0) / 125.0; // 1.0 ~ 1.2
        } else {
            // 하위 50%: 완만한 감소 (최소 점수 보장)
            return 0.3 + (percentile / 50.0) * 0.7; // 0.3 ~ 1.0
        }
    }
    
    /**
     * 길이의 백분율을 계산 (정규분포 가정)
     * @param length 실제 길이
     * @param avgLength 평균 길이
     * @param stdDeviation 표준편차
     * @return 백분율 (0-100)
     */
    private double calculateLengthPercentile(double length, double avgLength, double stdDeviation) {
        if (stdDeviation <= 0) {
            return length >= avgLength ? 75.0 : 25.0; // 표준편차가 0이면 평균 기준으로 구분
        }
        
        // Z-score 계산
        double zScore = (length - avgLength) / stdDeviation;
        
        // Z-score를 백분율로 변환 (근사치)
        double percentile = 50.0 + (zScore * 34.13); // 68-95-99.7 법칙 사용
        
        // 0-100 범위로 제한
        return Math.max(0.0, Math.min(100.0, percentile));
    }

    /**
     * 분류 로그의 사용자 선택 물고기를 비동기로 업데이트
     */
    @Async
    public void updateClassificationLogAsync(Long classificationLogId, String selectedFishName) {
        try {
            classificationLogService.updateUserSelectedFish(classificationLogId, selectedFishName);
            log.info("분류 로그 비동기 업데이트 완료: 로그ID={}, 선택물고기={}", classificationLogId, selectedFishName);
        } catch (Exception e) {
            log.error("분류 로그 비동기 업데이트 실패: 로그ID={}, 오류={}", classificationLogId, e.getMessage());
        }
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