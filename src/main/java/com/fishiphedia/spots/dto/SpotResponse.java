package com.fishiphedia.spots.dto;

import com.fishiphedia.spots.entity.SpotType;
import com.fishiphedia.spots.entity.WaterFacilityType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpotResponse {
    private Long id;
    private String name;
    private SpotType spotType;
    private String roadAddress;
    private String lotAddress;
    private Double latitude;
    private Double longitude;
    private String phoneNumber;
    private Double waterArea;
    private String mainFishSpecies;
    private Integer maxCapacity;
    private WaterFacilityType waterFacilityType;
    private String usageFee;
    private String keyPoints;
    private String safetyFacilities;
    private String convenienceFacilities;
    private String nearbyAttractions;
    private String managementPhone;
    private String managementOffice;
    private LocalDate dataReferenceDate;
    private String region;
}