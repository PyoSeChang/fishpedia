import { FishingSpot, SpotSearchRequest, SpotFilter, SpotType, WaterFacilityType } from '../types/SpotType';
import api from './api';

class SpotService {
  // 모든 낚시 스팟 조회
  async getAllSpots(): Promise<FishingSpot[]> {
    try {
      const response = await api.get('/spots');
      return response.data;
    } catch (error) {
      console.error('낚시 스팟 목록 조회 실패:', error);
      throw error;
    }
  }

  // 낚시 스팟 검색
  async searchSpots(searchRequest: SpotSearchRequest): Promise<FishingSpot[]> {
    try {
      const response = await api.post('/spots/search', searchRequest);
      return response.data;
    } catch (error) {
      console.error('낚시 스팟 검색 실패:', error);
      throw error;
    }
  }

  // 낚시터 타입별 조회
  async getSpotsByType(spotType: SpotType): Promise<FishingSpot[]> {
    try {
      const response = await api.get(`/spots/type/${spotType}`);
      return response.data;
    } catch (error) {
      console.error('낚시터 타입별 조회 실패:', error);
      throw error;
    }
  }

  // 지역별 낚시터 조회
  async getSpotsByRegion(region: string): Promise<FishingSpot[]> {
    try {
      const response = await api.get(`/spots/region/${region}`);
      return response.data;
    } catch (error) {
      console.error('지역별 낚시터 조회 실패:', error);
      throw error;
    }
  }

  // 영역 내 낚시터 조회
  async getSpotsInArea(minLat: number, maxLat: number, minLng: number, maxLng: number): Promise<FishingSpot[]> {
    try {
      const response = await api.get('/spots/area', {
        params: { minLat, maxLat, minLng, maxLng }
      });
      return response.data;
    } catch (error) {
      console.error('영역 내 낚시터 조회 실패:', error);
      throw error;
    }
  }

  // 특정 낚시 스팟 조회
  async getSpot(id: number): Promise<FishingSpot | null> {
    try {
      const response = await api.get(`/spots/${id}`);
      return response.data;
    } catch (error) {
      console.error('낚시 스팟 조회 실패:', error);
      throw error;
    }
  }
}

export const spotService = new SpotService();