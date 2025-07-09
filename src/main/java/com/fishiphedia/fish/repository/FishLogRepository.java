package com.fishiphedia.fish.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fishiphedia.fish.entity.FishLog;
import com.fishiphedia.user.entity.User;

@Repository
public interface FishLogRepository extends JpaRepository<FishLog, Long> {
    
    // 사용자의 낚시 일지 목록 조회 (최신순)
    List<FishLog> findByUserOrderByCollectAtDesc(User user);
    
    // 사용자의 특정 물고기 일지 목록 조회 (최신순)
    @Query("SELECT fl FROM FishLog fl WHERE fl.user = :user AND fl.fish.id = :fishId ORDER BY fl.collectAt DESC")
    List<FishLog> findByUserAndFishIdOrderByCollectAtDesc(@Param("user") User user, @Param("fishId") Long fishId);
    
    // 특정 사용자의 특정 낚시 일지 조회
    Optional<FishLog> findByIdAndUser(Long id, User user);
}
