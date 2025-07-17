import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {userService} from "../../services/userService";

const KakaoCallbackPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        console.log("카카오 code:", code);
        if (code) {
            userService.kakaoLogin(code)
                .then((res) => {
                    localStorage.setItem("accessToken", res.accessToken);
                    localStorage.setItem("refreshToken", res.refreshToken);
                    localStorage.setItem("loginId", res.loginId);
                    localStorage.setItem("userRole", res.role);
                    navigate("/");
                })
                .catch(() => {
                    navigate("/auth/login");
                });
        } else {
            navigate("/auth/login");
        }
    }, [navigate]);

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-xl font-semibold text-gray-700">
                카카오 로그인 처리 중입니다...
            </div>
        </div>
    );
};

export default KakaoCallbackPage;
