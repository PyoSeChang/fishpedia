import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFishTypeByName } from '../../types/FishType';

interface ClassificationResult {
  predictedFish: string;
  confidence: number;
  allPredictions: Array<{
    fish_name: string;
    confidence: number;
  }>;
  isFishDetected: boolean;
  detectedFishName: string | null;
  classificationLogId?: number;
}

interface FishClassifierProps {
  isAuthenticated: boolean;
  onLoginPrompt: () => void;
  onFishSelected?: (fishId: number, classificationLogId?: number, imageFile?: File) => void;
}

const FishClassifier: React.FC<FishClassifierProps> = ({ isAuthenticated, onLoginPrompt, onFishSelected }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [error, setError] = useState<string>('');
  const [showFishModal, setShowFishModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(file));
        setError('');
        setResult(null);
      } else {
        setError('이미지 파일만 선택해주세요.');
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
      setResult(null);
    }
  };

  const classifyImage = async () => {
    if (!selectedImage) {
      setError('먼저 이미지를 선택해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedImage);

      const token = localStorage.getItem('accessToken');
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:8081/api/fish/classification/predict', {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`분류 요청에 실패했습니다: ${errorText}`);
      }

      const data: ClassificationResult = await response.json();
      setResult(data);
      
      // 어종이 인식되면 모달 표시
      if (data.isFishDetected && data.detectedFishName) {
        setShowFishModal(true);
      }
    } catch (err) {
      setError('물고기 분류 중 오류가 발생했습니다. 서버가 실행 중인지 확인해주세요.');
      console.error('Classification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWriteFishLog = () => {
    if (result && result.detectedFishName && isAuthenticated) {
      const fishType = getFishTypeByName(result.detectedFishName);
      if (fishType) {
        setShowFishModal(false);
        if (onFishSelected) {
          // If we're in a modal context, call the callback with image file
          onFishSelected(fishType.id, result.classificationLogId, selectedImage || undefined);
        } else {
          // If we're standalone, store image in sessionStorage and navigate
          if (selectedImage) {
            // Store image data for retrieval in write page
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target?.result) {
                sessionStorage.setItem('classifierImage', e.target.result as string);
                sessionStorage.setItem('classifierImageName', selectedImage.name);
                sessionStorage.setItem('classifierImageType', selectedImage.type);
              }
              
              const queryParams = new URLSearchParams({
                fishId: fishType.id.toString(),
                fromClassifier: 'true'
              });
              if (result.classificationLogId) {
                queryParams.set('classificationLogId', result.classificationLogId.toString());
              }
              navigate(`/fish/logs/write?${queryParams.toString()}`);
            };
            reader.readAsDataURL(selectedImage);
          } else {
            const queryParams = new URLSearchParams({
              fishId: fishType.id.toString(),
            });
            if (result.classificationLogId) {
              queryParams.set('classificationLogId', result.classificationLogId.toString());
            }
            navigate(`/fish/logs/write?${queryParams.toString()}`);
          }
        }
      }
    }
  };

  const handleSignupAndWrite = () => {
    setShowFishModal(false);
    onLoginPrompt();
  };

  const resetClassifier = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {/* 어종 인식 성공 모달 */}
      {showFishModal && result?.isFishDetected && result?.detectedFishName && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="text-6xl mb-4"></div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              {result.detectedFishName} 입니다!
            </h2>
            <p className="text-gray-600 mb-6">
              AI가 높은 신뢰도로 물고기를 인식했습니다.
              <br />
              낚시 일지를 작성해보세요!
            </p>
            
            <div className="space-y-3">
              {isAuthenticated ? (
                <button
                  onClick={handleWriteFishLog}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  낚시 일지 작성하러 가기
                </button>
              ) : (
                <button
                  onClick={handleSignupAndWrite}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  가입하고 낚시 일지 작성하기
                </button>
              )}
              
              <button
                onClick={() => setShowFishModal(false)}
                className="w-full bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                나중에 하기
              </button>
            </div>
          </div>
        </div>
      )}

    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">
        AI 물고기 분류기
      </h2>
      <p className="text-center text-gray-600 mb-8">
        물고기 사진을 업로드하면 AI가 어떤 물고기인지 분류해드립니다!
      </p>

      {/* 이미지 업로드 영역 */}
      {!imagePreview && (
        <div
          className="border-2 border-dashed border-blue-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="text-6xl mb-4"></div>
          <p className="text-xl text-gray-600 mb-2">
            여기를 클릭하거나 이미지를 드래그해주세요
          </p>
          <p className="text-sm text-gray-400">
            JPG, PNG, GIF 등 이미지 파일 지원
          </p>
        </div>
      )}

      {/* 이미지 미리보기 */}
      {imagePreview && (
        <div className="text-center mb-6">
          <img
            src={imagePreview}
            alt="업로드된 이미지"
            className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
          />
          <div className="mt-4 space-x-4">
            <button
              onClick={classifyImage}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '분류 중...' : '물고기 분류하기'}
            </button>
            <button
              onClick={resetClassifier}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              다시 선택
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* 오류 메시지 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* 분류 결과 */}
      {result && (
        <div>
          {/* 물고기 인식 성공 */}
          {result.isFishDetected && result.detectedFishName ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="text-2xl font-bold text-green-800 mb-4 text-center">
                물고기 인식 성공!
              </h3>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-green-700 mb-2">
                  {result.detectedFishName}
                </div>
                <div className="text-lg text-green-600">
                  신뢰도: {(result.confidence * 100).toFixed(1)}%
                </div>
              </div>

              {/* 회원/비회원 분기 */}
              {isAuthenticated ? (
                <div className="text-center space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-800 mb-3">
                      이 물고기를 낚으셨나요? 낚시 일지에 기록해보세요!
                    </p>
                    <button
                      onClick={handleWriteFishLog}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      낚시 일지 작성하기
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <h4 className="text-yellow-800 font-semibold mb-2">
                      더 많은 기능을 이용해보세요!
                    </h4>
                    <p className="text-yellow-700 mb-3">
                      회원가입하시면 낚시 기록 작성, 점수 매기기, 도감 수집 등 다양한 기능을 이용할 수 있습니다.
                    </p>
                    <div className="space-x-4">
                      <button
                        onClick={onLoginPrompt}
                        className="bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
                      >
                        로그인/회원가입
                      </button>
                      <button
                        onClick={() => navigate('/fish/collection')}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        도감 보기
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* 물고기 인식 실패 */
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
              <h3 className="text-2xl font-bold text-orange-800 mb-4 text-center">
                물고기 인식 실패
              </h3>
              
              <div className="text-center mb-6">
                <div className="text-lg text-orange-600 mb-4">
                  AI가 물고기를 정확히 식별하지 못했습니다.
                </div>
                
                {/* 분류 시도 결과 표시 */}
                <div className="bg-white border border-orange-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">분류 시도 결과:</h4>
                  <div className="text-center mb-3">
                    <div className="text-2xl font-bold text-gray-700 mb-1">
                      {result.predictedFish}
                    </div>
                    <div className="text-sm text-red-600">
                      신뢰도: {(result.confidence * 100).toFixed(1)}% (기준 미달)
                    </div>
                  </div>
                  
                  {/* 기준 안내 */}
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    <p className="mb-1"><strong>인식 기준:</strong></p>
                    <p>• 넙치, 도다리: 90% 이상</p>
                    <p>• 기타 어종: 99% 이상</p>
                  </div>
                </div>
              </div>

              {/* 다시 시도 안내 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-blue-800 font-semibold mb-2">
                  더 정확한 인식을 위한 팁:
                </h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• 물고기가 선명하게 보이는 사진을 사용해주세요</li>
                  <li>• 물고기 전체가 잘 보이도록 촬영해주세요</li>
                  <li>• 밝고 깨끗한 배경에서 촬영하면 더 좋습니다</li>
                  <li>• 다른 각도에서 촬영한 사진을 시도해보세요</li>
                </ul>
                <button
                  onClick={resetClassifier}
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  다른 사진으로 다시 시도
                </button>
              </div>
            </div>
          )}

          {/* 상위 예측 결과 (항상 표시) */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-3">전체 분류 결과:</h4>
            <div className="space-y-2">
              {result.allPredictions?.slice(0, 5).map((pred, index) => (
                <div key={index} className="flex justify-between items-center bg-white p-2 rounded border">
                  <span className="font-medium">{pred.fish_name}</span>
                  <span className={`text-sm ${
                    index === 0 ? 'font-bold text-blue-600' : 'text-gray-600'
                  }`}>
                    {(pred.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default FishClassifier;