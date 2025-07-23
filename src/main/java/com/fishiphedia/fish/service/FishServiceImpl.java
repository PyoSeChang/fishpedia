package com.fishiphedia.fish.service;

import com.fishiphedia.fish.dto.FishRequest;
import com.fishiphedia.fish.dto.FishResponse;
import com.fishiphedia.fish.entity.Fish;
import com.fishiphedia.fish.entity.FishCollection;
import com.fishiphedia.fish.repository.FishRepository;
import com.fishiphedia.fish.repository.FishCollectionRepository;
import com.fishiphedia.user.entity.User;
import com.fishiphedia.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FishServiceImpl implements FishService {

    private final FishRepository fishRepository;
    private final FishCollectionRepository fishCollectionRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<FishResponse> getAllFish() {
        return fishRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FishResponse getFishById(Long id) {
        Fish fish = fishRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("물고기를 찾을 수 없습니다."));
        return convertToResponse(fish);
    }

    @Override
    public FishResponse createFish(FishRequest request) {
        // 중복 체크
        if (fishRepository.existsByName(request.getName())) {
            throw new RuntimeException("이미 존재하는 물고기 이름입니다.");
        }

        Fish fish = new Fish();
        fish.setName(request.getName());
        fish.setAvgLength(request.getAvgLength());
        fish.setStdDeviation(request.getStdDeviation());
        fish.setRarityScore(request.getRarityScore());

        Fish savedFish = fishRepository.save(fish);
        return convertToResponse(savedFish);
    }

    @Override
    public FishResponse updateFish(Long id, FishRequest request) {
        Fish fish = fishRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("물고기를 찾을 수 없습니다."));

        // 이름 중복 체크 (자신 제외)
        if (!fish.getName().equals(request.getName()) && 
            fishRepository.existsByName(request.getName())) {
            throw new RuntimeException("이미 존재하는 물고기 이름입니다.");
        }

        fish.setName(request.getName());
        fish.setAvgLength(request.getAvgLength());
        fish.setStdDeviation(request.getStdDeviation());
        fish.setRarityScore(request.getRarityScore());

        Fish updatedFish = fishRepository.save(fish);
        return convertToResponse(updatedFish);
    }

    @Override
    public void deleteFish(Long id) {
        if (!fishRepository.existsById(id)) {
            throw new RuntimeException("물고기를 찾을 수 없습니다.");
        }
        fishRepository.deleteById(id);
    }

    @Override
    public void copyFishToCollection(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
        List<Fish> allFish = fishRepository.findAll();
        for (Fish fish : allFish) {
            // 이미 존재하는지 체크(중복 방지)
            boolean exists = fishCollectionRepository.findByUser(user).stream()
                    .anyMatch(fc -> fc.getFish().getId().equals(fish.getId()));
            if (!exists) {
                FishCollection collection = new FishCollection();
                collection.setUser(user);
                collection.setFish(fish);
                collection.setIsCollect(false);
                collection.setHighestScore(0);
                collection.setHighestLength(0.0);
                fishCollectionRepository.save(collection);
            }
        }
    }

    @Override
    public Fish findByName(String name) {
        return fishRepository.findByName(name).orElse(null);
    }

    private FishResponse convertToResponse(Fish fish) {
        FishResponse response = new FishResponse();
        response.setId(fish.getId());
        response.setName(fish.getName());
        response.setAvgLength(fish.getAvgLength());
        response.setStdDeviation(fish.getStdDeviation());
        response.setRarityScore(fish.getRarityScore());
        return response;
    }
} 