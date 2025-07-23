package com.fishiphedia.search.repository;

import com.fishiphedia.search.entity.SearchLog;
import com.fishiphedia.search.entity.SearchLog.SearchType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SearchLogRepository extends JpaRepository<SearchLog, Long> {
    
    /**
     * 특정 기간 동안의 검색 로그 조회
     */
    List<SearchLog> findBySearchDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * 특정 검색 타입의 로그 조회
     */
    List<SearchLog> findBySearchType(SearchType searchType);
    
    /**
     * 특정 사용자의 검색 로그 조회
     */
    List<SearchLog> findByUserIdOrderBySearchDateDesc(Long userId);
    
    /**
     * 인기 검색어 조회 (최근 30일)
     */
    @Query("SELECT s.searchKeyword, COUNT(s) as searchCount " +
           "FROM SearchLog s " +
           "WHERE s.searchDate >= :startDate " +
           "AND s.searchType = :searchType " +
           "GROUP BY s.searchKeyword " +
           "ORDER BY searchCount DESC")
    List<Object[]> findPopularKeywords(@Param("startDate") LocalDateTime startDate, 
                                     @Param("searchType") SearchType searchType);
    
    /**
     * 검색 키워드별 통계
     */
    @Query("SELECT s.searchKeyword, COUNT(s) as count, AVG(s.resultCount) as avgResults " +
           "FROM SearchLog s " +
           "WHERE s.searchType = :searchType " +
           "AND s.searchDate >= :startDate " +
           "GROUP BY s.searchKeyword " +
           "ORDER BY count DESC")
    List<Object[]> findSearchStatistics(@Param("searchType") SearchType searchType, 
                                       @Param("startDate") LocalDateTime startDate);
}