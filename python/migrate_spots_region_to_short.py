#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
spots 테이블의 region 필드를 2글자 단축 형태로 마이그레이션하는 스크립트
- fishing_level_info=false: road_address/lot_address에서 2글자 지역명 추출
- fishing_level_info=true: 위도/경도 기반으로 2글자 지역명 설정
"""

import mysql.connector
from mysql.connector import Error
import logging
import re
from typing import Optional

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 데이터베이스 연결 설정
DB_CONFIG = {
    'host': 'localhost',
    'database': 'fishpedia',
    'user': 'root',
    'password': '1234',
    'charset': 'utf8mb4',
    'auth_plugin': 'mysql_native_password'
}

# 17개 시도 → 2글자 매핑
REGION_MAPPING = {
    # 특별시/광역시
    '서울': '서울',
    '서울특별시': '서울',
    '서울시': '서울',
    '부산': '부산',
    '부산광역시': '부산',
    '부산시': '부산',
    '대구': '대구', 
    '대구광역시': '대구',
    '대구시': '대구',
    '인천': '인천',
    '인천광역시': '인천',
    '인천시': '인천',
    '광주': '광주',
    '광주광역시': '광주',
    '광주시': '광주',
    '대전': '대전',
    '대전광역시': '대전',
    '대전시': '대전',
    '울산': '울산',
    '울산광역시': '울산',
    '울산시': '울산',
    '세종': '세종',
    '세종특별자치시': '세종',
    '세종시': '세종',
    
    # 도 단위
    '경기': '경기',
    '경기도': '경기',
    '강원': '강원',
    '강원도': '강원',
    '충북': '충북',
    '충청북도': '충북',
    '충남': '충남',
    '충청남도': '충남',
    '전북': '전북',
    '전라북도': '전북',
    '전남': '전남',
    '전라남도': '전남',
    '경북': '경북',
    '경상북도': '경북',
    '경남': '경남',
    '경상남도': '경남',
    '제주': '제주',
    '제주특별자치도': '제주',
    '제주도': '제주',
    
    # 시/군 단위 추가 매핑
    '김포시': '경기',
    '광주시': '경기',  # 경기도 광주시
}

# 위도/경도 기반 지역 매핑 (2글자) - 확장된 범위
COORDINATE_REGION_MAP = {
    '서울': {'lat_min': 37.4, 'lat_max': 37.7, 'lon_min': 126.8, 'lon_max': 127.2},
    '부산': {'lat_min': 35.0, 'lat_max': 35.3, 'lon_min': 128.9, 'lon_max': 129.3},
    '대구': {'lat_min': 35.7, 'lat_max': 36.0, 'lon_min': 128.5, 'lon_max': 128.8},
    '인천': {'lat_min': 37.2, 'lat_max': 37.6, 'lon_min': 126.4, 'lon_max': 126.9},
    '광주': {'lat_min': 35.1, 'lat_max': 35.3, 'lon_min': 126.8, 'lon_max': 127.0},
    '대전': {'lat_min': 36.2, 'lat_max': 36.5, 'lon_min': 127.3, 'lon_max': 127.5},
    '울산': {'lat_min': 35.4, 'lat_max': 35.7, 'lon_min': 129.0, 'lon_max': 129.5},
    '세종': {'lat_min': 36.4, 'lat_max': 36.6, 'lon_min': 127.2, 'lon_max': 127.4},
    '제주': {'lat_min': 33.1, 'lat_max': 33.7, 'lon_min': 126.0, 'lon_max': 127.0},
    '경기': {'lat_min': 36.9, 'lat_max': 38.3, 'lon_min': 126.4, 'lon_max': 127.9},
    '강원': {'lat_min': 37.0, 'lat_max': 38.7, 'lon_min': 127.6, 'lon_max': 130.95},  # 울릉도 포함
    '충북': {'lat_min': 36.0, 'lat_max': 37.2, 'lon_min': 127.4, 'lon_max': 128.5},
    '충남': {'lat_min': 35.9, 'lat_max': 37.2, 'lon_min': 125.0, 'lon_max': 127.8},  # 서해 확장
    '전북': {'lat_min': 35.0, 'lat_max': 36.3, 'lon_min': 125.8, 'lon_max': 127.8},  # 서해 확장
    '전남': {'lat_min': 33.8, 'lat_max': 35.4, 'lon_min': 124.0, 'lon_max': 127.8},  # 도서지역 포함
    '경북': {'lat_min': 35.4, 'lat_max': 37.5, 'lon_min': 128.0, 'lon_max': 129.6},
    '경남': {'lat_min': 34.0, 'lat_max': 35.8, 'lon_min': 127.7, 'lon_max': 129.5}   # 남해 도서 포함
}

# 특정 도서지역 좌표 매핑
ISLAND_COORDINATE_MAP = {
    # 전남 도서지역
    '상왕등도': {'lat': 35.66681, 'lon': 126.11081, 'region': '전남'},
    '비금도': {'lat': 34.7802, 'lon': 125.8963, 'region': '전남'},
    '가거도': {'lat': 34.07308, 'lon': 125.08806, 'region': '전남'},
    '하조도': {'lat': 34.27758, 'lon': 126.09372, 'region': '전남'},
    '추자도': {'lat': 33.96186, 'lon': 126.30038, 'region': '전남'},
    '거문도': {'lat': 34.03042, 'lon': 127.34114, 'region': '전남'},
    '신지도': {'lat': 34.3522, 'lon': 126.843, 'region': '전남'},
    
    # 경남 도서지역  
    '연도': {'lat': 34.41283, 'lon': 127.78882, 'region': '경남'},
    '욕지도': {'lat': 34.62111, 'lon': 128.25611, 'region': '경남'},
    '거제도': {'lat': 34.90544, 'lon': 128.76294, 'region': '경남'},
    
    # 제주 지역
    '비양도': {'lat': 33.4042, 'lon': 126.2306, 'region': '제주'},
    '김녕': {'lat': 33.5622, 'lon': 126.7394, 'region': '제주'},
    '성산포': {'lat': 33.47744, 'lon': 126.93192, 'region': '제주'},
    '서귀포': {'lat': 33.23797, 'lon': 126.60808, 'region': '제주'},
    
    # 경기 도서지역
    '국화도': {'lat': 37.06028, 'lon': 126.55817, 'region': '경기'},
    
    # 강원 지역
    '울릉도': {'lat': 37.4925, 'lon': 130.9141, 'region': '강원'},
    '대진항': {'lat': 37.3472, 'lon': 129.2633, 'region': '강원'},
    '남애항': {'lat': 37.9425, 'lon': 128.7895, 'region': '강원'},
    
    # 전북 도서지역
    '신시도': {'lat': 35.81, 'lon': 126.4488, 'region': '전북'},
    
    # 울산 지역
    '울산': {'lat': 35.4725, 'lon': 129.41246, 'region': '울산'},
    
    # 경북 지역
    '포항': {'lat': 36.11622, 'lon': 129.43144, 'region': '경북'},
    '울진 후정': {'lat': 37.07441, 'lon': 129.41018, 'region': '경북'},
    
    # 부산 지역
    '하리항': {'lat': 35.0104, 'lon': 129.0445, 'region': '부산'},
    
    # 먼바다 지역 (가장 가까운 육지 기준)
    '인천항 서측': {'lat': 37.3578, 'lon': 126.375, 'region': '인천'},
    '척포항 남남서': {'lat': 34.5504, 'lon': 128.3339, 'region': '경남'},
    '목포북항 서측': {'lat': 34.78435, 'lon': 125.7365, 'region': '전남'},
    '안흥항 북측': {'lat': 36.965, 'lon': 126.135, 'region': '충남'},
    '강릉항 북동': {'lat': 37.7842, 'lon': 128.968, 'region': '강원'},
    '공현진항 동남동': {'lat': 38.325, 'lon': 128.5754, 'region': '강원'},
    '도두항 북서': {'lat': 33.52516, 'lon': 126.4583, 'region': '제주'},
    '양포항 남동': {'lat': 35.82482, 'lon': 129.5892, 'region': '경북'}
}

def extract_region_from_address(address: str) -> Optional[str]:
    """
    주소에서 2글자 지역명 추출
    
    Args:
        address (str): 도로명 주소 또는 지번 주소
    
    Returns:
        Optional[str]: 2글자 지역명
    """
    if not address:
        return None
    
    # 주소 정규화 (공백 제거)
    address = address.strip()
    
    # 시도 패턴 매칭 (우선순위 순)
    region_patterns = [
        # 경기도 시/군 우선 처리 (광주광역시와 구분)
        r'경기도\s*(광주시|김포시)',
        r'(경기도)',
        
        # 특별시/광역시 패턴
        r'(서울특별시|부산광역시|대구광역시|인천광역시|광주광역시|대전광역시|울산광역시|세종특별자치시)',
        r'(서울시|부산시|대구시|인천시|대전시|울산시)',
        
        # 세종시 패턴 추가
        r'(세종시)',
        
        # 김포시 패턴 (경기도 김포시)
        r'(김포시)',
        
        # 도 패턴
        r'(강원도|충청북도|충청남도|전라북도|전라남도|경상북도|경상남도|제주특별자치도|제주도)',
        r'(강원|충북|충남|전북|전남|경북|경남|제주)',
        
        # 광역시는 마지막에 (경기도 광주시와 구분)
        r'(광주시)',
        r'(서울|부산|대구|인천|광주|대전|울산|세종)',
    ]
    
    for pattern in region_patterns:
        match = re.search(pattern, address)
        if match:
            region_full = match.group(1)
            return REGION_MAPPING.get(region_full)
    
    # 특수 케이스: 구/군으로 지역 추정
    district_patterns = {
        r'(종로구|중구|용산구|성동구|광진구|동대문구|중랑구|성북구|강북구|도봉구|노원구|은평구|서대문구|마포구|양천구|강서구|구로구|금천구|영등포구|동작구|관악구|서초구|강남구|송파구|강동구)': '서울',
        r'(중구|서구|동구|영도구|부산진구|동래구|남구|북구|해운대구|사하구|금정구|강서구|연제구|수영구|사상구|기장군)': '부산',
        r'(중구|동구|서구|남구|북구|수성구|달서구|달성군)': '대구',
        r'(중구|동구|미추홀구|연수구|남동구|부평구|계양구|서구|강화군|옹진군)': '인천',
        r'(동구|서구|남구|북구|광산구)': '광주',
        r'(동구|중구|서구|유성구|대덕구)': '대전',
        r'(중구|남구|동구|북구|울주군)': '울산'
    }
    
    for pattern, region in district_patterns.items():
        if re.search(pattern, address):
            return region
    
    return None

def get_region_by_coordinates(latitude: float, longitude: float) -> Optional[str]:
    """
    위도/경도 기반으로 2글자 지역명 반환
    
    Args:
        latitude (float): 위도
        longitude (float): 경도
    
    Returns:
        Optional[str]: 2글자 지역명
    """
    if not latitude or not longitude:
        return None
    
    # 정확한 매칭 (확장된 범위)
    for region, bounds in COORDINATE_REGION_MAP.items():
        if (bounds['lat_min'] <= latitude <= bounds['lat_max'] and 
            bounds['lon_min'] <= longitude <= bounds['lon_max']):
            return region
    
    # 대한민국 영토 범위 내 추정 (확장된 범위)
    if 33.0 <= latitude <= 38.7 and 124.0 <= longitude <= 132.0:
        if latitude < 34.0:  # 남해 최남단
            if longitude < 125.5:
                return '전남'  # 가거도 등 서남해 도서
            elif 126.0 <= longitude <= 127.0:
                return '제주'
            else:
                return '전남'
        elif latitude > 38.0:  # 서해북방한계선 근처
            if longitude > 128.0:
                return '강원'  # 강원도 동해안
            else:
                return '경기'
        elif longitude > 129.5:  # 동해 먼바다
            if latitude > 37.0:
                return '강원'  # 울릉도 등
            elif latitude > 36.0:
                return '경북'
            else:
                return '경남'
        elif longitude < 125.5:  # 서해 먼바다
            if latitude > 36.5:
                return '인천'
            elif latitude > 35.5:
                return '충남'
            else:
                return '전남'  # 비금도, 상왕등도 등
        else:
            # 중간 지역
            if latitude > 37.0:
                return '경기'
            elif latitude > 36.0:
                return '충남'
            elif latitude > 35.0:
                return '전북'
            else:
                return '전남'
    
    return None

def get_region_by_name_and_coordinates(name: str, latitude: float, longitude: float) -> Optional[str]:
    """
    이름과 좌표를 조합해서 지역 매핑
    
    Args:
        name (str): 장소 이름
        latitude (float): 위도
        longitude (float): 경도
    
    Returns:
        Optional[str]: 2글자 지역명
    """
    if not name or not latitude or not longitude:
        return None
    
    # 특정 도서지역 이름 매핑
    for island_name, info in ISLAND_COORDINATE_MAP.items():
        if island_name in name:
            return info['region']
    
    # 특정 항구/지역 이름 매핑 (부분 매칭)
    name_lower = name.lower()
    if any(keyword in name for keyword in ['인천항', '인천']):
        return '인천'
    elif any(keyword in name for keyword in ['목포', '목포북항']):
        return '전남'
    elif any(keyword in name for keyword in ['척포', '척포항']):
        return '경남'
    elif any(keyword in name for keyword in ['안흥', '안흥항']):
        return '충남'
    elif any(keyword in name for keyword in ['강릉', '강릉항']):
        return '강원'
    elif any(keyword in name for keyword in ['공현진', '공현진항']):
        return '강원'
    elif any(keyword in name for keyword in ['도두', '도두항']):
        return '제주'
    elif any(keyword in name for keyword in ['양포', '양포항']):
        return '경북'
    elif any(keyword in name for keyword in ['하리', '하리항']):
        return '부산'
    
    # 좌표 기반 매핑으로 폴백
    return get_region_by_coordinates(latitude, longitude)

def connect_to_database() -> Optional[mysql.connector.MySQLConnection]:
    """데이터베이스 연결"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            logger.info("데이터베이스 연결 성공")
            return connection
    except Error as e:
        logger.error(f"데이터베이스 연결 실패: {e}")
        return None

def get_spots_for_migration(connection: mysql.connector.MySQLConnection) -> list:
    """마이그레이션 대상 spots 조회"""
    try:
        cursor = connection.cursor(dictionary=True)
        query = """
        SELECT id, name, road_address, lot_address, latitude, longitude, 
               region, fishing_level_info
        FROM spots 
        WHERE region IS NULL OR region = '' OR LENGTH(region) > 2
        """
        cursor.execute(query)
        spots = cursor.fetchall()
        cursor.close()
        
        logger.info(f"마이그레이션 대상 spots 수: {len(spots)}")
        return spots
        
    except Error as e:
        logger.error(f"spots 데이터 조회 실패: {e}")
        return []

def update_spot_region(connection: mysql.connector.MySQLConnection, spot_id: int, region: str) -> bool:
    """spot의 region 업데이트"""
    try:
        cursor = connection.cursor()
        query = "UPDATE spots SET region = %s WHERE id = %s"
        cursor.execute(query, (region, spot_id))
        connection.commit()
        cursor.close()
        return True
        
    except Error as e:
        logger.error(f"spot ID {spot_id} 업데이트 실패: {e}")
        return False

def migrate_spot_region(spot: dict) -> Optional[str]:
    """
    개별 spot의 region 값 결정
    
    Args:
        spot (dict): spot 데이터
    
    Returns:
        Optional[str]: 2글자 지역명
    """
    spot_id = spot['id']
    name = spot['name']
    fishing_level_info = spot['fishing_level_info']
    
    if fishing_level_info:
        # fishing_level_info=true: 이름+좌표 기반 매핑
        latitude = spot['latitude']
        longitude = spot['longitude']
        region = get_region_by_name_and_coordinates(name, latitude, longitude)
        
        if region:
            logger.info(f"좌표 기반 매핑: ID={spot_id}, 이름={name}, "
                       f"좌표=({latitude}, {longitude}), 지역={region}")
        else:
            logger.warning(f"좌표 기반 매핑 실패: ID={spot_id}, 이름={name}, "
                          f"좌표=({latitude}, {longitude})")
        return region
    else:
        # fishing_level_info=false: 주소 기반
        road_address = spot['road_address']
        lot_address = spot['lot_address']
        
        # 우선순위: road_address > lot_address
        region = None
        if road_address:
            region = extract_region_from_address(road_address)
            source = "도로명주소"
        
        if not region and lot_address:
            region = extract_region_from_address(lot_address)
            source = "지번주소"
        
        if region:
            logger.info(f"주소 기반 매핑: ID={spot_id}, 이름={name}, "
                       f"출처={source}, 지역={region}")
        else:
            logger.warning(f"주소 기반 매핑 실패: ID={spot_id}, 이름={name}, "
                          f"도로명={road_address}, 지번={lot_address}")
        return region

def main():
    """메인 실행 함수"""
    logger.info("spots region 2글자 마이그레이션 시작")
    
    # 데이터베이스 연결
    connection = connect_to_database()
    if not connection:
        logger.error("데이터베이스 연결 실패로 종료")
        return
    
    try:
        # 마이그레이션 대상 spots 조회
        spots = get_spots_for_migration(connection)
        
        if not spots:
            logger.info("마이그레이션 대상 spots가 없습니다")
            return
        
        # 통계 변수
        success_count = 0
        fail_count = 0
        fishing_level_count = 0
        address_based_count = 0
        
        # 각 spot 마이그레이션
        for spot in spots:
            spot_id = spot['id']
            fishing_level_info = spot['fishing_level_info']
            
            # 지역 결정
            new_region = migrate_spot_region(spot)
            
            if new_region:
                # 데이터베이스 업데이트
                if update_spot_region(connection, spot_id, new_region):
                    success_count += 1
                    if fishing_level_info:
                        fishing_level_count += 1
                    else:
                        address_based_count += 1
                else:
                    fail_count += 1
            else:
                fail_count += 1
        
        # 결과 요약
        logger.info("=" * 50)
        logger.info("마이그레이션 완료 요약:")
        logger.info(f"- 전체 처리: {len(spots)}개")
        logger.info(f"- 성공: {success_count}개")
        logger.info(f"- 실패: {fail_count}개")
        logger.info(f"- 좌표 기반: {fishing_level_count}개")
        logger.info(f"- 주소 기반: {address_based_count}개")
        logger.info("=" * 50)
        
    except Exception as e:
        logger.error(f"실행 중 오류 발생: {e}")
        
    finally:
        if connection.is_connected():
            connection.close()
            logger.info("데이터베이스 연결 종료")

if __name__ == "__main__":
    main()