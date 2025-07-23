package com.fishiphedia.search.service;

import com.fishiphedia.search.entity.SearchLog;
import com.fishiphedia.search.entity.SearchLog.SearchType;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface SearchLogService {
    
    /**
     * 검색 로그 저장
     */
    void logSearch(String keyword, SearchType searchType, Integer resultCount, 
                   Long userId, HttpServletRequest request);
    
    /**
     * 사용자의 검색 기록 조회
     */
    List<SearchLog> getUserSearchHistory(Long userId, int limit);
    
    /**
     * 인기 검색어 조회
     */
    List<String> getPopularKeywords(SearchType searchType, int limit);
    
    /**
     * 검색 통계 조회
     */
    List<Object[]> getSearchStatistics(SearchType searchType, int days);
}