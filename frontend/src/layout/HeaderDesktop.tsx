import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderDesktopProps {
  isLoggedIn: boolean;
  loginId: string;
  userRole: string;
  onLogout: () => void;
  navItems: Array<{ path: string; label: string; icon: string }>;
}

const HeaderDesktop: React.FC<HeaderDesktopProps> = ({
  isLoggedIn,
  loginId,
  userRole,
  onLogout,
  navItems
}) => {
  const location = useLocation();

  return (
    <header className="bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🐟</span>
            <span className="text-white font-bold text-xl">Fishipedia</span>
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
                <span className="text-white text-sm">안녕하세요, {loginId}님!</span>
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