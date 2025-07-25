import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string; // loginId
  iat: number; // issued at
  exp: number; // expiration
}

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch (error) {
    console.error('JWT 디코딩 실패:', error);
    return null;
  }
};

export const getLoginIdFromToken = (token: string): string | null => {
  const decoded = decodeToken(token);
  return decoded?.sub || null;
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};