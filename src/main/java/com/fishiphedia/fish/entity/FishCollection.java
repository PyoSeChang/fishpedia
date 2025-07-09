package com.fishiphedia.fish.entity;

import java.time.LocalDate;

import com.fishiphedia.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.Index;

@Entity
@Table(
    name = "fish_collection",
    indexes = {
        @Index(name = "idx_fish_id", columnList = "fish_id"),
        @Index(name = "idx_highest_score", columnList = "highest_score"),
        @Index(name = "idx_total_score", columnList = "total_score"),
        @Index(name = "idx_user_id", columnList = "user_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class FishCollection {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fish_id", nullable = false)
    private Fish fish;
    
    @Column(name = "is_collect", nullable = false)
    private Boolean isCollect = false;
    
    @Column(name = "collect_at")
    private LocalDate collectAt;
    
    @Column(name = "highest_score")
    private Integer highestScore = 0;

    @Column(name = "total_score")
    private Integer totalScore = 0;
    
    @Column(name = "highest_length")
    private Double highestLength = 0.0;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "highest_log_id")
    private FishLog highestLog;

    @Column(name = "level", nullable = false)
    private Integer level = 1;

    @Column(name = "current_level_progress", nullable= false)
    private Double currentLevelProgress = 0.0;
} 