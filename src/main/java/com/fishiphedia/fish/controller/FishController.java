package com.fishiphedia.fish.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fishiphedia.common.service.FileUploadService;
import com.fishiphedia.fish.dto.FishRequest;
import com.fishiphedia.fish.dto.FishResponse;
import com.fishiphedia.fish.service.FishService;
import com.fishiphedia.fish.service.FastApiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/fish")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
@Tag(name = "Fish", description = "물고기 정보 관리 API")
public class FishController {

    private final FishService fishService;
    private final FileUploadService fileUploadService;
    private final FastApiService fastApiService;

    // 물고기 목록 조회
    @GetMapping
    public ResponseEntity<List<FishResponse>> getAllFish() {
        List<FishResponse> fishList = fishService.getAllFish();
        return ResponseEntity.ok(fishList);
    }

    // 물고기 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<FishResponse> getFishById(@PathVariable Long id) {
        try {
            FishResponse fish = fishService.getFishById(id);
            return ResponseEntity.ok(fish);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 물고기 등록
    @PostMapping
    public ResponseEntity<?> createFish(@RequestBody FishRequest request) {
        try {
            FishResponse fish = fishService.createFish(request);
            return ResponseEntity.ok(fish);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 물고기 수정
    @PutMapping("/{id}")
    public ResponseEntity<?> updateFish(@PathVariable Long id, @RequestBody FishRequest request) {
        try {
            FishResponse fish = fishService.updateFish(id, request);
            return ResponseEntity.ok(fish);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 물고기 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFish(@PathVariable Long id) {
        try {
            fishService.deleteFish(id);
            return ResponseEntity.ok(Map.of("message", "물고기가 삭제되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 점수 계산 API (FastAPI 연동)
    @PostMapping("/calculate-score")
    public ResponseEntity<?> calculateScore(
            @RequestParam(value = "fishType", required = false) String fishType,
            @RequestParam(value = "length", required = false) Double length,
            @RequestParam(value = "location", required = false) String location) {
        
        log.info("점수 계산 요청 받음 - fishType: {}, length: {}, location: {}", 
                fishType, length, location);
        
        try {
            // FastAPI를 통한 점수 계산
            Integer score = fastApiService.calculateScore(fishType, length, location);
            
            if (score != null) {
                log.info("FastAPI를 통해 계산된 점수: {}", score);
                return ResponseEntity.ok(Map.of("score", score, "source", "fastapi"));
            } else {
                // FastAPI 실패시 기본 점수 계산 로직
                int defaultScore = calculateDefaultScore(fishType, length);
                log.info("기본 로직으로 계산된 점수: {}", defaultScore);
                return ResponseEntity.ok(Map.of("score", defaultScore, "source", "default"));
            }
            
        } catch (Exception e) {
            log.error("점수 계산 중 오류 발생", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // 기본 점수 계산 로직
    private int calculateDefaultScore(String fishType, Double length) {
        int baseScore = 50;
        
        // 어종별 기본 점수
        if (fishType != null) {
            switch (fishType.toLowerCase()) {
                case "붕어": baseScore = 60; break;
                case "잉어": baseScore = 70; break;
                case "배스": baseScore = 80; break;
                case "송어": baseScore = 90; break;
                default: baseScore = 50;
            }
        }
        
        // 크기별 추가 점수
        if (length != null) {
            if (length >= 30) baseScore += 30;
            else if (length >= 20) baseScore += 20;
            else if (length >= 10) baseScore += 10;
        }
        
        return Math.min(baseScore, 100); // 최대 100점
    }

    // 물고기 식별 API (FastAPI 연동)
    @PostMapping("/identify")
    public ResponseEntity<?> identifyFish(@RequestParam("image") MultipartFile image) {
        try {
            if (image.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "이미지 파일이 필요합니다."));
            }
            
            log.info("물고기 식별 요청 받음 - 파일: {}", image.getOriginalFilename());
            
            String fishType = fastApiService.identifyFish(image);
            
            if (fishType != null) {
                return ResponseEntity.ok(Map.of(
                    "fishType", fishType,
                    "source", "fastapi",
                    "message", "FastAPI를 통해 물고기를 식별했습니다."
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "fishType", "알 수 없음",
                    "source", "default",
                    "message", "물고기 식별에 실패했습니다."
                ));
            }
            
        } catch (Exception e) {
            log.error("물고기 식별 중 오류 발생", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // 물고기 크기 측정 API (FastAPI 연동)
    @PostMapping("/measure")
    public ResponseEntity<?> measureFish(@RequestParam("image") MultipartFile image) {
        try {
            if (image.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "이미지 파일이 필요합니다."));
            }
            
            log.info("물고기 크기 측정 요청 받음 - 파일: {}", image.getOriginalFilename());
            
            Double length = fastApiService.measureFishSize(image);
            
            if (length != null) {
                return ResponseEntity.ok(Map.of(
                    "length", length,
                    "unit", "cm",
                    "source", "fastapi",
                    "message", "FastAPI를 통해 물고기 크기를 측정했습니다."
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "length", null,
                    "source", "default",
                    "message", "물고기 크기 측정에 실패했습니다."
                ));
            }
            
        } catch (Exception e) {
            log.error("물고기 크기 측정 중 오류 발생", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // 물고기 종합 분석 API (FastAPI 연동)
    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeFish(@RequestParam("image") MultipartFile image) {
        try {
            if (image.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "이미지 파일이 필요합니다."));
            }
            
            log.info("물고기 종합 분석 요청 받음 - 파일: {}", image.getOriginalFilename());
            
            Map<String, Object> result = fastApiService.analyzeFish(image);
            
            if (!result.isEmpty()) {
                result.put("source", "fastapi");
                result.put("message", "FastAPI를 통해 물고기를 분석했습니다.");
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.ok(Map.of(
                    "fishType", "알 수 없음",
                    "length", null,
                    "source", "default",
                    "message", "물고기 분석에 실패했습니다."
                ));
            }
            
        } catch (Exception e) {
            log.error("물고기 종합 분석 중 오류 발생", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // FastAPI 서버 상태 확인
    @GetMapping("/fastapi/health")
    public ResponseEntity<?> checkFastApiHealth() {
        try {
            boolean isHealthy = fastApiService.isHealthy();
            
            return ResponseEntity.ok(Map.of(
                "fastapi_healthy", isHealthy,
                "message", isHealthy ? "FastAPI 서버가 정상 작동 중입니다." : "FastAPI 서버에 연결할 수 없습니다.",
                "timestamp", System.currentTimeMillis()
            ));
            
        } catch (Exception e) {
            log.error("FastAPI 상태 확인 중 오류 발생", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
} 