export interface FishType {
  id: number;
  name: string;
  iconPath: string;
  avgLength: number;
  stdDeviation: number;
  rarityScore: number;
  description?: string;
  habitat?: string;
  season?: string[];
}

// 물고기 타입 상수 정의 (CNN 모델 기준 10종)
export const FISH_TYPES: FishType[] = [
  {
    id: 1,
    name: "감성돔",
    iconPath: "/물고기_이미지/감성돔.png",
    avgLength: 28.0,
    stdDeviation: 5.5,
    rarityScore: 35
  },
  {
    id: 2,
    name: "고등어",
    iconPath: "/물고기_이미지/고등어.png",
    avgLength: 22.0,
    stdDeviation: 4.5,
    rarityScore: 18
  },
  {
    id: 3,
    name: "넙치",
    iconPath: "/물고기_이미지/넙치.png",
    avgLength: 25.0,
    stdDeviation: 5.0,
    rarityScore: 22
  },
  {
    id: 4,
    name: "농어",
    iconPath: "/물고기_이미지/농어.png",
    avgLength: 30.0,
    stdDeviation: 6.0,
    rarityScore: 30
  },
  {
    id: 5,
    name: "도다리",
    iconPath: "/물고기_이미지/도다리.png",
    avgLength: 20.0,
    stdDeviation: 4.0,
    rarityScore: 25
  },
  {
    id: 6,
    name: "돌돔",
    iconPath: "/물고기_이미지/돌돔.png",
    avgLength: 32.0,
    stdDeviation: 6.5,
    rarityScore: 40
  },
  {
    id: 7,
    name: "숭어",
    iconPath: "/물고기_이미지/숭어.png",
    avgLength: 24.0,
    stdDeviation: 5.0,
    rarityScore: 20
  },
  {
    id: 8,
    name: "우럭",
    iconPath: "/물고기_이미지/우럭.png",
    avgLength: 18.0,
    stdDeviation: 3.5,
    rarityScore: 20
  },
  {
    id: 9,
    name: "전갱이",
    iconPath: "/물고기_이미지/전갱이.png",
    avgLength: 16.0,
    stdDeviation: 3.0,
    rarityScore: 15
  },
  {
    id: 10,
    name: "참돔",
    iconPath: "/물고기_이미지/참돔.png",
    avgLength: 28.0,
    stdDeviation: 5.5,
    rarityScore: 40
  }
];

// 유틸리티 함수들
export const getFishTypeById = (id: number): FishType | undefined => {
  return FISH_TYPES.find(fish => fish.id === id);
};

export const getFishTypeByName = (name: string): FishType | undefined => {
  return FISH_TYPES.find(fish => fish.name === name);
};

export const getFishTypesBySeason = (season: string): FishType[] => {
  return FISH_TYPES.filter(fish => fish.season?.includes(season));
};

export const getFishTypesByHabitat = (habitat: string): FishType[] => {
  return FISH_TYPES.filter(fish => fish.habitat === habitat);
};

export const getRareFishTypes = (minRarityScore: number = 25): FishType[] => {
  return FISH_TYPES.filter(fish => fish.rarityScore >= minRarityScore);
};

// 점수 계산 유틸리티
export const calculateFishScore = (fishType: FishType, length: number): number => {
  const baseScore = fishType.rarityScore;
  const avgLength = fishType.avgLength;
  const stdDeviation = fishType.stdDeviation;
  
  // 길이에 따른 보너스 점수 계산
  const zScore = (length - avgLength) / stdDeviation;
  const lengthBonus = Math.max(0, zScore * 10); // 표준편차당 10점 보너스
  
  return Math.round(baseScore + lengthBonus);
};

// 아이콘 경로 유틸리티
export const getFishIconPath = (fishType: FishType): string => {
  // 실제 아이콘이 없을 경우 기본 아이콘 반환
  return fishType.iconPath || "/icons/fish/default.png";
};

// 계절별 색상 매핑
export const SEASON_COLORS = {
  봄: "#4ade80", // green-400
  여름: "#fbbf24", // amber-400
  가을: "#f97316", // orange-500
  겨울: "#60a5fa" // blue-400
} as const;

// 희귀도별 색상 매핑
export const RARITY_COLORS = {
  common: "#6b7280", // gray-500
  uncommon: "#10b981", // emerald-500
  rare: "#3b82f6", // blue-500
  epic: "#8b5cf6", // violet-500
  legendary: "#f59e0b" // amber-500
} as const;

// 희귀도 판정 함수
export const getRarityLevel = (rarityScore: number): keyof typeof RARITY_COLORS => {
  if (rarityScore >= 35) return "legendary";
  if (rarityScore >= 25) return "epic";
  if (rarityScore >= 15) return "rare";
  if (rarityScore >= 10) return "uncommon";
  return "common";
}; 