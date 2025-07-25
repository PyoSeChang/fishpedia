import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BoardResponse, BoardCategory } from '../../types/BoardType';
import { boardService } from '../../services/boardService';
import { userService } from '../../services/userService';
import CommentSection from './CommentSection';

const BoardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [board, setBoard] = useState<BoardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
      fetchUserInfo();
    }
    
    if (id) {
      fetchBoard(parseInt(id));
    }
  }, [id]);

  const fetchUserInfo = async () => {
    try {
      const userInfo = await userService.getMyInfo();
      setCurrentUserId(userInfo.id);
      setCurrentUserName(userInfo.name);
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
    }
  };

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
      navigate(`/community/write?edit=${board.id}`);
    }
  };

  const handleDelete = async () => {
    if (board && window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      try {
        await boardService.deleteBoard(board.id);
        alert('게시글이 삭제되었습니다.');
        navigate('/community');
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

  const getCategoryColor = (category: BoardCategory) => {
    const colors = {
      [BoardCategory.NOTICE]: 'bg-red-100 text-red-800 border-red-200',
      [BoardCategory.FISH_LOG]: 'bg-green-100 text-green-800 border-green-200',
      [BoardCategory.FREE]: 'bg-blue-100 text-blue-800 border-blue-200',
      [BoardCategory.INQUIRY]: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[category];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('ko-KR', {
        month: '2-digit',
        day: '2-digit'
      });
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">게시글을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">{error || '존재하지 않는 게시글이거나 삭제된 게시글입니다.'}</p>
          <Link
            to="/community"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            커뮤니티로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = currentUserId === board.authorId;

  return (
    <div className="w-full">
      <div className="w-full">
        {/* 상단 네비게이션 */}
        <div className="mb-6">
          <Link
            to="/community"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            ← 게시글 목록으로
          </Link>
        </div>

        {/* 게시글 내용 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8" style={{width: '100%', maxWidth: 'none'}}>
          {/* 게시글 헤더 */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(board.category)}`}>
                    {getCategoryLabel(board.category)}
                  </span>
                  {board.pinned && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-200 rounded-full text-sm font-medium">
                      📌 고정
                    </span>
                  )}
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {board.title}
                </h1>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {board.authorName ? board.authorName.charAt(0) : '?'}
                      </span>
                    </div>
                    <span className="font-medium text-gray-700">{board.authorName || '익명'}</span>
                  </div>
                  <span>작성일: {formatDate(board.createAt)}</span>
                  {board.updateAt && board.updateAt !== board.createAt && (
                    <span className="text-green-600">수정됨: {formatDate(board.updateAt)}</span>
                  )}
                  <span>조회수: {board.readCount?.toLocaleString()}</span>
                </div>
              </div>
              
              {isAuthor && (
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>

            {board.tags && (
              <div className="flex flex-wrap gap-2">
                {board.tags.split(',').map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 게시글 본문 */}
          <div className="px-8 py-8">
            <div className="prose max-w-none text-gray-800 leading-relaxed">
              <div 
                className="text-base leading-7"
                style={{ whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={{ __html: board.content }}
              />
            </div>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <CommentSection boardId={board.id} />

        {/* 하단 네비게이션 */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            to="/community"
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            목록으로
          </Link>
          {isLoggedIn && (
            <Link
              to="/community/write"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              새 글 쓰기
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardDetail;