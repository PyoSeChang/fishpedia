package com.fishiphedia.fish.repository;

import com.fishiphedia.fish.entity.Fish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FishRepository extends JpaRepository<Fish, Long> {
    
    Optional<Fish> findByName(String name);
    
    boolean existsByName(String name);
} 