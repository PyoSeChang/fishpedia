package com.fishiphedia.fish.service;

import com.fishiphedia.fish.dto.FishCollectionResponse;
import java.util.List;

public interface FishCollectionService {
    List<FishCollectionResponse> getMyCollection();
} 