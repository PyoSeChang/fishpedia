import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getLoginIdFromToken } from '../utils/jwtUtils';
import { userService } from '../services/userService';

interface HeaderMobileProps {
  isLoggedIn: boolean;
  loginId: string;
  userName: string;
  userRole: string;
  onLogout: () => void;
  navItems: Array<{ path: string; label: string; icon: string }>;
}

const HeaderMobile: React.FC<HeaderMobileProps> = ({
  isLoggedIn,
  loginId,
  userName,
  userRole,
  onLogout,
  navItems
}) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string>('');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const fetchUserNameFromToken = async () => {
      if (isLoggedIn) {
        const token = localStorage.getItem('accessToken');
        if (token) {
          try {
            const tokenLoginId = getLoginIdFromToken(token);
            if (tokenLoginId) {
              const userInfo = await userService.getMyInfo();
              setDisplayName(userInfo.name);
            } else {
              setDisplayName(userName || loginId);
            }
          } catch (error) {
            console.error('사용자 정보 조회 실패:', error);
            setDisplayName(userName || loginId);
          }
        } else {
          setDisplayName(userName || loginId);
        }
      }
    };

    fetchUserNameFromToken();
  }, [isLoggedIn, userName, loginId]);

  return (
    <>
      <header className="bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* 햄버거 메뉴 버튼 */}
            <button
              onClick={toggleMenu}
              className="text-white p-2 rounded-md hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* 로고 */}
            <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
              <span className="text-white font-bold text-lg">아가미 아카이브</span>
            </Link>

            {/* 로그인 상태 표시 (간단히) */}
            <div className="text-white text-sm">
              {isLoggedIn ? (
                <span className="truncate max-w-20">{displayName || loginId}</span>
              ) : (
                <Link
                  to="/auth/login"
                  className="text-white hover:text-gray-200"
                  onClick={closeMenu}
                >
                  로그인
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 사이드바 오버레이 */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMenu}
        />
      )}

      {/* 사이드바 */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* 사이드바 헤더 */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-white font-bold text-lg">아가미 아카이브</span>
            </div>
            <button
              onClick={closeMenu}
              className="text-white p-1 rounded-md hover:bg-white hover:bg-opacity-10"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          
          {/* 사용자 정보 */}
          {isLoggedIn && (
            <div className="mt-4 text-white">
              <p className="text-sm opacity-90">안녕하세요!</p>
              <p className="font-semibold">{displayName || loginId}님</p>
            </div>
          )}
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="py-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              className={`flex items-center space-x-3 px-6 py-4 text-gray-700 hover:bg-gray-100 transition-colors ${
                location.pathname === item.path || 
                (item.path === '/community' && (location.pathname.startsWith('/board') || location.pathname.startsWith('/ranking')))
                  ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                  : ''
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* 로그아웃 버튼 */}
        {isLoggedIn && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <button
              onClick={() => {
                onLogout();
                closeMenu();
              }}
              className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              로그아웃
            </button>
          </div>
        )}

        {/* 로그인하지 않은 경우 로그인 버튼 */}
        {!isLoggedIn && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <Link
              to="/auth/login"
              onClick={closeMenu}
              className="block w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
            >
              로그인
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default HeaderMobile;