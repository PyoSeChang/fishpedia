package com.fishiphedia.user.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fishiphedia.common.util.JwtUtil;
import com.fishiphedia.fish.service.FishService;
import com.fishiphedia.user.dto.LoginRequest;
import com.fishiphedia.user.dto.RegisterRequest;
import com.fishiphedia.user.entity.Role;
import com.fishiphedia.user.entity.User;
import com.fishiphedia.user.entity.UserInfo;
import com.fishiphedia.user.repository.UserInfoRepository;
import com.fishiphedia.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserInfoRepository userInfoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final FishService fishService;

    @Override
    public Map<String, Object> register(RegisterRequest request) {
        // 중복 체크
        if (existsByLoginId(request.getLoginId())) {
            throw new RuntimeException("이미 존재하는 아이디입니다.");
        }
        if (existsByName(request.getName())) {
            throw new RuntimeException("이미 존재하는 닉네임입니다.");
        }
        if (existsByEmail(request.getEmail())) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }

        // User 엔티티 생성
        User user = new User();
        user.setLoginId(request.getLoginId());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER); // 기본값은 USER
        userRepository.save(user);

        // UserInfo 엔티티 생성
        UserInfo userInfo = new UserInfo();
        userInfo.setName(request.getName());
        userInfo.setEmail(request.getEmail());
        userInfo.setPhoneNumber(request.getPhoneNumber());
        userInfo.setLevel(1);
        userInfo.setUser(user);
        userInfoRepository.save(userInfo);

        // 회원가입 시 도감 자동 생성
        fishService.copyFishToCollection(user.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("message", "회원가입이 완료되었습니다.");
        result.put("userId", user.getId());
        return result;
    }

    @Override
    public Map<String, Object> login(LoginRequest request) {
        User user = userRepository.findByLoginId(request.getLoginId())
                .orElseThrow(() -> new RuntimeException("아이디 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        // JWT 토큰 생성
        String accessToken = jwtUtil.generateAccessToken(user.getLoginId());
        String refreshToken = jwtUtil.generateRefreshToken(user.getLoginId());

        Map<String, Object> result = new HashMap<>();
        result.put("message", "로그인되었습니다.");
        result.put("accessToken", accessToken);
        result.put("refreshToken", refreshToken);
        result.put("loginId", user.getLoginId());
        result.put("role", user.getRole().name());
        return result;
    }

    @Override
    public void logout() {
        // JWT는 클라이언트에서 토큰을 삭제하면 됨
        // 서버에서는 별도 처리 없음 (Stateless)
    }

    @Override
    public boolean existsByLoginId(String loginId) {
        return userRepository.existsByLoginId(loginId);
    }

    @Override
    public boolean existsByName(String name) {
        return userInfoRepository.existsByName(name);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userInfoRepository.existsByEmail(email);
    }

    @Override
    public Map<String, Object> getCurrentUserProfile() {
        // TODO: SecurityContext에서 현재 사용자 정보 가져오기
        // 현재는 임시로 구현
        Map<String, Object> profile = new HashMap<>();
        profile.put("message", "프로필 조회 기능은 추후 구현 예정");
        return profile;
    }

    @Override
    public UserInfo getCurrentUserInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String loginId = authentication.getName();
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        return userInfoRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("사용자 정보를 찾을 수 없습니다."));
    }

    @Override
    public Map<String, Object> createAdmin(RegisterRequest request) {
        // 중복 체크
        if (existsByLoginId(request.getLoginId())) {
            throw new RuntimeException("이미 존재하는 아이디입니다.");
        }
        if (existsByName(request.getName())) {
            throw new RuntimeException("이미 존재하는 닉네임입니다.");
        }
        if (existsByEmail(request.getEmail())) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }

        // User 엔티티 생성 (ADMIN 권한)
        User user = new User();
        user.setLoginId(request.getLoginId());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ADMIN);
        userRepository.save(user);

        // UserInfo 엔티티 생성
        UserInfo userInfo = new UserInfo();
        userInfo.setName(request.getName());
        userInfo.setEmail(request.getEmail());
        userInfo.setPhoneNumber(request.getPhoneNumber());
        userInfo.setLevel(1);
        userInfo.setUser(user);
        userInfoRepository.save(userInfo);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "관리자 계정이 생성되었습니다.");
        result.put("userId", user.getId());
        result.put("role", user.getRole().name());
        return result;
    }

    @Override
    public User findByLoginId(String loginId) {
        return userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }
}
