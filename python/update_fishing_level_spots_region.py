#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fishing_level_info=true인 spots 데이터의 region을 위도/경도 기반으로 업데이트하는 마이그레이션 스크립트
"""

import mysql.connector
from mysql.connector import Error
import logging
from typing import Optional, Tuple

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 데이터베이스 연결 설정
DB_CONFIG = {
    'host': 'localhost',
    'database': 'fishpedia',
    'user': 'root',
    'password': '1234',
    'charset': 'utf8mb4'
}

# 한국 주요 지역별 위도/경도 범위 정의
REGION_BOUNDARIES = {
    '서울': {'lat_min': 37.4, 'lat_max': 37.7, 'lon_min': 126.8, 'lon_max': 127.2},
    '부산': {'lat_min': 35.0, 'lat_max': 35.3, 'lon_min': 128.9, 'lon_max': 129.3},
    '대구': {'lat_min': 35.7, 'lat_max': 36.0, 'lon_min': 128.5, 'lon_max': 128.8},
    '인천': {'lat_min': 37.2, 'lat_max': 37.6, 'lon_min': 126.4, 'lon_max': 126.9},
    '광주': {'lat_min': 35.1, 'lat_max': 35.3, 'lon_min': 126.8, 'lon_max': 127.0},
    '대전': {'lat_min': 36.2, 'lat_max': 36.5, 'lon_min': 127.3, 'lon_max': 127.5},
    '울산': {'lat_min': 35.4, 'lat_max': 35.7, 'lon_min': 129.0, 'lon_max': 129.5},
    '세종': {'lat_min': 36.4, 'lat_max': 36.6, 'lon_min': 127.2, 'lon_max': 127.4},
    '제주': {'lat_min': 33.2, 'lat_max': 33.6, 'lon_min': 126.1, 'lon_max': 126.9},
    '경기': {'lat_min': 36.9, 'lat_max': 38.3, 'lon_min': 126.4, 'lon_max': 127.9},
    '강원': {'lat_min': 37.0, 'lat_max': 38.6, 'lon_min': 127.6, 'lon_max': 129.4},
    '충북': {'lat_min': 36.0, 'lat_max': 37.2, 'lon_min': 127.4, 'lon_max': 128.5},
    '충남': {'lat_min': 35.9, 'lat_max': 37.1, 'lon_min': 126.1, 'lon_max': 127.8},
    '전북': {'lat_min': 35.0, 'lat_max': 36.3, 'lon_min': 126.4, 'lon_max': 127.8},
    '전남': {'lat_min': 33.9, 'lat_max': 35.4, 'lon_min': 125.9, 'lon_max': 127.6},
    '경북': {'lat_min': 35.4, 'lat_max': 37.5, 'lon_min': 128.0, 'lon_max': 129.6},
    '경남': {'lat_min': 34.6, 'lat_max': 35.8, 'lon_min': 127.7, 'lon_max': 129.3}
}

def get_region_by_coordinates(latitude: float, longitude: float) -> Optional[str]:
    """
    위도/경도를 기반으로 지역을 반환
    
    Args:
        latitude (float): 위도
        longitude (float): 경도
    
    Returns:
        Optional[str]: 해당하는 지역명 또는 None
    """
    if not latitude or not longitude:
        return None
    
    # 정확한 매칭을 위해 시/도 단위부터 확인
    for region, bounds in REGION_BOUNDARIES.items():
        if (bounds['lat_min'] <= latitude <= bounds['lat_max'] and 
            bounds['lon_min'] <= longitude <= bounds['lon_max']):
            return region
    
    # 대한민국 영토 범위 내에 있는지 확인 (대략적)
    if 33.0 <= latitude <= 38.7 and 124.0 <= longitude <= 132.0:
        # 바다 지역은 가장 가까운 육지 지역으로 분류
        if latitude < 34.0:  # 남해 최남단
            return '제주' if 126.0 <= longitude <= 127.0 else '전남'
        elif latitude > 38.0:  # 서해북방한계선 근처
            return '경기'
        elif longitude > 129.5:  # 동해
            if latitude > 37.0:
                return '강원'
            elif latitude > 36.0:
                return '경북'
            else:
                return '경남'
        elif longitude < 125.5:  # 서해
            if latitude > 36.5:
                return '인천'
            elif latitude > 35.5:
                return '충남'
            else:
                return '전남'
    
    return '기타'

def connect_to_database() -> Optional[mysql.connector.MySQLConnection]:
    """
    데이터베이스에 연결
    
    Returns:
        Optional[mysql.connector.MySQLConnection]: 데이터베이스 연결 객체
    """
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            logger.info("데이터베이스 연결 성공")
            return connection
    except Error as e:
        logger.error(f"데이터베이스 연결 실패: {e}")
        return None

def get_fishing_level_spots(connection: mysql.connector.MySQLConnection) -> list:
    """
    fishing_level_info=true이고 region이 없는 spots 데이터 조회
    
    Args:
        connection: 데이터베이스 연결 객체
    
    Returns:
        list: spots 데이터 리스트
    """
    try:
        cursor = connection.cursor(dictionary=True)
        query = """
        SELECT id, name, latitude, longitude, region
        FROM spots 
        WHERE fishing_level_info = true 
        AND (region IS NULL OR region = '' OR region = '기타')
        AND latitude IS NOT NULL 
        AND longitude IS NOT NULL
        """
        cursor.execute(query)
        spots = cursor.fetchall()
        cursor.close()
        
        logger.info(f"업데이트 대상 spots 수: {len(spots)}")
        return spots
        
    except Error as e:
        logger.error(f"spots 데이터 조회 실패: {e}")
        return []

def update_spot_region(connection: mysql.connector.MySQLConnection, spot_id: int, region: str) -> bool:
    """
    특정 spot의 region을 업데이트
    
    Args:
        connection: 데이터베이스 연결 객체
        spot_id (int): spot ID
        region (str): 새로운 region 값
    
    Returns:
        bool: 업데이트 성공 여부
    """
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

def main():
    """
    메인 실행 함수
    """
    logger.info("fishing_level_info spots region 업데이트 시작")
    
    # 데이터베이스 연결
    connection = connect_to_database()
    if not connection:
        logger.error("데이터베이스 연결 실패로 종료")
        return
    
    try:
        # fishing_level_info=true인 spots 조회
        spots = get_fishing_level_spots(connection)
        
        if not spots:
            logger.info("업데이트 대상 spots가 없습니다")
            return
        
        # 각 spot에 대해 region 업데이트
        success_count = 0
        fail_count = 0
        
        for spot in spots:
            spot_id = spot['id']
            name = spot['name']
            latitude = spot['latitude']
            longitude = spot['longitude']
            current_region = spot['region']
            
            # 위도/경도로 지역 판별
            new_region = get_region_by_coordinates(latitude, longitude)
            
            if new_region:
                # 현재 region과 다른 경우에만 업데이트
                if current_region != new_region:
                    if update_spot_region(connection, spot_id, new_region):
                        logger.info(f"업데이트 완료: ID={spot_id}, 이름={name}, "
                                  f"좌표=({latitude}, {longitude}), "
                                  f"이전지역={current_region}, 새지역={new_region}")
                        success_count += 1
                    else:
                        fail_count += 1
                else:
                    logger.info(f"지역 변경 없음: ID={spot_id}, 이름={name}, 지역={current_region}")
            else:
                logger.warning(f"지역 판별 실패: ID={spot_id}, 이름={name}, "
                             f"좌표=({latitude}, {longitude})")
                fail_count += 1
        
        logger.info(f"업데이트 완료 - 성공: {success_count}, 실패: {fail_count}")
        
    except Exception as e:
        logger.error(f"실행 중 오류 발생: {e}")
        
    finally:
        if connection.is_connected():
            connection.close()
            logger.info("데이터베이스 연결 종료")

if __name__ == "__main__":
    main()