import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BoardRequest, BoardResponse, BoardCategory } from '../../types/BoardType';
import { boardService } from '../../services/boardService';
import { imageUploadService } from '../../services/imageUploadService';
import RichTextEditor from '../common/RichTextEditor';
import BoardAlbum from './BoardAlbum';

interface BoardFormProps {
  isEdit?: boolean;
}

const BoardForm: React.FC<BoardFormProps> = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<BoardRequest>({
    title: '',
    content: '',
    category: BoardCategory.FREE,
    tags: '',
    pinned: false
  });

  useEffect(() => {
    if (isEdit && id) {
      fetchBoard(parseInt(id));
    }
  }, [isEdit, id]);

  const fetchBoard = async (boardId: number) => {
    try {
      setLoading(true);
      const response: BoardResponse = await boardService.getBoard(boardId);
      setFormData({
        title: response.title,
        content: response.content,
        category: response.category,
        tags: response.tags || '',
        pinned: response.pinned
      });
    } catch (err) {
      setError('게시글을 불러오는데 실패했습니다.');
      console.error('Error fetching board:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content: content
    }));
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const imageUrl = await imageUploadService.uploadBoardImage(file);
      return imageUrl;
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      throw new Error('이미지 업로드에 실패했습니다.');
    }
  };

  const handleImageUploadedToAlbum = async (file: File, imageUrl: string): Promise<void> => {
    // 게시글이 이미 생성된 경우에만 앨범에 추가
    if (isEdit && id) {
      try {
        await boardService.addImageToBoard(parseInt(id), file, '에디터에서 업로드된 이미지');
        console.log('이미지가 앨범에 자동 등록되었습니다.');
      } catch (error) {
        console.error('앨범 등록 실패:', error);
        throw error;
      }
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    
    if (!formData.content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let response: BoardResponse;
      if (isEdit && id) {
        response = await boardService.updateBoard(parseInt(id), formData);
      } else {
        response = await boardService.createBoard(formData);
      }
      
      navigate(`/board/${response.id}`);
    } catch (err) {
      setError(isEdit ? '게시글 수정에 실패했습니다.' : '게시글 작성에 실패했습니다.');
      console.error('Error saving board:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isEdit && id) {
      navigate(`/board/${id}`);
    } else {
      navigate('/board');
    }
  };

  const getCategoryOptions = () => [
    { value: BoardCategory.FREE, label: '자유게시판' },
    { value: BoardCategory.QUESTION, label: '질문게시판' },
    { value: BoardCategory.TIP, label: '팁게시판' },
    { value: BoardCategory.REVIEW, label: '리뷰게시판' },
    { value: BoardCategory.NOTICE, label: '공지사항' }
  ];

  if (loading && isEdit) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">
          {isEdit ? '게시글 수정' : '게시글 작성'}
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 카테고리 선택 */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {getCategoryOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 제목 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              maxLength={200}
              placeholder="제목을 입력해주세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 태그 */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              태그 (쉼표로 구분)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="예: 낚시, 팁, 초보자"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              태그는 쉼표(,)로 구분하여 입력해주세요.
            </p>
          </div>

          {/* 내용 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              내용 *
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={handleContentChange}
              onImageUpload={handleImageUpload}
              onImageUploadedToAlbum={handleImageUploadedToAlbum}
              placeholder="내용을 입력해주세요"
              height={500}
            />
          </div>

          {/* 이미지 앨범 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이미지 앨범
            </label>
            <BoardAlbum 
              boardId={isEdit && id ? parseInt(id) : undefined}
              showUpload={true}
            />
          </div>

          {/* 상단 고정 (관리자만) */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="pinned"
              name="pinned"
              checked={formData.pinned}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="pinned" className="ml-2 block text-sm text-gray-700">
              상단 고정 (관리자만)
            </label>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '저장 중...' : (isEdit ? '수정하기' : '작성하기')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default BoardForm;