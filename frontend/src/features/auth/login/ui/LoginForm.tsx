/**
 * 로그인 폼 - Presentational Component
 * 순수한 UI 로직만 포함, 비즈니스 로직은 Container에서 처리
 */
import React from 'react';
import { z } from 'zod';
import { Form } from '../../../../shared/components/ui/Form';
import { Input } from '../../../../shared/components/ui/Input';
import { Checkbox } from '../../../../shared/components/ui/Checkbox';
import { ComponentProps } from '../../../../shared/types/common';

// 로그인 폼 스키마
const loginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요')
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Props 인터페이스
interface LoginFormProps extends ComponentProps {
  onSubmit: (data: LoginFormData) => void | Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  defaultValues?: Partial<LoginFormData>;
}

// Presentational Component
export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
  defaultValues = { email: '', password: '', rememberMe: false },
  className,
  testId,
}) => {
  return (
    <div className={className} data-testid={testId}>
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          엘더베리에 로그인
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          요양시설 매칭 서비스를 이용하시려면 로그인해주세요
        </p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        </div>
      )}

      {/* 로그인 폼 */}
      <Form.Root
        name="login-form"
        schema={loginSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        testId="login-form"
      >
        <Form.Field name="email" label="이메일" required>
          <Input
            type="email"
            placeholder="example@email.com"
            autoComplete="email"
            autoFocus
          />
        </Form.Field>

        <Form.Field name="password" label="비밀번호" required>
          <Input
            type="password"
            placeholder="비밀번호를 입력하세요"
            autoComplete="current-password"
          />
        </Form.Field>

        <Form.Field name="rememberMe">
          <Checkbox label="로그인 상태 유지" />
        </Form.Field>

        <Form.Actions>
          <Form.Submit
            loading={isLoading}
            variant="primary"
            size="lg"
            className="w-full"
            testId="login-submit-button"
          >
            로그인
          </Form.Submit>
        </Form.Actions>
      </Form.Root>

      {/* 추가 링크 */}
      <div className="mt-6 text-center space-y-2">
        <a
          href="/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          비밀번호를 잊으셨나요?
        </a>
        <div className="text-sm text-gray-600">
          계정이 없으신가요?{' '}
          <a
            href="/register"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            회원가입
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;