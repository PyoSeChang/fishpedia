import os
from pathlib import Path

# 프로젝트 루트 경로
BASE_DIR = Path(__file__).resolve().parent.parent

# 모델 설정
MODEL_PATH = BASE_DIR / "remove_tensorflow_cnn.h5"
MODEL_CLASSES = [
    "가자미", "고등어", "농어", "대구", "도미", 
    "민어", "삼치", "연어", "우럭", "참돔"
]

# API 설정
API_TITLE = "Fish Classification API"
API_VERSION = "1.0.0"
API_DESCRIPTION = "AI 기반 물고기 분류 API"

# 서버 설정
HOST = "0.0.0.0"
PORT = 8000
DEBUG = True

# 이미지 처리 설정
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "bmp"}
IMAGE_SIZE = (224, 224)

# CORS 설정
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8081",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8081"
]