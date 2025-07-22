package com.fishiphedia.spots.service;

import com.fishiphedia.spots.dto.SpotDetailSearchRequest;
import com.fishiphedia.spots.dto.SpotResponse;
import com.fishiphedia.spots.dto.SpotSearchRequest;
import com.fishiphedia.spots.entity.Spot;
import com.fishiphedia.spots.entity.SpotType;
import com.fishiphedia.spots.entity.WaterFacilityType;
import com.fishiphedia.spots.repository.SpotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SpotServiceImpl implements SpotService {

    private final SpotRepository spotRepository;

    @Override
    public List<SpotResponse> getAllSpots() {
        return spotRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SpotResponse getSpotById(Long id) {
        Spot spot = spotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("낚시터를 찾을 수 없습니다: " + id));
        return convertToResponse(spot);
    }

    @Override
    public List<SpotResponse> searchSpots(SpotSearchRequest request) {
        return spotRepository.findBySearchCriteria(
                request.getKeyword(),
                request.getSpotType(),
                request.getRegion(),
                request.getFishSpecies()
        ).stream()
                .filter(spot -> matchesLocationCriteria(spot, request))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SpotResponse> searchSpotsWithDetailFilters(SpotDetailSearchRequest request) {
        // Repository에서 기본 필터링된 결과를 가져옴 (지역, 키워드만)
        List<Spot> spots = spotRepository.findByDetailSearchCriteria(
                request.getRegion(),
                request.getKeyword(),
                request.getSpotTypes(),
                request.getWaterFacilityTypes(),
                request.getMinUsageFee(),
                request.getMaxUsageFee()
        );

        // 모든 세부 필터링을 Java 코드로 처리
        return spots.stream()
                .filter(spot -> matchesSpotTypes(spot, request.getSpotTypes()))
                .filter(spot -> matchesWaterFacilityTypes(spot, request.getWaterFacilityTypes()))
                .filter(spot -> matchesFishSpecies(spot, request.getFishSpecies()))
                .filter(spot -> matchesConvenienceFacilities(spot, request.getConvenienceFacilities()))
                .filter(spot -> matchesUsageFeeRange(spot, request.getMinUsageFee(), request.getMaxUsageFee()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SpotResponse> getSpotsByType(SpotType spotType) {
        return spotRepository.findBySpotType(spotType).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SpotResponse> getSpotsByRegion(String region) {
        return spotRepository.findByRegion(region).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SpotResponse> getSpotsInArea(Double minLat, Double maxLat, Double minLng, Double maxLng) {
        return spotRepository.findByLocationRange(minLat, maxLat, minLng, maxLng).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private boolean matchesLocationCriteria(Spot spot, SpotSearchRequest request) {
        // 위치 기반 필터링만 처리 (나머지는 쿼리에서 처리됨)
        if (request.getWaterFacilityType() != null && !request.getWaterFacilityType().equals(spot.getWaterFacilityType())) {
            return false;
        }

        if (request.getMinLatitude() != null && request.getMaxLatitude() != null &&
            request.getMinLongitude() != null && request.getMaxLongitude() != null) {
            if (spot.getLatitude() == null || spot.getLongitude() == null) {
                return false;
            }
            if (spot.getLatitude() < request.getMinLatitude() || spot.getLatitude() > request.getMaxLatitude() ||
                spot.getLongitude() < request.getMinLongitude() || spot.getLongitude() > request.getMaxLongitude()) {
                return false;
            }
        }

        return true;
    }

    private boolean matchesSpotTypes(Spot spot, List<SpotType> spotTypes) {
        if (CollectionUtils.isEmpty(spotTypes)) {
            return true;
        }
        return spotTypes.contains(spot.getSpotType());
    }
    
    private boolean matchesWaterFacilityTypes(Spot spot, List<WaterFacilityType> waterFacilityTypes) {
        if (CollectionUtils.isEmpty(waterFacilityTypes)) {
            return true;
        }
        return waterFacilityTypes.contains(spot.getWaterFacilityType());
    }

    private boolean matchesFishSpecies(Spot spot, List<String> fishSpecies) {
        if (CollectionUtils.isEmpty(fishSpecies)) {
            return true;
        }
        
        if (!StringUtils.hasText(spot.getMainFishSpecies())) {
            return false;
        }
        
        String mainFishSpecies = spot.getMainFishSpecies().toLowerCase();
        return fishSpecies.stream()
                .anyMatch(fish -> mainFishSpecies.contains(fish.toLowerCase()));
    }
    
    private boolean matchesConvenienceFacilities(Spot spot, List<String> convenienceFacilities) {
        if (CollectionUtils.isEmpty(convenienceFacilities)) {
            return true;
        }
        
        if (!StringUtils.hasText(spot.getConvenienceFacilities())) {
            return false;
        }
        
        String facilities = spot.getConvenienceFacilities().toLowerCase();
        return convenienceFacilities.stream()
                .allMatch(facility -> facilities.contains(facility.toLowerCase()));
    }
    
    private boolean matchesUsageFeeRange(Spot spot, Integer minUsageFee, Integer maxUsageFee) {
        if (minUsageFee == null && maxUsageFee == null) {
            return true;
        }
        
        if (!StringUtils.hasText(spot.getUsageFee())) {
            return minUsageFee == null; // 요금 정보가 없으면 최소값이 없을 때만 포함
        }
        
        try {
            // 숫자만 추출 (정규표현식 사용)
            String numericString = spot.getUsageFee().replaceAll("[^0-9]", "");
            if (numericString.isEmpty()) {
                return minUsageFee == null; // 숫자가 없으면 최소값이 없을 때만 포함
            }
            
            int usageFee = Integer.parseInt(numericString);
            
            if (minUsageFee != null && usageFee < minUsageFee) {
                return false;
            }
            
            if (maxUsageFee != null && usageFee > maxUsageFee) {
                return false;
            }
            
            return true;
        } catch (NumberFormatException e) {
            return minUsageFee == null; // 숫자 파싱 실패시 최소값이 없을 때만 포함
        }
    }

    private SpotResponse convertToResponse(Spot spot) {
        SpotResponse response = new SpotResponse();
        response.setId(spot.getId());
        response.setName(spot.getName());
        response.setSpotType(spot.getSpotType());
        response.setRoadAddress(spot.getRoadAddress());
        response.setLotAddress(spot.getLotAddress());
        response.setLatitude(spot.getLatitude());
        response.setLongitude(spot.getLongitude());
        response.setPhoneNumber(spot.getPhoneNumber());
        response.setWaterArea(spot.getWaterArea());
        response.setMainFishSpecies(spot.getMainFishSpecies());
        response.setMaxCapacity(spot.getMaxCapacity());
        response.setWaterFacilityType(spot.getWaterFacilityType());
        response.setUsageFee(spot.getUsageFee());
        response.setKeyPoints(spot.getKeyPoints());
        response.setSafetyFacilities(spot.getSafetyFacilities());
        response.setConvenienceFacilities(spot.getConvenienceFacilities());
        response.setNearbyAttractions(spot.getNearbyAttractions());
        response.setManagementPhone(spot.getManagementPhone());
        response.setManagementOffice(spot.getManagementOffice());
        response.setDataReferenceDate(spot.getDataReferenceDate());
        response.setRegion(spot.getRegion());
        
        // 바다 낚시터인 경우 fishingLevelInfo 설정
        if (spot.getSpotType() == SpotType.SEA) {
            response.setFishingLevelInfo(spot.isFishingLevelInfo());
        }
        
        return response;
    }
}