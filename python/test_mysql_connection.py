#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MySQL 연결 테스트 스크립트
"""

try:
    import mysql.connector
    print("mysql.connector 모듈이 설치되어 있습니다.")
    
    # 데이터베이스 연결 테스트
    DB_CONFIG = {
        'host': 'localhost',
        'database': 'fishpedia',
        'user': 'root',
        'password': '1234',
        'charset': 'utf8mb4',
        'auth_plugin': 'mysql_native_password'
    }
    
    connection = mysql.connector.connect(**DB_CONFIG)
    if connection.is_connected():
        print("데이터베이스 연결 성공!")
        
        cursor = connection.cursor(dictionary=True)
        
        # 실패한 spots 조회
        query = """
        SELECT id, name, road_address, lot_address, latitude, longitude, 
               region, fishing_level_info
        FROM spots 
        WHERE region IS NULL OR region = '' OR LENGTH(region) > 2
        ORDER BY id
        LIMIT 10
        """
        cursor.execute(query)
        failed_spots = cursor.fetchall()
        
        print(f"실패한 spots 샘플 {len(failed_spots)}개:")
        for spot in failed_spots:
            print(f"ID: {spot['id']}, 이름: {spot['name']}, region: {spot['region']}")
        
        cursor.close()
        connection.close()
    
except ImportError:
    print("mysql.connector 모듈이 설치되지 않았습니다.")
    print("Windows 명령 프롬프트에서 다음 명령을 실행하세요:")
    print("pip install mysql-connector-python")
except Exception as e:
    print(f"오류 발생: {e}")