package com.fishiphedia.search.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fishiphedia.user.entity.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "search_log", indexes = {
    @Index(name = "idx_search_keyword", columnList = "search_keyword"),
    @Index(name = "idx_search_type", columnList = "search_type"),
    @Index(name = "idx_search_date", columnList = "search_date"),
    @Index(name = "idx_user_id", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
public class SearchLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(name = "search_keyword", nullable = false, length = 500)
    private String searchKeyword;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "search_type", nullable = false)
    private SearchType searchType;
    
    @Column(name = "search_date", nullable = false)
    private LocalDateTime searchDate;
    
    @Column(name = "result_count")
    private Integer resultCount;
    
    @Column(name = "ip_address", length = 45)
    private String ipAddress;
    
    @Column(name = "user_agent", length = 1000)
    private String userAgent;
    
    @PrePersist
    protected void onCreate() {
        searchDate = LocalDateTime.now();
    }
    
    public enum SearchType {
        COMMUNITY("커뮤니티"),
        FISH_LOG("낚시 일지"),
        BOARD("게시판"),
        FISH("물고기"),
        SPOT("낚시터");
        
        private final String description;
        
        SearchType(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
}