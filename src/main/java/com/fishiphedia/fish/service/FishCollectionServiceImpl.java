package com.fishiphedia.fish.service;

import com.fishiphedia.fish.dto.FishCollectionResponse;
import com.fishiphedia.fish.entity.FishCollection;
import com.fishiphedia.fish.repository.FishCollectionRepository;
import com.fishiphedia.user.entity.User;
import com.fishiphedia.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FishCollectionServiceImpl implements FishCollectionService {

    private final FishCollectionRepository fishCollectionRepository;
    private final UserRepository userRepository;

    @Override
    public List<FishCollectionResponse> getMyCollection() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String loginId = authentication.getName();
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
        List<FishCollection> collections = fishCollectionRepository.findByUser(user);
        return collections.stream().map(this::toResponse).collect(Collectors.toList());
    }

    private FishCollectionResponse toResponse(FishCollection entity) {
        FishCollectionResponse dto = new FishCollectionResponse();
        dto.setFishId(entity.getFish().getId());
        dto.setIsCollect(entity.getIsCollect());
        dto.setHighestScore(entity.getHighestScore());
        dto.setHighestLength(entity.getHighestLength());
        dto.setCollectAt(entity.getCollectAt());
        return dto;
    }
} 