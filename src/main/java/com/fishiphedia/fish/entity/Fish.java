package com.fishiphedia.fish.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "fish")
@Getter
@Setter
@NoArgsConstructor
public class Fish {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false, unique = true)
    private String name;
    
    @Column(name = "avg_length", nullable = false)
    private Double avgLength;
    
    @Column(name = "std_deviation", nullable = false)
    private Double stdDeviation;
    
    @Column(name = "rarity_score", nullable = false)
    private Integer rarityScore;
} 