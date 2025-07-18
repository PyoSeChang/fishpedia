import React, { useState, useEffect } from 'react';
import { CommentResponse, CommentRequest } from '../../types/BoardType';
import { boardService } from '../../services/boardService';

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

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      setCurrentUserId(parseInt(userId));
    }
    fetchComments();
  }, [boardId]);

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
      fetchComments();
    } catch (err) {
      alert('댓글 작성에 실패했습니다.');
      console.error('Error creating comment:', err);
    }
  };

  const handleAddReply = async (parentId: number) => {
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
      fetchComments();
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
      fetchComments();
    } catch (err) {
      alert('댓글 수정에 실패했습니다.');
      console.error('Error updating comment:', err);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('정말로 삭제하시겠습니까?')) {
      return;
    }

    try {
      await boardService.deleteComment(commentId);
      fetchComments();
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
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderComment = (comment: CommentResponse, depth: number = 0) => {
    const isAuthor = currentUserId === comment.authorId;
    const maxDepth = 2;

    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-4'}`}>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{comment.authorName}</span>
              <span className="text-sm text-gray-500">{formatDate(comment.createAt)}</span>
              {comment.updateAt && comment.updateAt !== comment.createAt && (
                <span className="text-xs text-gray-400">(수정됨)</span>
              )}
            </div>
            
            {isAuthor && (
              <div className="flex space-x-2">
                <button
                  onClick={() => startEdit(comment)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  삭제
                </button>
              </div>
            )}
          </div>

          {editingComment === comment.id ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                rows={3}
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditComment(comment.id)}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  수정
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-800 mb-2">{comment.content}</p>
              
              {depth < maxDepth && currentUserId && (
                <button
                  onClick={() => startReply(comment.id)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  답글
                </button>
              )}
            </>
          )}

          {replyTo === comment.id && (
            <div className="mt-3 space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="답글을 입력해주세요..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                rows={3}
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAddReply(comment.id)}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  답글 작성
                </button>
                <button
                  onClick={cancelReply}
                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                >
                  취소
                </button>
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
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">
        댓글 ({comments.reduce((count, comment) => {
          const childrenCount = comment.children ? comment.children.length : 0;
          return count + 1 + childrenCount;
        }, 0)})
      </h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* 새 댓글 작성 */}
      {currentUserId && (
        <form onSubmit={handleAddComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력해주세요..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            rows={4}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              댓글 작성
            </button>
          </div>
        </form>
      )}

      {/* 댓글 목록 */}
      {loading ? (
        <div className="text-center py-4">댓글을 불러오는 중...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          첫 번째 댓글을 작성해보세요!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => renderComment(comment))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;