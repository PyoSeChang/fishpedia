import torch

# 모델 파일 분석
model_path = "fish_CNN.pth"
state_dict = torch.load(model_path, map_location='cpu')

print("=== 모델 구조 분석 ===")
print(f"모델 파일: {model_path}")
print(f"키 개수: {len(state_dict.keys())}")
print("\n=== State Dict Keys ===")
for key in state_dict.keys():
    print(f"{key}: {state_dict[key].shape}")

print("\n=== 예상 모델 구조 ===")
print("에러 메시지를 보면:")
print("- 실제 모델은 conv1, conv2, fc1, fc2 구조")
print("- 현재 우리 모델은 features.0, classifier.1 구조")
print("- fc1.weight 크기: torch.Size([128, 65536]) <- 실제 모델")
print("- 현재 모델 fc1: torch.Size([128, 200704])")
print("\n65536 = 256 * 256 = 16^2 * 16^2")
print("즉, 실제 모델은 16x16 크기로 flatten됨")
print("Conv 레이어 후 이미지 크기가 16x16이고, 채널이 256개인 듯함")