package com.fishiphedia.fish.controller;

import java.util.List;
import java.util.stream.Collectors;

import com.fishiphedia.fish.dto.*;
import com.fishiphedia.fish.entity.FishCollection;
import com.fishiphedia.fish.service.FishCollectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;

import com.fishiphedia.common.service.FileUploadService;
import com.fishiphedia.fish.entity.FishLog;
import com.fishiphedia.fish.service.FishLogService;
import com.fishiphedia.user.entity.User;
import com.fishiphedia.user.service.UserService;
import com.fishiphedia.search.service.SearchLogService;
import com.fishiphedia.search.entity.SearchLog.SearchType;
import com.fishiphedia.fish.service.FishService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/fish/logs")
@RequiredArgsConstructor
@Slf4j
public class FishLogController {

    private final FishLogService fishLogService;
    private final UserService userService;
    private final FileUploadService fileUploadService;
    private final FishCollectionService fishCollectionService;
    private final SearchLogService searchLogService;
    private final FishService fishService;


    // 낚시 일지 작성 (레벨 업데이트 포함)
    @PostMapping
    public ResponseEntity<FishLogCreateResponse> createFishLogWithLevel(
            @ModelAttribute FishLogRequest request,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findByLoginId(authentication.getName());
        
        // 이미지 업로드 처리
        if (image != null && !image.isEmpty()) {
            try {
                log.info("이미지 업로드 시작 - 파일명: {}, 크기: {}", image.getOriginalFilename(), image.getSize());
                String imgPath = fileUploadService.uploadFile(image);
                request.setImgPath(imgPath);
                log.info("이미지 업로드 성공: {}", imgPath);
            } catch (Exception e) {
                log.error("이미지 업로드 실패 - 파일명: {}, 에러: {}", image.getOriginalFilename(), e.getMessage(), e);
                return ResponseEntity.badRequest().body(null);
            }
        } else {
            log.info("업로드할 이미지 없음");
        }
        
        FishLogCreateResponse response = fishLogService.createFishLogWithLevel(request, user);
        return ResponseEntity.ok(response);
    }

    // 낚시 일지 작성 (레벨 업데이트 포함) - 새로운 엔드포인트
    @PostMapping("/with-level")
    public ResponseEntity<FishLogCreateResponse> createFishLogWithLevelNew(
            @ModelAttribute FishLogRequest request,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findByLoginId(authentication.getName());
        
        // 이미지 업로드 처리
        if (image != null && !image.isEmpty()) {
            try {
                log.info("이미지 업로드 시작 - 파일명: {}, 크기: {}", image.getOriginalFilename(), image.getSize());
                String imgPath = fileUploadService.uploadFile(image);
                request.setImgPath(imgPath);
                log.info("이미지 업로드 성공: {}", imgPath);
            } catch (Exception e) {
                log.error("이미지 업로드 실패 - 파일명: {}, 에러: {}", image.getOriginalFilename(), e.getMessage(), e);
                return ResponseEntity.badRequest().body(null);
            }
        } else {
            log.info("업로드할 이미지 없음");
        }
        
        FishLogCreateResponse response = fishLogService.createFishLogWithLevel(request, user);
        return ResponseEntity.ok(response);
    }

    // 사용자의 낚시 일지 목록 조회
    @GetMapping
    public FishLogDTO getMyFishLogs(
            @RequestParam(value = "fishId", required = false) Long fishId,
            HttpServletRequest request) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findByLoginId(authentication.getName());

        
        List<FishLog> fishLogs;
        FishCollectionResponse fishCollection;
        if (fishId != null) {
            fishLogs = fishLogService.getUserFishLogsByFish(user, fishId);
            fishCollection= fishCollectionService.getFishCollectionByFish(fishId);
            
            // 특정 물고기로 필터링한 경우 검색 로그 저장
            try {
                String fishName = "물고기ID:" + fishId;
                try {
                    var fishResponse = fishService.getFishById(fishId);
                    if (fishResponse != null) {
                        fishName = fishResponse.getName();
                    }
                } catch (Exception ignored) {
                    // 물고기 이름 조회 실패 시 ID로 대체
                }
                searchLogService.logSearch(fishName, SearchType.FISH_LOG, 
                                         fishLogs.size(), user.getId(), request);
            } catch (Exception e) {
                log.debug("낚시 일지 검색 로그 저장 실패: {}", e.getMessage());
            }
        } else {
            fishLogs = fishLogService.getUserFishLogs(user);
            fishCollection = null;
        }

        List<FishLogResponse> responses = fishLogs.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        System.out.println("FishCollection.CurrentLevelProgress: "+fishCollection.getCurrentLevelProgress());
        System.out.println("FishCollection.CurrentLevelProgress: "+fishCollection.getCurrentLevelProgress());
        System.out.println("FishCollection.CurrentLevelProgress: "+fishCollection.getCurrentLevelProgress());
        return FishLogDTO.builder()
                .fishLogs(responses)
                .fishCollection(fishCollection)
                .build();
    }

    // 특정 낚시 일지 조회
    @GetMapping("/{id}")
    public ResponseEntity<FishLogResponse> getFishLog(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findByLoginId(authentication.getName());
        
        FishLog fishLog = fishLogService.getFishLogById(id, user);
        return ResponseEntity.ok(convertToResponse(fishLog));
    }

    // 낚시 일지 검증 API
    @PostMapping("/{id}/verify")
    public ResponseEntity<Boolean> verifyFishLog(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findByLoginId(authentication.getName());
        
        // TODO: 실제 검증 로직 구현
        // 현재는 항상 true 반환
        boolean isVerified = fishLogService.verifyFishLog(id, user);
        
        return ResponseEntity.ok(isVerified);
    }

    private FishLogResponse convertToResponse(FishLog fishLog) {
        return FishLogResponse.builder()
                .id(fishLog.getId())
                .fishId(fishLog.getFish().getId())
                .fishName(fishLog.getFish().getName())
                .collectAt(fishLog.getCollectAt())
                .length(fishLog.getLength())
                .score(fishLog.getScore())
                .place(fishLog.getPlace())
                .review(fishLog.getReview())
                .imgPath(fishLog.getImgPath())
                .certified(fishLog.getCertified())
                .build();
    }
} 