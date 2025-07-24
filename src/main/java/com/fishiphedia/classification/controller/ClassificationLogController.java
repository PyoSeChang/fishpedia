package com.fishiphedia.classification.controller;

import com.fishiphedia.classification.dto.ClassificationLogResponse;
import com.fishiphedia.classification.service.ClassificationLogService;
import com.fishiphedia.common.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classification/log")
@RequiredArgsConstructor
public class ClassificationLogController {
    
    private final ClassificationLogService classificationLogService;
    private final JwtUtil jwtUtil;
    
    /**
     * 사용자 분류 로그 조회
     */
    @GetMapping("/user")
    public ResponseEntity<List<ClassificationLogResponse>> getUserClassificationLogs(
            @RequestHeader("Authorization") String token
    ) {
        String actualToken = token.startsWith("Bearer ") ? token.substring(7) : token;
        String loginId = jwtUtil.getLoginIdFromToken(actualToken);
        // TODO: loginId로 userId 조회하는 로직 필요
        
        List<ClassificationLogResponse> logs = classificationLogService.getUserClassificationLogs(1L); // 임시
        return ResponseEntity.ok(logs);
    }
    
    /**
     * 오답노트 조회
     */
    @GetMapping("/wrong-predictions")  
    public ResponseEntity<List<ClassificationLogResponse>> getWrongPredictions(
            @RequestHeader("Authorization") String token
    ) {
        String actualToken = token.startsWith("Bearer ") ? token.substring(7) : token;
        String loginId = jwtUtil.getLoginIdFromToken(actualToken);
        // TODO: loginId로 userId 조회하는 로직 필요
        
        List<ClassificationLogResponse> wrongPredictions = classificationLogService.getWrongPredictions(1L); // 임시
        return ResponseEntity.ok(wrongPredictions);
    }
    
    /**
     * 사용자 피드백 업데이트 (정답/오답 표시, 수정)
     */
    @PutMapping("/{logId}/feedback")
    public ResponseEntity<String> updateUserFeedback(
            @PathVariable Long logId,
            @RequestParam(required = false) String correctedFishName,
            @RequestParam(required = false) Boolean isCorrect,
            @RequestParam(required = false) String reason
    ) {
        try {
            classificationLogService.updateUserFeedback(logId, correctedFishName, isCorrect, reason);
            return ResponseEntity.ok("피드백이 성공적으로 업데이트되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("피드백 업데이트 실패: " + e.getMessage());
        }
    }
    
    /**
     * 낚시 일지와 연결
     */
    @PutMapping("/{logId}/link-fish-log/{fishLogId}")
    public ResponseEntity<String> linkToFishLog(
            @PathVariable Long logId,
            @PathVariable Long fishLogId
    ) {
        try {
            classificationLogService.linkToFishLog(logId, fishLogId);
            return ResponseEntity.ok("낚시 일지와 성공적으로 연결되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("연결 실패: " + e.getMessage());
        }
    }
    
    /**
     * 분류 로그 상세 조회
     */
    @GetMapping("/{logId}")
    public ResponseEntity<ClassificationLogResponse> getClassificationLog(@PathVariable Long logId) {
        try {
            ClassificationLogResponse log = classificationLogService.getClassificationLog(logId);
            return ResponseEntity.ok(log);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * 모델 성능 통계 (관리자용)
     */
    @GetMapping("/stats/performance")
    public ResponseEntity<Map<String, Object>> getModelPerformanceStats() {
        Object[] stats = classificationLogService.getModelPerformanceStats();
        
        Map<String, Object> response = new HashMap<>();
        if (stats != null && stats.length >= 3) {
            response.put("accuracy", stats[0]); // 정확도
            response.put("avgConfidence", stats[1]); // 평균 신뢰도
            response.put("totalCount", stats[2]); // 총 피드백 수
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 오답 패턴 분석 (관리자용)
     */
    @GetMapping("/stats/wrong-patterns")
    public ResponseEntity<List<Object[]>> getWrongPredictionPatterns() {
        List<Object[]> patterns = classificationLogService.getWrongPredictionPatterns();
        return ResponseEntity.ok(patterns);
    }
}