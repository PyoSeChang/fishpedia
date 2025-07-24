import torch
import torch.nn as nn
import torch.nn.functional as F
from pathlib import Path
from config.settings import MODEL_PATH, MODEL_CLASSES
import logging

logger = logging.getLogger(__name__)

class BinaryCNN(nn.Module):
    def __init__(self, num_classes=10):
        super(BinaryCNN, self).__init__()

        self.conv1 = nn.Conv2d(3, 32, kernel_size=3, padding=1)  # [B, 32, 224, 224]
        self.pool1 = nn.MaxPool2d(2, 2)  # [B, 32, 112, 112]

        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)  # [B, 64, 112, 112]
        self.pool2 = nn.MaxPool2d(2, 2)  # [B, 64, 56, 56]

        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)  # [B, 128, 56, 56]
        self.pool3 = nn.MaxPool2d(2, 2)  # [B, 128, 28, 28]

        self.dropout = nn.Dropout(0.5)
        self.fc1 = nn.Linear(128 * 28 * 28, 512)
        self.fc2 = nn.Linear(512, num_classes)

    def forward(self, x):
        x = F.relu(self.conv1(x))
        x = self.pool1(x)

        x = F.relu(self.conv2(x))
        x = self.pool2(x)

        x = F.relu(self.conv3(x))
        x = self.pool3(x)

        x = x.view(x.size(0), -1)  # Flatten
        x = self.dropout(x)
        x = F.relu(self.fc1(x))
        x = self.fc2(x)  # 최종 출력 (로짓)

        return x

class ModelManager:
    _instance = None
    _model = None
    _device = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if self._model is None:
            self._device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
            self._load_model()

    def _load_model(self):
        try:
            if MODEL_PATH.exists():
                # BinaryCNN 모델 구조로 직접 로드
                self._model = BinaryCNN(num_classes=len(MODEL_CLASSES))
                
                # 모델 파일 로드
                state_dict = torch.load(MODEL_PATH, map_location=self._device)
                
                try:
                    # 직접 로드 시도
                    self._model.load_state_dict(state_dict, strict=True)
                except RuntimeError as e:
                    logger.warning(f"직접 로드 실패, 동적 분석 시도: {e}")
                    # 실제 모델 구조 분석해서 동적으로 생성
                    self._model = self._create_model_from_state_dict(state_dict)
                    self._model.load_state_dict(state_dict, strict=True)
                
                self._model.to(self._device)
                self._model.eval()
                logger.info(f"BinaryCNN 모델이 성공적으로 로드되었습니다. 디바이스: {self._device}")
            else:
                raise FileNotFoundError(f"모델 파일을 찾을 수 없습니다: {MODEL_PATH}")
                
        except Exception as e:
            logger.error(f"모델 로드 실패: {e}")
            raise
    
    def _create_model_from_state_dict(self, state_dict):
        """state_dict에서 모델 구조를 파악해서 동적으로 생성"""
        logger.info("State dict keys:")
        for key in state_dict.keys():
            logger.info(f"  {key}: {state_dict[key].shape}")
        
        # conv1, conv2, fc1, fc2 구조 파악
        conv1_out_channels = state_dict['conv1.weight'].shape[0]
        conv1_in_channels = state_dict['conv1.weight'].shape[1]
        conv2_out_channels = state_dict['conv2.weight'].shape[0]
        conv2_in_channels = state_dict['conv2.weight'].shape[1]
        fc1_out_features = state_dict['fc1.weight'].shape[0]
        fc1_in_features = state_dict['fc1.weight'].shape[1]
        fc2_out_features = state_dict['fc2.weight'].shape[0]
        fc2_in_features = state_dict['fc2.weight'].shape[1]
        
        logger.info(f"Conv1: {conv1_in_channels} -> {conv1_out_channels}")
        logger.info(f"Conv2: {conv2_in_channels} -> {conv2_out_channels}")
        logger.info(f"FC1: {fc1_in_features} -> {fc1_out_features}")
        logger.info(f"FC2: {fc2_in_features} -> {fc2_out_features}")
        
        # 동적 모델 생성
        class DynamicFishCNN(nn.Module):
            def __init__(self):
                super(DynamicFishCNN, self).__init__()
                self.conv1 = nn.Conv2d(conv1_in_channels, conv1_out_channels, 3, padding=1)
                self.conv2 = nn.Conv2d(conv2_in_channels, conv2_out_channels, 3, padding=1)
                self.pool = nn.MaxPool2d(2, 2)
                self.fc1 = nn.Linear(fc1_in_features, fc1_out_features)
                self.fc2 = nn.Linear(fc2_in_features, fc2_out_features)
                self.relu = nn.ReLU()
                self.dropout = nn.Dropout(0.5)
            
            def forward(self, x):
                x = self.pool(self.relu(self.conv1(x)))
                x = self.pool(self.relu(self.conv2(x)))
                
                # 동적으로 flatten 크기 계산
                batch_size = x.size(0)
                flattened_size = x.view(batch_size, -1).size(1)
                logger.info(f"실제 flatten 크기: {flattened_size}, 기대 크기: {fc1_in_features}")
                
                # 크기가 맞지 않으면 adaptive pooling 사용
                if flattened_size != fc1_in_features:
                    # 목표 크기 계산: 65536 = 256 * 16 * 16
                    target_channels = conv2_out_channels  # 256
                    target_size = int((fc1_in_features / target_channels) ** 0.5)  # 16
                    x = nn.functional.adaptive_avg_pool2d(x, (target_size, target_size))
                    logger.info(f"Adaptive pooling으로 크기 조정: {x.shape}")
                
                x = x.view(-1, fc1_in_features)
                x = self.relu(self.fc1(x))
                x = self.dropout(x)
                x = self.fc2(x)
                return x
        
        return DynamicFishCNN()

    @property
    def model(self):
        return self._model

    @property
    def device(self):
        return self._device

    def is_loaded(self):
        return self._model is not None

# 전역 모델 매니저 인스턴스
model_manager = ModelManager()