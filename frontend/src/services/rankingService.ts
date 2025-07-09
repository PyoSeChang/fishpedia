import api from './api';

export interface FisherRanking {
  userId: number;
  name: string;
  totalScore: number;
}

export interface FishCollectionRanking {
  userId: number;
  name: string;
  fishId: number;
  fishName: string;
  totalScore: number;
  highestScore: number;
  highestLength: number;
}

export const rankingService = {
  // 낚시꾼 전체 랭킹
  async getFisherRanking(): Promise<FisherRanking[]> {
    const res = await api.get('/ranking/fisher');
    return res.data;
  },
  // FishCollection 전체 랭킹
  async getFishCollectionRanking(): Promise<FishCollectionRanking[]> {
    const res = await api.get('/ranking/fish-collection');
    return res.data;
  },
  // 모든 물고기별 랭킹
  async getFishRankingAllFish(): Promise<FishCollectionRanking[]> {
    const res = await api.get('/ranking/fish');
    return res.data;
  },
  // 특정 물고기별 랭킹
  async getFishRankingByFish(fishId: number): Promise<FishCollectionRanking[]> {
    const res = await api.get(`/ranking/fish/${fishId}`);
    return res.data;
  },
}; 