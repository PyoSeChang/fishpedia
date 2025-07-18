import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Plus } from 'lucide-react';
import SlateRichTextEditor from '../../components/common/SlateRichTextEditor';
import { boardService } from '../../services/boardService';
import { imageUploadService } from '../../services/imageUploadService';
import { BoardCategory, BoardRequest } from '../../types/BoardType';

interface AlbumImage {
  id: string;
  file: File;
  url: string;
  description: string;
}

const PostWritePage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [boardData, setBoardData] = useState<BoardRequest>({
    title: '',
    content: '',
    category: BoardCategory.FREE,
    tags: '',
    pinned: false
  });
  
  const [albumImages, setAlbumImages] = useState<AlbumImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const imageUrl = await imageUploadService.uploadBoardImage(file);
      
      // 앨범에 이미지 추가
      const newAlbumImage: AlbumImage = {
        id: Date.now().toString(),
        file: file,
        url: imageUrl,
        description: ''
      };
      
      setAlbumImages(prev => [...prev, newAlbumImage]);
      
      return imageUrl;
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      throw error;
    }
  };
  
  const handleImageDescriptionChange = (id: string, description: string) => {
    setAlbumImages(prev => 
      prev.map(img => 
        img.id === id ? { ...img, description } : img
      )
    );
  };
  
  const handleImageRemove = (id: string) => {
    setAlbumImages(prev => prev.filter(img => img.id !== id));
    if (selectedImageIndex !== null && selectedImageIndex >= albumImages.length - 1) {
      setSelectedImageIndex(null);
    }
  };
  
  const handleAddImageToAlbum = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await handleImageUpload(file);
        } catch (error) {
          alert('이미지 업로드에 실패했습니다.');
        }
      }
    };
    input.click();
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!boardData.title.trim() || !boardData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // 게시글 생성
      const createdBoard = await boardService.createBoard(boardData);
      
      // 앨범 이미지들 한꺼번에 전송
      for (const albumImage of albumImages) {
        try {
          await boardService.addImageToBoard(createdBoard.id, albumImage.file, albumImage.description);
        } catch (error) {
          console.warn('앨범 이미지 등록 실패:', error);
        }
      }
      
      alert('게시글이 성공적으로 작성되었습니다!');
      navigate('/community');
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      alert('게시글 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?')) {
      navigate('/community');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">게시글 작성</h1>
        <p className="text-gray-600">새로운 게시글을 작성하세요</p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        {/* 카테고리 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            카테고리 *
          </label>
          <select
            value={boardData.category}
            onChange={(e) => setBoardData(prev => ({ ...prev, category: e.target.value as BoardCategory }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value={BoardCategory.FREE}>자유 게시판</option>
            <option value={BoardCategory.QUESTION}>질문</option>
            <option value={BoardCategory.TIP}>팁</option>
            <option value={BoardCategory.REVIEW}>리뷰</option>
            <option value={BoardCategory.NOTICE}>공지사항</option>
          </select>
        </div>

        {/* 제목 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제목 *
          </label>
          <input
            type="text"
            value={boardData.title}
            onChange={(e) => setBoardData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="제목을 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={100}
            required
          />
        </div>

        {/* 태그 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            태그 (선택사항)
          </label>
          <input
            type="text"
            value={boardData.tags || ''}
            onChange={(e) => setBoardData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="태그를 입력하세요 (쉼표로 구분)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 내용 입력 (리치 텍스트 에디터) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            내용 *
          </label>
          <SlateRichTextEditor
            value={boardData.content}
            onChange={(content) => setBoardData(prev => ({ ...prev, content }))}
            onImageUpload={handleImageUpload}
            height={500}
            placeholder="게시글 내용을 입력하세요..."
          />
        </div>

        {/* 앨범 섹션 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">📸 앨범</h3>
            <button
              type="button"
              onClick={handleAddImageToAlbum}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              <span>이미지 추가</span>
            </button>
          </div>
          
          {albumImages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📷</div>
              <p>아직 추가된 이미지가 없습니다.</p>
              <p className="text-sm">이미지를 추가하여 게시글과 함께 앨범에 저장하세요!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 이미지 갤러리 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {albumImages.map((image, index) => (
                  <div
                    key={image.id}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={image.url}
                      alt={`앨범 이미지 ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageRemove(image.id);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              
              {/* 선택된 이미지 상세 정보 */}
              {selectedImageIndex !== null && (
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-800">
                      이미지 {selectedImageIndex + 1} / {albumImages.length}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                        disabled={selectedImageIndex === 0}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => setSelectedImageIndex(Math.min(albumImages.length - 1, selectedImageIndex + 1))}
                        disabled={selectedImageIndex === albumImages.length - 1}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <img
                        src={albumImages[selectedImageIndex].url}
                        alt={`앨범 이미지 ${selectedImageIndex + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        이미지 설명
                      </label>
                      <textarea
                        value={albumImages[selectedImageIndex].description}
                        onChange={(e) => handleImageDescriptionChange(albumImages[selectedImageIndex].id, e.target.value)}
                        placeholder="이미지에 대한 설명을 입력하세요..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={6}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            disabled={isLoading}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '작성 중...' : '게시글 작성'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostWritePage; 