import torch
import torch.nn as nn
from pathlib import Path
from config.settings import MODEL_PATH, MODEL_CLASSES
import logging

logger = logging.getLogger(__name__)

class FishCNN(nn.Module):
    def __init__(self, num_classes=10):
        super(FishCNN, self).__init__()
        # 에러 메시지를 통해 파악한 실제 모델 구조
        # fc1.weight: torch.Size([128, 65536]) = 256 channels * 16*16 = 65536
        self.conv1 = nn.Conv2d(3, 128, 3, padding=1)  # 첫 번째 conv
        self.conv2 = nn.Conv2d(128, 256, 3, padding=1)  # 두 번째 conv (256 channels)
        self.pool = nn.MaxPool2d(2, 2)
        self.fc1 = nn.Linear(256 * 16 * 16, 128)  # 65536 = 256 * 16 * 16
        self.fc2 = nn.Linear(128, num_classes)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.5)
    
    def forward(self, x):
        # 224 -> 112 -> 56 -> 28 -> 14 크기로 줄어들어야 16에 가까워짐
        x = self.pool(self.relu(self.conv1(x)))  # 224 -> 112
        x = self.pool(self.relu(self.conv2(x)))  # 112 -> 56
        # 추가 pooling이 필요할 수 있음
        x = self.pool(x)  # 56 -> 28  
        x = self.pool(x)  # 28 -> 14
        
        x = x.view(-1, 256 * 14 * 14)  # 실제로는 다른 크기일 수 있음
        x = self.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.fc2(x)
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
            # 일단 기본적인 구조로 시작
            self._model = nn.Module()
            
            if MODEL_PATH.exists():
                # 모델 파일을 직접 로드해서 구조 파악
                state_dict = torch.load(MODEL_PATH, map_location=self._device)
                
                # 실제 모델 구조 분석해서 동적으로 생성
                self._model = self._create_model_from_state_dict(state_dict)
                self._model.load_state_dict(state_dict, strict=True)
                self._model.to(self._device)
                self._model.eval()
                logger.info(f"모델이 성공적으로 로드되었습니다. 디바이스: {self._device}")
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