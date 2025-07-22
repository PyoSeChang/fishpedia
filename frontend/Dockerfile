# React Dockerfile
# 빌드 스테이지
FROM node:18-alpine as build

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 yarn.lock 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스코드 복사
COPY . .

# 빌드
RUN npm run build

# 프로덕션 스테이지
FROM nginx:alpine

# 빌드된 파일을 nginx에 복사
COPY --from=build /app/build /usr/share/nginx/html

# nginx 설정 복사 (React Router 지원을 위해)
COPY nginx.conf /etc/nginx/nginx.conf

# 포트 노출
EXPOSE 80

# nginx 실행
CMD ["nginx", "-g", "daemon off;"]