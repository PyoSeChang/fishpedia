package com.fishiphedia.spots.repository;

import com.fishiphedia.spots.entity.Spot;
import com.fishiphedia.spots.entity.SpotType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpotRepository extends JpaRepository<Spot, Long> {
    
    Optional<Spot> findByName(String name);
    
    List<Spot> findBySpotType(SpotType spotType);
    
    @Query("SELECT s FROM Spot s WHERE s.latitude BETWEEN :minLat AND :maxLat AND s.longitude BETWEEN :minLng AND :maxLng")
    List<Spot> findByLocationRange(@Param("minLat") Double minLat, @Param("maxLat") Double maxLat, 
                                   @Param("minLng") Double minLng, @Param("maxLng") Double maxLng);
    
    @Query("SELECT s FROM Spot s WHERE s.name LIKE %:keyword% OR s.mainFishSpecies LIKE %:keyword%")
    List<Spot> findByKeyword(@Param("keyword") String keyword);
}