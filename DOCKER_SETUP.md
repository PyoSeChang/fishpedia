# Fishiphedia Docker 실행 가이드

## 사전 준비
1. Docker와 Docker Compose 설치 필요
2. 8081, 80, 3307, 6379 포트가 사용 가능한지 확인

## 실행 방법

### 1. 전체 애플리케이션 실행
```bash
# 프로젝트 루트 디렉토리에서
docker-compose up -d
```

### 2. 각 서비스별 확인
- **프론트엔드**: http://localhost (포트 80)
- **백엔드 API**: http://localhost:8081/api
- **데이터베이스**: localhost:3307
- **Redis**: localhost:6379

### 3. 로그 확인
```bash
# 전체 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f database
```

### 4. 서비스 중지
```bash
docker-compose down
```

### 5. 데이터 포함 완전 삭제
```bash
docker-compose down -v
```

## 서비스 구성
- **frontend**: React 애플리케이션 (Nginx)
- **backend**: Spring Boot API 서버
- **database**: MySQL 8.0
- **redis**: Redis 캐시

## 데이터베이스 초기화
- `database_migration.sql` 파일이 자동으로 실행됩니다
- 초기 데이터가 필요하면 해당 파일에 추가하세요

## 파일 업로드
- 업로드된 파일은 `./uploads` 디렉토리에 저장됩니다
- 컨테이너 재시작해도 파일이 보존됩니다

## 개발 모드
개발 중에는 각 서비스를 개별적으로 실행할 수 있습니다:

```bash
# 데이터베이스만 실행
docker-compose up -d database redis

# 로컬에서 백엔드 개발
./gradlew bootRun --args='--spring.profiles.active=docker'

# 로컬에서 프론트엔드 개발
cd frontend && npm start
```