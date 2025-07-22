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
    
    // certified=true인 낚시 일지만 조회 (사용자별)
    List<FishLog> findByUserAndCertifiedTrueOrderByCollectAtDesc(User user);
    
    // certified=true인 낚시 일지만 조회 (사용자별, 물고기별)
    @Query("SELECT fl FROM FishLog fl WHERE fl.user = :user AND fl.fish.id = :fishId AND fl.certified = true ORDER BY fl.collectAt DESC")
    List<FishLog> findByUserAndFishIdAndCertifiedTrueOrderByCollectAtDesc(@Param("user") User user, @Param("fishId") Long fishId);
    
    // certified=true인 낚시 일지 중 최고 점수 조회 (사용자별, 물고기별)
    @Query("SELECT MAX(fl.score) FROM FishLog fl WHERE fl.user = :user AND fl.fish.id = :fishId AND fl.certified = true")
    Optional<Integer> findMaxScoreByUserAndFishIdAndCertifiedTrue(@Param("user") User user, @Param("fishId") Long fishId);
    
    // certified=true인 낚시 일지 중 최고 길이 조회 (사용자별, 물고기별)
    @Query("SELECT MAX(fl.length) FROM FishLog fl WHERE fl.user = :user AND fl.fish.id = :fishId AND fl.certified = true")
    Optional<Double> findMaxLengthByUserAndFishIdAndCertifiedTrue(@Param("user") User user, @Param("fishId") Long fishId);
    
    // certified=true인 낚시 일지의 총 점수 조회 (사용자별, 물고기별)
    @Query("SELECT COALESCE(SUM(fl.score), 0) FROM FishLog fl WHERE fl.user = :user AND fl.fish.id = :fishId AND fl.certified = true")
    Integer sumScoreByUserAndFishIdAndCertifiedTrue(@Param("user") User user, @Param("fishId") Long fishId);
    
    // certified=true인 낚시 일지의 총 점수 조회 (사용자별, 모든 물고기)
    @Query("SELECT COALESCE(SUM(fl.score), 0) FROM FishLog fl WHERE fl.user = :user AND fl.certified = true")
    Integer sumScoreByUserAndCertifiedTrue(@Param("user") User user);
}
