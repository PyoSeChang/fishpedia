#!/usr/bin/env python3
import mysql.connector
import json
from datetime import datetime
import sys
import os
import glob

class FishingSpotJsonInserter:
    def __init__(self):
        # Database configuration
        self.db_config = {
            'host': 'localhost',
            'user': 'root',
            'password': '1234',
            'database': 'fishpedia',
            'charset': 'utf8',
            'auth_plugin': 'mysql_native_password'
        }
    
    def connect_database(self):
        """데이터베이스 연결을 생성합니다."""
        try:
            conn = mysql.connector.connect(**self.db_config)
            return conn
        except mysql.connector.Error as e:
            print(f"데이터베이스 연결 실패: {e}")
            return None
    
    def load_json_file(self, filename):
        """JSON 파일을 로드합니다."""
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                data = json.load(f)
            print(f"JSON 파일 로드 완료: {filename}")
            return data
        except Exception as e:
            print(f"JSON 파일 로드 실패: {e}")
            return None
    
    def extract_spots_from_data(self, data, gubun=None):
        """JSON 데이터에서 스팟 정보를 추출합니다."""
        spots = []
        
        # 통합 파일인 경우 (gubun별로 분리된 데이터)
        if isinstance(data, dict) and gubun is None:
            for g, g_data in data.items():
                if g in ["갯바위", "선상"]:
                    spots.extend(self.extract_spots_from_single_data(g_data, g))
        # 개별 파일인 경우
        else:
            spots.extend(self.extract_spots_from_single_data(data, gubun))
        
        return spots
    
    def extract_spots_from_single_data(self, data, gubun):
        """단일 API 응답 데이터에서 스팟 정보를 추출합니다."""
        spots = []
        
        try:
            # API 응답 구조에 따라 수정 필요
            if 'response' in data and 'body' in data['response']:
                items = data['response']['body'].get('items', {})
                if isinstance(items, dict) and 'item' in items:
                    item_list = items['item'] if isinstance(items['item'], list) else [items['item']]
                elif isinstance(items, list):
                    item_list = items
                else:
                    print(f"예상하지 못한 items 구조: {type(items)}")
                    return spots
                
                for item in item_list:
                    spot = self.process_spot_item(item, gubun)
                    if spot:
                        spots.append(spot)
            else:
                print(f"예상하지 못한 API 응답 구조: {list(data.keys())}")
        
        except Exception as e:
            print(f"스팟 데이터 추출 중 오류: {e}")
        
        return spots
    
    def process_spot_item(self, item, gubun):
        """개별 스팟 아이템을 처리합니다."""
        # API 응답에서 필요한 데이터 추출 (실제 API 구조에 따라 수정 필요)
        name = item.get('seafsPstnNm', item.get('fcltNm', item.get('name', item.get('spotNm', ''))))
        latitude = item.get('lat', item.get('latitude', item.get('wido')))
        longitude = item.get('lot', item.get('lon', item.get('longitude', item.get('gyeongdo'))))
        
        # 위도/경도를 float로 변환
        try:
            latitude = float(latitude) if latitude else None
            longitude = float(longitude) if longitude else None
        except (ValueError, TypeError):
            print(f"잘못된 좌표 데이터: lat={latitude}, lon={longitude}")
            return None
        
        if not name or latitude is None or longitude is None:
            print(f"필수 데이터 누락: name={name}, lat={latitude}, lon={longitude}")
            return None
        
        return {
            'name': name,
            'latitude': latitude,
            'longitude': longitude,
            'gubun': gubun
        }
    
    def insert_spot(self, cursor, spot):
        """스팟 데이터를 데이터베이스에 삽입합니다."""
        insert_query = """
        INSERT INTO spots (
            name, 
            spot_type, 
            latitude, 
            longitude, 
            fishing_level_info, 
            gubun,
            data_reference_date
        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        
        values = (
            spot['name'],
            'SEA',  # 고정값
            spot['latitude'],
            spot['longitude'],
            True,  # fishing_level_info = true
            spot['gubun'],
            datetime.now().date()
        )
        
        try:
            cursor.execute(insert_query, values)
            print(f"삽입 성공: {spot['name']} (gubun: {spot['gubun']})")
            return True
        except mysql.connector.Error as e:
            print(f"데이터 삽입 실패: {e}")
            print(f"데이터: {values}")
            return False
    
    def insert_from_file(self, filename):
        """JSON 파일에서 데이터를 읽어 DB에 삽입합니다."""
        # JSON 파일 로드
        data = self.load_json_file(filename)
        if not data:
            return False
        
        # 파일명에서 gubun 추출 (개별 파일인 경우)
        gubun = None
        if 'fishing_spots_갯바위' in filename:
            gubun = '갯바위'
        elif 'fishing_spots_선상' in filename:
            gubun = '선상'
        
        # 스팟 데이터 추출
        spots = self.extract_spots_from_data(data, gubun)
        if not spots:
            print("추출할 스팟 데이터가 없습니다.")
            return False
        
        print(f"총 {len(spots)}개 스팟 데이터 추출됨")
        
        # DB 연결 및 삽입
        conn = self.connect_database()
        if not conn:
            return False
        
        cursor = conn.cursor()
        inserted_count = 0
        
        try:
            for spot in spots:
                if self.insert_spot(cursor, spot):
                    inserted_count += 1
            
            # 커밋
            conn.commit()
            print(f"\n총 {inserted_count}개 스팟이 성공적으로 삽입되었습니다.")
            
        except Exception as e:
            print(f"삽입 중 오류 발생: {e}")
            conn.rollback()
            return False
        
        finally:
            cursor.close()
            conn.close()
        
        return inserted_count > 0

def main():
    # 하드코딩된 파일 경로 사용 (스크립트 위치 기준)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    filename = os.path.join(os.path.dirname(script_dir), "fishing_spots_all_20250722_100810.json")
    
    if not os.path.exists(filename):
        print(f"파일이 존재하지 않습니다: {filename}")
        sys.exit(1)
    
    print("낚시터 JSON 데이터 DB 삽입 시작")
    print("=" * 50)
    print(f"대상 파일: {filename}")
    
    inserter = FishingSpotJsonInserter()
    
    if inserter.insert_from_file(filename):
        print("삽입이 성공적으로 완료되었습니다.")
        sys.exit(0)
    else:
        print("삽입 실패")
        sys.exit(1)

if __name__ == "__main__":
    main()