import React from 'react';
import { Mail, Phone, MapPin, Fish } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
      <footer className="bg-gray-900 text-gray-300 py-4 border-t border-gray-800 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          {/* 브랜드 */}
          <div className="flex items-center gap-2 mb-2 md:mb-0">
            <Fish className="text-blue-400" size={20} />
            <span className="text-white font-semibold text-lg">Fishipedia</span>
          </div>

          {/* 링크 및 연락처 */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-x-12 gap-y-2 text-gray-400">
            <div className="flex items-center gap-1">
              <span className="text-white font-medium">빠른 링크:</span>
              <Link to="/fish/collection" className="hover:text-white ml-2">도감</Link>
              <Link to="/ranking" className="hover:text-white ml-2">랭킹</Link>
              <Link to="/community" className="hover:text-white ml-2">커뮤니티</Link>
              <Link to="/profile" className="hover:text-white ml-2">프로필</Link>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-white font-medium">연락처:</span>
              <span className="flex items-center gap-1"><Mail size={14} /> support@fishipedia.com</span>
              <span className="flex items-center gap-1"><Phone size={14} /> 010-9549-3429</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> 부산진구</span>
            </div>
          </div>
        </div>

        <div className="mt-3 text-center text-xs text-gray-500">
          © 2024 Fishipedia. All rights reserved.
        </div>
      </footer>
  );
};

export default Footer;
