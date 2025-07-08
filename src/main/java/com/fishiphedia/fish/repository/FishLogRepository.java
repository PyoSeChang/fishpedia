package com.fishiphedia.fish.repository;
import com.fishiphedia.fish.entity.Fish;
import com.fishiphedia.fish.entity.FishLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FishLogRepository extends JpaRepository<FishLog, Long> {
}
