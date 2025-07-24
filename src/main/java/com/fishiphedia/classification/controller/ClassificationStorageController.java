package com.fishiphedia.classification.controller;

import com.fishiphedia.classification.entity.ClassificationStorage;
import com.fishiphedia.classification.service.ClassificationStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classification/storage")
@RequiredArgsConstructor
public class ClassificationStorageController {
    
    private final ClassificationStorageService classificationStorageService;
    
    /**
     * 특정 어종의 저장된 분류 결과 조회
     */
    @GetMapping("/fish/{fishName}")
    public ResponseEntity<List<ClassificationStorage>> getClassificationsByFish(@PathVariable String fishName) {
        List<ClassificationStorage> results = classificationStorageService.getClassificationsByFishName(fishName);
        return ResponseEntity.ok(results);
    }
    
    /**
     * 특정 신뢰도 이상의 분류 결과 조회
     */
    @GetMapping("/confidence/{minConfidence}")
    public ResponseEntity<List<ClassificationStorage>> getClassificationsByConfidence(@PathVariable BigDecimal minConfidence) {
        List<ClassificationStorage> results = classificationStorageService.getClassificationsByConfidence(minConfidence);
        return ResponseEntity.ok(results);
    }
    
    /**
     * 어종별 분류 결과 통계
     */
    @GetMapping("/stats/fish")
    public ResponseEntity<Map<String, Object>> getFishStatistics() {
        List<Object[]> stats = classificationStorageService.getClassificationStatsByFish();
        Map<String, Long> fishStats = new HashMap<>();
        
        for (Object[] stat : stats) {
            String fishName = (String) stat[0];
            Long count = (Long) stat[1];
            fishStats.put(fishName, count);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("fishStatistics", fishStats);
        response.put("totalSpecies", fishStats.size());
        response.put("totalClassifications", fishStats.values().stream().mapToLong(Long::longValue).sum());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 신뢰도별 분류 결과 통계
     */
    @GetMapping("/stats/confidence")
    public ResponseEntity<Map<String, Object>> getConfidenceStatistics() {
        Object[] stats = classificationStorageService.getConfidenceStatistics();
        
        Map<String, Object> response = new HashMap<>();
        response.put("highConfidence", stats[0]); // >= 99%
        response.put("mediumConfidence", stats[1]); // 90% ~ 99%
        
        Long high = stats[0] != null ? ((Number) stats[0]).longValue() : 0L;
        Long medium = stats[1] != null ? ((Number) stats[1]).longValue() : 0L;
        response.put("total", high + medium);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 전체 분류 저장소 요약 정보
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        Map<String, Object> summary = new HashMap<>();
        
        // 어종별 통계
        List<Object[]> fishStats = classificationStorageService.getClassificationStatsByFish();
        Map<String, Long> fishStatistics = new HashMap<>();
        for (Object[] stat : fishStats) {
            fishStatistics.put((String) stat[0], (Long) stat[1]);
        }
        
        // 신뢰도별 통계
        Object[] confidenceStats = classificationStorageService.getConfidenceStatistics();
        Long highConfidence = confidenceStats[0] != null ? ((Number) confidenceStats[0]).longValue() : 0L;
        Long mediumConfidence = confidenceStats[1] != null ? ((Number) confidenceStats[1]).longValue() : 0L;
        
        summary.put("totalSpecies", fishStatistics.size());
        summary.put("totalClassifications", highConfidence + mediumConfidence);
        summary.put("highConfidenceCount", highConfidence);
        summary.put("mediumConfidenceCount", mediumConfidence);
        summary.put("topFishSpecies", fishStatistics);
        
        return ResponseEntity.ok(summary);
    }
}