import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {userService} from "../../services/userService";

const KakaoCallbackPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const error = params.get("error");
        
        console.log("카카오 callback - code:", code);
        console.log("카카오 callback - error:", error);
        
        if (error) {
            console.error("카카오 로그인 에러:", error);
            alert("카카오 로그인이 취소되었습니다.");
            navigate("/auth/login");
            return;
        }
        
        if (code) {
            // 코드가 유효한지 확인
            if (code.length < 10) {
                console.error("유효하지 않은 인증 코드:", code);
                alert("유효하지 않은 인증 코드입니다.");
                navigate("/auth/login");
                return;
            }
            
            userService.kakaoLogin(code)
                .then((res) => {
                    console.log("카카오 로그인 성공:", res);
                    localStorage.setItem("accessToken", res.accessToken);
                    localStorage.setItem("refreshToken", res.refreshToken);
                    localStorage.setItem("loginId", res.loginId);
                    localStorage.setItem("userRole", res.role);
                    navigate("/");
                })
                .catch((error) => {
                    console.error("카카오 로그인 실패:", error);
                    alert("카카오 로그인에 실패했습니다. 다시 시도해주세요.");
                    navigate("/auth/login");
                });
        } else {
            console.error("인증 코드가 없습니다.");
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
