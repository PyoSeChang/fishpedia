package com.fishiphedia.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String loginId;
    private String password;
    private String name;
    private String email;
    private String phoneNumber;
} 