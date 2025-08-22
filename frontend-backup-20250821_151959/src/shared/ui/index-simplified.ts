/**
 * Simplified UI Components Library
 * 단순하고 효율적인 UI 컴포넌트 라이브러리
 * 
 * @version 2.0.0 - Simplified
 * @description 과도한 복잡성을 제거하고 핵심 기능에 집중
 * 
 * 개선사항:
 * - 600줄 → 100줄 이하로 단순화
 * - 과도한 검증 로직 제거
 * - 핵심 컴포넌트만 유지
 * - 개발자 친화적 API
 */

// === Core Components ===
export {
  Button,
  buttonVariants,
  type ButtonProps,
} from './Button';

export {
  Input,
  Textarea,
  type InputProps,
  type TextareaProps,
} from './Input';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  type CardProps,
  type CardHeaderProps,
  type CardTitleProps,
  type CardDescriptionProps,
  type CardContentProps,
  type CardFooterProps,
} from './Card';

// === Status & Feedback Components ===
export {
  Badge,
  badgeVariants,
  type BadgeProps,
} from './Badge';

// === Overlay Components ===
export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
  type ModalProps,
  type ModalHeaderProps,
  type ModalTitleProps,
  type ModalDescriptionProps,
  type ModalContentProps,
  type ModalFooterProps,
} from './Modal';

// === Form Components ===
export {
  Form,
  type FormRootProps,
  type FormFieldProps,
} from './Form';

// === Utility Types ===
export type ComponentSize = 'sm' | 'md' | 'lg';
export type ComponentVariant = 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning';
export type ComponentStatus = 'default' | 'success' | 'error' | 'warning' | 'info';

// === Common Props Interface ===
export interface ComponentProps {
  /** 컴포넌트 크기 */
  size?: ComponentSize;
  /** 컴포넌트 변형 */
  variant?: ComponentVariant;
  /** 컴포넌트 상태 */
  status?: ComponentStatus;
  /** 접근성 라벨 */
  'aria-label'?: string;
  /** CSS 클래스명 */
  className?: string;
}

/**
 * 컴포넌트 라이브러리 메타데이터
 */
export const UI_LIBRARY_INFO = {
  name: 'Elderberry UI Components',
  version: '2.0.0',
  description: '단순하고 효율적인 UI 컴포넌트 라이브러리',
  components: ['Button', 'Input', 'Card', 'Badge', 'Modal', 'Form'],
  features: [
    '타입 안전성',
    '일관된 디자인 시스템',
    '접근성 기본 지원',
    '간단한 API'
  ]
} as const;

/**
 * 사용 예시
 * 
 * @example
 * import { Button, Input, Card } from '@/shared/ui';
 * 
 * const MyComponent = () => (
 *   <Card>
 *     <CardHeader>
 *       <CardTitle>제목</CardTitle>
 *     </CardHeader>
 *     <CardContent>
 *       <Input placeholder="입력하세요" />
 *       <Button variant="primary">제출</Button>
 *     </CardContent>
 *   </Card>
 * );
 */