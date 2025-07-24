
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fishService, FishLog, FishLogDTO, LevelUpdateResult } from '../../services/fishService';
import { fishCollectionService, FishCollection } from '../../services/fishCollectionService';
import { userService, UserInfo } from '../../services/userService';
import FishSelector from '../../components/common/FishSelector';
import ProgressBar from '../../components/common/ProgressBar';
import { FISH_TYPES } from '../../types/FishType';

const FishLogsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [fishLogs, setFishLogs] = useState<FishLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFish, setSelectedFish] = useState<number | ''>('');
  const [collectionInfo, setCollectionInfo] = useState<FishCollection | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [collectionLoading, setCollectionLoading] = useState(true);
  const [levelUpdateResult, setLevelUpdateResult] = useState<LevelUpdateResult | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [verifyingLogs, setVerifyingLogs] = useState<Set<number>>(new Set());


  useEffect(() => {
    // URL 쿼리 파라미터에서 fishId 확인
    const urlParams = new URLSearchParams(location.search);
    const queryFishId = urlParams.get('fishId');
    
    let newSelectedFish: number | '' = '';
    if (queryFishId) {
      newSelectedFish = parseInt(queryFishId);
    }
    
    setSelectedFish(newSelectedFish);
    
    // 레벨 업데이트 결과 확인
    const state = location.state as { levelUpdateResult?: LevelUpdateResult };
    if (state?.levelUpdateResult) {
      setLevelUpdateResult(state.levelUpdateResult);
      setShowAnimation(true);
      
      // 5초 후 애니메이션 종료
      setTimeout(() => {
        setShowAnimation(false);
        setLevelUpdateResult(null);
      }, 5000);
    }
    
    // 즉시 API 호출
    const loadFishLogs = async () => {
      try {
        setLoading(true);
        setCollectionLoading(true);
        const fishIdParam = newSelectedFish === '' ? undefined : newSelectedFish;
        console.log('일지 조회 요청 - selectedFish:', newSelectedFish, 'fishIdParam:', fishIdParam);
        const result = await fishService.getFishLogs(fishIdParam);
        console.log('조회된 일지 개수:', result.fishLogs.length);
        setFishLogs(result.fishLogs);
        setCollectionInfo(result.fishCollection);
        console.log(result.fishCollection);
      } catch (error) {
        console.error('낚시 일지 로딩 실패:', error);
      } finally {
        setLoading(false);
        setCollectionLoading(false);
      }
    };
    
    loadFishLogs();
  }, [location.search]);

  // 컬렉션 정보 로드
  // useEffect(() => {
  //   const loadCollectionInfo = async () => {
  //     try {
  //       setCollectionLoading(true);
  //       if (selectedFish) {
  //         // 특정 물고기 컬렉션 정보
  //         console.log('컬렉션 정보 로드 - fishId:', selectedFish);
  //         const collections = await fishCollectionService.getMyCollection();
  //         const collection = collections.find(c => c.fishId === selectedFish);
  //         console.log('찾은 컬렉션:', collection);
  //         setCollectionInfo(collection || null);
  //         setUserInfo(null);
  //       } else {
  //         // 전체 사용자 정보
  //         console.log('전체 사용자 정보 로드');
  //         const userInfoData = await userService.getMyInfo();
  //         console.log('사용자 정보:', userInfoData);
  //         setUserInfo(userInfoData);
  //         setCollectionInfo(null);
  //       }
  //     } catch (error) {
  //       console.error('컬렉션 정보 로드 실패:', error);
  //     } finally {
  //       setCollectionLoading(false);
  //     }
  //   };
  //
  //   loadCollectionInfo();
  // }, [selectedFish, fishLogs.length]); // fishLogs.length를 의존성에 추가

  const handleFishChange = (fishId: number | '') => {
    console.log('FishSelector 값 변경:', fishId, '타입:', typeof fishId);
    
    // URL 업데이트 (useEffect가 자동으로 API 호출)
    if (fishId) {
      navigate(`/fish/logs?fishId=${fishId}`, { replace: true });
    } else {
      navigate('/fish/logs', { replace: true });
    }
  };

  const handleVerifyFishLog = async (fishLogId: number) => {
    try {
      setVerifyingLogs(prev => new Set([...Array.from(prev), fishLogId]));
      
      const isVerified = await fishService.verifyFishLog(fishLogId);
      
      if (isVerified) {
        // 일지 목록 새로고침
        const fishIdParam = selectedFish === '' ? undefined : selectedFish as number;
        const result = await fishService.getFishLogs(fishIdParam);
        setFishLogs(result.fishLogs);
        alert('랭킹 등록이 완료되었습니다!');
      } else {
        alert('검증에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('검증 실패:', error);
      alert('검증 중 오류가 발생했습니다.');
    } finally {
      setVerifyingLogs(prev => {
        const newSet = new Set(prev);
        newSet.delete(fishLogId);
        return newSet;
      });
    }
  };




  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-blue-600 mb-2">낚시 일지</h1>
            <p className="text-gray-600">나의 낚시 기록을 확인해보세요</p>
          </div>
          <button
            onClick={() => navigate('/fish/logs/write')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>일지 작성</span>
          </button>
        </div>



        {/* 필터 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-gray-700 font-medium">물고기 필터:</span>
            </div>
            <div className="w-full sm:w-80">
              <FishSelector
                value={selectedFish}
                onChange={handleFishChange}
                placeholder="물고기 선택"
                showAllOption={true}
              />
            </div>
            <div className="text-sm text-gray-500">
              {selectedFish ? '선택된 물고기의 일지만 표시됩니다' : '모든 물고기의 일지가 표시됩니다'}
            </div>
          </div>
        </div>


        {/* 컬렉션 정보 카드 */}
        {!collectionLoading && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {selectedFish ? '물고기별 컬렉션 정보' : '전체 낚시 정보'}
            </h2>
            {selectedFish ? (
              // 특정 물고기 컬렉션 정보
              collectionInfo ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {collectionInfo.highestScore}점
                      </div>
                      <div className="text-sm text-gray-600">최고 점수</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {collectionInfo.highestLength}cm
                      </div>
                      <div className="text-sm text-gray-600">최고 길이</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {collectionInfo.totalScore || 0}점
                      </div>
                      <div className="text-sm text-gray-600">총 점수</div>
                    </div>
                  </div>
                  
                  {/* 레벨 정보 및 진행도 바 */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">레벨 정보</h3>
                    <ProgressBar
                      progress={(collectionInfo?.currentLevelProgress || 0) / 100}
                      level={collectionInfo?.level || 1}
                      levelUpdate={levelUpdateResult}
                      showAnimation={showAnimation}
                    />
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  아직 해당 물고기를 낚지 않았습니다.
                </div>
              )
            ) : (
              // 전체 사용자 정보
              userInfo ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {userInfo?.totalScore || 0}점
                      </div>
                      <div className="text-sm text-gray-600">총 점수</div>
                    </div>
                  </div>
                  
                  {/* 전체 레벨 정보 및 진행도 바 */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">전체 레벨 정보</h3>
                    <ProgressBar
                      progress={(userInfo?.currentLevelProgress || 0) / 100}
                      level={userInfo?.level || 1}
                      levelUpdate={levelUpdateResult}
                      showAnimation={showAnimation}
                    />
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  사용자 정보를 불러올 수 없습니다.
                </div>
              )
            )}
          </div>
        )}

        {fishLogs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {selectedFish ? '해당 물고기의 일지가 없습니다' : '아직 낚시 일지가 없습니다'}
            </h2>
            <p className="text-gray-600 mb-6">
              {selectedFish ? '다른 물고기를 선택하거나 첫 번째 일지를 작성해보세요!' : '첫 번째 낚시 일지를 작성해보세요!'}
            </p>
            <button
              onClick={() => navigate('/fish/logs/write')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              일지 작성하기
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {fishLogs.map((log) => (
              <div key={log.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {log.imgPath ? (
                  <div className="h-48 bg-gray-200 relative">
                    <img
                      src={`http://localhost:8080${log.imgPath}`}
                      alt={`${log.fishName} 사진`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // 이미지 로드 실패 시 기본 이미지 표시
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center bg-gray-200">
                            <div class="text-center text-gray-500">
                              <div class="text-4xl mb-2"></div>
                              <div class="text-sm">이미지를 불러올 수 없습니다</div>
                            </div>
                          </div>
                        `;
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-4xl mb-2"></div>
                      <div className="text-sm">사진 없음</div>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-800">{log.fishName}</h3>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                      {log.score}점
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>길이:</strong> {log.length}cm</p>
                    <p><strong>날짜:</strong> {new Date(log.collectAt).toLocaleDateString()}</p>
                    {log.place && <p><strong>장소:</strong> {log.place}</p>}
                  </div>
                  {log.review && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-gray-700 text-sm line-clamp-3">{log.review}</p>
                    </div>
                  )}
                  
                  {/* 랭킹 등록 버튼 */}
                  <div className="mt-4 flex justify-between items-center">
                    {log.certified ? (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        ✓ 랭킹 등록됨
                      </span>
                    ) : (
                      <button
                        onClick={() => handleVerifyFishLog(log.id)}
                        disabled={verifyingLogs.has(log.id)}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                      >
                        {verifyingLogs.has(log.id) ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>검증 중...</span>
                          </>
                        ) : (
                          <>
                            <span>랭킹 등록</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FishLogsPage; 