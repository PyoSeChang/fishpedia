package com.fishiphedia.fish.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FishLogDTO {
    private List<FishLogResponse> fishLogs;
    private FishCollectionResponse fishCollection;
}
