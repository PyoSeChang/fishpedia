import { FishingSpot, SpotFilter, SpotSearchParams, SpotReview } from '../types/SpotType';
// import api from './api'; // 나중에 백엔드 연동 시 사용

// 샘플 데이터 (실제로는 백엔드 API와 연동)
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
    rating: 4.2,
    address: '서울특별시 서초구 반포동',
    openTime: '24시간',
    entryFee: 0,
    contact: '02-123-4567',
    tips: ['야간 낚시 추천', '미끼는 지렁이나 옥수수 사용'],
    bestSeason: ['봄', '가을'],
    reviews: [
      {
        id: 1,
        userId: 1,
        userName: '낚시왕김씨',
        rating: 4,
        comment: '접근성이 좋고 초보자도 쉽게 낚을 수 있어요!',
        createdAt: '2024-01-15'
      }
    ]
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
    rating: 4.5,
    address: '경기도 가평군 청평면',
    openTime: '06:00 - 22:00',
    entryFee: 10000,
    contact: '031-555-1234',
    tips: ['새벽 시간대가 입질이 좋음', '루어 낚시 추천'],
    bestSeason: ['여름', '가을'],
    reviews: [
      {
        id: 2,
        userId: 2,
        userName: '호수의왕자',
        rating: 5,
        comment: '경치도 아름답고 고기도 잘 잡혀요. 가족여행으로도 좋습니다.',
        createdAt: '2024-01-20'
      }
    ]
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
    rating: 4.0,
    address: '경기도 안산시 단원구',
    openTime: '24시간',
    entryFee: 5000,
    contact: '031-777-8888',
    tips: ['밀물 때 입질이 활발', '원투낚시 추천'],
    bestSeason: ['봄', '여름'],
    reviews: []
  },
  {
    id: 4,
    name: '춘천호',
    description: '강원도 춘천의 아름다운 호수로 송어낚시의 명소입니다.',
    latitude: 37.8813,
    longitude: 127.7298,
    fishTypes: ['송어', '산천어', '메기'],
    difficulty: 'medium',
    facilities: ['펜션', '카페', '보트대여'],
    rating: 4.6,
    address: '강원도 춘천시 신북읍',
    openTime: '05:00 - 21:00',
    entryFee: 15000,
    contact: '033-444-5555',
    tips: ['아침 일찍 가는 것이 좋음', '플라이 낚시 체험 가능'],
    bestSeason: ['봄', '여름', '가을']
  },
  {
    id: 5,
    name: '부산 해운대 방파제',
    description: '부산의 대표적인 바다낚시터로 다양한 바다어종을 낚을 수 있습니다.',
    latitude: 35.1595,
    longitude: 129.1600,
    fishTypes: ['학공치', '전갱이', '볼락'],
    difficulty: 'easy',
    facilities: ['주차장', '편의점', '횟집'],
    rating: 4.3,
    address: '부산광역시 해운대구 우동',
    openTime: '24시간',
    entryFee: 0,
    contact: '051-999-0000',
    tips: ['야간 낚시 인기', '안전장비 필수'],
    bestSeason: ['여름', '가을']
  }
];

class SpotService {
  // 낚시 스팟 목록 조회
  async getSpots(params?: SpotSearchParams): Promise<FishingSpot[]> {
    try {
      // 실제로는 백엔드 API 호출
      // const response = await api.get('/spots', { params });
      // return response.data;
      
      // 현재는 샘플 데이터 반환
      let filteredSpots = [...sampleSpots];
      
      if (params?.keyword) {
        filteredSpots = filteredSpots.filter(spot =>
          spot.name.includes(params.keyword!) ||
          spot.description.includes(params.keyword!) ||
          spot.fishTypes.some(fish => fish.includes(params.keyword!))
        );
      }
      
      if (params?.filter?.difficulty) {
        filteredSpots = filteredSpots.filter(spot => spot.difficulty === params.filter!.difficulty);
      }
      
      if (params?.filter?.fishType) {
        filteredSpots = filteredSpots.filter(spot =>
          spot.fishTypes.includes(params.filter!.fishType!)
        );
      }
      
      if (params?.sort) {
        filteredSpots.sort((a, b) => {
          switch (params.sort) {
            case 'rating':
              return b.rating - a.rating;
            case 'name':
              return a.name.localeCompare(b.name);
            default:
              return 0;
          }
        });
      }
      
      return filteredSpots;
    } catch (error) {
      console.error('낚시 스팟 목록 조회 실패:', error);
      throw error;
    }
  }

  // 특정 낚시 스팟 조회
  async getSpot(id: number): Promise<FishingSpot | null> {
    try {
      // 실제로는 백엔드 API 호출
      // const response = await api.get(`/spots/${id}`);
      // return response.data;
      
      return sampleSpots.find(spot => spot.id === id) || null;
    } catch (error) {
      console.error('낚시 스팟 조회 실패:', error);
      throw error;
    }
  }

  // 근처 낚시 스팟 조회
  async getNearbySpots(latitude: number, longitude: number, radius: number = 10): Promise<FishingSpot[]> {
    try {
      // 실제로는 백엔드 API 호출
      // const response = await api.get('/spots/nearby', {
      //   params: { latitude, longitude, radius }
      // });
      // return response.data;
      
      // 간단한 거리 계산 (실제로는 더 정확한 계산 필요)
      return sampleSpots.filter(spot => {
        const distance = Math.sqrt(
          Math.pow(spot.latitude - latitude, 2) + Math.pow(spot.longitude - longitude, 2)
        );
        return distance <= radius / 100; // 대략적인 계산
      });
    } catch (error) {
      console.error('근처 낚시 스팟 조회 실패:', error);
      throw error;
    }
  }

  // 낚시 스팟 리뷰 추가
  async addReview(spotId: number, review: Omit<SpotReview, 'id' | 'createdAt'>): Promise<SpotReview> {
    try {
      // 실제로는 백엔드 API 호출
      // const response = await api.post(`/spots/${spotId}/reviews`, review);
      // return response.data;
      
      const newReview: SpotReview = {
        ...review,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      
      return newReview;
    } catch (error) {
      console.error('리뷰 추가 실패:', error);
      throw error;
    }
  }

  // 인기 낚시 스팟 조회
  async getPopularSpots(limit: number = 5): Promise<FishingSpot[]> {
    try {
      const spots = await this.getSpots({ sort: 'rating' });
      return spots.slice(0, limit);
    } catch (error) {
      console.error('인기 낚시 스팟 조회 실패:', error);
      throw error;
    }
  }

  // 추천 낚시 스팟 조회 (사용자 선호도 기반)
  async getRecommendedSpots(userPreferences?: { difficulty?: string; fishTypes?: string[] }): Promise<FishingSpot[]> {
    try {
      // 실제로는 백엔드에서 사용자 선호도 기반 추천 알고리즘 실행
      let spots = [...sampleSpots];
      
      if (userPreferences?.difficulty) {
        spots = spots.filter(spot => spot.difficulty === userPreferences.difficulty);
      }
      
      if (userPreferences?.fishTypes && userPreferences.fishTypes.length > 0) {
        spots = spots.filter(spot =>
          spot.fishTypes.some(fish => userPreferences.fishTypes!.includes(fish))
        );
      }
      
      return spots.sort((a, b) => b.rating - a.rating).slice(0, 3);
    } catch (error) {
      console.error('추천 낚시 스팟 조회 실패:', error);
      throw error;
    }
  }
}

export const spotService = new SpotService();