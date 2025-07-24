import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BoardRequest, BoardResponse, BoardCategory } from '../../types/BoardType';
import { boardService } from '../../services/boardService';
import { imageUploadService } from '../../services/imageUploadService';
import SlateRichTextEditor from '../common/SlateRichTextEditor';

interface BoardFormProps {
  isEdit?: boolean;
}

const BoardForm: React.FC<BoardFormProps> = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorImages, setEditorImages] = useState<{ file: File; url: string; id: string }[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  
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
      // Parse existing tags
      if (response.tags) {
        const parsedTags = response.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        setTags(parsedTags);
      }
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

  const handleImageUploaded = (file: File, imageUrl: string) => {
    const imageId = `editor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setEditorImages(prev => [...prev, { file, url: imageUrl, id: imageId }]);
  };

  const handleImageDescriptionUpdate = (imageId: string, description: string) => {
    // This function handles description updates from the album component
    console.log(`Image ${imageId} description updated:`, description);
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);
    // Only update input, don't auto-register tags
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      
      // Check if input starts with # and has content after it
      if (tagInput.startsWith('#') && tagInput.length > 1) {
        const tagContent = tagInput.slice(1).trim(); // Remove # and trim
        if (tagContent && !tags.includes(tagContent)) {
          const newTags = [...tags, tagContent];
          setTags(newTags);
          setFormData(prev => ({
            ...prev,
            tags: newTags.join(', ')
          }));
          setTagInput('');
        } else if (tags.includes(tagContent)) {
          // Tag already exists, clear input
          setTagInput('');
        }
      }
      // If doesn't start with # or has no content after #, do nothing
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setFormData(prev => ({
      ...prev,
      tags: newTags.join(', ')
    }));
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
    { value: BoardCategory.FISH_LOG, label: '낚시 일지' },
    { value: BoardCategory.INQUIRY, label: '문의사항' },
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
          {/* 카테고리와 제목 - 3:7 비율 */}
          <div className="grid grid-cols-10 gap-4">
            <div className="col-span-3">
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
            
            <div className="col-span-7">
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
          </div>

          {/* 내용 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              내용 *
            </label>
            <SlateRichTextEditor
              value={formData.content}
              onChange={handleContentChange}
              onImageUpload={handleImageUpload}
              onImageUploaded={handleImageUploaded}
              placeholder="내용을 입력해주세요"
              height={500}
            />
          </div>

          {/* 이미지 앨범 - 캐러셀 스타일 */}
          {editorImages.length > 0 && (
            <ImageCarousel 
              images={editorImages}
              onImageDescriptionUpdate={handleImageDescriptionUpdate}
            />
          )}

          {/* 태그 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              태그
            </label>
            
            {/* 태그 표시 영역 */}
            {tags.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* 태그 입력 영역 */}
            <div>
              <input
                type="text"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyPress={handleTagInputKeyPress}
                placeholder="#내용 + Enter로 태그 추가"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                #내용을 입력하고 Enter를 누르거나 #기호 다음에 내용을 입력하면 태그가 자동으로 추가됩니다.
              </p>
            </div>
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

// 이미지 캐러셀 컴포넌트
interface ImageCarouselProps {
  images: { file: File; url: string; id: string }[];
  onImageDescriptionUpdate: (imageId: string, description: string) => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, onImageDescriptionUpdate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempDescription, setTempDescription] = useState<string>('');

  const handlePrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
  };

  const handleEditDescription = (imageId: string) => {
    setEditingId(imageId);
    setTempDescription(descriptions[imageId] || '');
  };

  const handleSaveDescription = (imageId: string) => {
    setDescriptions(prev => ({
      ...prev,
      [imageId]: tempDescription
    }));
    onImageDescriptionUpdate(imageId, tempDescription);
    setEditingId(null);
    setTempDescription('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTempDescription('');
  };

  if (images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="border border-gray-300 rounded-lg p-6">
      {/* 헤더 */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-gray-700">
           업로드된 이미지 ({currentIndex + 1}/{images.length})
        </h3>
      </div>

      {/* 이미지와 네비게이션 */}
      <div className="relative flex items-center justify-center mb-6">
        {/* 왼쪽 네비게이션 */}
        <button
          type="button"
          onClick={handlePrevious}
          disabled={images.length <= 1}
          className="absolute left-0 z-10 p-3 bg-white border border-gray-300 rounded-full shadow-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-xl text-gray-600">‹</span>
        </button>

        {/* 이미지 */}
        <div className="flex justify-center">
          <img
            src={currentImage.url}
            alt={`업로드된 이미지 ${currentIndex + 1}`}
            className="max-w-full max-h-80 object-contain rounded border shadow-sm"
          />
        </div>

        {/* 오른쪽 네비게이션 */}
        <button
          type="button"
          onClick={handleNext}
          disabled={images.length <= 1}
          className="absolute right-0 z-10 p-3 bg-white border border-gray-300 rounded-full shadow-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-xl text-gray-600">›</span>
        </button>
      </div>

      {/* 이미지 인디케이터 */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 mb-4">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-500' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* 설명 영역 */}
      <div className="max-w-2xl mx-auto">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          이미지 설명
        </label>
        
        {editingId === currentImage.id ? (
          <div className="space-y-3">
            <textarea
              value={tempDescription}
              onChange={(e) => setTempDescription(e.target.value)}
              placeholder="이미지에 대한 설명을 입력하세요..."
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
            />
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => handleSaveDescription(currentImage.id)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                저장
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="min-h-[100px] p-4 bg-gray-50 border border-gray-200 rounded-md text-center">
              <p className="text-gray-700">
                {descriptions[currentImage.id] || '설명이 없습니다.'}
              </p>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={() => handleEditDescription(currentImage.id)}
                className="text-blue-500 hover:text-blue-700 font-medium"
              >
                {descriptions[currentImage.id] ? '설명 수정' : '설명 추가'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardForm;