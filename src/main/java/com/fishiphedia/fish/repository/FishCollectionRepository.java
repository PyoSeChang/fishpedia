package com.fishiphedia.fish.repository;

import com.fishiphedia.fish.entity.FishCollection;
import com.fishiphedia.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FishCollectionRepository extends JpaRepository<FishCollection, Long> {
    List<FishCollection> findByUser(User user);
    List<FishCollection> findByFishIdOrderByHighestScoreDesc(Long fishId);
}
