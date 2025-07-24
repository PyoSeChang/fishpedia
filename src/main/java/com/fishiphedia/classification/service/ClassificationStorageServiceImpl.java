package com.fishiphedia.classification.service;

import com.fishiphedia.classification.dto.ClassificationStorageRequest;
import com.fishiphedia.classification.entity.ClassificationStorage;
import com.fishiphedia.classification.repository.ClassificationStorageRepository;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class ClassificationStorageServiceImpl implements ClassificationStorageService {
    
    private final ClassificationStorageRepository classificationStorageRepository;
    private final UserRepository userRepository;
    
    @Value("${app.classification.storage.path:./classification_storage}")
    private String classificationStoragePath;
    
    @Value("${app.classification.confidence.threshold:90}")
    private BigDecimal confidenceThreshold;
    
    @Override
    @Transactional
    public ClassificationStorage saveHighConfidenceClassification(Long userId, ClassificationStorageRequest request) {
        // 신뢰도 검증
        if (!isHighConfidence(request.getConfidence())) {
            throw new IllegalArgumentException("분류 신뢰도가 충분하지 않습니다. (최소 " + confidenceThreshold + "% 필요)");
        }
        
        // 사용자 조회 (null일 수 있음 - 비로그인 유저)
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId)
                    .orElse(null); // 사용자를 찾을 수 없어도 저장 계속 진행
        }
        
        // 이미지 파일 저장
        String imagePath = saveImageFile(request.getPredictedFishName(), request.getImageData(), request.getOriginalFilename());
        
        // 분류 결과 엔티티 생성
        ClassificationStorage classificationStorage = ClassificationStorage.builder()
                .user(user) // null일 수 있음
                .predictedFishName(request.getPredictedFishName())
                .confidence(request.getConfidence())
                .imagePath(imagePath)
                .originalFilename(request.getOriginalFilename())
                .build();
        
        ClassificationStorage saved = classificationStorageRepository.save(classificationStorage);
        log.info("고신뢰도 분류 결과 저장 완료: 사용자={}, 어종={}, 신뢰도={}%", 
                userId != null ? userId : "비로그인", request.getPredictedFishName(), request.getConfidence());
        
        return saved;
    }
    
    private String saveImageFile(String fishName, byte[] imageData, String originalFilename) {
        try {
            // 어종별 폴더 생성
            File fishDir = new File(classificationStoragePath, fishName);
            if (!fishDir.exists()) {
                fishDir.mkdirs();
            }
            
            // 파일명 생성 (UUID + 타임스탬프 + 원본 확장자)
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String extension = getFileExtension(originalFilename);
            String filename = UUID.randomUUID().toString() + "_" + timestamp + extension;
            
            // 파일 저장
            File imageFile = new File(fishDir, filename);
            try (FileOutputStream fos = new FileOutputStream(imageFile)) {
                fos.write(imageData);
            }
            
            // 상대 경로 반환
            return fishName + "/" + filename;
            
        } catch (IOException e) {
            log.error("이미지 파일 저장 실패: {}", e.getMessage());
            throw new RuntimeException("이미지 파일 저장에 실패했습니다.", e);
        }
    }
    
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".jpg"; // 기본 확장자
        }
        return filename.substring(filename.lastIndexOf("."));
    }
    
    @Override
    public List<ClassificationStorage> getClassificationsByFishName(String fishName) {
        return classificationStorageRepository.findByPredictedFishName(fishName);
    }
    
    @Override
    public List<ClassificationStorage> getClassificationsByConfidence(BigDecimal minConfidence) {
        return classificationStorageRepository.findByConfidenceGreaterThanEqual(minConfidence);
    }
    
    @Override
    public List<ClassificationStorage> getUserClassifications(Long userId) {
        return classificationStorageRepository.findByUserId(userId);
    }
    
    @Override
    public List<Object[]> getClassificationStatsByFish() {
        return classificationStorageRepository.countByFishName();
    }
    
    @Override
    public Object[] getConfidenceStatistics() {
        return classificationStorageRepository.getConfidenceStatistics();
    }
    
    @Override
    public boolean isHighConfidence(BigDecimal confidence) {
        return confidence != null && confidence.compareTo(confidenceThreshold) >= 0;
    }
}