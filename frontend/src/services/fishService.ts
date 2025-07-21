import api from './api';

export interface Fish {
  id: number;
  name: string;
  avgLength: number;
  stdDeviation: number;
  rarityScore: number;
}

export interface FishRequest {
  name: string;
  avgLength: number;
  stdDeviation: number;
  rarityScore: number;
}

export interface FishLog {
  id: number;
  fishId: number;
  fishName: string;
  collectAt: string;
  length: number;
  score: number;
  place?: string;
  review?: string;
  imgPath?: string;
}

export interface FishLogDTO {
  fishLogs: FishLog[];
  fishCollection?: any; // 추후 FishCollectionResponse 타입 정의 필요
}


export interface LevelUpdateResult {
  prevLevel: number;        // Level before increment
  prevProgress: number;     // Progress before increment (0~100, %)
  newLevel: number;         // Level after increment
  newProgress: number;      // Progress after increment (0~100, %)
  isLevelUp: boolean;       // Whether a level up occurred
  increment: number;        // Total progress increase (%)
}

export interface FishLogCreateResponse {
  fishLog: FishLog;
  levelUpdateResult: LevelUpdateResult;
  fishId: number;
}

export interface FishIdentificationResult {
  fishType: string;
  source: string;
  message: string;
}

export interface FishMeasurementResult {
  length: number | null;
  unit: string;
  source: string;
  message: string;
}

export interface FishAnalysisResult {
  fishType?: string;
  length?: number;
  confidence?: number;
  source: string;
  message: string;
}

export interface ScoreCalculationResult {
  score: number;
  source: string;
}

export const fishService = {
  // 물고기 목록 조회
  async getAllFish(): Promise<Fish[]> {
    const response = await api.get('/fish');
    return response.data;
  },

  // 물고기 상세 조회
  async getFishById(id: number): Promise<Fish> {
    const response = await api.get(`/fish/${id}`);
    return response.data;
  },

  // 물고기 등록
  async createFish(data: FishRequest): Promise<Fish> {
    const response = await api.post('/fish', data);
    return response.data;
  },

  // 물고기 수정
  async updateFish(id: number, data: FishRequest): Promise<Fish> {
    const response = await api.put(`/fish/${id}`, data);
    return response.data;
  },

  // 물고기 삭제
  async deleteFish(id: number): Promise<void> {
    await api.delete(`/fish/${id}`);
  },

  // 물고기 목록 조회 (일지 작성용)
  async getAllFishes(): Promise<Fish[]> {
    const response = await api.get('/fish');
    return response.data;
  },

  // 낚시 일지 작성
  async createFishLog(formData: FormData): Promise<FishLog> {
    const response = await api.post('/fish/logs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 낚시 일지 작성 (레벨 업데이트 포함)
  async createFishLogWithLevel(formData: FormData): Promise<FishLogCreateResponse> {
    const response = await api.post('/fish/logs/with-level', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 사용자의 낚시 일지 목록 조회
  async getUserFishLogs(fishId?: number): Promise<FishLogDTO> {
    const params = fishId ? `?fishId=${fishId}` : '';
    const url = `/fish/logs${params}`;
    console.log('API 호출:', url, 'fishId:', fishId);
    const response = await api.get(url);
    console.log('API 응답:', response.data);
    return response.data;
  },

  // 특정 낚시 일지 조회
  async getFishLogById(id: number): Promise<FishLog> {
    const response = await api.get(`/fish/logs/${id}`);
    return response.data;
  },

  // 점수 계산 (FastAPI 연동)
  async calculateScore(fishType?: string, length?: number, location?: string): Promise<ScoreCalculationResult> {
    const params = new URLSearchParams();
    if (fishType) {
      params.append('fishType', fishType);
    }
    if (length) {
      params.append('length', length.toString());
    }
    if (location) {
      params.append('location', location);
    }

    const response = await api.post(`/fish/calculate-score?${params.toString()}`);
    return response.data;
  },

  // 물고기 식별 (FastAPI 연동)
  async identifyFish(image: File): Promise<FishIdentificationResult> {
    const formData = new FormData();
    formData.append('image', image);

    const response = await api.post('/fish/identify', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 물고기 크기 측정 (FastAPI 연동)
  async measureFish(image: File): Promise<FishMeasurementResult> {
    const formData = new FormData();
    formData.append('image', image);

    const response = await api.post('/fish/measure', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 물고기 종합 분석 (FastAPI 연동)
  async analyzeFish(image: File): Promise<FishAnalysisResult> {
    const formData = new FormData();
    formData.append('image', image);

    const response = await api.post('/fish/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // FastAPI 서버 상태 확인
  async checkFastApiHealth(): Promise<{fastapi_healthy: boolean, message: string, timestamp: number}> {
    const response = await api.get('/fish/fastapi/health');
    return response.data;
  },


  // 낚시 일지 목록 조회
  async getFishLogs(fishId?: number): Promise<FishLogDTO> {
    const params = fishId ? `?fishId=${fishId}` : '';
    const response = await api.get(`/fish/logs${params}`);
    return response.data;
  }
}; 