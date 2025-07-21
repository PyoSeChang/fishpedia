export enum SpotType {
  SEA = 'SEA',
  RESERVOIR = 'RESERVOIR',
  FLATLAND = 'FLATLAND',
  OTHER = 'OTHER'
}

export enum WaterFacilityType {
  FIXED = 'FIXED',
  FLOATING = 'FLOATING',
  FIXED_AND_FLOATING = 'FIXED_AND_FLOATING',
  FLOATING_AND_FIXED = 'FLOATING_AND_FIXED',
  PIER_TYPE_PLATFORM = 'PIER_TYPE_PLATFORM',
  PLATFORM_AND_BUNGALOW = 'PLATFORM_AND_BUNGALOW',
  GROUND_FIXED = 'GROUND_FIXED',
  NONE = 'NONE',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
  WATER_FISHING_SPOT = 'WATER_FISHING_SPOT',
  WATER_PIER = 'WATER_PIER',
  WATER_PLATFORM = 'WATER_PLATFORM',
  NO_FACILITIES = 'NO_FACILITIES',
  INDOOR = 'INDOOR',
  INDOOR_FISHING = 'INDOOR_FISHING',
  COASTAL_BUNGALOW = 'COASTAL_BUNGALOW',
  MOBILE = 'MOBILE',
  PLATFORM = 'PLATFORM',
  MIXED_PLATFORM_BUNGALOW = 'MIXED_PLATFORM_BUNGALOW'
}

export interface FishingSpot {
  id: number;
  name: string;
  spotType: SpotType;
  roadAddress?: string;
  lotAddress?: string;
  latitude?: number;
  longitude?: number;
  phoneNumber?: string;
  waterArea?: number;
  mainFishSpecies?: string;
  maxCapacity?: number;
  waterFacilityType?: WaterFacilityType;
  usageFee?: string;
  keyPoints?: string;
  safetyFacilities?: string;
  convenienceFacilities?: string;
  nearbyAttractions?: string;
  managementPhone?: string;
  managementOffice?: string;
  dataReferenceDate?: string;
  region?: string;
}

export interface SpotSearchRequest {
  keyword?: string;
  spotType?: SpotType;
  waterFacilityType?: WaterFacilityType;
  region?: string;
  minLatitude?: number;
  maxLatitude?: number;
  minLongitude?: number;
  maxLongitude?: number;
  fishSpecies?: string;
}

export interface SpotFilter {
  spotType?: SpotType;
  waterFacilityType?: WaterFacilityType;
  region?: string;
  fishSpecies?: string;
}

export const SPOT_TYPE_LABELS = {
  [SpotType.SEA]: '바다',
  [SpotType.RESERVOIR]: '저수지',
  [SpotType.FLATLAND]: '평지',
  [SpotType.OTHER]: '기타'
};

export const WATER_FACILITY_TYPE_LABELS = {
  [WaterFacilityType.FIXED]: '고정형',
  [WaterFacilityType.FLOATING]: '부유형',
  [WaterFacilityType.FIXED_AND_FLOATING]: '고정형+부유형',
  [WaterFacilityType.FLOATING_AND_FIXED]: '부유형+고정형',
  [WaterFacilityType.PIER_TYPE_PLATFORM]: '잔교형좌대',
  [WaterFacilityType.PLATFORM_AND_BUNGALOW]: '좌대+방갈로',
  [WaterFacilityType.GROUND_FIXED]: '지상고정형',
  [WaterFacilityType.NONE]: '없음',
  [WaterFacilityType.NOT_APPLICABLE]: '해당없음',
  [WaterFacilityType.WATER_FISHING_SPOT]: '수상낚시터',
  [WaterFacilityType.WATER_PIER]: '수상잔교',
  [WaterFacilityType.WATER_PLATFORM]: '수상좌대',
  [WaterFacilityType.NO_FACILITIES]: '시설없음',
  [WaterFacilityType.INDOOR]: '실내',
  [WaterFacilityType.INDOOR_FISHING]: '실내낚시터',
  [WaterFacilityType.COASTAL_BUNGALOW]: '연안방갈로',
  [WaterFacilityType.MOBILE]: '이동형',
  [WaterFacilityType.PLATFORM]: '좌대',
  [WaterFacilityType.MIXED_PLATFORM_BUNGALOW]: '좌교형좌대연안방갈로'
};