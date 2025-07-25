import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    BookOpen,
    ClipboardList,
    MapPin,
    Users,
    User,
    LogOut,
} from 'lucide-react';

interface HeaderDesktopProps {
    isLoggedIn: boolean;
    loginId: string;
    userRole: string;
    onLogout: () => void;
    navItems: Array<{ path: string; label: string }>;
}

const iconMap: Record<string, React.ReactNode> = {
    '홈': <Home size={18} className="text-blue-600" />,
    '도감': <BookOpen size={18} className="text-blue-600" />,
    '낚시 일지': <ClipboardList size={18} className="text-blue-600" />,
    '낚시 스팟': <MapPin size={18} className="text-blue-600" />,
    '커뮤니티': <Users size={18} className="text-blue-600" />,
    '프로필': <User size={18} className="text-blue-600" />,
    '관리자': <User size={18} className="text-blue-600" />
};

const HeaderDesktop: React.FC<HeaderDesktopProps> = ({
                                                         isLoggedIn,
                                                         loginId,
                                                         userRole,
                                                         onLogout,
                                                         navItems
                                                     }) => {
    const location = useLocation();

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                {/* 로고 */}
                <Link to="/" className="text-2xl font-extrabold tracking-tight text-blue-700">
                    Fishipedia
                </Link>

                {/* 내비게이션 */}
                <nav className="flex items-center gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-md transition-colors duration-150
                ${location.pathname === item.path
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'}`}
                        >
                            {iconMap[item.label] ?? null}<span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* 사용자 정보 */}
                <div className="flex items-center gap-4">
                    {isLoggedIn ? (
                        <>
              <span className="text-sm text-gray-700 hidden md:block">
                {userRole === 'ADMIN' ? '관리자' : `${loginId} 님`}
              </span>
                            <button
                                onClick={onLogout}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 bg-gray-100 rounded-md hover:bg-red-50 hover:text-red-700 transition"
                            >
                                <LogOut size={16} /> 로그아웃
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/auth/login"
                            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
                        >
                            로그인
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default HeaderDesktop;