import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  ClipboardList,
  MapPin,
  Users,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface HeaderMobileProps {
  isLoggedIn: boolean;
  loginId: string;
  userRole: string;
  onLogout: () => void;
  navItems: Array<{ path: string; label: string }>;
}

const iconMap: Record<string, React.ReactNode> = {
  '홈': <Home size={18} />,
  '도감': <BookOpen size={18} />,
  '낚시 일지': <ClipboardList size={18} />,
  '낚시 스팟': <MapPin size={18} />,
  '커뮤니티': <Users size={18} />,
  '프로필': <User size={18} />,
  '관리자': <User size={18} />
};

const HeaderMobile: React.FC<HeaderMobileProps> = ({
                                                     isLoggedIn,
                                                     loginId,
                                                     userRole,
                                                     onLogout,
                                                     navItems
                                                   }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
      <>
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-blue-700">
              Fishipedia
            </Link>

            <button onClick={toggleMenu} className="text-gray-700">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>

        {isOpen && (
            <div className="fixed top-0 left-0 w-full h-full bg-white z-40 overflow-y-auto">
              <div className="px-6 py-6 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-blue-700">Fishipedia</span>
                  <button onClick={closeMenu}><X size={24} /></button>
                </div>

                {isLoggedIn && (
                    <div className="text-sm text-gray-600">
                      {userRole === 'ADMIN' ? '관리자' : `${loginId} 님`}
                    </div>
                )}

                <nav className="space-y-3">
                  {navItems.map((item) => (
                      <Link
                          key={item.path}
                          to={item.path}
                          onClick={closeMenu}
                          className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors
                    ${location.pathname === item.path
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'}`}
                      >
                        {iconMap[item.label] ?? null}<span>{item.label}</span>
                      </Link>
                  ))}
                </nav>

                <div className="pt-6">
                  {isLoggedIn ? (
                      <button
                          onClick={() => {
                            onLogout();
                            closeMenu();
                          }}
                          className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition"
                      >
                        로그아웃
                      </button>
                  ) : (
                      <Link
                          to="/auth/login"
                          onClick={closeMenu}
                          className="block text-center bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
                      >
                        로그인
                      </Link>
                  )}
                </div>
              </div>
            </div>
        )}
      </>
  );
};

export default HeaderMobile;
