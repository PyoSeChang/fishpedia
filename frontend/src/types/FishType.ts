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

// 물고기 타입 상수 정의
export const FISH_TYPES: FishType[] = [
  {
    id: 1,
    name: "붕어",
    iconPath: "/icons/fish/crucian-carp.png",
    avgLength: 15.0,
    stdDeviation: 3.0,
    rarityScore: 10,
    description: "한국의 대표적인 민물고기",
    habitat: "하천, 호수",
    season: ["봄", "가을"]
  },
  {
    id: 2,
    name: "잉어",
    iconPath: "/icons/fish/carp.png",
    avgLength: 25.0,
    stdDeviation: 5.0,
    rarityScore: 15,
    description: "큰 몸집의 민물고기",
    habitat: "하천, 호수",
    season: ["봄", "여름", "가을"]
  },
  {
    id: 3,  
    name: "송어",
    iconPath: "/icons/fish/trout.png",
    avgLength: 20.0,
    stdDeviation: 4.0,
    rarityScore: 25,
    description: "깨끗한 물을 좋아하는 고급 어종",
    habitat: "산간 계곡",
    season: ["봄", "가을", "겨울"]
  },
  {
    id: 4,
    name: "농어",
    iconPath: "/icons/fish/sea-bass.png",
    avgLength: 30.0,
    stdDeviation: 6.0,
    rarityScore: 30,
    description: "바다와 민물이 만나는 곳에서 서식",
    habitat: "하구, 연안",
    season: ["봄", "가을"]
  },
  {
    id: 5,
    name: "우럭",
    iconPath: "/icons/fish/rockfish.png",
    avgLength: 18.0,
    stdDeviation: 3.5,
    rarityScore: 20,
    description: "바위틈에서 서식하는 바다고기",
    habitat: "연안 암초",
    season: ["봄", "여름", "가을"]
  },
  {
    id: 6,
    name: "고등어",
    iconPath: "/icons/fish/mackerel.png",
    avgLength: 22.0,
    stdDeviation: 4.5,
    rarityScore: 18,
    description: "회로 유명한 대표적인 바다고기",
    habitat: "연안, 외해",
    season: ["봄", "가을"]
  },
  {
    id: 7,
    name: "갈치",
    iconPath: "/icons/fish/hairtail.png",
    avgLength: 35.0,
    stdDeviation: 7.0,
    rarityScore: 35,
    description: "긴 몸체가 특징인 고급 어종",
    habitat: "깊은 바다",
    season: ["여름", "가을"]
  },
  {
    id: 8,
    name: "참돔",
    iconPath: "/icons/fish/red-snapper.png",
    avgLength: 28.0,
    stdDeviation: 5.5,
    rarityScore: 40,
    description: "붉은 빛이 도는 고급 어종",
    habitat: "연안 암초",
    season: ["봄", "여름", "가을"]
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