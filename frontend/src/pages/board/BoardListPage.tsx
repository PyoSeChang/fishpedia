import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BoardList from '../../components/board/BoardList';
import { BoardCategory } from '../../types/BoardType';

const BoardListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BoardCategory | undefined>(
    searchParams.get('category') as BoardCategory || undefined
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      setSearchParams({ 
        ...(selectedCategory && { category: selectedCategory }),
        keyword: searchKeyword.trim() 
      });
    } else {
      setSearchParams(selectedCategory ? { category: selectedCategory } : {});
    }
  };

  const handleCategoryChange = (category: BoardCategory | undefined) => {
    setSelectedCategory(category);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (searchKeyword.trim()) params.set('keyword', searchKeyword.trim());
    setSearchParams(params);
  };

  const getCategoryLabel = (category: BoardCategory) => {
    const labels = {
      [BoardCategory.NOTICE]: '공지사항',
      [BoardCategory.FREE]: '자유게시판',
      [BoardCategory.QUESTION]: '질문게시판',
      [BoardCategory.TIP]: '팁게시판',
      [BoardCategory.REVIEW]: '리뷰게시판'
    };
    return labels[category];
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">게시판</h1>
        
        {/* 카테고리 탭 */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => handleCategoryChange(undefined)}
            className={`px-4 py-2 rounded-lg font-medium ${
              !selectedCategory
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          {Object.values(BoardCategory).map(category => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-lg font-medium ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getCategoryLabel(category)}
            </button>
          ))}
        </div>

        {/* 검색 폼 */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="제목, 내용, 태그로 검색..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            검색
          </button>
          {(searchKeyword || selectedCategory) && (
            <button
              type="button"
              onClick={() => {
                setSearchKeyword('');
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
      />
    </div>
  );
};

export default BoardListPage;