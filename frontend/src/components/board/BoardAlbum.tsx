import React, { useState, useEffect } from 'react';
import { boardService } from '../../services/boardService';

interface BoardAlbumImage {
  id: number;
  imagePath: string;
  description?: string;
  createAt: string;
  authorId: number;
}

interface BoardAlbumProps {
  boardId?: number;
  onImageSelect?: (imageUrl: string) => void;
  showUpload?: boolean;
  externalImages?: { file: File; url: string; id: string }[];
  onImageDescriptionUpdate?: (imageId: string, description: string) => void;
}

const BoardAlbum: React.FC<BoardAlbumProps> = ({ 
  boardId, 
  onImageSelect, 
  showUpload = true,
  externalImages = [],
  onImageDescriptionUpdate
}) => {
  const [albums, setAlbums] = useState<BoardAlbumImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [externalImageDescriptions, setExternalImageDescriptions] = useState<Record<string, string>>({});
  const [editingDescriptionId, setEditingDescriptionId] = useState<string | null>(null);
  const [tempDescription, setTempDescription] = useState<string>('');

  useEffect(() => {
    if (boardId) {
      fetchBoardAlbums();
    }
  }, [boardId]);

  const fetchBoardAlbums = async () => {
    if (!boardId) return;
    
    try {
      setLoading(true);
      const response = await boardService.getBoardImages(boardId);
      setAlbums(response);
    } catch (err) {
      setError('앨범을 불러오는데 실패했습니다.');
      console.error('Error fetching board albums:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      alert('이미지를 선택해주세요.');
      return;
    }

    try {
      setIsUploading(true);
      
      if (!boardId) {
        throw new Error('보드 ID가 필요합니다.');
      }
      
      // 보드에 이미지 추가
      await boardService.addImageToBoard(boardId, selectedImage, description);
      
      setSelectedImage(null);
      setImagePreview('');
      setDescription('');
      
      // 다시 목록 불러오기
      fetchBoardAlbums();
      
      alert('앨범에 이미지가 성공적으로 추가되었습니다!');
      
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageClick = (index: number) => {
    if (onImageSelect) {
      onImageSelect(allImages[index].imageUrl);
    } else {
      setSelectedIndex(index);
      setShowModal(true);
    }
  };

  const handlePrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < allImages.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
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

  const handleDescriptionEdit = (imageId: string, currentDescription: string) => {
    setEditingDescriptionId(imageId);
    setTempDescription(currentDescription);
  };

  const handleDescriptionSave = (imageId: string) => {
    setExternalImageDescriptions(prev => ({
      ...prev,
      [imageId]: tempDescription
    }));
    if (onImageDescriptionUpdate) {
      onImageDescriptionUpdate(imageId, tempDescription);
    }
    setEditingDescriptionId(null);
    setTempDescription('');
  };

  const handleDescriptionCancel = () => {
    setEditingDescriptionId(null);
    setTempDescription('');
  };

  // Combine server images and external images for display
  const allImages = [
    ...albums.map(album => ({
      id: `server-${album.id}`,
      type: 'server' as const,
      imagePath: album.imagePath,
      imageUrl: `http://localhost:8081${album.imagePath}`,
      description: album.description || '',
      createAt: album.createAt,
      authorId: album.authorId
    })),
    ...externalImages.map(extImg => ({
      id: `external-${extImg.id}`,
      type: 'external' as const,
      imagePath: '',
      imageUrl: extImg.url,
      description: externalImageDescriptions[extImg.id] || '',
      createAt: new Date().toISOString(),
      authorId: 0
    }))
  ];

  if (loading) return <div className="text-center py-4">로딩 중...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      {/* 업로드 섹션 */}
      {showUpload && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3"> 이미지 추가</h4>
          
          <div className="space-y-3">
            {/* 이미지 선택 */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm"
            />

            {/* 미리보기 */}
            {imagePreview && (
              <img
                src={imagePreview}
                alt="미리보기"
                className="w-full h-32 object-cover rounded border"
              />
            )}

            {/* 설명 */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="설명 (선택사항)"
              className="w-full px-2 py-1 text-sm border rounded resize-none"
              rows={2}
            />

            {/* 업로드 버튼 */}
            <button
              onClick={handleUpload}
              disabled={!selectedImage || isUploading}
              className={`w-full py-2 text-sm rounded transition-colors ${
                selectedImage && !isUploading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isUploading ? '업로드 중...' : '추가하기'}
            </button>
          </div>
        </div>
      )}

      {/* 갤러리 */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
           앨범 ({allImages.length}장)
        </h4>
        
        {allImages.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            이미지가 없습니다. 에디터에서 이미지를 업로드해보세요.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {allImages.map((image, index) => (
                <div
                  key={image.id}
                  className="relative group cursor-pointer"
                  onClick={() => handleImageClick(index)}
                >
                  <div className="aspect-square overflow-hidden rounded border hover:border-blue-400 transition-colors">
                    <img
                      src={image.imageUrl}
                      alt={image.description || '앨범 이미지'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  
                  {/* 외부 이미지 표시 */}
                  {image.type === 'external' && (
                    <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                      
                    </div>
                  )}
                  
                  {onImageSelect && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity rounded flex items-center justify-center">
                      <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="text-lg"></div>
                        <p className="text-xs">선택</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* 외부 이미지 설명 편집 섹션 */}
            {externalImages.length > 0 && (
              <div className="border-t pt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2"> 에디터 이미지 설명</h5>
                <div className="space-y-2">
                  {externalImages.map((extImg) => {
                    const imageId = extImg.id;
                    const currentDescription = externalImageDescriptions[imageId] || '';
                    const isEditing = editingDescriptionId === imageId;
                    
                    return (
                      <div key={imageId} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                        <img
                          src={extImg.url}
                          alt="미리보기"
                          className="w-12 h-12 object-cover rounded border"
                        />
                        <div className="flex-1">
                          {isEditing ? (
                            <div className="space-y-2">
                              <textarea
                                value={tempDescription}
                                onChange={(e) => setTempDescription(e.target.value)}
                                placeholder="이미지 설명을 입력하세요..."
                                className="w-full px-2 py-1 text-sm border rounded resize-none"
                                rows={2}
                              />
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleDescriptionSave(imageId)}
                                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                  저장
                                </button>
                                <button
                                  onClick={handleDescriptionCancel}
                                  className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                  취소
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-sm text-gray-700">
                                {currentDescription || '설명 없음'}
                              </p>
                              <button
                                onClick={() => handleDescriptionEdit(imageId, currentDescription)}
                                className="text-xs text-blue-500 hover:text-blue-700"
                              >
                                {currentDescription ? '수정' : '설명 추가'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 모달 */}
      {showModal && selectedIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-2xl max-h-full p-4">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-white text-xl z-10"
            >
              
            </button>

            {selectedIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-2xl z-10"
              >
                ‹
              </button>
            )}

            {selectedIndex < allImages.length - 1 && (
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-2xl z-10"
              >
                ›
              </button>
            )}

            <img
              src={allImages[selectedIndex].imageUrl}
              alt={allImages[selectedIndex].description || '앨범 이미지'}
              className="max-w-full max-h-[80vh] object-contain"
            />

            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded">
              <p className="text-sm">
                {allImages[selectedIndex].description || '설명 없음'}
              </p>
              <p className="text-xs text-gray-300 mt-1">
                {formatDate(allImages[selectedIndex].createAt)}
                {allImages[selectedIndex].type === 'external' && (
                  <span className="ml-2 text-blue-300"> 에디터 이미지</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardAlbum;