import numpy as np
from PIL import Image
import io
from config.settings import ALLOWED_EXTENSIONS
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

class ImageProcessor:
    def __init__(self):
        pass

    def validate_image(self, file_content: bytes, filename: str) -> None:
        """이미지 파일 유효성 검사"""
        # 파일 확장자 검사
        if filename:
            ext = filename.lower().split('.')[-1]
            if ext not in ALLOWED_EXTENSIONS:
                raise HTTPException(
                    status_code=400,
                    detail=f"지원하지 않는 파일 형식입니다. 허용된 형식: {', '.join(ALLOWED_EXTENSIONS)}"
                )

        # 이미지 파일인지 확인
        try:
            Image.open(io.BytesIO(file_content))
        except Exception:
            raise HTTPException(
                status_code=400,
                detail="유효한 이미지 파일이 아닙니다."
            )

    def preprocess_image(self, file_content: bytes) -> np.ndarray:
        """이미지 전처리 (TensorFlow용)"""
        try:
            # PIL Image로 변환
            image = Image.open(io.BytesIO(file_content)).convert('RGB')
            
            # NumPy array로 변환
            image_array = np.array(image)
            
            logger.info(f"이미지 전처리 완료: {image_array.shape}")
            return image_array
            
        except Exception as e:
            logger.error(f"이미지 전처리 실패: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"이미지 처리 중 오류가 발생했습니다: {str(e)}"
            )

# 전역 이미지 프로세서 인스턴스
image_processor = ImageProcessor()