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

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/fish")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class FishController {

    private final FishService fishService;
    private final FileUploadService fileUploadService;

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

    // 점수 계산 API
    @PostMapping("/calculate-score")
    public ResponseEntity<Integer> calculateScore(
            @RequestParam(value = "fishId", required = false) Long fishId,
            @RequestParam(value = "length", required = false) Double length,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        
        log.info("점수 계산 요청 받음 - fishId: {}, length: {}, image: {}", 
                fishId, length, image != null ? image.getOriginalFilename() : "null");
        
        // 이미지가 있으면 임시로 저장 (점수 계산용)
        if (image != null && !image.isEmpty()) {
            try {
                String imgPath = fileUploadService.uploadFile(image);
                log.info("점수 계산용 이미지 업로드: {}", imgPath);
            } catch (Exception e) {
                log.error("점수 계산용 이미지 업로드 실패", e);
            }
        }
        
        // TODO: 실제 점수 계산 로직 구현
        // 현재는 하드코딩으로 100점 반환
        int score = 100;
        
        log.info("계산된 점수: {}", score);
        return ResponseEntity.ok(score);
    }

    // 점수 계산 API (GET 메서드로도 테스트)
    @GetMapping("/calculate-score")
    public ResponseEntity<Integer> calculateScoreGet(
            @RequestParam(value = "fishId", required = false) Long fishId,
            @RequestParam(value = "length", required = false) Double length) {
        
        log.info("GET 점수 계산 요청 받음 - fishId: {}, length: {}", fishId, length);
        
        // TODO: 실제 점수 계산 로직 구현
        // 현재는 하드코딩으로 100점 반환
        int score = 100;
        
        log.info("GET 계산된 점수: {}", score);
        return ResponseEntity.ok(score);
    }
} 