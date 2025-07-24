import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BoardResponse, BoardCategory } from '../../types/BoardType';
import { boardService } from '../../services/boardService';
import CommentSection from './CommentSection';

const BoardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [board, setBoard] = useState<BoardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      setCurrentUserId(parseInt(userId));
    }
    
    if (id) {
      fetchBoard(parseInt(id));
    }
  }, [id]);

  const fetchBoard = async (boardId: number) => {
    try {
      setLoading(true);
      const response = await boardService.getBoard(boardId);
      setBoard(response);
    } catch (err) {
      setError('게시글을 불러오는데 실패했습니다.');
      console.error('Error fetching board:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (board) {
      navigate(`/board/edit/${board.id}`);
    }
  };

  const handleDelete = async () => {
    if (board && window.confirm('정말로 삭제하시겠습니까?')) {
      try {
        await boardService.deleteBoard(board.id);
        navigate('/board');
      } catch (err) {
        alert('게시글 삭제에 실패했습니다.');
        console.error('Error deleting board:', err);
      }
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
  if (!board) return <div className="text-center py-8">게시글을 찾을 수 없습니다.</div>;

  const isAuthor = currentUserId === board.authorId;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 게시글 헤더 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              board.category === BoardCategory.NOTICE 
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {getCategoryLabel(board.category)}
            </span>
            {board.pinned && (
              <span className="text-red-500 text-lg"></span>
            )}
          </div>
          
          {isAuthor && (
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {board.title}
        </h1>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <span>작성자: {board.authorName}</span>
            <span>작성일: {formatDate(board.createAt)}</span>
            {board.updateAt && board.updateAt !== board.createAt && (
              <span>수정일: {formatDate(board.updateAt)}</span>
            )}
          </div>
          <span>조회수: {board.readCount}</span>
        </div>

        {board.tags && (
          <div className="mb-4">
            {board.tags.split(',').map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded mr-2"
              >
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 게시글 내용 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div 
          className="prose max-w-none"
          style={{
            lineHeight: '1.7',
            fontSize: '16px',
            color: '#374151'
          }}
          dangerouslySetInnerHTML={{ __html: board.content }}
        />
      </div>

      {/* 댓글 섹션 */}
      <CommentSection boardId={board.id} />

      {/* 목록으로 버튼 */}
      <div className="flex justify-center">
        <button
          onClick={() => navigate('/board')}
          className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          목록으로
        </button>
      </div>
    </div>
  );
};

export default BoardDetail;