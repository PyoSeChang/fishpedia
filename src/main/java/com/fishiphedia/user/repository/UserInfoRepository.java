    package com.fishiphedia.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fishiphedia.user.entity.UserInfo;

@Repository
public interface UserInfoRepository extends JpaRepository<UserInfo, Long> {
    
    Optional<UserInfo> findByUserId(Long userId);
    
    boolean existsByName(String name);
    
    boolean existsByEmail(String email);
} 