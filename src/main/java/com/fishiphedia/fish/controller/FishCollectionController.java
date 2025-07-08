package com.fishiphedia.fish.controller;

import com.fishiphedia.fish.dto.FishCollectionResponse;
import com.fishiphedia.fish.service.FishCollectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fish-collection")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FishCollectionController {

    private final FishCollectionService fishCollectionService;

    @GetMapping("/my")
    public ResponseEntity<List<FishCollectionResponse>> getMyCollection() {
        List<FishCollectionResponse> result = fishCollectionService.getMyCollection();
        return ResponseEntity.ok(result);
    }
} 