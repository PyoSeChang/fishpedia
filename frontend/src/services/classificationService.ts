interface ClassificationResult {
  predicted_fish: string;
  confidence: number;
  all_predictions: Array<{
    fish_name: string;
    confidence: number;
  }>;
}

const FASTAPI_BASE_URL = 'http://localhost:8000';

export const classificationService = {
  classifyFish: async (imageFile: File): Promise<ClassificationResult> => {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch(`${FASTAPI_BASE_URL}/predict`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`분류 요청 실패: ${response.status} ${errorText}`);
    }

    return response.json();
  },

  checkHealth: async (): Promise<{ status: string; model_loaded: boolean }> => {
    const response = await fetch(`${FASTAPI_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error('FastAPI 서버 상태 확인 실패');
    }

    return response.json();
  }
};