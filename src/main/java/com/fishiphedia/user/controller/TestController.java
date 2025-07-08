package com.fishiphedia.user.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @GetMapping("/health")
    public Map<String, Object> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Server is running! 🎣");
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }

    @GetMapping("/fish")
    public Map<String, Object> getFishData() {
        Map<String, Object> response = new HashMap<>();
        response.put("fish", new Object[]{
            Map.of("id", 1, "name", "붕어", "avgLength", 15.0, "stdDeviation", 3.0, "isCollected", true),
            Map.of("id", 2, "name", "잉어", "avgLength", 25.0, "stdDeviation", 5.0, "isCollected", false),
            Map.of("id", 3, "name", "배스", "avgLength", 20.0, "stdDeviation", 4.0, "isCollected", true)
        });
        return response;
    }
} 