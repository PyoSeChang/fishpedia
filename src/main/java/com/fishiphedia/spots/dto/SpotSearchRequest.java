package com.fishiphedia.spots.dto;

import com.fishiphedia.spots.entity.SpotType;
import com.fishiphedia.spots.entity.WaterFacilityType;
import lombok.Data;

@Data
public class SpotSearchRequest {
    private String keyword;
    private SpotType spotType;
    private WaterFacilityType waterFacilityType;
    private String region;
    private Double minLatitude;
    private Double maxLatitude;
    private Double minLongitude;
    private Double maxLongitude;
    private String fishSpecies;
}