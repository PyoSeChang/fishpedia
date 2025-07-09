import api from './api';

export interface FishCollection {
  fishId: number;
  isCollect: boolean;
  highestScore: number;
  highestLength: number;
  collectAt?: string;
  totalScore?: number;
  level?: number;
  currentLevelProgress?: number;
}

export const fishCollectionService = {
  // 내 도감 조회
  async getMyCollection(): Promise<FishCollection[]> {
    const response = await api.get('/fish-collection/my');
    return response.data;
  }
}; 