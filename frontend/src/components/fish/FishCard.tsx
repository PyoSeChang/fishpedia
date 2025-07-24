import React from 'react';

interface FishCardProps {
  fish: {
    id: number;
    name: string;
    avgLength: number;
    stdDeviation: number;
    isCollected: boolean;
    highestScore: number;
    highestLength: number;
    collectDate: string | null;
  };
}

const FishCard: React.FC<FishCardProps> = ({ fish }) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${
      fish.isCollected ? 'ring-2 ring-blue-500' : 'opacity-75'
    }`}>
      {/* 카드 헤더 */}
      <div className={`p-6 text-center ${
        fish.isCollected 
          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
          : 'bg-gray-200 text-gray-600'
      }`}>
        <div className="text-4xl mb-2"></div>
        <h3 className="text-xl font-bold">{fish.name}</h3>
        <div className="text-sm opacity-80">
          평균 길이: {fish.avgLength}cm
        </div>
      </div>

      {/* 카드 내용 */}
      <div className="p-6 space-y-4">
        {fish.isCollected ? (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">최고 점수</span>
              <span className="font-bold text-blue-600">{fish.highestScore}점</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">최고 길이</span>
              <span className="font-bold text-cyan-600">{fish.highestLength}cm</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">수집일</span>
              <span className="text-sm text-gray-500">{fish.collectDate}</span>
            </div>
            <div className="mt-4">
              <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                 수집 완료
              </span>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="text-gray-400 mb-2"></div>
            <p className="text-gray-500">아직 수집하지 않은 물고기입니다</p>
            <p className="text-sm text-gray-400 mt-1">
              낚시해서 수집해보세요!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FishCard; 