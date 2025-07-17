package com.fishiphedia.user.service;

import java.util.Map;

import com.fishiphedia.user.dto.LoginRequest;
import com.fishiphedia.user.dto.RegisterRequest;
import com.fishiphedia.user.entity.User;
import com.fishiphedia.user.entity.UserInfo;

public interface UserService {
    
    // 회원가입
    Map<String, Object> register(RegisterRequest request);
    
    // 로그인
    Map<String, Object> login(LoginRequest request);
    
    // 로그아웃
    void logout();
    
    // 중복체크
    boolean existsByLoginId(String loginId);
    boolean existsByName(String name);
    boolean existsByEmail(String email);
    
    // 현재 사용자 프로필 조회
    Map<String, Object> getCurrentUserProfile();
    
    // 현재 사용자 정보 조회 (UserInfo)
    UserInfo getCurrentUserInfo();
    
    // 관리자 계정 생성 (개발용)
    Map<String, Object> createAdmin(RegisterRequest request);
    
    // 로그인 ID로 사용자 조회
    User findByLoginId(String loginId);

    Map<String, Object> kakaoLogin(String code);
} 