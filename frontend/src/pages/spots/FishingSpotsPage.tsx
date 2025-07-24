import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FishingSpot, SpotType, WaterFacilityType, SpotFilter, SPOT_TYPE_LABELS, WATER_FACILITY_TYPE_LABELS } from '../../types/SpotType';
import { spotService } from '../../services/spotService';

// 네이버 지도 API 타입 정의
declare global {
  interface Window {
    naver: any;
  }
}

// 바다 낚시 지수 테이블 컴포넌트
const FishingLevelTable: React.FC<{ spot: FishingSpot }> = ({ spot }) => {
  const [fishingLevel, setFishingLevel] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchFishingLevel = async () => {
    if (fishingLevel) return; // 이미 로드된 경우

    setLoading(true);
    try {
      // TODO: 실제 API 호출로 바다 낚시 지수 정보 가져오기
      // const response = await fishingLevelService.getFishingLevel(spot.latitude, spot.longitude);
      
      // 임시 데이터 (실제로는 API에서 가져옴)
      const mockData = {
        weatherCondition: '맑음',
        waveHeight: '0.5m',
        windSpeed: '5m/s',
        waterTemp: '18°C',
        fishingIndex: '좋음',
        recommendation: '오늘은 낚시하기 좋은 날씨입니다!'
      };
      
      setTimeout(() => {
        setFishingLevel(mockData);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('바다 낚시 지수 로드 실패:', error);
      setLoading(false);
    }
  };

  // 컴포넌트가 마운트될 때 데이터 로드
  useEffect(() => {
    fetchFishingLevel();
  }, []);

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <span></span>
          <h3 className="text-lg font-semibold text-blue-800">바다 낚시 지수</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-blue-600">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!fishingLevel) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <span></span>
          <h3 className="text-lg font-semibold text-blue-800">바다 낚시 지수</h3>
        </div>
        <div className="text-gray-500 text-center py-4">정보를 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <span></span>
        <h3 className="text-lg font-semibold text-blue-800">바다 낚시 지수</h3>
      </div>
      
      {/* 날씨 정보 테이블 */}
      <div className="bg-white rounded-lg border border-blue-200 overflow-hidden mb-4">
        <div className="grid grid-cols-4 gap-0">
          <div className="bg-blue-100 px-3 py-2 text-center text-sm font-medium text-blue-800 border-r border-blue-200">
            날씨
          </div>
          <div className="bg-blue-100 px-3 py-2 text-center text-sm font-medium text-blue-800 border-r border-blue-200">
            파도
          </div>
          <div className="bg-blue-100 px-3 py-2 text-center text-sm font-medium text-blue-800 border-r border-blue-200">
            바람
          </div>
          <div className="bg-blue-100 px-3 py-2 text-center text-sm font-medium text-blue-800">
            수온
          </div>
        </div>
        <div className="grid grid-cols-4 gap-0">
          <div className="px-3 py-2 text-center text-sm text-gray-700 border-r border-gray-200">
            {fishingLevel.weatherCondition}
          </div>
          <div className="px-3 py-2 text-center text-sm text-gray-700 border-r border-gray-200">
            {fishingLevel.waveHeight}
          </div>
          <div className="px-3 py-2 text-center text-sm text-gray-700 border-r border-gray-200">
            {fishingLevel.windSpeed}
          </div>
          <div className="px-3 py-2 text-center text-sm text-gray-700">
            {fishingLevel.waterTemp}
          </div>
        </div>
      </div>
      
      {/* 낚시 지수 */}
      <div className="bg-white rounded-lg border border-blue-200 p-3 mb-3">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">낚시 지수:</span>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            fishingLevel.fishingIndex === '좋음' ? 'bg-green-100 text-green-800' :
            fishingLevel.fishingIndex === '보통' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {fishingLevel.fishingIndex}
          </span>
        </div>
      </div>
      
      {/* 추천 메시지 */}
      <div className="bg-white rounded-lg border border-blue-200 p-3">
        <div className="text-sm text-gray-700">
          <span className="font-medium text-blue-700"> 추천:</span>
          <p className="mt-1">{fishingLevel.recommendation}</p>
        </div>
      </div>
    </div>
  );
};


const FishingSpotsPage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null); // 상세보기 영역 ref 추가
  const [map, setMap] = useState<any>(null);
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);
  const [spots, setSpots] = useState<FishingSpot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<SpotFilter>({
    region: '경기' // 기본값으로 경기 설정
  });
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [markers, setMarkers] = useState<any[]>([]);
  
  // 세부 검색 드롭다운 상태
  const [showDetailSearch, setShowDetailSearch] = useState<boolean>(false);
  const [detailFilter, setDetailFilter] = useState({
    spotTypes: [] as SpotType[],
    waterFacilityTypes: [] as WaterFacilityType[],
    fishSpecies: [] as string[],
    minUsageFee: undefined as number | undefined,
    maxUsageFee: undefined as number | undefined,
    convenienceFacilities: [] as string[]
  });

  // 낚시터 데이터 로드 - 지역별로 로드 (기본 검색)
  useEffect(() => {
    const loadSpots = async () => {
      if (!filter.region) {
        setSpots([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await spotService.getSpotsByRegion(filter.region);
        
        // 임시: 바다 낚시터에 fishingLevelInfo 속성 추가 (실제로는 백엔드에서 처리)
        const spotsWithFishingLevel = data.map(spot => ({
          ...spot,
          fishingLevelInfo: spot.fishingLevelInfo === true
        }));
        
        setSpots(spotsWithFishingLevel);
      } catch (error) {
        console.error('낚시터 데이터 로드 실패:', error);
        setSpots([]);
      } finally {
        setLoading(false);
      }
    };

    loadSpots();
  }, [filter.region]); // 지역이 변경될 때마다 데이터 재로드

  // 세부 검색 실행
  const handleDetailSearch = async () => {
    if (!filter.region) return;

    try {
      setLoading(true);
      const searchParams = {
        region: filter.region,
        keyword: searchKeyword || undefined,
        spotTypes: detailFilter.spotTypes.length > 0 ? detailFilter.spotTypes : undefined,
        waterFacilityTypes: detailFilter.waterFacilityTypes.length > 0 ? detailFilter.waterFacilityTypes : undefined,
        fishSpecies: detailFilter.fishSpecies.length > 0 ? detailFilter.fishSpecies : undefined,
        minUsageFee: detailFilter.minUsageFee,
        maxUsageFee: detailFilter.maxUsageFee,
        convenienceFacilities: detailFilter.convenienceFacilities.length > 0 ? detailFilter.convenienceFacilities : undefined
      };

      const data = await spotService.searchSpotsWithDetailFilters(searchParams);
      
      const spotsWithFishingLevel = data.map(spot => ({
        ...spot,
        fishingLevelInfo: spot.fishingLevelInfo === true
      }));
      
      setSpots(spotsWithFishingLevel);
      setShowDetailSearch(false); // 검색 후 드롭다운 닫기
    } catch (error) {
      console.error('세부 검색 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 지역별 지도 중심 좌표 (2글자 코드 기준)
  const getRegionCenter = (region?: string) => {
    const regionCenters: { [key: string]: { lat: number; lng: number } } = {
      '경기': { lat: 37.4138, lng: 127.5183 },
      '서울': { lat: 37.5665, lng: 126.9780 },
      '인천': { lat: 37.4563, lng: 126.7052 },
      '강원': { lat: 37.8228, lng: 128.1555 },
      '충북': { lat: 36.6356, lng: 127.4917 },
      '충남': { lat: 36.5184, lng: 126.8000 },
      '전북': { lat: 35.7175, lng: 127.1530 },
      '전남': { lat: 34.8679, lng: 126.9910 },
      '경북': { lat: 36.4919, lng: 128.8889 },
      '경남': { lat: 35.4606, lng: 128.2132 },
      '제주': { lat: 33.4996, lng: 126.5312 },
      '부산': { lat: 35.1796, lng: 129.0756 },
      '대구': { lat: 35.8714, lng: 128.6014 },
      '울산': { lat: 35.5384, lng: 129.3114 },
      '광주': { lat: 35.1595, lng: 126.8526 },
      '대전': { lat: 36.3504, lng: 127.3845 },
      '세종': { lat: 36.4875, lng: 127.2816 }
    };
    
    return region ? regionCenters[region] : { lat: 37.5665, lng: 126.9780 }; // 기본값: 서울
  };

  // 필터링된 스팟들 (지역 데이터가 이미 필터링되어 있으므로 지역 필터는 제거)
  const filteredSpots = useMemo(() => {
    return spots.filter(spot => {
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
  }, [spots, searchKeyword, filter.spotType, filter.waterFacilityType, filter.fishSpecies]);

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
      case SpotType.SEA: return '';
      case SpotType.RESERVOIR: return '';
      case SpotType.FLATLAND: return '';
      default: return '';
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
    
    // 상세보기 영역으로 스크롤
    setTimeout(() => {
      if (detailRef.current) {
        detailRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100); // 상태 업데이트 후 스크롤
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
    setFilter({}); // 모든 필터 초기화
    setSearchKeyword('');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">낚시 스팟</h1>
        <p className="text-gray-600 mb-6">
          전국의 인기 낚시 스팟을 지도에서 확인하고 정보를 얻어보세요
        </p>

        {/* 지역 선택 */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-lg"></span>
            <h3 className="text-lg font-semibold text-blue-800">지역 선택</h3>
            <span className="text-sm text-blue-600">성능 최적화를 위해 지역을 먼저 선택해주세요</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-9 gap-2">
            {[
              '경기', '서울', '인천', '강원', '충북', 
              '충남', '전북', '전남', '경북', '경남', 
              '제주', '부산', '대구', '울산', 
              '광주', '대전', '세종'
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
                {region}
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

        {/* 검색 */}
        <div className="mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="스팟 이름, 어종, 주소로 검색하세요"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full px-4 py-3 pl-12 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-400 text-xl"></span>
              </div>
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <span className="text-xl"></span>
                </button>
              )}
            </div>
            
            {/* 세부 검색 드롭다운 버튼 */}
            <div className="relative">
              <button
                onClick={() => setShowDetailSearch(!showDetailSearch)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <span></span>
                세부 검색
                <span className={`transition-transform ${showDetailSearch ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {/* 세부 검색 드롭다운 */}
              {showDetailSearch && (
                <div className="absolute top-full right-0 mt-2 w-[600px] bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">세부 검색 옵션</h3>
                  
                  {/* 낚시터 유형 */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <span></span> 낚시터 유형
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(SPOT_TYPE_LABELS).map(([type, label]) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={detailFilter.spotTypes.includes(type as SpotType)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDetailFilter(prev => ({
                                  ...prev,
                                  spotTypes: [...prev.spotTypes, type as SpotType]
                                }));
                              } else {
                                setDetailFilter(prev => ({
                                  ...prev,
                                  spotTypes: prev.spotTypes.filter(t => t !== type)
                                }));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 수상시설 유형 */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <span></span> 수상시설 유형
                    </h4>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {Object.entries(WATER_FACILITY_TYPE_LABELS).map(([type, label]) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={detailFilter.waterFacilityTypes.includes(type as WaterFacilityType)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDetailFilter(prev => ({
                                  ...prev,
                                  waterFacilityTypes: [...prev.waterFacilityTypes, type as WaterFacilityType]
                                }));
                              } else {
                                setDetailFilter(prev => ({
                                  ...prev,
                                  waterFacilityTypes: prev.waterFacilityTypes.filter(t => t !== type)
                                }));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 어종 */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <span></span> 주요 어종
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {['농어', '광어', '도미', '참돔', '우럭', '감성돔', '방어', '고등어', '전어'].map(fish => (
                        <label key={fish} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={detailFilter.fishSpecies.includes(fish)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDetailFilter(prev => ({
                                  ...prev,
                                  fishSpecies: [...prev.fishSpecies, fish]
                                }));
                              } else {
                                setDetailFilter(prev => ({
                                  ...prev,
                                  fishSpecies: prev.fishSpecies.filter(f => f !== fish)
                                }));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{fish}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 이용료 범위 */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <span></span> 이용료 범위
                    </h4>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        placeholder="최소 금액"
                        value={detailFilter.minUsageFee || ''}
                        onChange={(e) => setDetailFilter(prev => ({
                          ...prev,
                          minUsageFee: e.target.value ? parseInt(e.target.value) : undefined
                        }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-500">~</span>
                      <input
                        type="number"
                        placeholder="최대 금액"
                        value={detailFilter.maxUsageFee || ''}
                        onChange={(e) => setDetailFilter(prev => ({
                          ...prev,
                          maxUsageFee: e.target.value ? parseInt(e.target.value) : undefined
                        }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-500">원</span>
                    </div>
                  </div>

                  {/* 편의시설 */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <span></span> 편의시설
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {['화장실', '주차장', '매점', '식당', '낚시대여', '미끼판매', '숙박시설', '샤워장', '휴게소'].map(facility => (
                        <label key={facility} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={detailFilter.convenienceFacilities.includes(facility)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDetailFilter(prev => ({
                                  ...prev,
                                  convenienceFacilities: [...prev.convenienceFacilities, facility]
                                }));
                              } else {
                                setDetailFilter(prev => ({
                                  ...prev,
                                  convenienceFacilities: prev.convenienceFacilities.filter(f => f !== facility)
                                }));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{facility}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 버튼들 */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <button
                      onClick={() => {
                        setDetailFilter({
                          spotTypes: [],
                          waterFacilityTypes: [],
                          fishSpecies: [],
                          minUsageFee: undefined,
                          maxUsageFee: undefined,
                          convenienceFacilities: []
                        });
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      초기화
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowDetailSearch(false)}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        취소
                      </button>
                      <button
                        onClick={handleDetailSearch}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        검색
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
            <div className="relative w-full h-96 lg:h-[500px]">
              <div 
                ref={mapRef} 
                className="w-full h-full"
                style={{ background: '#e5e7eb' }}
              >
                {!window.naver && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-4xl mb-4"></div>
                      <p className="text-gray-600">지도를 로딩하는 중...</p>
                      <p className="text-sm text-gray-500 mt-2">
                        네이버 지도 API 키가 필요합니다
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 마커 범례 */}
              <div className="absolute top-4 right-4 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3 z-[1000]">
                <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
                  <span></span>
                  마커 범례
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <div 
                      className="flex items-center justify-center w-6 h-6 rounded text-white text-xs font-bold shadow-sm"
                      style={{ backgroundColor: '#3B82F6' }}
                    >
                      
                    </div>
                    <span className="text-gray-700">바다</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="flex items-center justify-center w-6 h-6 rounded text-white text-xs font-bold shadow-sm"
                      style={{ backgroundColor: '#10B981' }}
                    >
                      
                    </div>
                    <span className="text-gray-700">저수지</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="flex items-center justify-center w-6 h-6 rounded text-white text-xs font-bold shadow-sm"
                      style={{ backgroundColor: '#F59E0B' }}
                    >
                      
                    </div>
                    <span className="text-gray-700">평지</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="flex items-center justify-center w-6 h-6 rounded text-white text-xs font-bold shadow-sm"
                      style={{ backgroundColor: '#6B7280' }}
                    >
                      
                    </div>
                    <span className="text-gray-700">기타</span>
                  </div>
                </div>
              </div>
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
                <div className="text-4xl mb-4"></div>
                <p className="text-gray-500">낚시터 정보를 불러오는 중...</p>
              </div>
            ) : filteredSpots.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4"></div>
                <p className="text-gray-500 mb-2">{spots.length === 0 ? '해당 지역에 낚시터 정보가 없습니다' : '검색 결과가 없습니다'}</p>
                <p className="text-sm text-gray-400">
                  {spots.length === 0 ? '다른 지역을 선택해보세요' : '다른 키워드로 검색해보거나 필터를 변경해보세요'}
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
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-800 text-lg">{spot.name}</h3>
                  {spot.spotType && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {SPOT_TYPE_LABELS[spot.spotType]}
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  {(spot.roadAddress || spot.lotAddress) && (
                    <div>
                      <span className="text-xs font-medium text-gray-500">주소:</span>
                      <p className="text-sm text-gray-600">{spot.roadAddress || spot.lotAddress}</p>
                    </div>
                  )}
                  
                  {spot.mainFishSpecies && (
                    <div>
                      <span className="text-xs font-medium text-gray-500">어종:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {spot.mainFishSpecies
                          .split(/[,\s\d+등]+/)
                          .map(species => species.trim())
                          .filter(species => 
                            species && 
                            species.length > 1 && 
                            !species.match(/^\d+$/) && 
                            !['등', '+', ',', ' '].includes(species)
                          )
                          .map((species, index) => (
                            <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                              {species}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      </div>

      {/* 선택된 스팟 상세 정보 */}
      {selectedSpot && (
        <div ref={detailRef} className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-800">{selectedSpot.name}</h2>
            <button
              onClick={() => setSelectedSpot(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              
            </button>
          </div>
          
          <div className="space-y-4 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {selectedSpot.spotType && (
                  <div>
                    <span className="font-medium text-gray-700">유형:</span>
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                      {SPOT_TYPE_LABELS[selectedSpot.spotType]}
                    </span>
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
                    <span className="font-medium text-gray-700">전화번호:</span>
                    <span className="ml-2 text-gray-600">{selectedSpot.phoneNumber}</span>
                  </div>
                )}
                
                {selectedSpot.mainFishSpecies && (
                  <div>
                    <span className="font-medium text-gray-700 block mb-2">어종:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedSpot.mainFishSpecies
                        .split(/[,\s\d+등]+/)
                        .map(species => species.trim())
                        .filter(species => 
                          species && 
                          species.length > 1 && 
                          !species.match(/^\d+$/) && 
                          !['등', '+', ',', ' '].includes(species)
                        )
                        .map((species, index) => (
                          <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                            {species}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
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
                    <span className="ml-2 text-gray-600"> {selectedSpot.usageFee}</span>
                  </div>
                )}
                
                {selectedSpot.waterArea && (
                  <div>
                    <span className="font-medium text-gray-700">수면적:</span>
                    <span className="ml-2 text-gray-600">{selectedSpot.waterArea}㎡</span>
                  </div>
                )}
                
                {selectedSpot.maxCapacity && (
                  <div>
                    <span className="font-medium text-gray-700">최대수용인원:</span>
                    <span className="ml-2 text-gray-600">{selectedSpot.maxCapacity}명</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* 편의시설 */}
            {selectedSpot.convenienceFacilities && (
              <div>
                <span className="font-medium text-gray-700 block mb-2">편의시설:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedSpot.convenienceFacilities.split(/[,\s]+/).filter(facility => facility.trim()).map((facility, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {facility.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* 안전시설 */}
            {selectedSpot.safetyFacilities && (
              <div>
                <span className="font-medium text-gray-700 block mb-2">안전시설:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedSpot.safetyFacilities.split(/[,\s]+/).filter(facility => facility.trim()).map((facility, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {facility.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {selectedSpot.keyPoints && (
              <div>
                <span className="font-medium text-gray-700">주요포인트:</span>
                <p className="text-gray-600 mt-1">{selectedSpot.keyPoints}</p>
              </div>
            )}
            
            {selectedSpot.nearbyAttractions && (
              <div>
                <span className="font-medium text-gray-700">주변관광지:</span>
                <p className="text-gray-600 mt-1">{selectedSpot.nearbyAttractions}</p>
              </div>
            )}
            
            {/* 바다 낚시 지수 테이블 */}
            {selectedSpot.fishingLevelInfo === true && (
              <div className="mt-6">
                <FishingLevelTable spot={selectedSpot} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FishingSpotsPage;