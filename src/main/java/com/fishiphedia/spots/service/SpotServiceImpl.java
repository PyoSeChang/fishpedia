package com.fishiphedia.spots.service;

import com.fishiphedia.spots.dto.SpotResponse;
import com.fishiphedia.spots.dto.SpotSearchRequest;
import com.fishiphedia.spots.entity.Spot;
import com.fishiphedia.spots.entity.SpotType;
import com.fishiphedia.spots.repository.SpotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
        List<Spot> spots = spotRepository.findAll();
        
        return spots.stream()
                .filter(spot -> matchesSearchCriteria(spot, request))
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
        return spotRepository.findAll().stream()
                .filter(spot -> spot.getRegion() != null && spot.getRegion().contains(region))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SpotResponse> getSpotsInArea(Double minLat, Double maxLat, Double minLng, Double maxLng) {
        return spotRepository.findByLocationRange(minLat, maxLat, minLng, maxLng).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private boolean matchesSearchCriteria(Spot spot, SpotSearchRequest request) {
        if (request.getKeyword() != null && !request.getKeyword().isEmpty()) {
            String keyword = request.getKeyword().toLowerCase();
            boolean nameMatch = spot.getName() != null && spot.getName().toLowerCase().contains(keyword);
            boolean fishMatch = spot.getMainFishSpecies() != null && spot.getMainFishSpecies().toLowerCase().contains(keyword);
            boolean addressMatch = (spot.getRoadAddress() != null && spot.getRoadAddress().toLowerCase().contains(keyword)) ||
                                 (spot.getLotAddress() != null && spot.getLotAddress().toLowerCase().contains(keyword));
            if (!nameMatch && !fishMatch && !addressMatch) {
                return false;
            }
        }

        if (request.getSpotType() != null && !request.getSpotType().equals(spot.getSpotType())) {
            return false;
        }

        if (request.getWaterFacilityType() != null && !request.getWaterFacilityType().equals(spot.getWaterFacilityType())) {
            return false;
        }

        if (request.getRegion() != null && !request.getRegion().isEmpty()) {
            if (spot.getRegion() == null || !spot.getRegion().contains(request.getRegion())) {
                return false;
            }
        }

        if (request.getFishSpecies() != null && !request.getFishSpecies().isEmpty()) {
            if (spot.getMainFishSpecies() == null || !spot.getMainFishSpecies().contains(request.getFishSpecies())) {
                return false;
            }
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
        return response;
    }
}