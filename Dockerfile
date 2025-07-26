# ==========================================
# 엘더베리 프로젝트 - Spring Boot Dockerfile
# Multi-stage build with Java 21 LTS
# ==========================================

# Build Stage - Gradle Build
FROM openjdk:21-jdk-slim AS builder

# 빌드 환경변수 설정
ARG BUILD_ENV=production

# 작업 디렉토리 설정
WORKDIR /app

# Gradle Wrapper 복사
COPY gradlew .
COPY gradle gradle/
RUN chmod +x gradlew

# Gradle 캐시 최적화를 위한 의존성 파일 먼저 복사
COPY build.gradle.kts settings.gradle.kts ./

# 의존성 다운로드 (캐시 레이어)
RUN ./gradlew dependencies --no-daemon

# 소스 코드 복사
COPY src/ src/
COPY frontend/ frontend/

# 애플리케이션 빌드 (프론트엔드 포함)
RUN ./gradlew clean buildForDeploy --no-daemon

# Runtime Stage - 최종 실행 이미지
FROM openjdk:21-jre-slim

# 시스템 패키지 업데이트 및 필수 도구 설치
RUN apt-get update && apt-get install -y \
    curl \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# 애플리케이션 사용자 생성
RUN groupadd -r elderberry && useradd -r -g elderberry elderberry

# 작업 디렉토리 설정
WORKDIR /app

# 빌드된 JAR 파일 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 로그 및 업로드 디렉토리 생성
RUN mkdir -p /app/logs /app/uploads && \
    chown -R elderberry:elderberry /app

# 포트 노출
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# 사용자 변경
USER elderberry

# 런타임 환경변수 설정
ENV SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE:-production}
ENV SERVER_PORT=${SERVER_PORT:-8080}
ENV LOG_LEVEL=${LOG_LEVEL:-info}

# JVM 최적화 설정
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:+UnlockExperimentalVMOptions -XX:+UseContainerSupport"

# 애플리케이션 실행
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar app.jar"]