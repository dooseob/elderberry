/**
 * 폼 컴포넌트 - Compound Component 패턴 적용
 * React Hook Form과 Zod를 활용한 타입 안전한 폼 구현
 */
import React, { createContext, useContext, forwardRef } from 'react';
import { 
  useForm, 
  FormProvider, 
  UseFormProps, 
  UseFormReturn,
  FieldPath,
  FieldValues,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '../../../lib/utils';
import { ComponentProps } from '../../../types/common';

// 폼 컨텍스트
interface FormContextValue extends UseFormReturn {
  name: string;
}

const FormContext = createContext<FormContextValue | null>(null);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('Form compound components must be used within Form.Root');
  }
  return context;
};

// 폼 루트 컴포넌트
interface FormRootProps<T extends FieldValues = any> extends ComponentProps {
  children: React.ReactNode;
  name: string;
  schema?: z.ZodSchema<T>;
  defaultValues?: Partial<T>;
  onSubmit: (data: T) => void | Promise<void>;
  onError?: (errors: any) => void;
  mode?: UseFormProps<T>['mode'];
}

const FormRoot = <T extends FieldValues>({
  children,
  name,
  schema,
  defaultValues,
  onSubmit,
  onError,
  mode = 'onChange',
  className,
  testId,
}: FormRootProps<T>) => {
  const methods = useForm<T>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
    mode,
  });

  const { handleSubmit } = methods;

  const contextValue: FormContextValue = {
    ...methods,
    name,
  };

  return (
    <FormProvider {...methods}>
      <FormContext.Provider value={contextValue}>
        <form
          onSubmit={handleSubmit(onSubmit, onError)}
          className={cn('space-y-6', className)}
          data-testid={testId}
          noValidate
        >
          {children}
        </form>
      </FormContext.Provider>
    </FormProvider>
  );
};

// 폼 필드 컴포넌트
interface FormFieldProps<T extends FieldValues = any> extends ComponentProps {
  name: FieldPath<T>;
  label?: string;
  description?: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormField = <T extends FieldValues>({
  name,
  label,
  description,
  required,
  children,
  className,
  testId,
}: FormFieldProps<T>) => {
  const { formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <div className={cn('space-y-2', className)} data-testid={testId}>
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {children}
      
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error.message as string}
        </p>
      )}
    </div>
  );
};

// 폼 그룹 컴포넌트
interface FormGroupProps extends ComponentProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

const FormGroup = forwardRef<HTMLDivElement, FormGroupProps>(
  ({ title, description, children, className, testId }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-4', className)}
        data-testid={testId}
      >
        {title && (
          <div className="space-y-1">
            <h3 className="text-lg font-medium">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        <div className="space-y-4">{children}</div>
      </div>
    );
  }
);

FormGroup.displayName = 'FormGroup';

// 폼 액션 컴포넌트
interface FormActionsProps extends ComponentProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

const FormActions = forwardRef<HTMLDivElement, FormActionsProps>(
  ({ children, align = 'right', className, testId }, ref) => {
    const alignClass = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
    };

    return (
      <div
        ref={ref}
        className={cn('flex gap-3', alignClass[align], className)}
        data-testid={testId}
      >
        {children}
      </div>
    );
  }
);

FormActions.displayName = 'FormActions';

// 제출 버튼 컴포넌트
interface FormSubmitProps extends ComponentProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}

const FormSubmit = forwardRef<HTMLButtonElement, FormSubmitProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    disabled, 
    loading,
    className, 
    testId 
  }, ref) => {
    const { formState: { isSubmitting, isValid } } = useFormContext();
    
    const isDisabled = disabled || isSubmitting || loading;
    const showLoading = isSubmitting || loading;

    const variantClass = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-300',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100',
    };

    const sizeClass = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        type="submit"
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:pointer-events-none disabled:opacity-50',
          variantClass[variant],
          sizeClass[size],
          className
        )}
        data-testid={testId}
      >
        {showLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

FormSubmit.displayName = 'FormSubmit';

// 리셋 버튼 컴포넌트
interface FormResetProps extends ComponentProps {
  children: React.ReactNode;
  variant?: 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const FormReset = forwardRef<HTMLButtonElement, FormResetProps>(
  ({ children, variant = 'outline', size = 'md', className, testId }, ref) => {
    const { reset } = useFormContext();

    const variantClass = {
      secondary: 'bg-gray-600 text-white hover:bg-gray-700',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
      ghost: 'text-gray-700 hover:bg-gray-100',
    };

    const sizeClass = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => reset()}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          variantClass[variant],
          sizeClass[size],
          className
        )}
        data-testid={testId}
      >
        {children}
      </button>
    );
  }
);

FormReset.displayName = 'FormReset';

// Compound Component 구성
export const Form = {
  Root: FormRoot,
  Field: FormField,
  Group: FormGroup,
  Actions: FormActions,
  Submit: FormSubmit,
  Reset: FormReset,
};

// 편의성을 위한 기본 내보내기
export default Form;