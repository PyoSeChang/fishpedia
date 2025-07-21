import tensorflow as tf
import numpy as np
from pathlib import Path
from config.settings import MODEL_PATH, MODEL_CLASSES
import logging

logger = logging.getLogger(__name__)

class TensorFlowModelManager:
    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(TensorFlowModelManager, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if self._model is None:
            self._load_model()

    def _load_model(self):
        try:
            if MODEL_PATH.exists():
                self._model = tf.keras.models.load_model(MODEL_PATH)
                logger.info(f"TensorFlow 모델이 성공적으로 로드되었습니다: {MODEL_PATH}")
                logger.info(f"모델 입력 형태: {self._model.input_shape}")
                logger.info(f"모델 출력 형태: {self._model.output_shape}")
                logger.info(f"모델 요약:")
                self._model.summary()
            else:
                raise FileNotFoundError(f"모델 파일을 찾을 수 없습니다: {MODEL_PATH}")
                
        except Exception as e:
            logger.error(f"TensorFlow 모델 로드 실패: {e}")
            raise

    @property
    def model(self):
        return self._model

    def is_loaded(self):
        return self._model is not None

    def predict(self, input_array):
        """예측 수행"""
        if not self.is_loaded():
            raise RuntimeError("모델이 로드되지 않았습니다")
        
        try:
            predictions = self._model.predict(input_array)
            return predictions
        except Exception as e:
            logger.error(f"예측 실패: {e}")
            raise

    def preprocess_image(self, image_array):
        """이미지 전처리 (TensorFlow 형식에 맞게)"""
        try:
            # 이미지를 모델 입력 크기에 맞게 조정
            input_shape = self._model.input_shape[1:3]  # (height, width)
            
            # PIL Image를 numpy array로 변환하고 크기 조정
            if len(image_array.shape) == 3:
                image_array = np.expand_dims(image_array, axis=0)
            
            # TensorFlow resize 사용
            resized = tf.image.resize(image_array, input_shape)
            
            # 정규화 (0-1 범위)
            normalized = resized / 255.0
            
            return normalized.numpy()
            
        except Exception as e:
            logger.error(f"이미지 전처리 실패: {e}")
            raise

# 전역 모델 매니저 인스턴스
tf_model_manager = TensorFlowModelManager()