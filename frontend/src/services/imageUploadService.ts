import api from './api';

export const imageUploadService = {
  // 게시판용 이미지 업로드
  uploadBoardImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/board/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // 백엔드에서 전체 URL을 반환하는 경우
    if (response.data.startsWith('http')) {
      return response.data;
    }
    
    // 상대 경로를 반환하는 경우 절대 URL로 변환
    return `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081'}${response.data}`;
  },
};