#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
간단한 마이그레이션 테스트 스크립트
"""

import os
import glob

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
    
    print(f"전체 Excel 파일: {len(excel_files)}개")
    print(f"낚시터 파일: {len(fishing_files)}개")
    
    for f in excel_files:
        print(f"전체 파일: {f}")
    
    for f in fishing_files:
        print(f"낚시터 파일: {f}")
    
    return fishing_files

def main():
    docs_path = "./docs"
    if not os.path.exists(docs_path):
        print(f"docs 디렉토리를 찾을 수 없습니다: {docs_path}")
        return
    
    excel_files = find_excel_files(docs_path)
    print(f"발견된 파일: {len(excel_files)}개")

if __name__ == "__main__":
    main()