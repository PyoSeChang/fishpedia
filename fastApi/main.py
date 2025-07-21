from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import numpy as np
import logging
from models.tensorflow_cnn import tf_model_manager
from utils.image_processor import image_processor
from config.settings import (
    API_TITLE, API_VERSION, API_DESCRIPTION, 
    CORS_ORIGINS, MODEL_CLASSES, MAX_FILE_SIZE,
    HOST, PORT, DEBUG
)

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 최신 FastAPI에서는 lifespan 사용
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 시작 시
    try:
        logger.info("FastAPI 서버 시작 중...")
        if tf_model_manager.is_loaded():
            logger.info("TensorFlow 모델이 성공적으로 로드되었습니다.")
        else:
            logger.error("모델 로드에 실패했습니다.")
    except Exception as e:
        logger.error(f"서버 시작 중 오류 발생: {e}")
    
    yield
    
    # 종료 시 (필요한 경우)
    logger.info("FastAPI 서버 종료 중...")

# FastAPI 앱 초기화 (lifespan 추가)
app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description=API_DESCRIPTION,
    lifespan=lifespan
)

# CORS 미들웨어 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "Fish Classification API", 
        "version": API_VERSION,
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {
        "status": "healthy" if tf_model_manager.is_loaded() else "unhealthy",
        "model_loaded": tf_model_manager.is_loaded(),
        "model_type": "TensorFlow/Keras",
        "classes": MODEL_CLASSES
    }

@app.post("/predict")
async def predict_fish(file: UploadFile = File(...)):
    """물고기 분류 예측 엔드포인트"""
    if not tf_model_manager.is_loaded():
        raise HTTPException(status_code=500, detail="모델이 로드되지 않았습니다")
    
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다")
    
    try:
        # 파일 내용 읽기
        contents = await file.read()
        
        # 파일 크기 확인
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail=f"파일 크기가 너무 큽니다. 최대 {MAX_FILE_SIZE // (1024*1024)}MB")
        
        # 이미지 유효성 검사 및 전처리
        image_processor.validate_image(contents, file.filename)
        image_array = image_processor.preprocess_image(contents)
        
        # TensorFlow 모델용 전처리
        processed_image = tf_model_manager.preprocess_image(image_array)
        
        # 모델 예측
        predictions = tf_model_manager.predict(processed_image)
        probabilities = predictions[0]  # 첫 번째 배치
        
        predicted_idx = np.argmax(probabilities)
        confidence = float(probabilities[predicted_idx])
        
        predicted_fish = MODEL_CLASSES[predicted_idx]
        
        # 모든 예측 결과 정리
        all_predictions = []
        for i, prob in enumerate(probabilities):
            all_predictions.append({
                "fish_name": MODEL_CLASSES[i],
                "confidence": float(prob)
            })
        
        all_predictions.sort(key=lambda x: x["confidence"], reverse=True)
        
        logger.info(f"분류 완료: {predicted_fish} (신뢰도: {confidence:.3f})")
        
        return {
            "predicted_fish": predicted_fish,
            "confidence": confidence,
            "all_predictions": all_predictions[:5]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"예측 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail=f"예측 중 오류 발생: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT, reload=DEBUG)