package com.fishiphedia.board.entity;

import com.fishiphedia.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "board")
@Getter
@Setter
@NoArgsConstructor
public class Board {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "create_at", nullable = false)
    private LocalDate createAt;
    
    @Column(name = "update_at")
    private LocalDate updateAt;
    
    @Column(name = "read_count", nullable = false)
    private Integer readCount = 0;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @PrePersist
    protected void onCreate() {
        createAt = LocalDate.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updateAt = LocalDate.now();
    }
} 