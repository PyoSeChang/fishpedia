package com.fishiphedia.fish.controller;

import com.fishiphedia.fish.dto.FishRequest;
import com.fishiphedia.fish.dto.FishResponse;
import com.fishiphedia.fish.service.FishService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fish")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FishController {

    private final FishService fishService;

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
} 