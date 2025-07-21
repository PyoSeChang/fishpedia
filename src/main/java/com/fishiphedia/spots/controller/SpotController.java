package com.fishiphedia.spots.controller;

import com.fishiphedia.spots.dto.SpotResponse;
import com.fishiphedia.spots.dto.SpotSearchRequest;
import com.fishiphedia.spots.entity.SpotType;
import com.fishiphedia.spots.service.SpotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/spots")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SpotController {

    private final RestTemplate restTemplate;
    private final SpotService spotService;

    @GetMapping
    public ResponseEntity<List<SpotResponse>> getAllSpots() {
        try {
            List<SpotResponse> spots = spotService.getAllSpots();
            return ResponseEntity.ok(spots);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<SpotResponse> getSpotById(@PathVariable Long id) {
        try {
            SpotResponse spot = spotService.getSpotById(id);
            return ResponseEntity.ok(spot);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/search")
    public ResponseEntity<List<SpotResponse>> searchSpots(@RequestBody SpotSearchRequest request) {
        try {
            List<SpotResponse> spots = spotService.searchSpots(request);
            return ResponseEntity.ok(spots);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/type/{spotType}")
    public ResponseEntity<List<SpotResponse>> getSpotsByType(@PathVariable SpotType spotType) {
        try {
            List<SpotResponse> spots = spotService.getSpotsByType(spotType);
            return ResponseEntity.ok(spots);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/region/{region}")
    public ResponseEntity<List<SpotResponse>> getSpotsByRegion(@PathVariable String region) {
        try {
            List<SpotResponse> spots = spotService.getSpotsByRegion(region);
            return ResponseEntity.ok(spots);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/area")
    public ResponseEntity<List<SpotResponse>> getSpotsInArea(
            @RequestParam Double minLat,
            @RequestParam Double maxLat,
            @RequestParam Double minLng,
            @RequestParam Double maxLng) {
        try {
            List<SpotResponse> spots = spotService.getSpotsInArea(minLat, maxLat, minLng, maxLng);
            return ResponseEntity.ok(spots);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/fishing-forecast")
    public ResponseEntity<?> getFishingForecast() {
        try {
            String apiUrl = "https://apis.data.go.kr/1192136/fcstFishing";
            String serviceKey = "OfClaw16m1tUnZnlLW2%2FEM%2BXJB8pMkuc8u8t1FBOQMj5Ap3uw7r4uGFEQJPWsh8YrSFBSEM1DYmMvK3C0IaDpA%3D%3D";
            
            String requestUrl = apiUrl + "?serviceKey=" + serviceKey + "&dataType=JSON";
            
            String response = restTemplate.getForObject(requestUrl, String.class);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}