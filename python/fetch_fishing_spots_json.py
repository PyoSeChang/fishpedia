#!/usr/bin/env python3
import requests
from requests.adapters import HTTPAdapter
from urllib3.poolmanager import PoolManager
import ssl
import json
from datetime import datetime
import sys
import os

class TLSAdapter(HTTPAdapter):
    def init_poolmanager(self, *args, **kwargs):
        ##################################################
        # SSL 설정 개선
        kwargs['ssl_version'] = ssl.PROTOCOL_TLS
        kwargs['ssl_context'] = ssl.create_default_context()
        kwargs['ssl_context'].check_hostname = False
        kwargs['ssl_context'].verify_mode = ssl.CERT_NONE
        kwargs['ssl_context'].set_ciphers('DEFAULT:!aNULL:!eNULL:!MD5:!3DES:!DES:!RC4:!IDEA:!SEED:!aDSS:!SRP:!PSK')
        return super().init_poolmanager(*args, **kwargs)
        ################################################

class FishingSpotJsonFetcher:
    def __init__(self):
        self.service_key = "OfClaw16m1tUnZnlLW2%2FEM%2BXJB8pMkuc8u8t1FBOQMj5Ap3uw7r4uGFEQJPWsh8YrSFBSEM1DYmMvK3C0IaDpA%3D%3D"
        self.api_url = "https://apis.data.go.kr/1192136/fcstFishing/GetFcstFishingApiService"
        self.gubun_types = ["갯바위", "선상"]
        
        # Setup requests session with TLS adapter
        self.session = requests.Session()
        self.session.mount('https://', TLSAdapter())
        
        print(f"OpenSSL Version: {ssl.OPENSSL_VERSION}")
    
    def fetch_fishing_spots(self, gubun):
        """API에서 낚시터 정보를 가져옵니다."""
        # 서비스 키를 인코딩하지 않고 직접 URL에 포함
        url = f"{self.api_url}?serviceKey={self.service_key}&gubun={gubun}&type=json&numOfRows=100&pageNo=1"
        
        try:
            print(f"API 요청 중: gubun={gubun}")
            print(f"요청 URL: {url}")
            # 타임아웃과 추가 설정 적용
            response = self.session.get(
                url, 
                timeout=30,
                verify=False,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            )
            response.raise_for_status()
            
            data = response.json()
            print(f"API 응답 성공: gubun '{gubun}' - 상태코드 {response.status_code}")
            
            return data
            
        except requests.exceptions.RequestException as e:
            print(f"API 요청 실패 (gubun: {gubun}): {e}")
            return None
        except json.JSONDecodeError as e:
            print(f"JSON 파싱 실패 (gubun: {gubun}): {e}")
            print(f"Response content: {response.text}")
            return None
    
    def save_json_file(self, data, gubun):
        """JSON 데이터를 파일로 저장합니다."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"fishing_spots_{gubun}_{timestamp}.json"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"JSON 파일 저장 완료: {filename}")
            return filename
        except Exception as e:
            print(f"JSON 파일 저장 실패: {e}")
            return None
    
    def fetch_all_and_save(self):
        """모든 gubun 타입의 데이터를 가져와서 JSON 파일로 저장합니다."""
        all_data = {}
        saved_files = []
        
        for gubun in self.gubun_types:
            print(f"\n=== {gubun} 데이터 가져오기 시작 ===")
            
            data = self.fetch_fishing_spots(gubun)
            if data:
                # 개별 파일로 저장
                filename = self.save_json_file(data, gubun)
                if filename:
                    saved_files.append(filename)
                
                # 전체 데이터에 추가
                all_data[gubun] = data
                
                print(f"{gubun} 데이터 처리 완료")
            else:
                print(f"{gubun} 데이터 가져오기 실패")
        
        # 전체 데이터를 하나의 파일로도 저장
        if all_data:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            combined_filename = f"fishing_spots_all_{timestamp}.json"
            
            try:
                with open(combined_filename, 'w', encoding='utf-8') as f:
                    json.dump(all_data, f, indent=2, ensure_ascii=False)
                print(f"\n통합 JSON 파일 저장 완료: {combined_filename}")
                saved_files.append(combined_filename)
            except Exception as e:
                print(f"통합 JSON 파일 저장 실패: {e}")
        
        return saved_files

def main():
    print("낚시터 API 데이터 JSON 저장 시작")
    print("=" * 50)
    
    # OpenSSL / request 버전 점검
    print(f"OpenSSL Version: {ssl.OPENSSL_VERSION}")
    try:
        import importlib.metadata
        requests_version = importlib.metadata.version("requests")
        print(f"Requests Version: {requests_version}")
    except:
        print("Requests version 확인 실패")
    print()
    
    fetcher = FishingSpotJsonFetcher()
    saved_files = fetcher.fetch_all_and_save()
    
    if saved_files:
        print(f"\n성공적으로 저장된 파일들:")
        for filename in saved_files:
            file_size = os.path.getsize(filename) if os.path.exists(filename) else 0
            print(f"  - {filename} ({file_size:,} bytes)")
        
        print("\n다음 단계: insert_fishing_spots_from_json.py를 사용하여 DB에 삽입하세요.")
        sys.exit(0)
    else:
        print("JSON 파일 저장 실패")
        sys.exit(1)

if __name__ == "__main__":
    main()