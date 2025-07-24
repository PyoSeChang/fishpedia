import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FishClassifier from '../../components/fish/FishClassifier';

const HomePage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 로그인 상태 확인
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token);
  }, []);

  const handleLoginPrompt = () => {
    navigate('/auth/login');
  };

  return (
    <div className="space-y-12">
      {/* 히어로 섹션 */}
      <section className="text-center py-8 md:py-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl text-white">
        <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-6">
          🐟 Fishipedia
        </h1>
        <p className="text-sm md:text-xl text-blue-100 px-4">
          AI로 물고기를 분류하고 낚시를 기록하세요
        </p>
      </section>


      {/* AI 물고기 분류기 섹션 */}
      <FishClassifier 
        isAuthenticated={isAuthenticated} 
        onLoginPrompt={handleLoginPrompt} 
      />

    </div>
  );
};

export default HomePage; 