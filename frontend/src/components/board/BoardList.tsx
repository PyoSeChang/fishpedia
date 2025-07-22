import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BoardResponse, BoardCategory, BoardListResponse } from '../../types/BoardType';
import { boardService } from '../../services/boardService';
import WriteButton from './WriteButton';

interface BoardListProps {
  category?: BoardCategory;
  searchKeyword?: string;
  searchTitle?: string;
  searchTags?: string;
}

const BoardList: React.FC<BoardListProps> = ({ category, searchKeyword, searchTitle, searchTags }) => {
  const [boards, setBoards] = useState<BoardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchBoards = async (page: number = 0) => {
    try {
      setLoading(true);
      
      let response: BoardListResponse;
      
      // 향상된 검색이 사용되는 경우
      if (searchTitle || searchTags) {
        response = await boardService.getBoardsAdvanced(
          category,
          searchKeyword,
          searchTitle,
          searchTags,
          page,
          20
        );
      } else {
        // 기본 검색
        response = await boardService.getBoards(
          category, 
          searchKeyword, 
          page, 
          20
        );
      }
      
      setBoards(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setCurrentPage(page);
    } catch (err) {
      setError('게시글을 불러오는데 실패했습니다.');
      console.error('Error fetching boards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards(0);
  }, [category, searchKeyword, searchTitle, searchTags]);

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      fetchBoards(page);
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="text-center py-8">로딩 중...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {category ? getCategoryLabel(category) : '전체 게시글'}
          <span className="text-sm text-gray-500 ml-2">({totalElements}개)</span>
        </h2>
        <WriteButton />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                분류
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                제목
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작성자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작성일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                조회수
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {boards.map((board) => (
              <tr key={board.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    board.category === BoardCategory.NOTICE 
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {getCategoryLabel(board.category)}
                  </span>
                  {board.pinned && (
                    <span className="ml-1 text-red-500">📌</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Link
                    to={`/board/${board.id}`}
                    className="text-gray-900 hover:text-blue-600 font-medium"
                  >
                    {board.title}
                  </Link>
                  {board.tags && (
                    <div className="text-xs text-gray-500 mt-1">
                      {board.tags.split(',').map((tag, index) => (
                        <span key={index} className="mr-2">#{tag.trim()}</span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {board.authorName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(board.createAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {board.readCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {boards.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            등록된 게시글이 없습니다.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-3 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = Math.max(0, Math.min(currentPage - 2 + i, totalPages - 5 + i));
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 border rounded ${
                  currentPage === page
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page + 1}
              </button>
            );
          })}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="px-3 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};

export default BoardList;