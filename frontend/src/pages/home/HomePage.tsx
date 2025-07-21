import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fishService } from '../../services/fishService';
import FishClassifier from '../../components/fish/FishClassifier';

const HomePage: React.FC = () => {
  const [serverStatus, setServerStatus] = useState<string>('연결 중...');
  const [fishCount, setFishCount] = useState<number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 로그인 상태 확인
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token);

    // 서버 상태 확인 (간단한 API 호출로 대체)
    fishService.getAllFish()
      .then((data: any) => {
        setServerStatus('서버 연결 성공');
      })
      .catch((error: any) => {
        setServerStatus('서버 연결 실패');
        console.error('서버 연결 오류:', error);
      });

    // 물고기 데이터 가져오기
    fishService.getAllFish()
      .then((fishData: any) => {
        setFishCount(fishData.length);
      })
      .catch((error: any) => {
        console.error('물고기 데이터 로드 오류:', error);
      });
  }, []);

  const handleLoginPrompt = () => {
    navigate('/auth/login');
  };

  return (
    <div className="space-y-12">
      {/* 히어로 섹션 */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl text-white">
        <h1 className="text-5xl font-bold mb-6">
          🎣 Fishipedia에 오신 것을 환영합니다!
        </h1>
        <p className="text-xl mb-8 text-blue-100">
          낚시 기록과 도감 수집을 통해 더욱 즐거운 낚시를 경험해보세요
        </p>
        <div className="space-x-4">
          <Link
            to="/fish/collection"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            도감 보기
          </Link>
          <Link
            to="/community"
            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
          >
            커뮤니티 참여
          </Link>
        </div>
      </section>

      {/* 주요 기능 섹션 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-lg text-center">
          <div className="text-4xl mb-4">🐟</div>
          <h3 className="text-xl font-semibold mb-3 text-blue-600">물고기 도감</h3>
          <p className="text-gray-600 mb-4">
            다양한 물고기 정보를 수집하고 관리하세요
          </p>
          <Link
            to="/fish/collection"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            도감 보기 →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg text-center">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-xl font-semibold mb-3 text-blue-600">낚시 기록</h3>
          <p className="text-gray-600 mb-4">
            낚시한 물고기를 기록하고 점수를 확인하세요
          </p>
          <Link
            to="/fish/logs"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            기록 보기 →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg text-center">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold mb-3 text-blue-600">랭킹 시스템</h3>
          <p className="text-gray-600 mb-4">
            다른 낚시꾼들과 경쟁하고 순위를 확인하세요
          </p>
          <Link
            to="/ranking"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            랭킹 보기 →
          </Link>
        </div>
      </section>

      {/* AI 물고기 분류기 섹션 */}
      <FishClassifier 
        isAuthenticated={isAuthenticated} 
        onLoginPrompt={handleLoginPrompt} 
      />

      {/* 서버 상태 섹션 */}
      <section className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-blue-600">서버 상태</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-lg mb-2">백엔드 서버</h3>
            <p className="text-gray-600">{serverStatus}</p>
          </div>
          <div className="border-l-4 border-cyan-500 pl-4">
            <h3 className="font-semibold text-lg mb-2">물고기 데이터</h3>
            <p className="text-gray-600">총 {fishCount}마리의 물고기 정보</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 