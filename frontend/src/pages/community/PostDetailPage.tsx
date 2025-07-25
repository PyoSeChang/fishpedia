import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { boardService } from '../../services/boardService';
import { BoardResponse, CommentResponse, CommentRequest, BoardCategory } from '../../types/BoardType';
import { userService } from '../../services/userService';

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [board, setBoard] = useState<BoardResponse | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
      fetchUserInfo();
    }
  }, []);

  const fetchUserInfo = async () => {
    try {
      const userInfo = await userService.getMyInfo();
      setCurrentUserId(userInfo.id);
      setCurrentUserName(userInfo.name);
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBoard();
      fetchComments();
    }
  }, [id]);

  const fetchBoard = async () => {
    try {
      const boardData = await boardService.getBoard(Number(id));
      setBoard(boardData);
    } catch (err) {
      setError('게시글을 불러오는데 실패했습니다.');
      console.error('Error fetching board:', err);
    }
  };

  const fetchComments = async () => {
    try {
      const commentsData = await boardService.getComments(Number(id));
      setComments(commentsData);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
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
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert('댓글을 작성하려면 로그인이 필요합니다.');
      return;
    }
    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      const commentData: CommentRequest = {
        content: newComment.trim()
      };
      await boardService.createComment(Number(id), commentData);
      setNewComment('');
      await fetchComments();
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  const handleReplySubmit = async (commentId: number) => {
    if (!isLoggedIn) {
      alert('댓글을 작성하려면 로그인이 필요합니다.');
      return;
    }
    if (!replyContent.trim()) {
      alert('답글 내용을 입력해주세요.');
      return;
    }

    try {
      const replyData: CommentRequest = {
        content: replyContent.trim(),
        parentId: commentId
      };
      await boardService.createComment(Number(id), replyData);
      setReplyContent('');
      setReplyingTo(null);
      await fetchComments();
    } catch (error) {
      console.error('답글 작성 실패:', error);
      alert('답글 작성에 실패했습니다.');
    }
  };

  const handleDeleteBoard = async () => {
    if (!board || currentUserId !== board.authorId) return;
    
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      try {
        await boardService.deleteBoard(board.id);
        alert('게시글이 삭제되었습니다.');
        navigate('/community');
      } catch (error) {
        console.error('게시글 삭제 실패:', error);
        alert('게시글 삭제에 실패했습니다.');
      }
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      try {
        await boardService.deleteComment(commentId);
        await fetchComments();
      } catch (error) {
        console.error('댓글 삭제 실패:', error);
        alert('댓글 삭제에 실패했습니다.');
      }
    }
  };

  const renderComment = (comment: CommentResponse, depth: number = 0) => {
    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-8 mt-4 border-l-2 border-gray-200 pl-4' : 'mb-6'}`}>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {comment.authorName.charAt(0)}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-900">{comment.authorName}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {formatDate(comment.createAt)}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {depth === 0 && (
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  답글
                </button>
              )}
              {currentUserId === comment.authorId && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  삭제
                </button>
              )}
            </div>
          </div>
          
          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </div>

          {replyingTo === comment.id && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {currentUserName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="답글을 작성하세요..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent('');
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => handleReplySubmit(comment.id)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      답글 작성
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {comment.children && comment.children.map(child => renderComment(child, depth + 1))}
      </div>
    );
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{background: 'green', padding: '10px', textAlign: 'center', color: 'white'}}>
        DEBUG: PostDetailPage가 렌더링됨
      </div>
      <div className="w-full px-4 py-8">
        {/* 상단 네비게이션 */}
        <div className="mb-6">
          <Link
            to="/community"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            ← 게시글 목록으로
          </Link>
        </div>

        {/* 게시글 내용 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
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
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {board.title}
                </h1>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {board.authorName.charAt(0)}
                      </span>
                    </div>
                    <span className="font-medium text-gray-700">{board.authorName}</span>
                  </div>
                  <span>작성일: {formatDate(board.createAt)}</span>
                  <span>조회수: {board.readCount}</span>
                </div>
              </div>
              
              {currentUserId === board.authorId && (
                <div className="flex space-x-2 ml-4">
                  <Link
                    to={`/community/write?edit=${board.id}`}
                    className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    수정
                  </Link>
                  <button
                    onClick={handleDeleteBoard}
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
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 게시글 본문 */}
          <div className="px-8 py-8">
            <div className="prose max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
              {board.content}
            </div>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className="bg-white rounded-xl shadow-lg max-w-6xl mx-auto">
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              댓글 {comments.length}개
            </h2>
          </div>

          {/* 댓글 작성 폼 */}
          <div className="px-8 py-6 border-b border-gray-200">
            {isLoggedIn ? (
              <form onSubmit={handleCommentSubmit}>
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {currentUserName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="댓글을 작성하세요..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                    />
                    <div className="flex justify-end mt-3">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        댓글 작성
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">댓글을 작성하려면 로그인이 필요합니다.</p>
                <Link
                  to="/auth/login"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  로그인하기
                </Link>
              </div>
            )}
          </div>

          {/* 댓글 목록 */}
          <div className="px-8 py-6">
            {comments.length > 0 ? (
              <div className="space-y-6">
                {comments.filter(comment => !comment.parentId).map(comment => renderComment(comment))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-gray-500">첫 번째 댓글을 작성해보세요!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;