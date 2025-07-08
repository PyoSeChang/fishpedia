package com.fishiphedia.user.controller;

import com.fishiphedia.user.dto.LoginRequest;
import com.fishiphedia.user.dto.RegisterRequest;
import com.fishiphedia.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    // 회원가입
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            Map<String, Object> result = userService.register(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Map<String, Object> result = userService.login(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        userService.logout();
        return ResponseEntity.ok(Map.of("message", "로그아웃되었습니다."));
    }

    // 아이디 중복체크
    @GetMapping("/check/loginId/{loginId}")
    public ResponseEntity<Map<String, Boolean>> checkLoginId(@PathVariable String loginId) {
        boolean exists = userService.existsByLoginId(loginId);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    // 닉네임 중복체크
    @GetMapping("/check/name/{name}")
    public ResponseEntity<Map<String, Boolean>> checkName(@PathVariable String name) {
        boolean exists = userService.existsByName(name);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    // 이메일 중복체크
    @GetMapping("/check/email/{email}")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@PathVariable String email) {
        boolean exists = userService.existsByEmail(email);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    // 사용자 정보 조회
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        try {
            Map<String, Object> profile = userService.getCurrentUserProfile();
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 관리자 계정 생성 (개발용)
    @PostMapping("/admin/register")
    public ResponseEntity<?> createAdmin(@RequestBody RegisterRequest request) {
        try {
            Map<String, Object> result = userService.createAdmin(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
} 