package com.fishiphedia.spots.service;

import com.fishiphedia.spots.dto.SpotDetailSearchRequest;
import com.fishiphedia.spots.dto.SpotResponse;
import com.fishiphedia.spots.dto.SpotSearchRequest;
import com.fishiphedia.spots.entity.SpotType;

import java.util.List;

public interface SpotService {
    List<SpotResponse> getAllSpots();
    SpotResponse getSpotById(Long id);
    List<SpotResponse> searchSpots(SpotSearchRequest request);
    List<SpotResponse> searchSpotsWithDetailFilters(SpotDetailSearchRequest request);
    List<SpotResponse> getSpotsByType(SpotType spotType);
    List<SpotResponse> getSpotsByRegion(String region);
    List<SpotResponse> getSpotsInArea(Double minLat, Double maxLat, Double minLng, Double maxLng);
}