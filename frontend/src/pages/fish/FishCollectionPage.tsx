import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fishCollectionService, FishCollection } from '../../services/fishCollectionService';
import { FISH_TYPES, getRarityLevel, RARITY_COLORS } from '../../types/FishType';

const FishCollectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [userCollection, setUserCollection] = useState<FishCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserCollection = async () => {
      try {
        const collection = await fishCollectionService.getMyCollection();
        setUserCollection(collection);
      } catch (error) {
        console.error('도감 정보 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserCollection();
  }, []);

  // 카드 클릭 시 이동
  const handleCardClick = (fishId: number) => {
    navigate(`/fish/logs?fishId=${fishId}`);
  };

  // 유저의 fish_collection 정보와 FISH_TYPES를 매칭
  const getFishCardInfo = (fish: typeof FISH_TYPES[0]) => {
    const collection = userCollection.find((c) => c.fishId === fish.id);
    return {
      ...fish,
      isCollect: collection?.isCollect || false,
      highestScore: collection?.highestScore,
      highestLength: collection?.highestLength,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-blue-600">도감 정보를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-blue-600 mb-8 text-center"> 물고기 도감</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {FISH_TYPES.map((fish) => {
          const card = getFishCardInfo(fish);
          const rarityLevel = getRarityLevel(fish.rarityScore);
          const rarityColor = RARITY_COLORS[rarityLevel];
          
          return (
            <div
              key={fish.id}
              className={`cursor-pointer rounded-xl border p-4 shadow-md flex flex-col items-center transition hover:scale-105 ${
                card.isCollect ? 'bg-blue-50 border-blue-400' : 'bg-gray-100 border-gray-300 opacity-60'
              }`}
              onClick={() => handleCardClick(fish.id)}
            >
              {/* 물고기 아이콘 */}
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                <img
                  src={fish.iconPath}
                  alt={fish.name}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '';
                  }}
                />
              </div>
              
              <div className="font-bold text-lg mb-1 text-center">{fish.name}</div>
              
              {/* 희귀도 표시 */}
              <span 
                className="px-2 py-1 text-xs rounded-full text-white mb-2"
                style={{ backgroundColor: rarityColor }}
              >
                {rarityLevel}
              </span>
              
              {card.isCollect ? (
                <>
                  <div className="text-green-600 text-sm font-semibold">수집 완료</div>
                  <div className="text-xs mt-1">최고 점수: <span className="font-bold">{card.highestScore}</span></div>
                  <div className="text-xs">최고 길이: <span className="font-bold">{card.highestLength}cm</span></div>
                </>
              ) : (
                <div className="text-gray-400 text-sm">미수집</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FishCollectionPage; 