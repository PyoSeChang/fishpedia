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
}

const BoardAlbum: React.FC<BoardAlbumProps> = ({ 
  boardId, 
  onImageSelect, 
  showUpload = true 
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
      const fullImageUrl = `http://localhost:8081${albums[index].imagePath}`;
      onImageSelect(fullImageUrl);
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
    if (selectedIndex !== null && selectedIndex < albums.length - 1) {
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

  if (loading) return <div className="text-center py-4">로딩 중...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      {/* 업로드 섹션 */}
      {showUpload && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">📸 이미지 추가</h4>
          
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
          📷 앨범 ({albums.length}장)
        </h4>
        
        {albums.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            보드에 아직 이미지가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {albums.map((album, index) => (
              <div
                key={album.id}
                className="relative group cursor-pointer"
                onClick={() => handleImageClick(index)}
              >
                <div className="aspect-square overflow-hidden rounded border hover:border-blue-400 transition-colors">
                  <img
                    src={`http://localhost:8081${album.imagePath}`}
                    alt={album.description || '앨범 이미지'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                
                {onImageSelect && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity rounded flex items-center justify-center">
                    <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-lg">📤</div>
                      <p className="text-xs">선택</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
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
              ✕
            </button>

            {selectedIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-2xl z-10"
              >
                ‹
              </button>
            )}

            {selectedIndex < albums.length - 1 && (
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-2xl z-10"
              >
                ›
              </button>
            )}

            <img
              src={`http://localhost:8081${albums[selectedIndex].imagePath}`}
              alt={albums[selectedIndex].description || '앨범 이미지'}
              className="max-w-full max-h-[80vh] object-contain"
            />

            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded">
              <p className="text-sm">
                {albums[selectedIndex].description || '설명 없음'}
              </p>
              <p className="text-xs text-gray-300 mt-1">
                {formatDate(albums[selectedIndex].createAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardAlbum;