package com.fishiphedia.spots.dto;

import com.fishiphedia.spots.entity.SpotType;
import com.fishiphedia.spots.entity.WaterFacilityType;
import lombok.Data;

import java.util.List;

@Data
public class SpotDetailSearchRequest {
    private String region;
    private String keyword;
    private List<SpotType> spotTypes;
    private List<WaterFacilityType> waterFacilityTypes;
    private List<String> fishSpecies;
    private Integer minUsageFee;
    private Integer maxUsageFee;
    private List<String> convenienceFacilities;
}