import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-800 to-cyan-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 로고 및 설명 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎣</span>
              <span className="font-bold text-xl">Fishipedia</span>
            </div>
            <p className="text-blue-100">
              낚시 기록과 도감 수집을 통한 즐거운 낚시 커뮤니티
            </p>
          </div>

          {/* 빠른 링크 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">빠른 링크</h3>
            <ul className="space-y-2 text-blue-100">
              <li><a href="/fish/collection" className="hover:text-white transition-colors">물고기 도감</a></li>
              <li><a href="/ranking" className="hover:text-white transition-colors">랭킹</a></li>
              <li><a href="/community" className="hover:text-white transition-colors">커뮤니티</a></li>
              <li><a href="/profile" className="hover:text-white transition-colors">프로필</a></li>
            </ul>
          </div>

          {/* 연락처 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">연락처</h3>
            <div className="space-y-2 text-blue-100">
              <p>📧 support@fishipedia.com</p>
              <p>📱 010-1234-5678</p>
              <p>📍 서울특별시 강남구</p>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-700 mt-8 pt-8 text-center text-blue-100">
          <p>&copy; 2024 Fishipedia. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 