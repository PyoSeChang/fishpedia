package com.fishiphedia.ranking.repository;

import com.fishiphedia.fish.entity.Fish;
import com.fishiphedia.ranking.entity.RankingCollection;
import com.fishiphedia.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RankingCollectionRepository extends JpaRepository<RankingCollection, Long> {
    
    // 사용자별 랭킹 컬렉션 조회
    List<RankingCollection> findByUser(User user);
    
    // 사용자와 물고기로 특정 랭킹 컬렉션 조회
    Optional<RankingCollection> findByUserAndFish(User user, Fish fish);
    
    // 물고기별 최고 점수 순 랭킹 조회
    List<RankingCollection> findByFishOrderByHighestScoreDesc(Fish fish);
    
    // 물고기별 최고 점수 순 랭킹 조회 (fishId로)
    @Query("SELECT rc FROM RankingCollection rc WHERE rc.fish.id = :fishId ORDER BY rc.highestScore DESC")
    List<RankingCollection> findByFishIdOrderByHighestScoreDesc(@Param("fishId") Long fishId);
    
    // 전체 총점 순 랭킹 조회 (모든 물고기 통합)
    @Query("SELECT rc.user, SUM(rc.totalScore) as totalScore FROM RankingCollection rc GROUP BY rc.user ORDER BY totalScore DESC")
    List<Object[]> findUserTotalScoreRanking();
    
    // 물고기별 총점 순 랭킹 조회
    List<RankingCollection> findByFishOrderByTotalScoreDesc(Fish fish);
    
    // 물고기별 총점 순 랭킹 조회 (fishId로)
    @Query("SELECT rc FROM RankingCollection rc WHERE rc.fish.id = :fishId ORDER BY rc.totalScore DESC")
    List<RankingCollection> findByFishIdOrderByTotalScoreDesc(@Param("fishId") Long fishId);
    
    // 전체 랭킹 컬렉션을 총점 순으로 조회
    List<RankingCollection> findAllByOrderByTotalScoreDesc();
    
    // 전체 랭킹 컬렉션을 최고점수 순으로 조회
    List<RankingCollection> findAllByOrderByHighestScoreDesc();
}