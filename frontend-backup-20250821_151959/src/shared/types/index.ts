/**
 * 공유 타입 통합 내보내기
 * Feature-Sliced Design 구조에 맞춘 타입 정의
 */

// 공통 타입
export * from './common';

// 기존 타입들 (호환성 유지를 위해 재내보내기)
export * from '../../types/api';
export * from '../../types/errors';
export * from '../../types/components';

// 도메인별 공통 타입들은 각 entity에서 관리
// 순환 참조 방지를 위해 여기서는 공통 타입만 내보내기