package com.fishiphedia.board.entity;

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
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "comment")
@Getter
@Setter
@NoArgsConstructor
public class Comment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;
    
    @Column(name = "create_at", nullable = false)
    private LocalDate createAt;
    
    @Column(name = "update_at")
    private LocalDate updateAt;
    
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