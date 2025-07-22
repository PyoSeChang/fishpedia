#!/usr/bin/env python3
import requests
import mysql.connector
import json
from datetime import datetime
import sys
import ssl
print(ssl.OPENSSL_VERSION)

class FishingSpotMigration:
    def __init__(self):
        self.service_key = "OfClaw16m1tUnZnlLW2/EM+XJB8pMkuc8u8t1FBOQMj5Ap3uw7r4uGFEQJPWsh8YrSFBSEM1DYmMvK3C0IaDpA=="
        self.api_url = "	https://apis.data.go.kr/1192136/fcstFishing/GetFcstFishingApiService"
        self.gubun_types = ["갯바위", "선상"]
        
        # Database configuration
        self.db_config = {
            'host': 'localhost',
            'user': 'root',
            'password': '1234', 
            'database': 'fishpedia',
            'charset': 'utf8'
        }
    
    def fetch_fishing_spots(self, gubun):
        """API에서 낚시터 정보를 가져옵니다."""
        params = {
            'serviceKey': self.service_key,
            'gubun': gubun,
            'type': 'json',
            'numOfRows': 1000,  # 한 번에 가져올 최대 개수
            'pageNo': 1
        }
        
        try:
            response = requests.get(self.api_url, params=params, verify=False)
            response.raise_for_status()
            
            data = response.json()
            print(f"API Response for gubun '{gubun}': {json.dumps(data, indent=2, ensure_ascii=False)}")
            
            # API 응답 구조에 따라 수정 필요
            if 'response' in data and 'body' in data['response']:
                items = data['response']['body'].get('items', {})
                if isinstance(items, dict) and 'item' in items:
                    return items['item'] if isinstance(items['item'], list) else [items['item']]
                elif isinstance(items, list):
                    return items
            
            return []
            
        except requests.exceptions.RequestException as e:
            print(f"API 요청 실패: {e}")
            return []
        except json.JSONDecodeError as e:
            print(f"JSON 파싱 실패: {e}")
            print(f"Response content: {response.text}")
            return []
    
    def connect_database(self):
        """데이터베이스 연결을 생성합니다."""
        try:
            conn = mysql.connector.connect(**self.db_config)
            return conn
        except mysql.connector.Error as e:
            print(f"데이터베이스 연결 실패: {e}")
            return None
    
    def insert_spot(self, cursor, spot_data, gubun):
        """스팟 데이터를 데이터베이스에 삽입합니다."""
        
        # API 응답에서 필요한 데이터 추출 (API 구조에 따라 수정 필요)
        name = spot_data.get('fcltNm', spot_data.get('name', ''))
        latitude = spot_data.get('lat', spot_data.get('latitude'))
        longitude = spot_data.get('lon', spot_data.get('longitude'))
        
        # 위도/경도를 float로 변환
        try:
            latitude = float(latitude) if latitude else None
            longitude = float(longitude) if longitude else None
        except (ValueError, TypeError):
            print(f"잘못된 좌표 데이터: lat={latitude}, lon={longitude}")
            return False
        
        if not name or latitude is None or longitude is None:
            print(f"필수 데이터 누락: name={name}, lat={latitude}, lon={longitude}")
            return False
        
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
            name,
            'SEA',  # 고정값
            latitude,
            longitude,
            True,  # fishing_level_info = true
            gubun,
            datetime.now().date()
        )
        
        try:
            cursor.execute(insert_query, values)
            print(f"삽입 성공: {name} (gubun: {gubun})")
            return True
        except mysql.connector.Error as e:
            print(f"데이터 삽입 실패: {e}")
            print(f"데이터: {values}")
            return False
    
    def migrate(self):
        """전체 마이그레이션을 실행합니다."""
        conn = self.connect_database()
        if not conn:
            return False
        
        cursor = conn.cursor()
        total_inserted = 0
        
        try:
            for gubun in self.gubun_types:
                print(f"\n=== {gubun} 데이터 처리 시작 ===")
                
                spots = self.fetch_fishing_spots(gubun)
                print(f"{gubun}에서 {len(spots)}개 스팟 조회됨")
                
                for spot in spots:
                    if self.insert_spot(cursor, spot, gubun):
                        total_inserted += 1
                
                print(f"{gubun} 처리 완료")
            
            # 커밋
            conn.commit()
            print(f"\n총 {total_inserted}개 스팟이 성공적으로 삽입되었습니다.")
            
        except Exception as e:
            print(f"마이그레이션 중 오류 발생: {e}")
            conn.rollback()
            return False
        
        finally:
            cursor.close()
            conn.close()
        
        return True

def main():
    print("낚시터 API 데이터 마이그레이션 시작")
    print("=" * 50)
    
    migration = FishingSpotMigration()
    
    if migration.migrate():
        print("마이그레이션이 성공적으로 완료되었습니다.")
        sys.exit(0)
    else:
        print("마이그레이션 실패")
        sys.exit(1)

if __name__ == "__main__":
    main()