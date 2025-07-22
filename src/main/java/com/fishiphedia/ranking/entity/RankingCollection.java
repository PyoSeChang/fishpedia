package com.fishiphedia.ranking.entity;

import com.fishiphedia.fish.entity.Fish;
import com.fishiphedia.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ranking_collection")
@Getter
@Setter
@NoArgsConstructor
public class RankingCollection {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fish_id", nullable = false)
    private Fish fish;
    
    @Column(name = "highest_score", nullable = false)
    private Integer highestScore = 0;
    
    @Column(name = "highest_length")
    private Double highestLength = 0.0;
    
    @Column(name = "total_score", nullable = false)
    private Integer totalScore = 0;
    
    @Column(name = "catch_count", nullable = false)
    private Integer catchCount = 0;
    
    // 유니크 제약조건: 한 사용자는 물고기 종류당 하나의 랭킹 레코드만 가질 수 있음
    @Table(uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "fish_id"})
    })
    public static class TableConstraints {}
}