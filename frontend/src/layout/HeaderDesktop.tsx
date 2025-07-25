import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getLoginIdFromToken } from '../utils/jwtUtils';
import { userService } from '../services/userService';

interface HeaderDesktopProps {
  isLoggedIn: boolean;
  loginId: string;
  userName: string;
  userRole: string;
  onLogout: () => void;
  navItems: Array<{ path: string; label: string; icon: string }>;
}

const HeaderDesktop: React.FC<HeaderDesktopProps> = ({
  isLoggedIn,
  loginId,
  userName,
  userRole,
  onLogout,
  navItems
}) => {
  const location = useLocation();
  const [displayName, setDisplayName] = useState<string>('');

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
    <header className="bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-white font-bold text-xl">아가미 아카이브</span>
          </Link>

          {/* 네비게이션 */}
          <nav className="flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === item.path || 
                  (item.path === '/community' && (location.pathname.startsWith('/board') || location.pathname.startsWith('/ranking')))
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
                {/*<span className="text-white text-sm">안녕하세요, {displayName || loginId}님!</span>*/}
                <button
                  onClick={onLogout}
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

export default HeaderDesktop;