import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import HeaderDesktop from './HeaderDesktop';
import HeaderMobile from './HeaderMobile';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedLoginId = localStorage.getItem('loginId');
    const storedUserRole = localStorage.getItem('userRole');
    if (token && storedLoginId) {
      setIsLoggedIn(true);
      setLoginId(storedLoginId);
      setUserRole(storedUserRole || 'USER');
    }
  }, []);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const handleLogout = async () => {
    try {
      await userService.logout();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('loginId');
      localStorage.removeItem('userRole');
      setIsLoggedIn(false);
      setLoginId('');
      setUserRole('');
      navigate('/auth/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const navItems = [
    { path: '/', label: '홈', icon: '' },
    { path: '/fish/collection', label: '도감', icon: '' },
    { path: '/fish/logs', label: '낚시 일지', icon: '' },
    { path: '/spots', label: '낚시 스팟', icon: '' },
    { path: '/community', label: '커뮤니티', icon: '' },
    { 
      path: userRole === 'ADMIN' ? '/admin' : '/profile', 
      label: userRole === 'ADMIN' ? '관리자' : '프로필', 
      icon: userRole === 'ADMIN' ? '' : '' 
    },
  ];

  const commonProps = {
    isLoggedIn,
    loginId,
    userRole,
    onLogout: handleLogout,
    navItems
  };

  return isMobile ? (
    <HeaderMobile {...commonProps} />
  ) : (
    <HeaderDesktop {...commonProps} />
  );
};

export default Header; 