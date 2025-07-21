package com.fishiphedia.spots.entity;

public enum SpotType {
    SEA("바다"),
    RESERVOIR("저수지"),
    FLATLAND("평지"),
    OTHER("기타");

    private final String koreanName;

    SpotType(String koreanName) {
        this.koreanName = koreanName;
    }

    public String getKoreanName() {
        return koreanName;
    }

    public static SpotType fromKoreanName(String koreanName) {
        for (SpotType type : SpotType.values()) {
            if (type.koreanName.equals(koreanName)) {
                return type;
            }
        }
        return OTHER;
    }
}