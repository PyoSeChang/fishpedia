package com.fishiphedia.search.service;

import com.fishiphedia.search.entity.SearchLog;
import com.fishiphedia.search.entity.SearchLog.SearchType;
import com.fishiphedia.search.repository.SearchLogRepository;
import com.fishiphedia.user.entity.User;
import com.fishiphedia.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SearchLogServiceImpl implements SearchLogService {
    
    private final SearchLogRepository searchLogRepository;
    private final UserRepository userRepository;
    
    @Override
    public void logSearch(String keyword, SearchType searchType, Integer resultCount, 
                         Long userId, HttpServletRequest request) {
        try {
            SearchLog searchLog = new SearchLog();
            searchLog.setSearchKeyword(keyword);
            searchLog.setSearchType(searchType);
            searchLog.setResultCount(resultCount);
            
            // 사용자 정보 설정 (로그인한 경우)
            if (userId != null) {
                User user = userRepository.findById(userId).orElse(null);
                searchLog.setUser(user);
            }
            
            // IP 주소 추출
            String ipAddress = getClientIpAddress(request);
            searchLog.setIpAddress(ipAddress);
            
            // User Agent 설정
            String userAgent = request.getHeader("User-Agent");
            if (userAgent != null && userAgent.length() > 1000) {
                userAgent = userAgent.substring(0, 1000);
            }
            searchLog.setUserAgent(userAgent);
            
            searchLogRepository.save(searchLog);
            
            log.info("검색 로그 저장 - 키워드: {}, 타입: {}, 결과수: {}, 사용자: {}", 
                    keyword, searchType, resultCount, userId);
            
        } catch (Exception e) {
            log.error("검색 로그 저장 실패 - 키워드: {}, 타입: {}", keyword, searchType, e);
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<SearchLog> getUserSearchHistory(Long userId, int limit) {
        List<SearchLog> allHistory = searchLogRepository.findByUserIdOrderBySearchDateDesc(userId);
        return allHistory.stream()
                .limit(limit)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<String> getPopularKeywords(SearchType searchType, int limit) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(30);
        List<Object[]> results = searchLogRepository.findPopularKeywords(startDate, searchType);
        
        return results.stream()
                .limit(limit)
                .map(result -> (String) result[0])
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Object[]> getSearchStatistics(SearchType searchType, int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        return searchLogRepository.findSearchStatistics(searchType, startDate);
    }
    
    /**
     * 클라이언트 실제 IP 주소 추출
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String[] headerNames = {
            "X-Forwarded-For",
            "X-Real-IP", 
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_FORWARDED",
            "HTTP_X_CLUSTER_CLIENT_IP",
            "HTTP_CLIENT_IP",
            "HTTP_FORWARDED_FOR",
            "HTTP_FORWARDED",
            "HTTP_VIA",
            "REMOTE_ADDR"
        };
        
        for (String header : headerNames) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                // 여러 IP가 있는 경우 첫 번째 IP 사용
                if (ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                return ip;
            }
        }
        
        return request.getRemoteAddr();
    }
}