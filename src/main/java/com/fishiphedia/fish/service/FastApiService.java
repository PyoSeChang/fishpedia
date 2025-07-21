package com.fishiphedia.fish.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FastApiService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${fastapi.url:http://localhost:8000}")
    private String fastApiUrl;

    /**
     * FastAPI를 통한 물고기 종류 식별
     */
    public String identifyFish(MultipartFile image) {
        try {
            String url = fastApiUrl + "/api/fish/identify";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(image.getBytes()) {
                @Override
                public String getFilename() {
                    return image.getOriginalFilename();
                }
            });

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            log.info("FastAPI 물고기 식별 요청: {}", url);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                String fishType = (String) result.get("fish_type");
                Double confidence = (Double) result.get("confidence");
                
                log.info("물고기 식별 결과: {} (신뢰도: {}%)", fishType, confidence);
                return fishType;
            }
            
            log.warn("FastAPI 응답이 비정상적입니다: {}", response.getStatusCode());
            return null;
            
        } catch (Exception e) {
            log.error("FastAPI 물고기 식별 중 오류 발생", e);
            return null;
        }
    }

    /**
     * FastAPI를 통한 물고기 크기 측정
     */
    public Double measureFishSize(MultipartFile image) {
        try {
            String url = fastApiUrl + "/api/fish/measure";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(image.getBytes()) {
                @Override
                public String getFilename() {
                    return image.getOriginalFilename();
                }
            });

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            log.info("FastAPI 물고기 크기 측정 요청: {}", url);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                Double length = (Double) result.get("length_cm");
                Double confidence = (Double) result.get("confidence");
                
                log.info("물고기 크기 측정 결과: {}cm (신뢰도: {}%)", length, confidence);
                return length;
            }
            
            log.warn("FastAPI 응답이 비정상적입니다: {}", response.getStatusCode());
            return null;
            
        } catch (Exception e) {
            log.error("FastAPI 물고기 크기 측정 중 오류 발생", e);
            return null;
        }
    }

    /**
     * FastAPI를 통한 종합 분석 (물고기 식별 + 크기 측정)
     */
    public Map<String, Object> analyzeFish(MultipartFile image) {
        try {
            String url = fastApiUrl + "/api/fish/analyze";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(image.getBytes()) {
                @Override
                public String getFilename() {
                    return image.getOriginalFilename();
                }
            });

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            log.info("FastAPI 물고기 종합 분석 요청: {}", url);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                log.info("물고기 종합 분석 결과: {}", result);
                return result;
            }
            
            log.warn("FastAPI 응답이 비정상적입니다: {}", response.getStatusCode());
            return new HashMap<>();
            
        } catch (Exception e) {
            log.error("FastAPI 물고기 종합 분석 중 오류 발생", e);
            return new HashMap<>();
        }
    }

    /**
     * FastAPI를 통한 점수 계산
     */
    public Integer calculateScore(String fishType, Double length, String location) {
        try {
            String url = fastApiUrl + "/api/fish/score";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("fish_type", fishType);
            requestBody.put("length_cm", length);
            requestBody.put("location", location);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            log.info("FastAPI 점수 계산 요청: {} - {}", url, requestBody);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                Integer score = (Integer) result.get("score");
                
                log.info("점수 계산 결과: {}점", score);
                return score;
            }
            
            log.warn("FastAPI 응답이 비정상적입니다: {}", response.getStatusCode());
            return null;
            
        } catch (Exception e) {
            log.error("FastAPI 점수 계산 중 오류 발생", e);
            return null;
        }
    }

    /**
     * FastAPI 서버 상태 확인
     */
    public boolean isHealthy() {
        try {
            String url = fastApiUrl + "/health";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.warn("FastAPI 서버 상태 확인 실패: {}", e.getMessage());
            return false;
        }
    }
}