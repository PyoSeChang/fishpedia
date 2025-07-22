# 🎣 낚시터 페이지 UI 전면 개편 작업 문서

## 📋 작업 개요

낚시터 페이지의 UI를 전면 개편하고, 세부 검색 기능을 추가하여 사용자 경험을 향상시키는 작업입니다.

## ✅ 완료된 작업

### 1. **프론트엔드 UI 개편**

#### 기본 설정 변경
- ✅ 초기 마운트 시 경기 지역 기본 선택으로 변경
- ✅ 지역 선택 우선 배치 (성능 최적화 안내 포함)

#### 검색 UI 재구성
- ✅ 검색 input field를 지역 선택 밑으로 이동
- ✅ 더 큰 검색창으로 사용성 향상 (px-4 py-3 pl-12 text-lg)
- ✅ 세부 검색 드롭다운 버튼 추가 (🔧 세부 검색)

#### 세부 검색 드롭다운 구현
- ✅ 600px 너비의 드롭다운 모달 구현
- ✅ **낚시터 유형**: 체크박스로 바다/저수지/평지/기타 다중 선택
- ✅ **수상시설 유형**: 체크박스로 모든 시설 유형 다중 선택 (스크롤 가능)
- ✅ **어종**: 인기 어종 체크박스 (농어, 광어, 도미, 참돔, 우럭, 감성돔, 방어, 고등어, 전어)
- ✅ **이용료 범위**: 최소/최대 금액 입력 필드
- ✅ **편의시설**: 화장실, 주차장, 매점, 식당, 낚시대여, 미끼판매, 숙박시설, 샤워장, 휴게소
- ✅ 초기화, 취소, 검색 버튼 구현

#### 바다 낚시 지수 기능
- ✅ `fishingLevelInfo` 필드를 FishingSpot DTO에 추가
- ✅ 바다 낚시터(`SpotType.SEA`)에만 "🌊 바다지수" 드롭다운 버튼 표시
- ✅ 드롭다운 모달에서 실시간 정보 표시:
  - 날씨, 파도, 바람, 수온
  - 낚시 지수 (좋음/보통/나쁨) 색상 구분
  - 추천 메시지
- ✅ 상세 정보 섹션에도 바다 낚시 지수 영역 추가

#### 필터 로직 개선
- ✅ 체크박스 방식으로 다중 선택 가능한 필터 구현
- ✅ radio가 아닌 실제 체크박스 동작으로 변경
- ✅ 세부 검색 상태 관리 (`detailFilter` state 추가)

### 2. **프론트엔드 서비스 계층**

- ✅ `spotService.ts`에 `searchSpotsWithDetailFilters` 메서드 추가
- ✅ 세부 검색 파라미터 인터페이스 정의

### 3. **백엔드 DTO 생성**

- ✅ `SpotDetailSearchRequest.java` DTO 생성
  - region, keyword, spotTypes, waterFacilityTypes, fishSpecies
  - minUsageFee, maxUsageFee, convenienceFacilities
- ✅ `SpotResponse.java`에 `fishingLevelInfo` 필드 추가

### 4. **백엔드 엔티티 확인**

- ✅ `Spot.java` 엔티티에 `fishingLevelInfo` 필드 확인됨

## 🚧 진행 중인 작업

### 5. **백엔드 Repository 계층**
- 🔄 `SpotRepository.java`에 세부 검색 쿼리 메서드 추가 중

## 📝 남은 작업

### 6. **백엔드 Repository 계층 완료**
- [ ] 복잡한 세부 검색 쿼리 메서드 구현
- [ ] 동적 쿼리 생성 (Criteria API 또는 QueryDSL 고려)
- [ ] 다중 선택 필터 처리 (IN 절 활용)
- [ ] 가격 범위 검색 쿼리
- [ ] 편의시설 LIKE 검색 쿼리

### 7. **백엔드 Service 계층**
- [ ] `SpotService.java` 인터페이스에 세부 검색 메서드 추가
- [ ] `SpotServiceImpl.java`에 세부 검색 로직 구현
- [ ] fishingLevelInfo 필드 자동 설정 로직 (바다 낚시터 판별)
- [ ] 검색 결과 매핑 및 변환

### 8. **백엔드 Controller 계층**
- [ ] `SpotController.java`에 `/spots/search/detail` POST 엔드포인트 추가
- [ ] Request validation 추가
- [ ] Response 형식 통일
- [ ] 에러 핸들링 구현

### 9. **데이터베이스 마이그레이션**
- [ ] `spots` 테이블에 `fishing_level_info` 컬럼 추가
- [ ] 기존 데이터에서 바다 낚시터(`spot_type = 'SEA'`) 자동 업데이트
- [ ] 인덱스 추가 고려 (검색 성능 최적화)

### 10. **API 테스트 및 통합**
- [ ] Postman/Thunder Client로 API 엔드포인트 테스트
- [ ] 프론트엔드-백엔드 통합 테스트
- [ ] 다양한 필터 조합 테스트
- [ ] 에러 케이스 테스트

### 11. **성능 최적화**
- [ ] 검색 쿼리 성능 분석
- [ ] 필요시 인덱스 추가
- [ ] 캐싱 전략 고려
- [ ] 페이지네이션 적용 검토

### 12. **UI/UX 개선**
- [ ] 로딩 상태 처리 개선
- [ ] 에러 메시지 사용자 친화적으로 개선
- [ ] 검색 결과 없을 때 UI 개선
- [ ] 모바일 반응형 최적화

## 🎯 핵심 구현 포인트

### 세부 검색 쿼리 설계

```sql
-- 예상 쿼리 구조
SELECT s FROM Spot s WHERE
  s.region = :region
  AND (:keyword IS NULL OR s.name LIKE %:keyword% OR s.mainFishSpecies LIKE %:keyword%)
  AND (:spotTypes IS EMPTY OR s.spotType IN :spotTypes)
  AND (:waterFacilityTypes IS EMPTY OR s.waterFacilityType IN :waterFacilityTypes)
  AND (:minUsageFee IS NULL OR CAST(REGEXP_REPLACE(s.usageFee, '[^0-9]', '') AS INTEGER) >= :minUsageFee)
  AND (:maxUsageFee IS NULL OR CAST(REGEXP_REPLACE(s.usageFee, '[^0-9]', '') AS INTEGER) <= :maxUsageFee)
  AND (:fishSpeciesList IS EMPTY OR EXISTS (SELECT 1 FROM :fishSpeciesList f WHERE s.mainFishSpecies LIKE CONCAT('%', f, '%')))
  AND (:convenienceFacilities IS EMPTY OR EXISTS (SELECT 1 FROM :convenienceFacilities cf WHERE s.convenienceFacilities LIKE CONCAT('%', cf, '%')))
```

### API 엔드포인트 설계

```java
@PostMapping("/spots/search/detail")
public ResponseEntity<List<SpotResponse>> searchSpotsWithDetailFilters(
    @RequestBody @Valid SpotDetailSearchRequest request
) {
    // 구현 예정
}
```

## 🔧 개발 환경 설정

- **프론트엔드**: React + TypeScript + Tailwind CSS
- **백엔드**: Spring Boot + JPA/Hibernate
- **데이터베이스**: MySQL
- **API 클라이언트**: Axios

## 📊 예상 작업 시간

- **백엔드 Repository/Service/Controller**: 2-3시간
- **데이터베이스 마이그레이션**: 30분
- **API 테스트 및 통합**: 1-2시간
- **UI/UX 개선 및 버그 수정**: 1시간

**총 예상 시간**: 4-6시간

## 🚀 다음 작업 우선순위

1. **백엔드 Repository 쿼리 메서드 완성**
2. **Service 계층 구현**
3. **Controller 엔드포인트 추가**
4. **데이터베이스 마이그레이션**
5. **통합 테스트**

---

*작업 진행 상황은 이 문서에서 지속적으로 업데이트됩니다.*