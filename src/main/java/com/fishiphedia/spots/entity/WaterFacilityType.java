package com.fishiphedia.spots.entity;

public enum WaterFacilityType {
    FIXED("고정형"),
    FLOATING("부유형"),
    FIXED_AND_FLOATING("고정형+부유형"),
    FLOATING_AND_FIXED("부유형+고정형"),
    PIER_TYPE_PLATFORM("잔교형좌대"),
    PLATFORM_AND_BUNGALOW("좌대+방갈로"),
    GROUND_FIXED("지상고정형"),
    NONE("없음"),
    NOT_APPLICABLE("해당없음"),
    WATER_FISHING_SPOT("수상낚시터"),
    WATER_PIER("수상잔교"),
    WATER_PLATFORM("수상좌대"),
    NO_FACILITIES("시설없음"),
    INDOOR("실내"),
    INDOOR_FISHING("실내낚시터"),
    COASTAL_BUNGALOW("연안방갈로"),
    MOBILE("이동형"),
    PLATFORM("좌대"),
    MIXED_PLATFORM_BUNGALOW("좌교형좌대연안방갈로");

    private final String koreanName;

    WaterFacilityType(String koreanName) {
        this.koreanName = koreanName;
    }

    public String getKoreanName() {
        return koreanName;
    }

    public static WaterFacilityType fromKoreanName(String koreanName) {
        for (WaterFacilityType type : WaterFacilityType.values()) {
            if (type.koreanName.equals(koreanName)) {
                return type;
            }
        }
        return NONE;
    }
}