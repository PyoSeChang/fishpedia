import React, { useEffect, useState } from 'react';
import { rankingService, FisherRanking, FishCollectionRanking } from '../../services/rankingService';
import FishSelector from '../../components/common/FishSelector';

// 하드코딩된 fish 목록 (id, name만)
const fishList = [
  { id: 0, name: '전체' },
  { id: 1, name: '붕어' },
  { id: 2, name: '잉어' },
  { id: 3, name: '배스' },
  { id: 4, name: '송어' },
  { id: 5, name: '메기' },
  { id: 6, name: '가물치' },
  { id: 7, name: '피라미' },
  { id: 8, name: '쏘가리' },
  { id: 9, name: '청어' },
  { id: 10, name: '숭어' },
];

type ViewMode = 'fisher' | 'fish';

const RankingPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('fisher');
  const [selectedFish, setSelectedFish] = useState<number | ''>(''); // 빈 문자열: 전체
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 랭킹 데이터 불러오기
  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        if (viewMode === 'fisher') {
          if (!selectedFish) {
            // 전체 낚시꾼 랭킹 (UserInfo.totalScore)
            const data = await rankingService.getFisherRanking();
            setRanking(data);
          } else {
            // 특정 물고기별 낚시꾼 랭킹 (FishCollection.totalScore)
            const data = await rankingService.getFishCollectionRanking();
            setRanking(data.filter((r: FishCollectionRanking) => r.fishId === selectedFish));
          }
        } else {
          if (!selectedFish) {
            // 전체 물고기별 최고점수 랭킹
            const data = await rankingService.getFishRankingAllFish();
            setRanking(data);
          } else {
            // 특정 물고기별 최고점수 랭킹
            const data = await rankingService.getFishRankingByFish(selectedFish);
            setRanking(data);
          }
        }
      } catch (e) {
        setRanking([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, [viewMode, selectedFish]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">🏆 랭킹</h1>
      <RankingNav
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedFish={selectedFish}
        setSelectedFish={setSelectedFish}
      />
      <RankingList
        viewMode={viewMode}
        selectedFish={selectedFish}
        ranking={ranking}
        loading={loading}
      />
    </div>
  );
};

interface RankingNavProps {
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  selectedFish: number | '';
  setSelectedFish: (id: number | '') => void;
}

const RankingNav: React.FC<RankingNavProps> = ({ viewMode, setViewMode, selectedFish, setSelectedFish }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg font-semibold border transition-colors ${
              viewMode === 'fisher' 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'
            }`}
            onClick={() => setViewMode('fisher')}
          >
            🎣 낚시꾼 랭킹
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold border transition-colors ${
              viewMode === 'fish' 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'
            }`}
            onClick={() => setViewMode('fish')}
          >
            🐟 물고기 랭킹
          </button>
        </div>
        
        <div className="w-full sm:w-64">
          <FishSelector
            value={selectedFish}
            onChange={setSelectedFish}
            placeholder="물고기 선택"
            showAllOption={true}
          />
        </div>
      </div>
    </div>
  );
};

interface RankingListProps {
  viewMode: ViewMode;
  selectedFish: number | '';
  ranking: any[];
  loading: boolean;
}

const RankingList: React.FC<RankingListProps> = ({ viewMode, selectedFish, ranking, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center text-blue-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          랭킹을 불러오는 중...
        </div>
      </div>
    );
  }
  
  if (!ranking.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">📊</div>
          랭킹 데이터가 없습니다.
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <table className="w-full text-center">
        <thead>
          <tr className="bg-blue-50">
            <th className="py-3 px-2">순위</th>
            <th className="py-3 px-2">닉네임</th>
            <th className="py-3 px-2">물고기</th>
            <th className="py-3 px-2">점수</th>
            {viewMode === 'fish' && <th className="py-3 px-2">최고 길이</th>}
          </tr>
        </thead>
        <tbody>
          {ranking.map((item, idx) => (
            <tr key={idx} className="border-t hover:bg-gray-50 transition-colors">
              <td className="py-3 px-2 font-bold">
                {idx < 3 ? (
                  <span className="text-lg">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                  </span>
                ) : (
                  idx + 1
                )}
              </td>
              <td className="py-3 px-2 font-medium">{item.name}</td>
              <td className="py-3 px-2">{item.fishName || '-'}</td>
              <td className="py-3 px-2 font-bold text-blue-600">
                {viewMode === 'fisher' ? (item.totalScore ?? '-') : (item.highestScore ?? '-')}
              </td>
              {viewMode === 'fish' && <td className="py-3 px-2">{item.highestLength ?? '-'}cm</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RankingPage; 