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
import org.springframework.web.client.RestTemplate;

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
        // 중복 체크 (email은 loginId와 동일하므로 한 번만 체크)
        if (existsByLoginId(request.getLoginId())) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }
        if (existsByName(request.getName())) {
            throw new RuntimeException("이미 존재하는 닉네임입니다.");
        }

        // User 엔티티 생성
        User user = new User();
        user.setLoginId(request.getLoginId()); // 이제 loginId는 email
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER); // 기본값은 USER
        userRepository.save(user);

        // UserInfo 엔티티 생성
        UserInfo userInfo = new UserInfo();
        userInfo.setName(request.getName());
        userInfo.setEmail(request.getLoginId()); // email은 loginId와 동일
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
                .orElseThrow(() -> new RuntimeException("이메일 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("이메일 또는 비밀번호가 올바르지 않습니다.");
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
        // 중복 체크 (email은 loginId와 동일하므로 한 번만 체크)
        if (existsByLoginId(request.getLoginId())) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }
        if (existsByName(request.getName())) {
            throw new RuntimeException("이미 존재하는 닉네임입니다.");
        }

        // User 엔티티 생성 (ADMIN 권한)
        User user = new User();
        user.setLoginId(request.getLoginId()); // 이제 loginId는 email
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ADMIN);
        userRepository.save(user);

        // UserInfo 엔티티 생성
        UserInfo userInfo = new UserInfo();
        userInfo.setName(request.getName());
        userInfo.setEmail(request.getLoginId()); // email은 loginId와 동일
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

    @Override
    public synchronized Map<String, Object> kakaoLogin(String code) {
        try {
            // 1. 카카오 토큰 발급 요청
            String tokenUri = "https://kauth.kakao.com/oauth/token";
            RestTemplate restTemplate = new RestTemplate();
            Map<String, String> tokenParams = new HashMap<>();
            tokenParams.put("grant_type", "authorization_code");
            tokenParams.put("client_id", "a7f21c96241b51f363002bbe85fd5630"); // REST API 키
            tokenParams.put("redirect_uri", "http://localhost:3000/oauth/callback/kakao");
            tokenParams.put("code", code);

            // application/x-www-form-urlencoded
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED);
            org.springframework.util.MultiValueMap<String, String> body = new org.springframework.util.LinkedMultiValueMap<>();
            body.setAll(tokenParams);

            org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, String>> httpEntity =
                    new org.springframework.http.HttpEntity<>(body, headers);

            Map<String, Object> tokenResponse = restTemplate.postForObject(tokenUri, httpEntity, Map.class);
            String accessToken = (String) tokenResponse.get("access_token");

            // 2. 카카오 사용자 정보 요청
            String userInfoUri = "https://kapi.kakao.com/v2/user/me";
            org.springframework.http.HttpHeaders infoHeaders = new org.springframework.http.HttpHeaders();
            infoHeaders.setBearerAuth(accessToken);

            org.springframework.http.HttpEntity<Void> infoEntity = new org.springframework.http.HttpEntity<>(infoHeaders);
            Map<String, Object> userInfoResponse = restTemplate.postForObject(userInfoUri, infoEntity, Map.class);
            System.out.println("카카오 userInfoResponse: " + userInfoResponse);

            // 3. 카카오 계정에서 이메일/ID 추출
            Map<String, Object> kakaoAccount = (Map<String, Object>) userInfoResponse.get("kakao_account");
            System.out.println("kakaoAcount !!!!!"+kakaoAccount);
            String email = (String) kakaoAccount.get("email");
            System.out.println("email !!!!!!"+email);
            String nickname = (String) ((Map<String, Object>) kakaoAccount.get("profile")).get("nickname");
            System.out.println("nickname !!!!!!"+nickname);
            String kakaoId = String.valueOf(userInfoResponse.get("id")); // 고유ID (String 변환)
            System.out.println("kakaoId !!!!!!"+kakaoId);
            
            // 4. 우리 서비스 회원 존재 여부 확인 (email을 loginId로 사용)
            User user = userRepository.findByLoginId(email).orElse(null);

            if (user == null) {
                try {
                    // 회원이 아니면 자동 회원가입
                    user = new User();
                    user.setLoginId(email); // 이메일을 loginId로 사용
                    user.setPassword(passwordEncoder.encode("kakao_dummy_password_" + kakaoId)); // 더미패스워드
                    user.setRole(Role.USER);
                    userRepository.save(user);

                    // UserInfo 생성
                    UserInfo userInfo = new UserInfo();
                    userInfo.setName(nickname);
                    userInfo.setEmail(email);
                    userInfo.setLevel(1);
                    userInfo.setUser(user);
                    userInfoRepository.save(userInfo);

                    // 도감 자동 생성 등 기존 회원가입과 동일
                    fishService.copyFishToCollection(user.getId());
                } catch (org.springframework.dao.DataIntegrityViolationException e) {
                    // 중복 키 오류가 발생하면 다시 조회 (다른 스레드에서 이미 생성됨)
                    user = userRepository.findByLoginId(email)
                            .orElseThrow(() -> new RuntimeException("사용자 조회 실패"));
                }
            }

            // 5. JWT 토큰 발급
            String jwtAccessToken = jwtUtil.generateAccessToken(user.getLoginId());
            String jwtRefreshToken = jwtUtil.generateRefreshToken(user.getLoginId());

            Map<String, Object> result = new HashMap<>();
            result.put("message", "카카오 로그인 완료");
            result.put("accessToken", jwtAccessToken);
            result.put("refreshToken", jwtRefreshToken);
            result.put("loginId", user.getLoginId());
            result.put("role", user.getRole().name());
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("카카오 로그인 실패: " + e.getMessage(), e);
        }
    }

}
