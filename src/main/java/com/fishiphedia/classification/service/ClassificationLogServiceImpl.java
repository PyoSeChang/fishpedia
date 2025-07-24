package com.fishiphedia.classification.service;

import com.fishiphedia.classification.dto.ClassificationLogRequest;
import com.fishiphedia.classification.dto.ClassificationLogResponse;
import com.fishiphedia.classification.entity.ClassificationCorrectionHistory;
import com.fishiphedia.classification.entity.ClassificationLog;
import com.fishiphedia.classification.repository.ClassificationLogRepository;
import com.fishiphedia.fish.entity.FishLog;
import com.fishiphedia.fish.repository.FishLogRepository;
import com.fishiphedia.user.entity.User;
import com.fishiphedia.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClassificationLogServiceImpl implements ClassificationLogService {
    
    private final ClassificationLogRepository classificationLogRepository;
    private final UserRepository userRepository;
    private final FishLogRepository fishLogRepository;
    
    @Value("${app.classification.storage.path:./classification_storage}")
    private String classificationStoragePath;
    
    @Override
    @Transactional
    public ClassificationLog saveClassificationLog(Long userId, ClassificationLogRequest request) {
        // 사용자 조회 (null일 수 있음)
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }
        
        // 이미지 저장 (선택적)
        String imagePath = null;
        if (request.getImageData() != null && request.getPredictedFishName() != null) {
            imagePath = saveImageFile(request.getPredictedFishName(), request.getImageData(), request.getOriginalFilename());
        }
        
        // 분류 로그 생성
        ClassificationLog classificationLog = ClassificationLog.builder()
                .user(user)
                .predictedFishName(request.getPredictedFishName())
                .confidence(request.getConfidence())
                .isFishDetected(request.getIsFishDetected())
                .imagePath(imagePath)
                .originalFilename(request.getOriginalFilename())
                .build();
        
        ClassificationLog saved = classificationLogRepository.save(classificationLog);
        log.info("분류 로그 저장 완료: 사용자={}, 예측={}, 신뢰도={}%", 
                userId != null ? userId : "비로그인", 
                request.getPredictedFishName(), 
                request.getConfidence());
        
        return saved;
    }
    
    private String saveImageFile(String fishName, byte[] imageData, String originalFilename) {
        try {
            // 로그용 폴더 구조: classification_storage/logs/어종명/
            File logsDir = new File(classificationStoragePath, "logs");
            File fishDir = new File(logsDir, fishName != null ? fishName : "unknown");
            if (!fishDir.exists()) {
                fishDir.mkdirs();
            }
            
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String extension = getFileExtension(originalFilename);
            String filename = UUID.randomUUID().toString() + "_" + timestamp + extension;
            
            File imageFile = new File(fishDir, filename);
            try (FileOutputStream fos = new FileOutputStream(imageFile)) {
                fos.write(imageData);
            }
            
            return "logs/" + (fishName != null ? fishName : "unknown") + "/" + filename;
            
        } catch (IOException e) {
            log.error("분류 로그 이미지 저장 실패: {}", e.getMessage());
            return null; // 이미지 저장 실패해도 로그는 저장
        }
    }
    
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".jpg";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
    
    @Override
    public List<ClassificationLogResponse> getUserClassificationLogs(Long userId) {
        List<ClassificationLog> logs = classificationLogRepository.findByUserIdOrderByClassificationDateDesc(userId);
        return logs.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    @Override
    public List<ClassificationLogResponse> getWrongPredictions(Long userId) {
        List<ClassificationLog> logs = classificationLogRepository
                .findByUserIdAndUserCorrectedFishNameIsNotNullOrderByUserFeedbackDateDesc(userId);
        return logs.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public ClassificationLog updateUserFeedback(Long logId, String correctedFishName, Boolean isCorrect, String reason) {
        ClassificationLog log = classificationLogRepository.findById(logId)
                .orElseThrow(() -> new IllegalArgumentException("분류 로그를 찾을 수 없습니다."));
        
        String oldFishName = log.getUserCorrectedFishName() != null ? 
                log.getUserCorrectedFishName() : log.getPredictedFishName();
        
        // 피드백 업데이트
        log.setUserCorrectedFishName(correctedFishName);
        log.setIsCorrect(isCorrect);
        log.setUserFeedbackDate(LocalDateTime.now());
        
        // 수정 이력 추가
        if (!oldFishName.equals(correctedFishName)) {
            ClassificationCorrectionHistory history = ClassificationCorrectionHistory.builder()
                    .classificationLog(log)
                    .oldFishName(oldFishName)
                    .newFishName(correctedFishName)
                    .correctionReason(reason)
                    .build();
            
            log.getCorrectionHistories().add(history);
        }
        
        return classificationLogRepository.save(log);
    }
    
    @Override
    @Transactional
    public ClassificationLog linkToFishLog(Long logId, Long fishLogId) {
        ClassificationLog log = classificationLogRepository.findById(logId)
                .orElseThrow(() -> new IllegalArgumentException("분류 로그를 찾을 수 없습니다."));
        
        FishLog fishLog = fishLogRepository.findById(fishLogId)
                .orElseThrow(() -> new IllegalArgumentException("낚시 일지를 찾을 수 없습니다."));
        
        log.setFishLog(fishLog);
        return classificationLogRepository.save(log);
    }

    @Override
    @Transactional
    public ClassificationLog updateUserSelectedFish(Long logId, String selectedFishName) {
        ClassificationLog log = classificationLogRepository.findById(logId)
                .orElseThrow(() -> new IllegalArgumentException("분류 로그를 찾을 수 없습니다."));
        
        // AI가 예측한 물고기명과 사용자가 선택한 물고기명 비교
        String predictedFishName = log.getPredictedFishName();
        boolean isCorrect = predictedFishName != null && predictedFishName.equals(selectedFishName);
        
        // 사용자 피드백 업데이트
        log.setUserCorrectedFishName(selectedFishName);
        log.setIsCorrect(isCorrect);
        log.setUserFeedbackDate(LocalDateTime.now());
        
        // 수정 이력 추가 (다른 경우에만)
        if (!isCorrect) {
            ClassificationCorrectionHistory history = ClassificationCorrectionHistory.builder()
                    .classificationLog(log)
                    .oldFishName(predictedFishName)
                    .newFishName(selectedFishName)
                    .correctionReason("사용자가 낚시 일지 작성 시 다른 물고기 선택")
                    .build();
            
            if (log.getCorrectionHistories() == null) {
                log.setCorrectionHistories(List.of(history));
            } else {
                log.getCorrectionHistories().add(history);
            }
        }
        
        ClassificationLog saved = classificationLogRepository.save(log);

        
        return saved;
    }

    @Override
    public ClassificationLogResponse getClassificationLog(Long logId) {
        ClassificationLog log = classificationLogRepository.findById(logId)
                .orElseThrow(() -> new IllegalArgumentException("분류 로그를 찾을 수 없습니다."));
        return convertToResponse(log);
    }
    
    @Override
    public Object[] getModelPerformanceStats() {
        return classificationLogRepository.getModelPerformanceStats();
    }
    
    @Override
    public List<Object[]> getWrongPredictionPatterns() {
        return classificationLogRepository.getWrongPredictionStats();
    }
    
    private ClassificationLogResponse convertToResponse(ClassificationLog log) {
        return ClassificationLogResponse.builder()
                .id(log.getId())
                .userId(log.getUser() != null ? log.getUser().getId() : null)
                .predictedFishName(log.getPredictedFishName())
                .confidence(log.getConfidence())
                .isFishDetected(log.getIsFishDetected())
                .imagePath(log.getImagePath())
                .originalFilename(log.getOriginalFilename())
                .classificationDate(log.getClassificationDate())
                .userCorrectedFishName(log.getUserCorrectedFishName())
                .isCorrect(log.getIsCorrect())
                .userFeedbackDate(log.getUserFeedbackDate())
                .fishLogId(log.getFishLog() != null ? log.getFishLog().getId() : null)
                .isHighConfidence(isHighConfidence(log.getConfidence(), log.getPredictedFishName()))
                .needsReview(log.getIsCorrect() == null && log.getIsFishDetected() == Boolean.TRUE)
                .build();
    }
    
    private Boolean isHighConfidence(BigDecimal confidence, String fishName) {
        if (confidence == null) return false;
        
        if ("넙치".equals(fishName) || "도다리".equals(fishName)) {
            return confidence.compareTo(BigDecimal.valueOf(90)) >= 0;
        }
        return confidence.compareTo(BigDecimal.valueOf(99)) >= 0;
    }
}