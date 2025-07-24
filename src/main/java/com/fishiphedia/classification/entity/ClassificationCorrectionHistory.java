package com.fishiphedia.classification.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "classification_correction_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassificationCorrectionHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classification_log_id", nullable = false)
    private ClassificationLog classificationLog;
    
    @Column(name = "old_fish_name")
    private String oldFishName;
    
    @Column(name = "new_fish_name")
    private String newFishName;
    
    @Column(name = "correction_reason", columnDefinition = "TEXT")
    private String correctionReason;
    
    @Column(name = "correction_date")
    private LocalDateTime correctionDate;
    
    @PrePersist
    protected void onCreate() {
        if (correctionDate == null) {
            correctionDate = LocalDateTime.now();
        }
    }
}