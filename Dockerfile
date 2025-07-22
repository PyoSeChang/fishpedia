# Spring Boot Dockerfile
FROM openjdk:17-jdk-slim

# 작업 디렉토리 설정
WORKDIR /app

# Gradle 빌드를 위한 파일들 복사
COPY gradle/ gradle/
COPY gradlew build.gradle settings.gradle ./
COPY src/ src/

# 실행 권한 부여 및 빌드
RUN chmod +x gradlew
RUN ./gradlew build -x test --no-daemon

# 빌드된 JAR 파일 확인 및 복사
RUN ls -la build/libs/
RUN JAR_FILE=$(find build/libs -name "*.jar" ! -name "*plain*" | head -1) && cp "$JAR_FILE" app.jar

# 포트 노출
EXPOSE 8081

# 애플리케이션 실행
CMD ["java", "-jar", "app.jar"]