import React, { useState, useEffect, useRef } from 'react';
import { FishingSpot, SpotType, WaterFacilityType, SpotFilter, SPOT_TYPE_LABELS, WATER_FACILITY_TYPE_LABELS } from '../../types/SpotType';
import { spotService } from '../../services/spotService';

// 네이버 지도 API 타입 정의
declare global {
  interface Window {
    naver: any;
  }
}


const FishingSpotsPage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);
  const [spots, setSpots] = useState<FishingSpot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<SpotFilter>({
    region: '경기도' // 기본값으로 경기도 설정
  });
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [markers, setMarkers] = useState<any[]>([]);

  // 낚시터 데이터 로드 - 지역별로 로드
  useEffect(() => {
    const loadSpots = async () => {
      try {
        setLoading(true);
        let data: FishingSpot[];
        
        // 지역이 선택된 경우 해당 지역만 로드, 아니면 전체 로드
        if (filter.region) {
          data = await spotService.getSpotsByRegion(filter.region);
        } else {
          data = await spotService.getAllSpots();
        }
        
        setSpots(data);
      } catch (error) {
        console.error('낚시터 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSpots();
  }, [filter.region]); // 지역이 변경될 때마다 데이터 재로드

  // 지역별 지도 중심 좌표
  const getRegionCenter = (region?: string) => {
    const regionCenters: { [key: string]: { lat: number; lng: number } } = {
      '경기도': { lat: 37.4138, lng: 127.5183 },
      '서울특별시': { lat: 37.5665, lng: 126.9780 },
      '인천광역시': { lat: 37.4563, lng: 126.7052 },
      '강원도': { lat: 37.8228, lng: 128.1555 },
      '충청북도': { lat: 36.6356, lng: 127.4917 },
      '충청남도': { lat: 36.5184, lng: 126.8000 },
      '전라북도': { lat: 35.7175, lng: 127.1530 },
      '전라남도': { lat: 34.8679, lng: 126.9910 },
      '경상북도': { lat: 36.4919, lng: 128.8889 },
      '경상남도': { lat: 35.4606, lng: 128.2132 },
      '제주특별자치도': { lat: 33.4996, lng: 126.5312 },
      '부산광역시': { lat: 35.1796, lng: 129.0756 },
      '대구광역시': { lat: 35.8714, lng: 128.6014 },
      '울산광역시': { lat: 35.5384, lng: 129.3114 },
      '광주광역시': { lat: 35.1595, lng: 126.8526 },
      '대전광역시': { lat: 36.3504, lng: 127.3845 },
      '세종특별자치시': { lat: 36.4875, lng: 127.2816 }
    };
    
    return region ? regionCenters[region] : { lat: 37.5665, lng: 126.9780 }; // 기본값: 서울
  };

  // 필터링된 스팟들 (지역 데이터가 이미 필터링되어 있으므로 지역 필터는 제거)
  const filteredSpots = spots.filter(spot => {
    // 검색 키워드 필터
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      const nameMatch = spot.name?.toLowerCase().includes(keyword);
      const addressMatch = spot.roadAddress?.toLowerCase().includes(keyword) || spot.lotAddress?.toLowerCase().includes(keyword);
      const fishMatch = spot.mainFishSpecies?.toLowerCase().includes(keyword);
      const regionMatch = spot.region?.toLowerCase().includes(keyword);
      
      if (!nameMatch && !addressMatch && !fishMatch && !regionMatch) {
        return false;
      }
    }

    // 낚시터 타입 필터
    if (filter.spotType && spot.spotType !== filter.spotType) {
      return false;
    }

    // 수상시설물 타입 필터
    if (filter.waterFacilityType && spot.waterFacilityType !== filter.waterFacilityType) {
      return false;
    }

    // 어종 필터
    if (filter.fishSpecies && (!spot.mainFishSpecies || !spot.mainFishSpecies.includes(filter.fishSpecies))) {
      return false;
    }

    return true;
  });

  // 마커 업데이트
  const updateMarkers = (naverMap: any, spotsToShow: FishingSpot[]) => {
    // 기존 마커 제거
    markers.forEach(marker => {
      marker.setMap(null);
    });

    // 새로운 마커 생성
    const newMarkers = spotsToShow
      .filter(spot => spot.latitude && spot.longitude)
      .map(spot => {
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(spot.latitude!, spot.longitude!),
          map: naverMap,
          title: spot.name,
          icon: {
            content: `<div style="
              background: ${getSpotTypeColor(spot.spotType)};
              color: white;
              padding: 4px 8px;
              border-radius: 8px;
              font-size: 12px;
              font-weight: bold;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              cursor: pointer;
            ">${getSpotTypeIcon(spot.spotType)}</div>`,
            anchor: new window.naver.maps.Point(12, 12)
          }
        });

        // 마커 클릭 이벤트
        window.naver.maps.Event.addListener(marker, 'click', () => {
          setSelectedSpot(spot);
          naverMap.setCenter(new window.naver.maps.LatLng(spot.latitude!, spot.longitude!));
          naverMap.setZoom(13);
        });

        return marker;
      });

    setMarkers(newMarkers);
  };

  // 스팟 타입별 색상
  const getSpotTypeColor = (spotType?: SpotType) => {
    switch (spotType) {
      case SpotType.SEA: return '#3B82F6'; // 파란색
      case SpotType.RESERVOIR: return '#10B981'; // 초록색
      case SpotType.FLATLAND: return '#F59E0B'; // 주황색
      default: return '#6B7280'; // 회색
    }
  };

  // 스팟 타입별 아이콘
  const getSpotTypeIcon = (spotType?: SpotType) => {
    switch (spotType) {
      case SpotType.SEA: return '🌊';
      case SpotType.RESERVOIR: return '🏞️';
      case SpotType.FLATLAND: return '🎣';
      default: return '📍';
    }
  };

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
        const regionCenter = getRegionCenter(filter.region);
        const mapOptions = {
          center: new window.naver.maps.LatLng(regionCenter.lat, regionCenter.lng),
          zoom: filter.region ? 11 : 10, // 지역 선택시 더 확대
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

        // 필터링된 스팟으로 마커 업데이트
        updateMarkers(naverMap, filteredSpots);
        
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
  }, [spots, filter, searchKeyword, loading]);

  // 필터링된 스팟이 변경될 때 마커 업데이트
  useEffect(() => {
    if (map && !loading) {
      updateMarkers(map, filteredSpots);
    }
  }, [map, filteredSpots, loading]);



  const handleSpotClick = (spot: FishingSpot) => {
    setSelectedSpot(spot);
    if (map && spot.latitude && spot.longitude) {
      map.setCenter(new window.naver.maps.LatLng(spot.latitude, spot.longitude));
      map.setZoom(13);
    }
  };

  // 필터 핸들러
  const handleFilterChange = (newFilter: Partial<SpotFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
    
    // 지역이 변경된 경우 지도 중심 이동
    if (newFilter.region && map) {
      const regionCenter = getRegionCenter(newFilter.region);
      map.setCenter(new window.naver.maps.LatLng(regionCenter.lat, regionCenter.lng));
      map.setZoom(11);
    }
  };

  const clearFilters = () => {
    setFilter({ region: '경기도' }); // 기본값 유지
    setSearchKeyword('');
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

        {/* 주요 필터 - 지역 선택 */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-lg">🗺️</span>
            <h3 className="text-lg font-semibold text-blue-800">지역 선택</h3>
            <span className="text-sm text-blue-600">성능 최적화를 위해 지역을 먼저 선택해주세요</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-9 gap-2">
            {[
              '경기도', '서울특별시', '인천광역시', '강원도', '충청북도', 
              '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', 
              '제주특별자치도', '부산광역시', '대구광역시', '울산광역시', 
              '광주광역시', '대전광역시', '세종특별자치시'
            ].map(region => (
              <button
                key={region}
                onClick={() => handleFilterChange({ region })}
                className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                  filter.region === region 
                    ? 'bg-blue-500 text-white border-blue-500 shadow-md' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                }`}
              >
                {region.replace('특별시', '').replace('광역시', '').replace('특별자치도', '').replace('도', '')}
              </button>
            ))}
            <button
              onClick={() => handleFilterChange({ region: undefined })}
              className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                !filter.region 
                  ? 'bg-gray-500 text-white border-gray-500 shadow-md' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              전체
            </button>
          </div>
        </div>

        {/* 세부 필터 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* 낚시터 유형 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">낚시터 유형</label>
            <select
              value={filter.spotType || ''}
              onChange={(e) => handleFilterChange({ spotType: e.target.value as SpotType || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              {Object.entries(SPOT_TYPE_LABELS).map(([type, label]) => (
                <option key={type} value={type}>{label}</option>
              ))}
            </select>
          </div>

          {/* 어종 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">어종</label>
            <input
              type="text"
              value={filter.fishSpecies || ''}
              onChange={(e) => handleFilterChange({ fishSpecies: e.target.value || undefined })}
              placeholder="어종명 입력"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 필터 초기화 */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              필터 초기화
            </button>
          </div>
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
            낚시터 목록 ({loading ? '로딩중...' : `${filteredSpots.length}개`})
          </h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-gray-500">낚시터 정보를 불러오는 중...</p>
              </div>
            ) : filteredSpots.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎣</div>
                <p className="text-gray-500 mb-2">검색 결과가 없습니다</p>
                <p className="text-sm text-gray-400">
                  다른 키워드로 검색해보거나 필터를 변경해보세요
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  필터 초기화
                </button>
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
                  <div className="flex gap-1">
                    {spot.spotType && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {SPOT_TYPE_LABELS[spot.spotType]}
                      </span>
                    )}
                    {spot.region && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {spot.region}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {spot.roadAddress && (
                    <div>
                      <span className="text-xs font-medium text-gray-500">주소:</span>
                      <p className="text-sm text-gray-600">{spot.roadAddress}</p>
                    </div>
                  )}
                  
                  {spot.mainFishSpecies && (
                    <div>
                      <span className="text-xs font-medium text-gray-500">주요어종:</span>
                      <p className="text-sm text-gray-600">🐟 {spot.mainFishSpecies}</p>
                    </div>
                  )}
                  
                  {spot.waterFacilityType && (
                    <div>
                      <span className="text-xs font-medium text-gray-500">시설유형:</span>
                      <span className="ml-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {WATER_FACILITY_TYPE_LABELS[spot.waterFacilityType]}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    {spot.usageFee && (
                      <span className="text-sm text-gray-600">💰 {spot.usageFee}</span>
                    )}
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
              <h3 className="font-semibold text-gray-700 mb-2">낚시터 정보</h3>
              
              <div className="space-y-3">
                {selectedSpot.spotType && (
                  <div>
                    <span className="font-medium text-gray-700">유형:</span>
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                      {SPOT_TYPE_LABELS[selectedSpot.spotType]}
                    </span>
                  </div>
                )}
                
                {selectedSpot.region && (
                  <div>
                    <span className="font-medium text-gray-700">지역:</span>
                    <span className="ml-2">{selectedSpot.region}</span>
                  </div>
                )}
                
                {selectedSpot.roadAddress && (
                  <div>
                    <span className="font-medium text-gray-700">주소:</span>
                    <p className="text-gray-600 mt-1">{selectedSpot.roadAddress}</p>
                  </div>
                )}
                
                {selectedSpot.phoneNumber && (
                  <div>
                    <span className="font-medium text-gray-700">연락처:</span>
                    <span className="ml-2">{selectedSpot.phoneNumber}</span>
                  </div>
                )}
                
                {selectedSpot.waterArea && (
                  <div>
                    <span className="font-medium text-gray-700">수면적:</span>
                    <span className="ml-2">{selectedSpot.waterArea}㎡</span>
                  </div>
                )}
                
                {selectedSpot.maxCapacity && (
                  <div>
                    <span className="font-medium text-gray-700">최대수용인원:</span>
                    <span className="ml-2">{selectedSpot.maxCapacity}명</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">이용 안내</h3>
              <div className="space-y-3">
                {selectedSpot.mainFishSpecies && (
                  <div>
                    <span className="font-medium text-gray-700">주요어종:</span>
                    <p className="text-gray-600 mt-1">🐟 {selectedSpot.mainFishSpecies}</p>
                  </div>
                )}
                
                {selectedSpot.waterFacilityType && (
                  <div>
                    <span className="font-medium text-gray-700">수상시설:</span>
                    <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                      {WATER_FACILITY_TYPE_LABELS[selectedSpot.waterFacilityType]}
                    </span>
                  </div>
                )}
                
                {selectedSpot.usageFee && (
                  <div>
                    <span className="font-medium text-gray-700">이용요금:</span>
                    <span className="ml-2">💰 {selectedSpot.usageFee}</span>
                  </div>
                )}
                
                {selectedSpot.keyPoints && (
                  <div>
                    <span className="font-medium text-gray-700">주요포인트:</span>
                    <p className="text-gray-600 mt-1">{selectedSpot.keyPoints}</p>
                  </div>
                )}
                
                {selectedSpot.safetyFacilities && (
                  <div>
                    <span className="font-medium text-gray-700">안전시설:</span>
                    <p className="text-gray-600 mt-1">{selectedSpot.safetyFacilities}</p>
                  </div>
                )}
                
                {selectedSpot.convenienceFacilities && (
                  <div>
                    <span className="font-medium text-gray-700">편의시설:</span>
                    <p className="text-gray-600 mt-1">{selectedSpot.convenienceFacilities}</p>
                  </div>
                )}
                
                {selectedSpot.nearbyAttractions && (
                  <div>
                    <span className="font-medium text-gray-700">주변관광지:</span>
                    <p className="text-gray-600 mt-1">{selectedSpot.nearbyAttractions}</p>
                  </div>
                )}
                
                {selectedSpot.managementOffice && (
                  <div>
                    <span className="font-medium text-gray-700">관리기관:</span>
                    <span className="ml-2">{selectedSpot.managementOffice}</span>
                    {selectedSpot.managementPhone && (
                      <span className="text-gray-600"> ({selectedSpot.managementPhone})</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FishingSpotsPage;