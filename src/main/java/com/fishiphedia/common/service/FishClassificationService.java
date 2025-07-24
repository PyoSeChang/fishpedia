package com.fishiphedia.common.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class FishClassificationService {

    @Value("${app.fastapi.url:http://localhost:8000}")
    private String fastApiUrl;

    private final RestTemplate restTemplate;

    public FishClassificationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public ClassificationResult classifyFish(MultipartFile imageFile) throws IOException {
        String url = fastApiUrl + "/predict";

        System.out.println("=== FastAPI 요청 시작 ===");
        System.out.println("URL: " + url);
        System.out.println("파일명: " + imageFile.getOriginalFilename());
        System.out.println("파일 크기: " + imageFile.getSize() + " bytes");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        ByteArrayResource resource = new ByteArrayResource(imageFile.getBytes()) {
            @Override
            public String getFilename() {
                return imageFile.getOriginalFilename();
            }
        };
        body.add("file", resource);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        System.out.println("FastAPI로 요청 전송 중...");
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, Map.class);

        System.out.println("=== FastAPI 응답 받음 ===");
        System.out.println("HTTP 상태 코드: " + response.getStatusCode());
        System.out.println("응답 헤더: " + response.getHeaders());
        
        if (response.getStatusCode() == HttpStatus.OK) {
            Map<String, Object> responseBody = response.getBody();
            System.out.println("=== FastAPI 응답 내용 ===");
            System.out.println("전체 응답: " + responseBody);
            
            if (responseBody != null) {
                System.out.println("predicted_fish: " + responseBody.get("predicted_fish"));
                System.out.println("confidence: " + responseBody.get("confidence"));
                System.out.println("all_predictions: " + responseBody.get("all_predictions"));
            } else {
                System.out.println("응답 본문이 null입니다!");
            }
            
            return mapToClassificationResult(responseBody);
        } else {
            System.out.println("FastAPI 오류 응답: " + response.getStatusCode());
            System.out.println("오류 응답 본문: " + response.getBody());
            throw new RuntimeException("FastAPI 서버에서 분류 실패: " + response.getStatusCode());
        }
    }

    public HealthStatus checkHealth() {
        try {
            String url = fastApiUrl + "/health";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();
                return new HealthStatus(
                    (String) responseBody.get("status"),
                    (Boolean) responseBody.get("model_loaded")
                );
            } else {
                return new HealthStatus("error", false);
            }
        } catch (Exception e) {
            return new HealthStatus("disconnected", false);
        }
    }

    private ClassificationResult mapToClassificationResult(Map<String, Object> responseBody) {
        System.out.println("=== 응답 데이터 파싱 시작 ===");
        
        if (responseBody == null) {
            System.out.println("responseBody가 null입니다!");
            return null;
        }
        
        System.out.println("responseBody 키들: " + responseBody.keySet());
        
        String predictedFish = (String) responseBody.get("predicted_fish");
        System.out.println("파싱된 predicted_fish: " + predictedFish);
        
        Object confidenceObj = responseBody.get("confidence");
        System.out.println("confidence 원본 객체: " + confidenceObj + " (타입: " + (confidenceObj != null ? confidenceObj.getClass() : "null") + ")");
        
        Double confidence = null;
        if (confidenceObj != null) {
            confidence = ((Number) confidenceObj).doubleValue();
            System.out.println("원본 confidence: " + confidence);
            
            // 테스트용: confidence를 70%로 하드코딩 (주석처리)
            // confidence = 0.70;
            // System.out.println("테스트용 하드코딩된 confidence: " + confidence);
        }
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> allPredictions = (List<Map<String, Object>>) responseBody.get("all_predictions");
        System.out.println("파싱된 all_predictions: " + allPredictions);
        
        // 새로 추가된 필드들 파싱
        Boolean isFishDetected = (Boolean) responseBody.get("is_fish_detected");
        String detectedFishName = (String) responseBody.get("detected_fish_name");
        System.out.println("파싱된 is_fish_detected: " + isFishDetected);
        System.out.println("파싱된 detected_fish_name: " + detectedFishName);
        
        ClassificationResult result = new ClassificationResult(predictedFish, confidence, allPredictions, isFishDetected, detectedFishName);
        System.out.println("최종 생성된 ClassificationResult: " + result);
        System.out.println("=== 응답 데이터 파싱 완료 ===");
        
        return result;
    }

    public static class ClassificationResult {
        private String predictedFish;
        private Double confidence;
        private List<Map<String, Object>> allPredictions;
        private Boolean isFishDetected;
        private String detectedFishName;
        private Long classificationLogId; // 추가: 분류 로그 ID

        public ClassificationResult(String predictedFish, Double confidence, List<Map<String, Object>> allPredictions, Boolean isFishDetected, String detectedFishName) {
            this.predictedFish = predictedFish;
            this.confidence = confidence;
            this.allPredictions = allPredictions;
            this.isFishDetected = isFishDetected;
            this.detectedFishName = detectedFishName;
        }

        public String getPredictedFish() {
            return predictedFish;
        }

        public void setPredictedFish(String predictedFish) {
            this.predictedFish = predictedFish;
        }

        public Double getConfidence() {
            return confidence;
        }

        public void setConfidence(Double confidence) {
            this.confidence = confidence;
        }

        public List<Map<String, Object>> getAllPredictions() {
            return allPredictions;
        }

        public void setAllPredictions(List<Map<String, Object>> allPredictions) {
            this.allPredictions = allPredictions;
        }

        public Boolean getIsFishDetected() {
            return isFishDetected;
        }

        public void setIsFishDetected(Boolean isFishDetected) {
            this.isFishDetected = isFishDetected;
        }

        public String getDetectedFishName() {
            return detectedFishName;
        }

        public void setDetectedFishName(String detectedFishName) {
            this.detectedFishName = detectedFishName;
        }

        public Long getClassificationLogId() {
            return classificationLogId;
        }

        public void setClassificationLogId(Long classificationLogId) {
            this.classificationLogId = classificationLogId;
        }
    }

    public static class HealthStatus {
        private String status;
        private Boolean modelLoaded;

        public HealthStatus(String status, Boolean modelLoaded) {
            this.status = status;
            this.modelLoaded = modelLoaded;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Boolean getModelLoaded() {
            return modelLoaded;
        }

        public void setModelLoaded(Boolean modelLoaded) {
            this.modelLoaded = modelLoaded;
        }
    }
}