#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
낚시터 정보 Excel 파일들을 MySQL DB로 마이그레이션하는 스크립트

사용법:
pip install pandas openpyxl pymysql sqlalchemy
python migrate_spots.py

docs/ 디렉토리의 모든 Excel 파일을 자동으로 처리합니다.
"""

import pandas as pd
import pymysql
from sqlalchemy import create_engine, text
import datetime
import os
import glob
import re

# DB 연결 설정
DB_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': '1234',
    'database': 'fishpedia',
    'charset': 'utf8mb4'
}

# 낚시터 유형 매핑
SPOT_TYPE_MAPPING = {
    '바다': 'SEA',
    '저수지': 'RESERVOIR', 
    '평지': 'FLATLAND'
}

# 수상시설물 유형 매핑
WATER_FACILITY_MAPPING = {
    '고정형': 'FIXED',
    '부유형': 'FLOATING',
    '고정형+부유형': 'FIXED_AND_FLOATING',
    '부유형+고정형': 'FLOATING_AND_FIXED',
    '잔교형좌대': 'PIER_TYPE_PLATFORM',
    '좌대+방갈로': 'PLATFORM_AND_BUNGALOW',
    '지상고정형': 'GROUND_FIXED',
    '없음': 'NONE',
    '해당없음': 'NOT_APPLICABLE',
    '수상낚시터': 'WATER_FISHING_SPOT',
    '수상잔교': 'WATER_PIER',
    '수상좌대': 'WATER_PLATFORM',
    '시설없음': 'NO_FACILITIES',
    '실내': 'INDOOR',
    '실내낚시터': 'INDOOR_FISHING',
    '연안방갈로': 'COASTAL_BUNGALOW',
    '이동형': 'MOBILE',
    '좌대': 'PLATFORM',
    '좌교형좌대연안방갈로': 'MIXED_PLATFORM_BUNGALOW'
}

def create_db_connection():
    """데이터베이스 연결 생성"""
    try:
        connection_string = f"mysql+pymysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}?charset={DB_CONFIG['charset']}"
        engine = create_engine(connection_string)
        return engine
    except Exception as e:
        print(f"DB 연결 실패: {e}")
        return None

def create_spots_table(engine):
    """spots 테이블 생성"""
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS spots (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        spot_type ENUM('SEA', 'RESERVOIR', 'FLATLAND', 'OTHER'),
        road_address VARCHAR(500),
        lot_address VARCHAR(500),
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        phone_number VARCHAR(20),
        water_area DOUBLE,
        main_fish_species VARCHAR(500),
        max_capacity INT,
        water_facility_type ENUM('FIXED', 'FLOATING', 'FIXED_AND_FLOATING', 'FLOATING_AND_FIXED', 
                                'PIER_TYPE_PLATFORM', 'PLATFORM_AND_BUNGALOW', 'GROUND_FIXED', 
                                'NONE', 'NOT_APPLICABLE', 'WATER_FISHING_SPOT', 'WATER_PIER', 
                                'WATER_PLATFORM', 'NO_FACILITIES', 'INDOOR', 'INDOOR_FISHING', 
                                'COASTAL_BUNGALOW', 'MOBILE', 'PLATFORM', 'MIXED_PLATFORM_BUNGALOW'),
        usage_fee VARCHAR(200),
        key_points TEXT,
        safety_facilities TEXT,
        convenience_facilities TEXT,
        nearby_attractions TEXT,
        management_phone VARCHAR(20),
        management_office VARCHAR(100),
        data_reference_date DATE,
        region VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """
    
    try:
        with engine.connect() as conn:
            conn.execute(text(create_table_sql))
            conn.commit()
        print("✅ spots 테이블 생성/확인 완료")
        return True
    except Exception as e:
        print(f"❌ 테이블 생성 실패: {e}")
        return False

def clean_data(value):
    """데이터 정리 함수"""
    if pd.isna(value) or value == '-' or value == '':
        return None
    if isinstance(value, str):
        return value.strip()
    return value

def convert_date(date_str):
    """날짜 문자열을 DATE 형식으로 변환"""
    if pd.isna(date_str) or date_str == '-':
        return None
    try:
        if isinstance(date_str, str):
            return datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
        return date_str
    except:
        return None

def find_excel_files(docs_path):
    """docs 디렉토리에서 모든 Excel 파일 찾기"""
    excel_files = []
    
    # .xlsx 파일 찾기
    xlsx_files = glob.glob(os.path.join(docs_path, "**/*.xlsx"), recursive=True)
    excel_files.extend(xlsx_files)
    
    # .xls 파일 찾기
    xls_files = glob.glob(os.path.join(docs_path, "**/*.xls"), recursive=True)
    excel_files.extend(xls_files)
    
    # 낚시터 관련 파일만 필터링 (파일명에 '낚시터' 포함)
    fishing_files = [f for f in excel_files if '낚시터' in os.path.basename(f)]
    
    print(f"🔍 디버그: 전체 Excel 파일 {len(excel_files)}개 발견")
    print(f"🔍 디버그: 낚시터 파일 {len(fishing_files)}개 필터링")
    for f in fishing_files[:3]:  # 처음 3개만 출력
        print(f"   - {f}")
    
    return fishing_files

def extract_region_from_filename(filename):
    """파일명에서 지역명 추출"""
    basename = os.path.basename(filename)
    
    # 일반적인 지역명 패턴 매칭
    regions = {
        '경기': '경기도',
        '서울': '서울특별시',
        '인천': '인천광역시',
        '강원': '강원도',
        '충북': '충청북도',
        '충남': '충청남도',
        '전북': '전라북도',
        '전남': '전라남도',
        '경북': '경상북도',
        '경남': '경상남도',
        '제주': '제주특별자치도',
        '부산': '부산광역시',
        '대구': '대구광역시',
        '울산': '울산광역시',
        '광주': '광주광역시',
        '대전': '대전광역시',
        '세종': '세종특별자치시'
    }
    
    for short_name, full_name in regions.items():
        if short_name in basename:
            return full_name
    
    return '기타지역'

def read_excel_data(file_path):
    """Excel 파일 읽기 및 데이터 변환"""
    try:
        # 지역명 추출
        region = extract_region_from_filename(file_path)
        print(f"🗺️ 처리 중인 지역: {region}")
        
        # Excel 파일 읽기 (첫 번째 행은 헤더)
        df = pd.read_excel(file_path, header=0)
        
        print(f"📊 Excel 파일 읽기 완료: {len(df)}개 행")
        print(f"📋 컬럼: {list(df.columns)}")
        
        # 디버깅: 처음 몇 행 출력
        print("🔍 디버그: 처음 3행 데이터")
        for i in range(min(3, len(df))):
            print(f"   행 {i+1}: {dict(df.iloc[i])}")
        print()
        
        # 컬럼명 매핑 (여러 가능한 컬럼명 지원)
        column_mapping = {
            '번호': 'original_id',
            '낚시터명': 'name',
            '낚시터 명': 'name',
            '시설명': 'name',
            '낚시터유형': 'spot_type',
            '낚시터 유형': 'spot_type',
            '유형': 'spot_type',
            '소재지도로명주소': 'road_address',
            '도로명주소': 'road_address',
            '주소(도로명)': 'road_address',
            '소재지지번주소': 'lot_address',
            '지번주소': 'lot_address',
            '주소(지번)': 'lot_address',
            'WGS84위도': 'latitude',
            '위도': 'latitude',
            'WGS84경도': 'longitude',
            '경도': 'longitude',
            '낚시터전화번호': 'phone_number',
            '전화번호': 'phone_number',
            '연락처': 'phone_number',
            '수면적': 'water_area',
            '주요어종': 'main_fish_species',
            '어종': 'main_fish_species',
            '최대수용인원': 'max_capacity',
            '수용인원': 'max_capacity',
            '수상시설물유형': 'water_facility_type',
            '시설유형': 'water_facility_type',
            '이용요금': 'usage_fee',
            '요금': 'usage_fee',
            '주요포인트': 'key_points',
            '포인트': 'key_points',
            '안전시설현황': 'safety_facilities',
            '안전시설': 'safety_facilities',
            '편익시설현황': 'convenience_facilities',
            '편의시설': 'convenience_facilities',
            '편익시설': 'convenience_facilities',
            '주변관광지': 'nearby_attractions',
            '관광지': 'nearby_attractions',
            '관리기관전화번호': 'management_phone',
            '관리기관연락처': 'management_phone',
            '관리기관명': 'management_office',
            '관리기관': 'management_office',
            '데이터기준일자': 'data_reference_date',
            '기준일자': 'data_reference_date'
        }
        
        # 컬럼명 변경
        df = df.rename(columns=column_mapping)
        
        # 데이터 정리 및 변환
        processed_data = []
        
        for index, row in df.iterrows():
            try:
                # SpotType 변환
                spot_type_korean = clean_data(row.get('spot_type'))
                spot_type = SPOT_TYPE_MAPPING.get(spot_type_korean, 'OTHER')
                
                # WaterFacilityType 변환
                facility_type_korean = clean_data(row.get('water_facility_type'))
                facility_type = WATER_FACILITY_MAPPING.get(facility_type_korean, 'NONE')
                
                # 숫자 데이터 변환
                latitude = None
                longitude = None
                water_area = None
                max_capacity = None
                
                try:
                    if not pd.isna(row.get('latitude')):
                        latitude = float(row['latitude'])
                except:
                    pass
                    
                try:
                    if not pd.isna(row.get('longitude')):
                        longitude = float(row['longitude'])
                except:
                    pass
                    
                try:
                    if not pd.isna(row.get('water_area')):
                        water_area = float(row['water_area'])
                except:
                    pass
                    
                try:
                    if not pd.isna(row.get('max_capacity')):
                        max_capacity = int(row['max_capacity'])
                except:
                    pass
                
                # 처리된 데이터 추가 (지역 정보 포함)
                processed_row = {
                    'name': clean_data(row.get('name')),
                    'spot_type': spot_type,
                    'road_address': clean_data(row.get('road_address')),
                    'lot_address': clean_data(row.get('lot_address')),
                    'latitude': latitude,
                    'longitude': longitude,
                    'phone_number': clean_data(row.get('phone_number')),
                    'water_area': water_area,
                    'main_fish_species': clean_data(row.get('main_fish_species')),
                    'max_capacity': max_capacity,
                    'water_facility_type': facility_type,
                    'usage_fee': clean_data(row.get('usage_fee')),
                    'key_points': clean_data(row.get('key_points')),
                    'safety_facilities': clean_data(row.get('safety_facilities')),
                    'convenience_facilities': clean_data(row.get('convenience_facilities')),
                    'nearby_attractions': clean_data(row.get('nearby_attractions')),
                    'management_phone': clean_data(row.get('management_phone')),
                    'management_office': clean_data(row.get('management_office')),
                    'data_reference_date': convert_date(row.get('data_reference_date')),
                    'region': region  # 지역 정보 추가
                }
                
                # 필수 필드 체크
                if processed_row['name']:
                    processed_data.append(processed_row)
                    if len(processed_data) <= 3:  # 처음 3개만 디버그 출력
                        print(f"🔍 디버그: 처리된 데이터 {len(processed_data)}: {processed_row['name']}")
                else:
                    print(f"⚠️ 행 {index + 2}: 낚시터명이 없어서 스킵 - 원본 이름: '{row.get('name')}'")
                    
            except Exception as e:
                print(f"⚠️ 행 {index + 2} 처리 중 오류: {e}")
                continue
        
        print(f"✅ 데이터 처리 완료: {len(processed_data)}개 유효 레코드")
        return processed_data
        
    except Exception as e:
        print(f"❌ Excel 파일 읽기 실패: {e}")
        return None

def upsert_data_to_db(engine, data):
    """처리된 데이터를 DB에 UPSERT (업데이트 또는 삽입)"""
    try:
        # 데이터 UPSERT
        success_count = 0
        error_count = 0
        insert_count = 0
        update_count = 0
        
        for i, row in enumerate(data):
            try:
                # 기존 데이터 확인 (이름으로만 중복 체크 - 주소가 NULL일 수 있음)
                check_sql = """
                SELECT id FROM spots 
                WHERE name = :name 
                LIMIT 1
                """
                
                with engine.connect() as conn:
                    result = conn.execute(text(check_sql), {
                        'name': row['name']
                    })
                    existing_row = result.fetchone()
                    
                    if existing_row:
                        # 기존 데이터가 있으면 업데이트
                        update_sql = """
                        UPDATE spots SET
                            spot_type = :spot_type,
                            road_address = :road_address,
                            lot_address = :lot_address,
                            latitude = :latitude,
                            longitude = :longitude,
                            phone_number = :phone_number,
                            water_area = :water_area,
                            main_fish_species = :main_fish_species,
                            max_capacity = :max_capacity,
                            water_facility_type = :water_facility_type,
                            usage_fee = :usage_fee,
                            key_points = :key_points,
                            safety_facilities = :safety_facilities,
                            convenience_facilities = :convenience_facilities,
                            nearby_attractions = :nearby_attractions,
                            management_phone = :management_phone,
                            management_office = :management_office,
                            data_reference_date = :data_reference_date,
                            region = :region,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = :id
                        """
                        
                        update_params = row.copy()
                        update_params['id'] = existing_row[0]
                        
                        conn.execute(text(update_sql), update_params)
                        update_count += 1
                    else:
                        # 기존 데이터가 없으면 새로 삽입
                        insert_sql = """
                        INSERT INTO spots (
                            name, spot_type, road_address, lot_address, latitude, longitude,
                            phone_number, water_area, main_fish_species, max_capacity,
                            water_facility_type, usage_fee, key_points, safety_facilities,
                            convenience_facilities, nearby_attractions, management_phone,
                            management_office, data_reference_date, region
                        ) VALUES (
                            :name, :spot_type, :road_address, :lot_address, :latitude, :longitude,
                            :phone_number, :water_area, :main_fish_species, :max_capacity,
                            :water_facility_type, :usage_fee, :key_points, :safety_facilities,
                            :convenience_facilities, :nearby_attractions, :management_phone,
                            :management_office, :data_reference_date, :region
                        )
                        """
                        
                        conn.execute(text(insert_sql), row)
                        insert_count += 1
                    
                    conn.commit()
                
                success_count += 1
                
                if (i + 1) % 50 == 0:
                    print(f"📝 진행상황: {i + 1}/{len(data)} 레코드 처리 완료 (삽입: {insert_count}, 업데이트: {update_count})")
                    
            except Exception as e:
                error_count += 1
                print(f"❌ 레코드 {i + 1} 처리 실패: {e}")
                print(f"   데이터: {row['name']}")
                continue
        
        print(f"✅ 데이터 UPSERT 완료!")
        print(f"   신규 삽입: {insert_count}개")
        print(f"   기존 업데이트: {update_count}개")
        print(f"   총 성공: {success_count}개")
        print(f"   실패: {error_count}개")
        
        return success_count, error_count
        
    except Exception as e:
        print(f"❌ 데이터 UPSERT 중 오류: {e}")
        return 0, len(data)

def main():
    """메인 실행 함수"""
    print("🎣 낚시터 정보 마이그레이션 시작")
    print("=" * 50)
    
    # 필수 모듈 확인
    try:
        import pandas as pd
        import pymysql
        from sqlalchemy import create_engine, text
        print("✅ 필수 모듈 로드 완료")
    except ImportError as e:
        print(f"❌ 필수 모듈 누락: {e}")
        print("다음 명령어로 설치하세요: pip install pandas openpyxl pymysql sqlalchemy")
        return
    
    # docs 디렉토리에서 모든 Excel 파일 찾기
    docs_path = "./docs"
    if not os.path.exists(docs_path):
        print(f"❌ docs 디렉토리를 찾을 수 없습니다: {docs_path}")
        return
    
    excel_files = find_excel_files(docs_path)
    if not excel_files:
        print("❌ 낚시터 관련 Excel 파일을 찾을 수 없습니다.")
        return
    
    print(f"📁 발견된 Excel 파일: {len(excel_files)}개")
    for file in excel_files:
        print(f"   - {file}")
    print()
    
    # DB 연결
    print("🔌 데이터베이스 연결 중...")
    engine = create_db_connection()
    if not engine:
        print("❌ 데이터베이스 연결 실패")
        return
    
    # 연결 테스트
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ 데이터베이스 연결 성공")
    except Exception as e:
        print(f"❌ 데이터베이스 연결 테스트 실패: {e}")
        return
    
    # 테이블 생성
    print("📋 테이블 생성/확인 중...")
    if not create_spots_table(engine):
        return
    
    # 모든 Excel 파일 처리
    total_success = 0
    total_error = 0
    total_processed = 0
    
    for i, excel_file in enumerate(excel_files, 1):
        print(f"\n📖 파일 {i}/{len(excel_files)} 처리 중: {os.path.basename(excel_file)}")
        print("-" * 40)
        
        # Excel 데이터 읽기
        data = read_excel_data(excel_file)
        if not data:
            print(f"⚠️ 파일 {excel_file} 처리 실패")
            continue
        
        # 데이터 UPSERT
        print("💾 데이터베이스에 UPSERT 중...")
        success_count, error_count = upsert_data_to_db(engine, data)
        
        total_success += success_count
        total_error += error_count
        total_processed += len(data)
        
        print(f"✅ 파일 처리 완료 - 성공: {success_count}, 실패: {error_count}")
    
    print("\n" + "=" * 50)
    print("🎉 전체 마이그레이션 완료!")
    print(f"   처리된 파일: {len(excel_files)}개")
    print(f"   총 처리: {total_processed}개 레코드")
    print(f"   성공: {total_success}개")
    print(f"   실패: {total_error}개")

if __name__ == "__main__":
    main()