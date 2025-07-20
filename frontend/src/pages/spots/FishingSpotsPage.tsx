import React, { useState, useEffect, useRef } from 'react';

// 네이버 지도 API 타입 정의
declare global {
  interface Window {
    naver: any;
  }
}

// 낚시 스팟 타입 정의
interface FishingSpot {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  fishTypes: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  facilities: string[];
  rating: number;
  imageUrl?: string;
}

// 샘플 낚시 스팟 데이터
const sampleSpots: FishingSpot[] = [
  {
    id: 1,
    name: '한강 반포대교 낚시터',
    description: '서울 시내에서 접근성이 좋은 인기 낚시 스팟입니다. 붕어, 잉어, 배스 등을 낚을 수 있습니다.',
    latitude: 37.5172,
    longitude: 126.9967,
    fishTypes: ['붕어', '잉어', '배스'],
    difficulty: 'easy',
    facilities: ['주차장', '편의점', '화장실'],
    rating: 4.2
  },
  {
    id: 2,
    name: '청평호',
    description: '경기도 가평군에 위치한 대형 호수로 다양한 어종과 아름다운 경치를 자랑합니다.',
    latitude: 37.7564,
    longitude: 127.4306,
    fishTypes: ['송어', '배스', '블루길'],
    difficulty: 'medium',
    facilities: ['펜션', '식당', '낚시용품점'],
    rating: 4.5
  },
  {
    id: 3,
    name: '안산 시화호',
    description: '서해안의 대표적인 바다낚시 포인트로 숭어, 농어 등을 낚을 수 있습니다.',
    latitude: 37.3447,
    longitude: 126.7342,
    fishTypes: ['숭어', '농어', '망둥어'],
    difficulty: 'hard',
    facilities: ['방파제', '낚시카페'],
    rating: 4.0
  }
];

const FishingSpotsPage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);
  const [spots] = useState<FishingSpot[]>(sampleSpots);
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // 네이버 지도 초기화
  useEffect(() => {
    const initializeMap = () => {
      console.log('네이버 지도 초기화 시작...');
      
      if (!mapRef.current) {
        console.error('지도 컨테이너가 없습니다.');
        return;
      }
      
      if (!window.naver) {
        console.error('네이버 지도 API가 로드되지 않았습니다.');
        return;
      }

      try {
        const mapOptions = {
          center: new window.naver.maps.LatLng(37.5665, 126.9780), // 서울 중심
          zoom: 10,
          mapTypeControl: true,
          scaleControl: true,
          logoControl: true,
          mapDataControl: true,
          zoomControl: true
        };

        console.log('지도 생성 중...');
        const naverMap = new window.naver.maps.Map(mapRef.current, mapOptions);
        setMap(naverMap);
        console.log('지도 생성 완료!');

        // 낚시 스팟 마커 추가 (필터링된 스팟만)
        const currentFilteredSpots = spots.filter(spot => {
          const matchesFilter = filter === 'all' || spot.difficulty === filter;
          const matchesSearch = searchKeyword === '' || 
            spot.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            spot.description.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            spot.fishTypes.some(fish => fish.toLowerCase().includes(searchKeyword.toLowerCase())) ||
            spot.facilities.some(facility => facility.toLowerCase().includes(searchKeyword.toLowerCase()));
          return matchesFilter && matchesSearch;
        });

        currentFilteredSpots.forEach(spot => {
          try {
            const marker = new window.naver.maps.Marker({
              position: new window.naver.maps.LatLng(spot.latitude, spot.longitude),
              map: naverMap,
              title: spot.name,
              icon: {
                content: `<div style="
                  background: #3B82F6;
                  color: white;
                  padding: 4px 8px;
                  border-radius: 8px;
                  font-size: 12px;
                  font-weight: bold;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  cursor: pointer;
                ">🎣</div>`,
                anchor: new window.naver.maps.Point(12, 12)
              }
            });

            // 마커 클릭 이벤트
            window.naver.maps.Event.addListener(marker, 'click', () => {
              setSelectedSpot(spot);
              naverMap.setCenter(new window.naver.maps.LatLng(spot.latitude, spot.longitude));
              naverMap.setZoom(13);
            });
            
            console.log(`마커 추가 완료: ${spot.name}`);
          } catch (markerError) {
            console.error(`마커 생성 실패 (${spot.name}):`, markerError);
          }
        });
        
      } catch (mapError) {
        console.error('지도 초기화 실패:', mapError);
        // 사용자에게 에러 표시
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px;">
              <div style="text-align: center; color: #dc2626; padding: 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
                <p style="font-weight: bold; margin-bottom: 8px;">지도 로딩 실패</p>
                <p style="font-size: 14px; margin-bottom: 16px;">네이버 지도 API 인증에 실패했습니다.</p>
                <details style="font-size: 12px; text-align: left;">
                  <summary style="cursor: pointer; margin-bottom: 8px;">해결 방법 보기</summary>
                  <ul style="padding-left: 20px; line-height: 1.6;">
                    <li>네이버 클라우드 플랫폼에서 도메인 등록 확인</li>
                    <li>허용 도메인에 'localhost:3000' 추가</li>
                    <li>API 키 상태 확인</li>
                    <li>브라우저 콘솔에서 상세 에러 확인</li>
                  </ul>
                </details>
              </div>
            </div>
          `;
        }
      }
    };

    // 네이버 지도 API 로드
    if (!window.naver) {
      const clientId = process.env.REACT_APP_NAVER_MAP_CLIENT_ID || 'gfnyi4izq0';
      console.log('네이버 지도 API 로딩 시작...', clientId);
      console.log('현재 URL:', window.location.href);
      console.log('현재 Origin:', window.location.origin);
      
      const script = document.createElement('script');
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
      script.onload = () => {
        console.log('네이버 지도 API 로딩 완료');
        initializeMap();
      };
      script.onerror = (error) => {
        console.error('네이버 지도 API 로딩 실패:', error);
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px;">
              <div style="text-align: center; color: #92400e; padding: 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                <p style="font-weight: bold; margin-bottom: 8px;">API 로딩 실패</p>
                <p style="font-size: 14px; margin-bottom: 16px;">네이버 지도 스크립트를 불러올 수 없습니다.</p>
                <p style="font-size: 12px;">네트워크 연결이나 API 키를 확인해주세요.</p>
              </div>
            </div>
          `;
        }
      };
      document.head.appendChild(script);
    } else {
      console.log('네이버 지도 API 이미 로딩됨');
      initializeMap();
    }
  }, [spots, filter, searchKeyword]);

  const filteredSpots = spots.filter(spot => {
    // 난이도 필터
    const matchesFilter = filter === 'all' || spot.difficulty === filter;
    
    // 검색 키워드 필터
    const matchesSearch = searchKeyword === '' || 
      spot.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      spot.description.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      spot.fishTypes.some(fish => fish.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      spot.facilities.some(facility => facility.toLowerCase().includes(searchKeyword.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const getDifficultyLabel = (difficulty: string) => {
    const labels = {
      easy: '초급',
      medium: '중급',
      hard: '고급'
    };
    return labels[difficulty as keyof typeof labels];
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors];
  };

  const handleSpotClick = (spot: FishingSpot) => {
    setSelectedSpot(spot);
    if (map) {
      map.setCenter(new window.naver.maps.LatLng(spot.latitude, spot.longitude));
      map.setZoom(13);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">🎣 낚시 스팟</h1>
        <p className="text-gray-600 mb-6">
          전국의 인기 낚시 스팟을 지도에서 확인하고 정보를 얻어보세요
        </p>

        {/* 검색 */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="스팟 이름, 어종, 시설로 검색하세요"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 필터 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter('easy')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'easy'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            초급자용
          </button>
          <button
            onClick={() => setFilter('medium')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'medium'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            중급자용
          </button>
          <button
            onClick={() => setFilter('hard')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'hard'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            고급자용
          </button>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 지도 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">낚시 스팟 지도</h2>
              <p className="text-sm text-gray-600">마커를 클릭하면 상세 정보를 확인할 수 있습니다</p>
            </div>
            <div 
              ref={mapRef} 
              className="w-full h-96 lg:h-[500px]"
              style={{ background: '#e5e7eb' }}
            >
              {!window.naver && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🗺️</div>
                    <p className="text-gray-600">지도를 로딩하는 중...</p>
                    <p className="text-sm text-gray-500 mt-2">
                      네이버 지도 API 키가 필요합니다
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 스팟 목록 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            낚시 스팟 목록 ({filteredSpots.length}개)
          </h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {filteredSpots.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎣</div>
                <p className="text-gray-500 mb-2">검색 결과가 없습니다</p>
                <p className="text-sm text-gray-400">
                  다른 키워드로 검색해보거나 필터를 변경해보세요
                </p>
                {searchKeyword && (
                  <button
                    onClick={() => setSearchKeyword('')}
                    className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    검색 초기화
                  </button>
                )}
              </div>
            ) : (
              filteredSpots.map(spot => (
              <div
                key={spot.id}
                onClick={() => handleSpotClick(spot)}
                className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all hover:shadow-lg ${
                  selectedSpot?.id === spot.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">{spot.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(spot.difficulty)}`}>
                    {getDifficultyLabel(spot.difficulty)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{spot.description}</p>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium text-gray-500">어종:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {spot.fishTypes.map((fish, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          🐟 {fish}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs font-medium text-gray-500">시설:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {spot.facilities.map((facility, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {facility}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-sm text-gray-600 ml-1">{spot.rating}</span>
                    </div>
                    <button className="text-blue-500 text-sm font-medium hover:text-blue-700">
                      상세보기 →
                    </button>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      </div>

      {/* 선택된 스팟 상세 정보 */}
      {selectedSpot && (
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-800">{selectedSpot.name}</h2>
            <button
              onClick={() => setSelectedSpot(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">스팟 정보</h3>
              <p className="text-gray-600 mb-4">{selectedSpot.description}</p>
              
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-700">난이도:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedSpot.difficulty)}`}>
                    {getDifficultyLabel(selectedSpot.difficulty)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">평점:</span>
                  <span className="ml-2 text-yellow-400">⭐ {selectedSpot.rating}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">이용 안내</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-700">어종:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedSpot.fishTypes.map((fish, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                        🐟 {fish}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">시설:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedSpot.facilities.map((facility, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FishingSpotsPage;