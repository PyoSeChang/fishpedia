import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fishService, FishLogCreateResponse, LevelUpdateResult } from '../../services/fishService';

import FishSelector from '../../components/common/FishSelector';

const FishLogWritePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedFish, setSelectedFish] = useState<number | ''>('');
  const [length, setLength] = useState<string>('');
  const [place, setPlace] = useState<string>('');
  const [review, setReview] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedScore, setCalculatedScore] = useState<number | null>(null);
  const [isCalculatingScore, setIsCalculatingScore] = useState(false);
  const [scoreCalculationError, setScoreCalculationError] = useState<string>('');
  const [classificationLogId, setClassificationLogId] = useState<number | null>(null);

  // URL 파라미터에서 fishId와 classificationLogId를 받아서 자동 선택
  useEffect(() => {
    const fishId = searchParams.get('fishId');
    const logId = searchParams.get('classificationLogId');
    
    if (fishId) {
      const fishIdNumber = parseInt(fishId, 10);
      if (!isNaN(fishIdNumber)) {
        setSelectedFish(fishIdNumber);
        console.log(`물고기 자동 선택: fishId=${fishIdNumber}`);
      }
    }
    
    if (logId) {
      const logIdNumber = parseInt(logId, 10);
      if (!isNaN(logIdNumber)) {
        setClassificationLogId(logIdNumber);
        console.log(`분류 로그 ID 설정: classificationLogId=${logIdNumber}`);
      }
    }
  }, [searchParams]);

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

  // 점수 계산 버튼 활성화 조건
  const isScoreButtonEnabled = () => {
    const hasLength = length && parseFloat(length) > 0;
    const hasImageAndLength = selectedImage && hasLength;
    const hasFishAndLength = selectedFish && hasLength;
    
    return hasImageAndLength || hasFishAndLength;
  };

  // 점수 계산 (비동기 처리)
  const handleCalculateScore = async () => {
    if (!isScoreButtonEnabled()) return;

    setIsCalculatingScore(true);
    setScoreCalculationError('');
    
    try {
      // POST 메서드로 먼저 시도
      let score;
      try {
        score = await fishService.calculateScore(
          selectedFish ? selectedFish.toString() : undefined,
          parseFloat(length),
          place || undefined
        );
      } catch (error) {
        console.log('POST 메서드 실패, GET 메서드로 시도:', error);
        // POST가 실패하면 GET 메서드로 시도 (이미지 없이)
        score = await fishService.calculateScore(
          selectedFish ? selectedFish.toString() : undefined,
          parseFloat(length)
        );
      }
      setCalculatedScore(score.score);
    } catch (error) {
      console.error('점수 계산 실패:', error);
      setScoreCalculationError('점수 계산에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsCalculatingScore(false);
    }
  };

  // 폼 제출 (레벨 업데이트 포함)
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!selectedFish || !length) {
      alert('물고기 종류와 길이를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('fishId', selectedFish.toString());
      formData.append('length', length);
      formData.append('place', place);
      formData.append('review', review);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      if (classificationLogId) {
        formData.append('classificationLogId', classificationLogId.toString());
      }

      const response: FishLogCreateResponse = await fishService.createFishLogWithLevel(formData);

      alert('낚시 일지가 성공적으로 작성되었습니다!');
      
      // 해당 물고기의 일지 목록 페이지로 이동 (레벨 업데이트 결과와 함께)
      navigate(`/fish/logs?fishId=${response.fishId}`, { 
        state: { levelUpdateResult: response.levelUpdateResult }
      });
      
    } catch (error) {
      console.error('일지 작성 실패:', error);
      alert('일지 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };




  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-blue-600 mb-2">낚시 일지 작성</h1>
              <p className="text-gray-600">오늘의 낚시 기록을 남겨보세요</p>
            </div>
            <button
              onClick={() => navigate('/fish/logs')}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← 목록으로
            </button>
          </div>




          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 물고기 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                물고기 종류 *
              </label>
              <FishSelector
                value={selectedFish}
                onChange={setSelectedFish}
                placeholder="물고기를 선택하세요"
                showAllOption={false}
              />
            </div>

            {/* 물고기 길이 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                물고기 길이 (cm) *
              </label>
              <input
                type="number"
                step="0.1"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 25.5"
                required
              />
            </div>

            {/* 점수 계산 섹션 (폼과 분리) */}
            <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  예상 점수 계산 (선택사항)
                </label>
                {calculatedScore !== null && (
                  <span className="text-lg font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                    {calculatedScore}점
                  </span>
                )}
              </div>
              
              <button
                type="button"
                onClick={handleCalculateScore}
                disabled={!isScoreButtonEnabled() || isCalculatingScore}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isScoreButtonEnabled() && !isCalculatingScore
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isCalculatingScore ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>계산 중...</span>
                  </span>
                ) : (
                  '점수 미리보기'
                )}
              </button>
              
              {scoreCalculationError && (
                <p className="text-red-500 text-sm mt-2">{scoreCalculationError}</p>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                사진과 길이를 입력하거나, 물고기 종류와 길이를 입력하면 예상 점수를 미리 확인할 수 있습니다.
              </p>
            </div>

            {/* 장소 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                낚시 장소
              </label>
              <input
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 한강공원, 부산 해운대"
              />
            </div>

            {/* 후기 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                낚시 후기
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="오늘의 낚시는 어땠나요? 특별한 일이 있었나요?"
              />
            </div>

            {/* 사진 업로드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사진 업로드 (선택사항)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="미리보기"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>저장 중...</span>
                </span>
              ) : (
                '일지 저장하기'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FishLogWritePage; 