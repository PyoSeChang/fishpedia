import api from './api';

export interface RegisterRequest {
  loginId: string;
  password: string;
  name: string;
  email: string;
  phoneNumber?: string;
}

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  loginId: string;
  role: string;
}

export interface UserInfo {
  id: number;
  name: string;
  level: number;
  currentLevelProgress: number;
  totalScore: number;
  email: string;
  phoneNumber?: string;
}

export const userService = {
  // 회원가입
  async register(data: RegisterRequest) {
    const response = await api.post('/users/register', data);
    return response.data;
  },

  // 로그인
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post('/users/login', data);
    return response.data;
  },

  // 카카오 로그인
  async kakaoLogin(code: string): Promise<LoginResponse> {
    const response = await api.post('/users/kakao-login', { code });
    return response.data;
  },

  // 네이버 로그인
  async naverLogin(code: string): Promise<LoginResponse> {
    const response = await api.post('/users/naver-login', { code });
    return response.data;
  },

  // 로그아웃
  async logout() {
    const response = await api.post('/users/logout');
    return response.data;
  },

  // 아이디 중복체크
  async checkLoginId(loginId: string) {
    const response = await api.get(`/users/check/loginId/${loginId}`);
    return response.data.exists;
  },

  // 닉네임 중복체크
  async checkName(name: string) {
    const response = await api.get(`/users/check/name/${name}`);
    return response.data.exists;
  },

  // 이메일 중복체크
  async checkEmail(email: string) {
    const response = await api.get(`/users/check/email/${email}`);
    return response.data.exists;
  },

  // 프로필 조회
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // 내 정보 조회 (UserInfo)
  async getMyInfo(): Promise<UserInfo> {
    const response = await api.get('/users/my-info');
    return response.data;
  }
}; 