import os
from pathlib import Path

# 프로젝트 루트 경로
BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent

# 모델 설정 (도커 환경에서는 /app/best_model2.h5, 로컬에서는 상위 디렉토리)
DOCKER_MODEL_PATH = Path("/app/best_model2.h5")
LOCAL_MODEL_PATH = PROJECT_ROOT / "best_model2.h5"
MODEL_PATH = DOCKER_MODEL_PATH if DOCKER_MODEL_PATH.exists() else LOCAL_MODEL_PATH
MODEL_CLASSES = [
    '감성돔', '고등어', '넙치', '농어', '도다리',
    '돌돔', '숭어', '우럭', '전갱이', '참돔'
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
IMAGE_SIZE = (128, 128)

# CORS 설정
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8081",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8081"
]