package com.fishiphedia.board.entity;

import com.fishiphedia.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "album")
@Getter
@Setter
@NoArgsConstructor
public class Album {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false, unique = true)
    private Board board;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "image_path", nullable = false)
    private String imagePath;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "create_at", nullable = false)
    private LocalDateTime createAt;
    
    @Column(name = "update_at")
    private LocalDateTime updateAt;
    
    @PrePersist
    protected void onCreate() {
        createAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updateAt = LocalDateTime.now();
    }
}