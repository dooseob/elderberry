# 📡 복구된 API 엔드포인트 문서

**문서 생성일**: 2025-07-28  
**복구 작업**: board, job, chatbot 시스템  
**컴파일 상태**: ✅ 성공 (63개 오류 → 0개)

## 🗂️ Board System API

### 기본 정보
- **Base URL**: `/api/boards`
- **인증**: JWT Token 필요
- **권한**: 게시판별 접근 권한 확인

### 게시판 관리
```http
GET    /api/boards                    # 게시판 목록 조회
GET    /api/boards/{id}               # 특정 게시판 조회
POST   /api/boards                    # 게시판 생성 (관리자만)
PUT    /api/boards/{id}               # 게시판 수정 (관리자만)
DELETE /api/boards/{id}               # 게시판 비활성화 (관리자만)
```

### 게시글 관리
```http
GET    /api/boards/{id}/posts                 # 게시글 목록 조회
GET    /api/boards/{id}/posts/search          # 게시글 검색
POST   /api/boards/{id}/posts                 # 게시글 작성
GET    /api/boards/{boardId}/posts/{postId}   # 특정 게시글 조회
PUT    /api/boards/{boardId}/posts/{postId}   # 게시글 수정
DELETE /api/boards/{boardId}/posts/{postId}   # 게시글 삭제
```

### 댓글 관리
```http
GET    /api/boards/{boardId}/posts/{postId}/comments              # 댓글 목록 조회
POST   /api/boards/{boardId}/posts/{postId}/comments              # 댓글 작성
PUT    /api/boards/{boardId}/posts/{postId}/comments/{commentId}  # 댓글 수정
DELETE /api/boards/{boardId}/posts/{postId}/comments/{commentId}  # 댓글 삭제
```

## 💼 Job System API

### 기본 정보
- **Base URL**: `/api/jobs`
- **인증**: JWT Token 필요
- **권한**: 역할별 접근 제한 (구직자, 고용주, 관리자)

### 구인공고 조회
```http
GET    /api/jobs                      # 전체 구인공고 목록
GET    /api/jobs/urgent               # 긴급 채용 공고
GET    /api/jobs/featured             # 추천 공고
GET    /api/jobs/popular              # 인기 공고
GET    /api/jobs/latest               # 최신 공고
GET    /api/jobs/search               # 공고 검색
GET    /api/jobs/filter               # 필터링된 공고
GET    /api/jobs/category/{category}  # 카테고리별 공고
GET    /api/jobs/location             # 지역별 공고
GET    /api/jobs/{id}                 # 특정 공고 상세 조회
```

### 구인공고 관리 (고용주/관리자)
```http
POST   /api/jobs                      # 구인공고 등록
PUT    /api/jobs/{id}                 # 구인공고 수정
DELETE /api/jobs/{id}                 # 구인공고 삭제
GET    /api/jobs/employer/{employerId} # 특정 고용주의 공고 목록
GET    /api/jobs/my                   # 내가 등록한 공고 목록
```

### 공고 통계
```http
GET    /api/jobs/deadline-approaching  # 마감 임박 공고
GET    /api/jobs/stats/category       # 카테고리별 통계
GET    /api/jobs/stats/today          # 오늘 등록된 공고 수
```

### 지원서 관리
```http
POST   /api/jobs/{jobId}/apply               # 구인공고 지원
GET    /api/jobs/{jobId}/applications        # 특정 공고의 지원서 목록 (고용주)
GET    /api/jobs/applications/my             # 내 지원서 목록 (구직자)
PUT    /api/jobs/applications/{applicationId}/status     # 지원서 상태 변경 (고용주)
PUT    /api/jobs/applications/{applicationId}/interview  # 면접 일정 설정 (고용주)
DELETE /api/jobs/applications/{applicationId}            # 지원서 취소 (구직자)
```

## 🤖 Chatbot System API

### 기본 정보
- **Base URL**: `/api/chatbot`
- **기능**: Python 챗봇 서버로의 프록시 역할
- **인증**: 선택사항 (공개 API 형태로 동작)

### 챗봇 서비스
```http
GET    /api/chatbot/health             # 챗봇 서비스 상태 확인
GET    /api/chatbot/**                 # 모든 GET 요청 프록시
POST   /api/chatbot/**                 # 모든 POST 요청 프록시
PUT    /api/chatbot/**                 # 모든 PUT 요청 프록시
DELETE /api/chatbot/**                 # 모든 DELETE 요청 프록시
```

### 챗봇 통신 예시
```json
POST /api/chatbot/chat
{
  "message": "안녕하세요, 요양 시설을 찾고 있습니다.",
  "language": "ko",
  "context": {
    "user_type": "family_member",
    "region": "서울특별시"
  }
}
```

## 🔒 인증 및 권한

### 인증 방식
- **JWT 토큰**: Authorization: Bearer {token}
- **토큰 위치**: HTTP Header
- **만료시간**: 1시간 (3600초)

### 권한 레벨
1. **ADMIN**: 모든 API 접근 가능
2. **FACILITY**: 시설 관련 API, 구인공고 관리
3. **COORDINATOR**: 코디네이터 서비스 관련
4. **USER_DOMESTIC**: 국내 사용자, 게시판 이용
5. **USER_OVERSEAS**: 해외 사용자, 전체 서비스 이용
6. **JOB_SEEKER_DOMESTIC**: 국내 구직자
7. **JOB_SEEKER_OVERSEAS**: 해외 구직자

## 📋 공통 응답 형식

### 성공 응답
```json
{
  "data": { ... },
  "message": "성공 메시지",
  "timestamp": "2025-07-28T17:00:00"
}
```

### 오류 응답
```json
{
  "error": "error_code",
  "message": "오류 메시지",
  "details": "상세 오류 정보",
  "timestamp": "2025-07-28T17:00:00"
}
```

### HTTP 상태 코드
- `200 OK`: 성공
- `201 Created`: 생성 성공
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스 없음
- `500 Internal Server Error`: 서버 오류

## 🚀 개발자 참고사항

### 주요 수정사항
1. **Member 엔티티**: `getUsername()` 메서드 추가 (email 반환)
2. **CustomException**: 정적 내부 클래스 사용 (NotFound, Forbidden 등)
3. **JobApplication**: 추가 필드 및 비즈니스 메서드 구현
4. **WebClient**: Spring Boot 3.x 호환성 개선

### 테스트 상태
- **메인 컴파일**: ✅ 성공
- **프론트엔드 빌드**: ✅ 성공  
- **단위 테스트**: ⚠️ 일부 비활성화 (dependency 이슈)
- **통합 테스트**: ✅ Board, Job 시스템 활성화

### 성능 최적화
- **데이터베이스**: H2 파일 기반 (./data/elderberry)
- **캐싱**: Spring Cache 적용
- **페이징**: 모든 목록 API에 Pageable 지원
- **검색**: 키워드 기반 동적 쿼리

---

**📞 지원**: 이슈 발생 시 `docs/troubleshooting/solutions-db.md` 참조  
**🔄 업데이트**: API 변경사항은 자동으로 문서에 반영  
**🏷️ 태그**: `#api-documentation`, `#board-system`, `#job-system`, `#chatbot-proxy`