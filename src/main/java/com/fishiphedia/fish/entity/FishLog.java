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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "fish_log")
@Getter
@Setter
@NoArgsConstructor
public class FishLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fish_id", nullable = false)
    private Fish fish;
    
    @Column(name = "collect_at", nullable = false)
    private LocalDate collectAt;
    
    @Column(name = "length", nullable = false)
    private Double length;
    
    @Column(name = "score", nullable = false)
    private Integer score;
    
    @Column(name = "place")
    private String place;
    
    @Column(name = "review", columnDefinition = "TEXT")
    private String review;
    
    @Column(name = "img_path")
    private String imgPath;
    
    @Column(name = "certified", nullable = false)
    private Boolean certified = false;
} 