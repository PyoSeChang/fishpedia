import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CommentResponse, CommentRequest } from '../../types/BoardType';
import { boardService } from '../../services/boardService';
import { userService } from '../../services/userService';

interface CommentSectionProps {
  boardId: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ boardId }) => {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
      fetchUserInfo();
    }
    fetchComments();
  }, [boardId]);

  const fetchUserInfo = async () => {
    try {
      const userInfo = await userService.getMyInfo();
      setCurrentUserId(userInfo.id);
      setCurrentUserName(userInfo.name);
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await boardService.getComments(boardId);
      setComments(response);
    } catch (err) {
      setError('댓글을 불러오는데 실패했습니다.');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
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
      
      await boardService.createComment(boardId, commentData);
      setNewComment('');
      await fetchComments();
    } catch (err) {
      alert('댓글 작성에 실패했습니다.');
      console.error('Error creating comment:', err);
    }
  };

  const handleAddReply = async (parentId: number) => {
    if (!isLoggedIn) {
      alert('댓글을 작성하려면 로그인이 필요합니다.');
      return;
    }
    
    if (!replyContent.trim()) {
      alert('답글 내용을 입력해주세요.');
      return;
    }

    try {
      const commentData: CommentRequest = {
        content: replyContent.trim(),
        parentId: parentId
      };
      
      await boardService.createComment(boardId, commentData);
      setReplyTo(null);
      setReplyContent('');
      await fetchComments();
    } catch (err) {
      alert('답글 작성에 실패했습니다.');
      console.error('Error creating reply:', err);
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editContent.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      const commentData: CommentRequest = {
        content: editContent.trim()
      };
      
      await boardService.updateComment(commentId, commentData);
      setEditingComment(null);
      setEditContent('');
      await fetchComments();
    } catch (err) {
      alert('댓글 수정에 실패했습니다.');
      console.error('Error updating comment:', err);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await boardService.deleteComment(commentId);
      await fetchComments();
    } catch (err) {
      alert('댓글 삭제에 실패했습니다.');
      console.error('Error deleting comment:', err);
    }
  };

  const startEdit = (comment: CommentResponse) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const startReply = (commentId: number) => {
    setReplyTo(commentId);
    setReplyContent('');
  };

  const cancelReply = () => {
    setReplyTo(null);
    setReplyContent('');
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

  const getTotalCommentCount = () => {
    return comments.reduce((count, comment) => {
      const childrenCount = comment.children ? comment.children.length : 0;
      return count + 1 + childrenCount;
    }, 0);
  };

  const renderComment = (comment: CommentResponse, depth: number = 0) => {
    const isAuthor = currentUserId === comment.authorId;
    const maxDepth = 1; // 1단계 답글만 허용

    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-8 mt-4 border-l-2 border-gray-200 pl-4' : 'mb-6'}`}>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {comment.authorName ? comment.authorName.charAt(0) : '?'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-900">{comment.authorName || '익명'}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {formatDate(comment.createAt)}
                </span>
                {comment.updateAt && comment.updateAt !== comment.createAt && (
                  <span className="text-xs text-green-600 ml-2">(수정됨)</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {depth < maxDepth && isLoggedIn && (
                <button
                  onClick={() => startReply(comment.id)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  답글
                </button>
              )}
              {isAuthor && (
                <>
                  <button
                    onClick={() => startEdit(comment)}
                    className="text-sm text-green-600 hover:text-green-800 font-medium transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          </div>

          {editingComment === comment.id ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => handleEditComment(comment.id)}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  수정 완료
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </div>
          )}

          {replyTo === comment.id && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {currentUserName ? currentUserName.charAt(0) : '?'}
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
                      onClick={cancelReply}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => handleAddReply(comment.id)}
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

        {comment.children && comment.children.map(child => 
          renderComment(child, depth + 1)
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg" style={{width: '70%', margin: '0 auto'}}>
      <div className="px-8 py-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">
          댓글 {getTotalCommentCount()}개
        </h2>
      </div>

      {error && (
        <div className="px-8 py-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      {/* 댓글 작성 폼 */}
      <div className="px-8 py-6 border-b border-gray-200">
        {isLoggedIn ? (
          <form onSubmit={handleAddComment}>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {currentUserName ? currentUserName.charAt(0) : '?'}
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
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              로그인하기
            </Link>
          </div>
        )}
      </div>

      {/* 댓글 목록 */}
      <div className="px-8 py-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">댓글을 불러오는 중...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-gray-500">첫 번째 댓글을 작성해보세요!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.filter(comment => !comment.parentId).map(comment => renderComment(comment))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;