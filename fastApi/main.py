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
        from PIL import Image
        import io
        
        # 파일 내용 읽기
        contents = await file.read()
        
        # 파일 크기 확인
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail=f"파일 크기가 너무 큽니다. 최대 {MAX_FILE_SIZE // (1024*1024)}MB")
        
        # 이미지 유효성 검사 및 전처리
        image_processor.validate_image(contents, file.filename)
        
        # 훈련 코드와 동일한 Keras 방식으로 이미지 전처리
        from tensorflow.keras.preprocessing import image
        import tempfile
        import os
        
        # 임시 파일로 저장 (Keras load_img를 사용하기 위해)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            temp_file.write(contents)
            temp_path = temp_file.name
        
        try:
            # 훈련할 때와 동일한 방식으로 전처리
            img = image.load_img(temp_path, target_size=(128, 128))
            img_array = image.img_to_array(img) / 255.0  # 정규화
            img_array = np.expand_dims(img_array, axis=0)  # (1, 128, 128, 3)
        finally:
            # 임시 파일 삭제
            os.unlink(temp_path)
        
        # 모델 예측
        logger.info(f"이미지 배열 형태: {img_array.shape}")
        logger.info(f"이미지 배열 타입: {type(img_array)}")
        logger.info(f"이미지 배열 범위: min={img_array.min():.3f}, max={img_array.max():.3f}")
        
        predictions = tf_model_manager.predict(img_array)
        logger.info(f"모델 예측 결과 형태: {predictions.shape}")
        logger.info(f"원시 예측값: {predictions}")
        
        probabilities = predictions[0]  # (10,)
        logger.info(f"확률 배열: {probabilities}")
        logger.info(f"확률 합계: {np.sum(probabilities):.6f}")
        
        predicted_idx = int(np.argmax(probabilities))
        confidence = float(probabilities[predicted_idx])
        predicted_fish = MODEL_CLASSES[predicted_idx]
        
        logger.info(f"예측된 인덱스: {predicted_idx}")
        logger.info(f"예측된 물고기: {predicted_fish}")
        logger.info(f"신뢰도: {confidence:.6f}")
        
        # 모든 예측 결과 정리
        all_predictions = []
        for i, prob in enumerate(probabilities):
            fish_result = {
                "fish_name": MODEL_CLASSES[i],
                "confidence": float(prob)
            }
            all_predictions.append(fish_result)
            logger.info(f"  {i}: {MODEL_CLASSES[i]} -> {float(prob):.6f}")
        
        all_predictions.sort(key=lambda x: x["confidence"], reverse=True)
        
        logger.info(f"최종 분류 완료: {predicted_fish} (신뢰도: {confidence:.6f})")
        logger.info(f"상위 3개 예측:")
        for i, pred in enumerate(all_predictions[:3]):
            logger.info(f"  {i+1}. {pred['fish_name']}: {pred['confidence']:.6f}")
        
        # 신뢰도 기반 어종 판정 로직
        is_fish_detected = False
        detected_fish_name = None
        
        # 넙치, 도다리는 0.90 이상
        if predicted_fish in ['넙치', '도다리'] and confidence >= 0.90:
            is_fish_detected = True
            detected_fish_name = predicted_fish
            logger.info(f"넙치/도다리 인식 성공: {predicted_fish} (신뢰도: {confidence:.6f})")
        
        # 나머지 8종은 0.99 이상
        elif predicted_fish not in ['넙치', '도다리'] and confidence >= 0.99:
            is_fish_detected = True
            detected_fish_name = predicted_fish
            logger.info(f"일반 어종 인식 성공: {predicted_fish} (신뢰도: {confidence:.6f})")
        
        else:
            logger.info(f"신뢰도 부족 - 어종: {predicted_fish}, 신뢰도: {confidence:.6f}")
        
        response_data = {
            "predicted_fish": predicted_fish,
            "confidence": confidence,
            "all_predictions": all_predictions[:5],
            "is_fish_detected": is_fish_detected,
            "detected_fish_name": detected_fish_name
        }
        
        logger.info(f"응답 데이터: {response_data}")
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"예측 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail=f"예측 중 오류 발생: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT, reload=DEBUG)