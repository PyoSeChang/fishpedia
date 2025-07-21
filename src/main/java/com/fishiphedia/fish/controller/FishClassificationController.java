package com.fishiphedia.fish.controller;

import com.fishiphedia.common.service.FishClassificationService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/fish/classification")
public class FishClassificationController {

    private final FishClassificationService fishClassificationService;

    public FishClassificationController(FishClassificationService fishClassificationService) {
        this.fishClassificationService = fishClassificationService;
    }

    @PostMapping(value = "/predict", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> classifyFish(@RequestParam("file") MultipartFile file) {
        try {
            // 파일 유효성 검사
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("파일이 비어있습니다.");
            }

            if (!file.getContentType().startsWith("image/")) {
                return ResponseEntity.badRequest().body("이미지 파일만 업로드 가능합니다.");
            }

            // 파일 크기 제한 (예: 10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("파일 크기가 너무 큽니다. (최대 10MB)");
            }

            // FastAPI로 분류 요청
            FishClassificationService.ClassificationResult result = fishClassificationService.classifyFish(file);

            // TODO: 추후 분류 로그 저장, 사용자별 분류 히스토리 등 추가 가능
            // logClassificationRequest(file, result);

            return ResponseEntity.ok(result);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("파일 처리 중 오류가 발생했습니다: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("물고기 분류 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @GetMapping("/health")
    public ResponseEntity<FishClassificationService.HealthStatus> checkHealth() {
        FishClassificationService.HealthStatus health = fishClassificationService.checkHealth();
        return ResponseEntity.ok(health);
    }

    // TODO: 추후 분류 히스토리 조회 API 추가 가능
    // @GetMapping("/history")
    // public ResponseEntity<List<ClassificationHistory>> getClassificationHistory() { ... }

    // TODO: 추후 분류 통계 API 추가 가능
    // @GetMapping("/stats")
    // public ResponseEntity<ClassificationStats> getClassificationStats() { ... }
}