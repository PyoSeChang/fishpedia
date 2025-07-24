interface ClassificationResult {
  predicted_fish: string;
  confidence: number;
  all_predictions: Array<{
    fish_name: string;
    confidence: number;
  }>;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const classificationService = {
  classifyFish: async (imageFile: File): Promise<ClassificationResult> => {
    const formData = new FormData();
    formData.append('file', imageFile);

    // JWT 토큰 가져오기 (선택적)
    const token = localStorage.getItem('accessToken');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/fish/classification/predict`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`분류 요청 실패: ${response.status} ${errorText}`);
    }

    return response.json();
  },

  checkHealth: async (): Promise<{ status: string; model_loaded: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/api/fish/classification/health`);
    
    if (!response.ok) {
      throw new Error('분류 서버 상태 확인 실패');
    }

    return response.json();
  },

  // 분류 저장소 관련 API 추가
  getClassificationStats: async () => {
    const token = localStorage.getItem('accessToken');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/classification/storage/summary`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('분류 통계 조회 실패');
    }

    return response.json();
  }
};