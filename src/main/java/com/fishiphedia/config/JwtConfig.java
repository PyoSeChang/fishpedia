package com.fishiphedia.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "jwt")
@Getter
@Setter
public class JwtConfig {
    
    private String secret = "fishiphediaSecretKeyForJWTTokenGenerationAndValidation2024";
    private long accessTokenExpiration = 3600000; // 1시간 (밀리초)
    private long refreshTokenExpiration = 2592000000L; // 30일 (밀리초)
} 