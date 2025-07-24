package com.fishiphedia.classification.entity;

import com.fishiphedia.fish.entity.FishLog;
import com.fishiphedia.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "classification_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassificationLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;
    
    @Column(name = "predicted_fish_name")
    private String predictedFishName;
    
    @Column(name = "confidence", precision = 5, scale = 2)
    private BigDecimal confidence;
    
    @Column(name = "is_fish_detected")
    private Boolean isFishDetected;
    
    @Column(name = "image_path", length = 500)
    private String imagePath;
    
    @Column(name = "original_filename")
    private String originalFilename;
    
    @Column(name = "classification_date")
    private LocalDateTime classificationDate;
    
    // 사용자 피드백 관련 (오답노트)
    @Column(name = "user_corrected_fish_name")
    private String userCorrectedFishName;
    
    @Column(name = "is_correct")
    private Boolean isCorrect;
    
    @Column(name = "user_feedback_date")
    private LocalDateTime userFeedbackDate;
    
    // 낚시 일지 연결
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fish_log_id")
    private FishLog fishLog;
    
    // 수정 이력
    @OneToMany(mappedBy = "classificationLog", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ClassificationCorrectionHistory> correctionHistories;
    
    @PrePersist
    protected void onCreate() {
        if (classificationDate == null) {
            classificationDate = LocalDateTime.now();
        }
    }
}