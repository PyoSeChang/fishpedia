package com.fishiphedia.spots.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "spots")
@Getter
@Setter
@NoArgsConstructor
public class Spot {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "spot_type")
    private SpotType spotType;
    
    @Column(name = "road_address", length = 500)
    private String roadAddress;
    
    @Column(name = "lot_address", length = 500)
    private String lotAddress;
    
    @Column(name = "latitude", precision = 10)
    private Double latitude;
    
    @Column(name = "longitude", precision = 11)
    private Double longitude;
    
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;
    
    @Column(name = "water_area")
    private Double waterArea;
    
    @Column(name = "main_fish_species", length = 500)
    private String mainFishSpecies;
    
    @Column(name = "max_capacity")
    private Integer maxCapacity;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "water_facility_type")
    private WaterFacilityType waterFacilityType;
    
    @Column(name = "usage_fee", length = 200)
    private String usageFee;
    
    @Column(name = "key_points", length = 1000)
    private String keyPoints;
    
    @Column(name = "safety_facilities", length = 1000)
    private String safetyFacilities;
    
    @Column(name = "convenience_facilities", length = 1000)
    private String convenienceFacilities;
    
    @Column(name = "nearby_attractions", length = 1000)
    private String nearbyAttractions;
    
    @Column(name = "management_phone", length = 20)
    private String managementPhone;
    
    @Column(name = "management_office", length = 100)
    private String managementOffice;
    
    @Column(name = "data_reference_date")
    private LocalDate dataReferenceDate;
    
    @Column(name = "region", length = 100)
    private String region;

    @Column(name = "fishing_level_info")
    private boolean fishingLevelInfo;

    @Column(name = "gubun")
    private String gubun;
}