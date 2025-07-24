package com.fishiphedia.classification.entity;

import com.fishiphedia.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "classification_storage")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassificationStorage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;
    
    @Column(name = "predicted_fish_name", nullable = false)
    private String predictedFishName;
    
    @Column(name = "confidence", nullable = false, precision = 5, scale = 2)
    private BigDecimal confidence;
    
    @Column(name = "image_path", nullable = false, length = 500)
    private String imagePath;
    
    @Column(name = "original_filename")
    private String originalFilename;
    
    @Column(name = "classification_date")
    private LocalDateTime classificationDate;
    
    @PrePersist
    protected void onCreate() {
        classificationDate = LocalDateTime.now();
    }
}