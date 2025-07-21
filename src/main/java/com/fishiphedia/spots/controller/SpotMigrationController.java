package com.fishiphedia.spots.controller;

import com.fishiphedia.spots.repository.SpotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/spots")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SpotMigrationController {

    private final SpotRepository spotRepository;

    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getSpotCount() {
        try {
            long count = spotRepository.count();
            return ResponseEntity.ok(Map.of(
                "count", count,
                "message", "현재 등록된 낚시터 수"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }

    @DeleteMapping("/all")
    public ResponseEntity<Map<String, Object>> deleteAllSpots() {
        try {
            long countBefore = spotRepository.count();
            spotRepository.deleteAll();
            return ResponseEntity.ok(Map.of(
                "deletedCount", countBefore,
                "message", "모든 낚시터 데이터 삭제 완료"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }
}