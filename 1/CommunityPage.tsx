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

  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BoardCategory | undefined>(
      searchParams.get('category') as BoardCategory || undefined
  );

  const [rankingType, setRankingType] = useState<RankingType>('fisher');
  const [selectedFish, setSelectedFish] = useState<number | ''>('');
  const [ranking, setRanking] = useState<any[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);

  const parseSearchInput = (input: string) => {
    const hashtagRegex = /#(\w+)/g;
    const tags: string[] = [];
    let match;
    while ((match = hashtagRegex.exec(input)) !== null) {
      tags.push(match[1]);
    }
    const title = input.replace(hashtagRegex, '').trim();
    return { title, tags };
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (searchInput.trim()) {
      const { title, tags } = parseSearchInput(searchInput);
      if (title) params.set('title', title);
      if (tags.length > 0) params.set('tags', tags.join(','));
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

  useEffect(() => {
    if (viewMode === 'ranking') fetchRanking();
  }, [viewMode, rankingType, selectedFish]);

  const fetchRanking = async () => {
    setRankingLoading(true);
    try {
      if (rankingType === 'fisher') {
        const data: FishCollectionRanking[] = await rankingService.getFishCollectionRanking();
        const filtered = selectedFish
            ? data.filter((r) => r.fishId === selectedFish)
            : data;
        setRanking(filtered);
      }
    } catch (e) {
      setRanking([]);
    } finally {
      setRankingLoading(false);
    }
  };

  return (
      <div className="max-w-screen-xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-blue-600 mb-3">커뮤니티</h1>
          <p className="text-gray-700 text-lg">다른 낚시꾼들과 소통하고, 랭킹을 확인하세요.</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
              onClick={() => {
                setViewMode('board');
                handleCategoryChange(undefined);
              }}
              className={`px-6 py-3 rounded-lg font-semibold text-lg ${
                  viewMode === 'board' && !selectedCategory
                      ? 'bg-blue-600 text-white'
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
                  className={`px-6 py-3 rounded-lg font-semibold text-lg ${
                      viewMode === 'board' && selectedCategory === category
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {getCategoryLabel(category)}
              </button>
          ))}
          <button
              onClick={() => setViewMode('ranking')}
              className={`px-6 py-3 rounded-lg font-semibold text-lg ${
                  viewMode === 'ranking'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            랭킹
          </button>
        </div>

        {/* Board Search */}
        {viewMode === 'board' && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-blue-700 text-sm leading-relaxed">
                <strong>검색 팁:</strong> <br />
                #태그 + 스페이스로 태그 생성 / 예: <span className="bg-blue-100 px-2 py-0.5 rounded">#바다낚시</span>
              </div>
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
                <TaggableInput
                    value={searchInput}
                    onChange={setSearchInput}
                    placeholder="제목 + #태그로 검색"
                    onSubmit={() => {
                      const event = new Event('submit') as any;
                      handleSearch(event);
                    }}
                    className="flex-1 w-full"
                />
                <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700"
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
                        className="px-6 py-3 bg-gray-500 text-white text-lg rounded-lg hover:bg-gray-600"
                    >
                      초기화
                    </button>
                )}
              </form>
              <BoardList
                  category={selectedCategory}
                  searchKeyword={searchParams.get('keyword') || undefined}
                  searchTitle={searchParams.get('title') || undefined}
                  searchTags={searchParams.get('tags') || undefined}
              />
            </>
        )}

        {/* Ranking */}
        {viewMode === 'ranking' && (
            <>
              <div className="bg-white p-6 rounded-xl shadow-lg mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-2">
                  <button
                      onClick={() => setRankingType('fisher')}
                      className={`px-6 py-3 rounded-lg font-bold border text-lg ${
                          rankingType === 'fisher'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'
                      }`}
                  >
                    낚시꾼 랭킹
                  </button>
                  <button
                      onClick={() => setRankingType('fish')}
                      className={`px-6 py-3 rounded-lg font-bold border text-lg ${
                          rankingType === 'fish'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'
                      }`}
                  >
                    물고기 랭킹
                  </button>
                </div>
                <div className="w-full md:w-64">
                  <FishSelector
                      value={selectedFish}
                      onChange={setSelectedFish}
                      placeholder="물고기 선택"
                      showAllOption={true}
                  />
                </div>
              </div>
              <RankingList
                  rankingType={rankingType}
                  selectedFish={selectedFish}
                  ranking={ranking}
                  loading={rankingLoading}
              />
            </>
        )}
      </div>
  );
};

interface RankingListProps {
  rankingType: RankingType;
  selectedFish: number | '';
  ranking: any[];
  loading: boolean;
}

const RankingList: React.FC<RankingListProps> = ({ rankingType, ranking, loading }) => {
  if (loading) {
    return (
        <div className="bg-white p-10 rounded-xl text-center text-blue-600 shadow-md">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          불러오는 중...
        </div>
    );
  }

  if (!ranking.length) {
    return (
        <div className="bg-white p-10 rounded-xl text-center text-gray-400 shadow-md">
          랭킹 데이터가 없습니다.
        </div>
    );
  }

  return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <table className="w-full text-center text-lg">
          <thead>
          <tr className="bg-blue-50 text-blue-700">
            <th className="py-3 px-4">순위</th>
            <th className="py-3 px-4">닉네임</th>
            <th className="py-3 px-4">물고기</th>
            <th className="py-3 px-4">점수</th>
            {rankingType === 'fish' && <th className="py-3 px-4">최고 길이</th>}
          </tr>
          </thead>
          <tbody>
          {ranking.map((item, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50 transition">
                <td className="py-3 px-4 font-bold">{idx + 1}</td>
                <td className="py-3 px-4">{item.name}</td>
                <td className="py-3 px-4">{item.fishName || '-'}</td>
                <td className="py-3 px-4 text-blue-600 font-semibold">
                  {rankingType === 'fisher' ? item.totalScore : item.highestScore}
                </td>
                {rankingType === 'fish' && <td className="py-3 px-4">{item.highestLength}cm</td>}
              </tr>
          ))}
          </tbody>
        </table>
      </div>
  );
};

export default CommunityPage;
