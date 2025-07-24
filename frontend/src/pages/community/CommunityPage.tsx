import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import BoardList from '../../components/board/BoardList';
import { BoardCategory } from '../../types/BoardType';
import { rankingService, FishCollectionRanking } from '../../services/rankingService';
import FishSelector from '../../components/common/FishSelector';
import TaggableInput from '../../components/common/TaggableInput';

type ViewMode = 'board' | 'ranking';
type RankingType = 'fisher' | 'fish';

const CommunityPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  
  // Board states
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BoardCategory | undefined>(
    searchParams.get('category') as BoardCategory || undefined
  );

  // Ranking states
  const [rankingType, setRankingType] = useState<RankingType>('fisher');
  const [selectedFish, setSelectedFish] = useState<number | ''>('');
  const [ranking, setRanking] = useState<any[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);

  // Board functions
  const parseSearchInput = (input: string) => {
    const hashtagRegex = /#(\w+)/g;
    const tags: string[] = [];
    let match;
    
    // #태그 추출
    while ((match = hashtagRegex.exec(input)) !== null) {
      tags.push(match[1]);
    }
    
    // #태그 제거한 나머지 텍스트를 제목으로 사용
    const title = input.replace(hashtagRegex, '').trim();
    
    return { title, tags };
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (selectedCategory) {
      params.set('category', selectedCategory);
    }
    
    if (searchInput.trim()) {
      const { title, tags } = parseSearchInput(searchInput);
      
      if (title) {
        params.set('title', title);
      }
      if (tags.length > 0) {
        params.set('tags', tags.join(','));
      }
    }
    
    setSearchParams(params);
  };

  const handleCategoryChange = (category: BoardCategory | undefined) => {
    setSelectedCategory(category);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    
    if (searchInput.trim()) {
      const { title, tags } = parseSearchInput(searchInput);
      if (title) params.set('title', title);
      if (tags.length > 0) params.set('tags', tags.join(','));
    }
    
    setSearchParams(params);
  };

  const getCategoryLabel = (category: BoardCategory) => {
    const labels = {
      [BoardCategory.NOTICE]: '공지사항',
      [BoardCategory.FISH_LOG]: '낚시 일지',
      [BoardCategory.FREE]: '자유게시판',
      [BoardCategory.INQUIRY]: '문의사항'
    };
    return labels[category];
  };

  // Ranking functions
  useEffect(() => {
    if (viewMode === 'ranking') {
      fetchRanking();
    }
  }, [viewMode, rankingType, selectedFish]);

  const fetchRanking = async () => {
    setRankingLoading(true);
    try {
      if (rankingType === 'fisher') {
        if (!selectedFish) {
          const data = await rankingService.getFisherRanking();
          setRanking(data);
        } else {
          const data = await rankingService.getFishCollectionRanking();
          setRanking(data.filter((r: FishCollectionRanking) => r.fishId === selectedFish));
        }
      } else {
        if (!selectedFish) {
          const data = await rankingService.getFishRankingAllFish();
          setRanking(data);
        } else {
          const data = await rankingService.getFishRankingByFish(selectedFish);
          setRanking(data);
        }
      }
    } catch (e) {
      setRanking([]);
    } finally {
      setRankingLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-600 mb-4"> 커뮤니티</h1>
        <p className="text-gray-600 mb-6">
          다른 낚시꾼들과 이야기를 나누고 랭킹을 확인하세요
        </p>
      </div>

      {/* 카테고리 및 랭킹 탭 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => {
            setViewMode('board');
            handleCategoryChange(undefined);
          }}
          className={`px-4 py-2 rounded-lg font-medium ${
            viewMode === 'board' && !selectedCategory
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          전체
        </button>
        {Object.values(BoardCategory).map(category => (
          <button
            key={category}
            onClick={() => {
              setViewMode('board');
              handleCategoryChange(category);
            }}
            className={`px-4 py-2 rounded-lg font-medium ${
              viewMode === 'board' && selectedCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {getCategoryLabel(category)}
          </button>
        ))}
        <button
          onClick={() => setViewMode('ranking')}
          className={`px-4 py-2 rounded-lg font-medium ${
            viewMode === 'ranking'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
           랭킹
        </button>
      </div>

      {/* Board Section */}
      {viewMode === 'board' && (
        <div>
          {/* 통합 검색 폼 */}
          <div className="mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
              <p className="text-sm text-blue-800">
                 <strong>검색 팁:</strong> #태그를 입력하고 스페이스를 누르면 태그로 변환됩니다! 
                여러 태그를 입력하면 OR 검색 (하나라도 일치하면 검색됨)
                <br />
                예: <code className="bg-blue-100 px-1 rounded">#바다낚시</code> + 스페이스 → 태그로 변환
              </p>
            </div>
            
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1">
                <TaggableInput
                  value={searchInput}
                  onChange={setSearchInput}
                  placeholder="제목과 #태그로 검색하세요... (#태그 + 스페이스로 태그 생성)"
                  onSubmit={() => {
                    const event = new Event('submit') as any;
                    handleSearch(event);
                  }}
                  className="w-full"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                검색
              </button>
              {(searchInput || selectedCategory) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setSelectedCategory(undefined);
                    setSearchParams({});
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  초기화
                </button>
              )}
            </form>
          </div>

          {/* 게시글 목록 */}
          <BoardList 
            category={selectedCategory} 
            searchKeyword={searchParams.get('keyword') || undefined}
            searchTitle={searchParams.get('title') || undefined}
            searchTags={searchParams.get('tags') || undefined}
          />
        </div>
      )}

      {/* Ranking Section */}
      {viewMode === 'ranking' && (
        <div>
          <RankingNav
            rankingType={rankingType}
            setRankingType={setRankingType}
            selectedFish={selectedFish}
            setSelectedFish={setSelectedFish}
          />
          <RankingList
            rankingType={rankingType}
            selectedFish={selectedFish}
            ranking={ranking}
            loading={rankingLoading}
          />
        </div>
      )}
    </div>
  );
};

// Ranking Navigation Component
interface RankingNavProps {
  rankingType: RankingType;
  setRankingType: (v: RankingType) => void;
  selectedFish: number | '';
  setSelectedFish: (id: number | '') => void;
}

const RankingNav: React.FC<RankingNavProps> = ({ 
  rankingType, 
  setRankingType, 
  selectedFish, 
  setSelectedFish 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg font-semibold border transition-colors ${
              rankingType === 'fisher' 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'
            }`}
            onClick={() => setRankingType('fisher')}
          >
             낚시꾼 랭킹
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold border transition-colors ${
              rankingType === 'fish' 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'
            }`}
            onClick={() => setRankingType('fish')}
          >
             물고기 랭킹
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

// Ranking List Component
interface RankingListProps {
  rankingType: RankingType;
  selectedFish: number | '';
  ranking: any[];
  loading: boolean;
}

const RankingList: React.FC<RankingListProps> = ({ 
  rankingType, 
  selectedFish, 
  ranking, 
  loading 
}) => {
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
          <div className="text-4xl mb-2"></div>
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
            {rankingType === 'fish' && <th className="py-3 px-2">최고 길이</th>}
          </tr>
        </thead>
        <tbody>
          {ranking.map((item, idx) => (
            <tr key={idx} className="border-t hover:bg-gray-50 transition-colors">
              <td className="py-3 px-2 font-bold">
                {idx < 3 ? (
                  <span className="text-lg">
                    {idx === 0 ? '' : idx === 1 ? '' : ''}
                  </span>
                ) : (
                  idx + 1
                )}
              </td>
              <td className="py-3 px-2 font-medium">{item.name}</td>
              <td className="py-3 px-2">{item.fishName || '-'}</td>
              <td className="py-3 px-2 font-bold text-blue-600">
                {rankingType === 'fisher' ? (item.totalScore ?? '-') : (item.highestScore ?? '-')}
              </td>
              {rankingType === 'fish' && <td className="py-3 px-2">{item.highestLength ?? '-'}cm</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CommunityPage; 