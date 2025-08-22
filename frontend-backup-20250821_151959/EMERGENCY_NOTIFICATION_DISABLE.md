# 🚨 비상시 NotificationBell 비활성화 가이드

## 상황
홈화면에서 NotificationBell 컴포넌트로 인한 무한 루프 문제가 계속 발생하는 경우

## 즉시 적용 가능한 해결책

### 1. Header.tsx에서 NotificationBell 임시 제거

파일: `/frontend/src/widgets/header/ui/Header.tsx`

**수정 전:**
```tsx
{/* 알림 벨 (로그인 상태에서만 표시) */}
{isAuthenticated && (
  <div className="notification-wrapper">
    <NotificationBell />
    <NotificationPanel />
  </div>
)}
```

**수정 후:**
```tsx
{/* 알림 벨 임시 비활성화 - 무한 루프 문제 해결 중 */}
{isAuthenticated && false && (
  <div className="notification-wrapper">
    <NotificationBell />
    <NotificationPanel />
  </div>
)}
```

### 2. 대체 방안: 정적 알림 아이콘

```tsx
{/* 임시 정적 알림 아이콘 */}
{isAuthenticated && (
  <button 
    className="p-2 rounded-full transition-colors duration-200 hover:bg-gray-100"
    onClick={() => navigate('/notifications')}
  >
    <Bell className="h-6 w-6 text-gray-500 hover:text-gray-700" />
  </button>
)}
```

## 적용 방법

1. 위 코드를 `/frontend/src/widgets/header/ui/Header.tsx` 파일에 적용
2. 브라우저 새로고침
3. 홈화면이 정상적으로 로드되는지 확인

## 복구 방법

문제가 해결되면 `&& false` 부분을 제거하여 원상복구

```tsx
{isAuthenticated && (
  <div className="notification-wrapper">
    <NotificationBell />
    <NotificationPanel />
  </div>
)}
```