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

        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, Map.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            Map<String, Object> responseBody = response.getBody();
            return mapToClassificationResult(responseBody);
        } else {
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
        String predictedFish = (String) responseBody.get("predicted_fish");
        Double confidence = ((Number) responseBody.get("confidence")).doubleValue();
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> allPredictions = (List<Map<String, Object>>) responseBody.get("all_predictions");
        
        return new ClassificationResult(predictedFish, confidence, allPredictions);
    }

    public static class ClassificationResult {
        private String predictedFish;
        private Double confidence;
        private List<Map<String, Object>> allPredictions;

        public ClassificationResult(String predictedFish, Double confidence, List<Map<String, Object>> allPredictions) {
            this.predictedFish = predictedFish;
            this.confidence = confidence;
            this.allPredictions = allPredictions;
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