package com.fishiphedia.fish.controller;

import com.fishiphedia.classification.dto.ClassificationLogRequest;
import com.fishiphedia.classification.dto.ClassificationStorageRequest;
import com.fishiphedia.classification.entity.ClassificationLog;
import com.fishiphedia.classification.service.ClassificationLogService;
import com.fishiphedia.classification.service.ClassificationStorageService;
import com.fishiphedia.common.service.FishClassificationService;
import com.fishiphedia.common.util.JwtUtil;
import com.fishiphedia.user.entity.User;
import com.fishiphedia.user.repository.UserRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/fish/classification")
public class FishClassificationController {

    private final FishClassificationService fishClassificationService;
    private final ClassificationStorageService classificationStorageService;
    private final ClassificationLogService classificationLogService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public FishClassificationController(
            FishClassificationService fishClassificationService,
            ClassificationStorageService classificationStorageService,
            ClassificationLogService classificationLogService,
            JwtUtil jwtUtil,
            UserRepository userRepository
    ) {
        this.fishClassificationService = fishClassificationService;
        this.classificationStorageService = classificationStorageService;
        this.classificationLogService = classificationLogService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @PostMapping(value = "/predict", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> classifyFish(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "Authorization", required = false) String token
    ) {
        try {
            // 파일 유효성 검사
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("파일이 비어있습니다.");
            }

            if (!file.getContentType().startsWith("image/")) {
                return ResponseEntity.badRequest().body("이미지 파일만 업로드 가능합니다.");
            }

            // 파일 크기 제한 (예: 10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("파일 크기가 너무 큽니다. (최대 10MB)");
            }

            // FastAPI로 분류 요청
            FishClassificationService.ClassificationResult result = fishClassificationService.classifyFish(file);
            
            // 신뢰도 기반 추가 검증
            boolean isDetectionValid = validateDetection(result);
            
            // 검증 결과를 바탕으로 최종 판정 업데이트
            if (!isDetectionValid) {
                result.setIsFishDetected(false);
                result.setDetectedFishName(null);
            }

            // 1. 모든 분류 시도를 로그로 저장
            Long classificationLogId = null;
            try {
                classificationLogId = saveClassificationLog(token, file, result);
            } catch (Exception e) {
                System.err.println("분류 로그 저장 실패: " + e.getMessage());
            }
            
            // 2. 고신뢰도 분류 결과는 별도 저장 (기존 기능 유지)
            if (result.getIsFishDetected()) {
                try {
                    saveHighConfidenceClassification(token, file, result);
                } catch (Exception e) {
                    System.err.println("고신뢰도 분류 결과 저장 실패: " + e.getMessage());
                }
            }

            // 3. 응답에 로그 ID 포함
            if (classificationLogId != null) {
                result.setClassificationLogId(classificationLogId);
            }

            return ResponseEntity.ok(result);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("파일 처리 중 오류가 발생했습니다: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("물고기 분류 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @GetMapping("/health")
    public ResponseEntity<FishClassificationService.HealthStatus> checkHealth() {
        FishClassificationService.HealthStatus health = fishClassificationService.checkHealth();
        return ResponseEntity.ok(health);
    }

    // TODO: 추후 분류 히스토리 조회 API 추가 가능
    // @GetMapping("/history")
    // public ResponseEntity<List<ClassificationHistory>> getClassificationHistory() { ... }

    // TODO: 추후 분류 통계 API 추가 가능
    // @GetMapping("/stats")
    // public ResponseEntity<ClassificationStats> getClassificationStats() { ... }
    
    /**
     * 신뢰도 기반 물고기 탐지 검증
     * - 넙치, 도다리: 90% 이상
     * - 기타 어종: 99% 이상
     */
    private boolean validateDetection(FishClassificationService.ClassificationResult result) {
        if (result == null || result.getPredictedFish() == null || result.getConfidence() == null) {
            return false;
        }
        
        String predictedFish = result.getPredictedFish();
        double confidence = result.getConfidence();
        
        // 넙치, 도다리는 90% 이상
        if ("넙치".equals(predictedFish) || "도다리".equals(predictedFish)) {
            return confidence >= 0.90;
        }
        
        // 나머지 어종은 99% 이상
        return confidence >= 0.99;
    }
    
    /**
     * 고신뢰도 분류 결과 저장 (비로그인 유저도 가능)
     */
    private void saveHighConfidenceClassification(String token, MultipartFile file, FishClassificationService.ClassificationResult result) {
        try {
            Long userId = null;
            
            // 토큰이 있으면 사용자 ID 추출 시도
            if (token != null && !token.trim().isEmpty()) {
                try {
                    String actualToken = token.startsWith("Bearer ") ? token.substring(7) : token;
                    String loginId = jwtUtil.getLoginIdFromToken(actualToken);
                    
                    // loginId로 실제 사용자 ID 조회
                    User user = userRepository.findByLoginId(loginId).orElse(null);
                    if (user != null) {
                        userId = user.getId();
                    }
                    
                } catch (Exception e) {
                    // 토큰 추출 실패해도 비로그인으로 계속 진행
                    System.out.println("토큰 추출 실패, 비로그인으로 분류 결과 저장: " + e.getMessage());
                }
            }
            
            // 신뢰도를 BigDecimal로 변환 (퍼센트 단위)
            BigDecimal confidence = BigDecimal.valueOf(result.getConfidence() * 100);
            
            // 고신뢰도 검증
            if (classificationStorageService.isHighConfidence(confidence)) {
                ClassificationStorageRequest request = ClassificationStorageRequest.builder()
                        .predictedFishName(result.getPredictedFish())
                        .confidence(confidence)
                        .originalFilename(file.getOriginalFilename())
                        .imageData(file.getBytes())
                        .build();
                
                classificationStorageService.saveHighConfidenceClassification(userId, request);
            }
            
        } catch (IOException e) {
            System.err.println("이미지 파일 처리 중 오류: " + e.getMessage());
            throw new RuntimeException("이미지 파일 처리 실패", e);
        } catch (Exception e) {
            System.err.println("고신뢰도 분류 결과 저장 중 오류: " + e.getMessage());
            throw new RuntimeException("분류 결과 저장 실패", e);
        }
    }
    
    /**
     * 모든 분류 시도를 로그로 저장
     */
    private Long saveClassificationLog(String token, MultipartFile file, FishClassificationService.ClassificationResult result) {
        try {
            Long userId = null;
            
            // 토큰이 있으면 사용자 ID 추출 시도
            if (token != null && !token.trim().isEmpty()) {
                try {
                    String actualToken = token.startsWith("Bearer ") ? token.substring(7) : token;
                    String loginId = jwtUtil.getLoginIdFromToken(actualToken);
                    User user = userRepository.findByLoginId(loginId).orElse(null);
                    if (user != null) {
                        userId = user.getId();
                    }
                } catch (Exception e) {
                    System.out.println("토큰 추출 실패, 비로그인으로 분류 로그 저장: " + e.getMessage());
                }
            }
            
            // 신뢰도를 BigDecimal로 변환 (퍼센트 단위)
            BigDecimal confidence = result.getConfidence() != null ? 
                    BigDecimal.valueOf(result.getConfidence() * 100) : null;
            
            // 분류 로그 요청 생성
            ClassificationLogRequest logRequest = ClassificationLogRequest.builder()
                    .predictedFishName(result.getPredictedFish())
                    .confidence(confidence)
                    .isFishDetected(result.getIsFishDetected())
                    .originalFilename(file.getOriginalFilename())
                    .imageData(file.getBytes()) // 모든 이미지를 로그용 폴더에 저장
                    .build();
            
            ClassificationLog savedLog = classificationLogService.saveClassificationLog(userId, logRequest);
            return savedLog.getId();
            
        } catch (Exception e) {
            System.err.println("분류 로그 저장 중 오류: " + e.getMessage());
            throw new RuntimeException("분류 로그 저장 실패", e);
        }
    }
}