import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [userRole, setUserRole] = useState('');

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
    { path: '/', label: '홈', icon: '🏠' },
    { path: '/fish/collection', label: '도감', icon: '🐟' },
    { path: '/fish/logs', label: '낚시 일지', icon: '📋' },
    { path: '/ranking', label: '랭킹', icon: '🏆' },
    // { path: '/community', label: '커뮤니티', icon: '💬' },
    { path: '/board', label: '게시판', icon: '📝' },
    { 
      path: userRole === 'ADMIN' ? '/admin' : '/profile', 
      label: userRole === 'ADMIN' ? '관리자' : '프로필', 
      icon: userRole === 'ADMIN' ? '⚙️' : '👤' 
    },
  ];

  return (
    <header className="bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎣</span>
            <span className="text-white font-bold text-xl">Fishipedia</span>
          </Link>

          {/* 네비게이션 */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* 로그인/로그아웃 버튼 */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                <span className="text-white text-sm">안녕하세요, {loginId}님!</span>
                <button
                  onClick={handleLogout}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link
                to="/auth/login"
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 