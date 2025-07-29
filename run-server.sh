#!/bin/bash
# 서버 실행 스크립트
echo "🚀 엘더베리 서버 시작 중..."
echo "Java Version: $(java -version 2>&1 | head -1)"
echo "Working Directory: $(pwd)"
echo ""

./gradlew bootRun