/**
 * useFormData Hook
 * 폼 데이터 관리와 유효성 검사를 위한 종합적인 Hook
 * 
 * @version 3.0.0
 * @features
 * - 타입 안전 폼 데이터 관리
 * - 실시간 유효성 검사
 * - 중첩 객체 및 배열 지원
 * - 터치/더티 상태 추적
 * - 자동 에러 메시지 생성
 * - 폼 제출 처리
 * - 필드 의존성 검사
 * - React Hook Form 호환 API
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

// === 타입 정의 ===

type FormValue = any;
type FormErrors<T> = Partial<Record<keyof T, string>>;
type FormTouched<T> = Partial<Record<keyof T, boolean>>;
type FormDirty<T> = Partial<Record<keyof T, boolean>>;

interface ValidationRule<T = any> {
  /** 필수 필드 */
  required?: boolean | string;
  /** 최소 길이 */
  minLength?: number | { value: number; message: string };
  /** 최대 길이 */
  maxLength?: number | { value: number; message: string };
  /** 최소값 */
  min?: number | { value: number; message: string };
  /** 최대값 */
  max?: number | { value: number; message: string };
  /** 정규식 패턴 */
  pattern?: RegExp | { value: RegExp; message: string };
  /** 커스텀 유효성 검사 */
  validate?: (value: any, formData: T) => string | boolean | Promise<string | boolean>;
  /** 의존성 검사 */
  deps?: (keyof T)[];
}

type ValidationRules<T> = Partial<Record<keyof T, ValidationRule<T>>>;

interface UseFormDataOptions<T> {
  /** 초기 데이터 */
  initialData?: Partial<T>;
  /** 유효성 검사 규칙 */
  validationRules?: ValidationRules<T>;
  /** 실시간 검사 활성화 */
  validateOnChange?: boolean;
  /** 블러 시 검사 활성화 */
  validateOnBlur?: boolean;
  /** 제출 전 검사 활성화 */
  validateOnSubmit?: boolean;
  /** 에러 메시지 제거 지연 (ms) */
  errorClearDelay?: number;
  /** 폼 제출 핸들러 */
  onSubmit?: (data: T, helpers: FormHelpers<T>) => Promise<void> | void;
  /** 값 변경 콜백 */
  onChange?: (name: keyof T, value: any, formData: T) => void;
  /** 에러 콜백 */
  onError?: (errors: FormErrors<T>) => void;
  /** 성공 콜백 */
  onSuccess?: (data: T) => void;
  /** 데이터 변환 함수 */
  transform?: {
    input?: (data: Partial<T>) => Partial<T>;
    output?: (data: T) => any;
  };
}

interface FormHelpers<T> {
  /** 특정 필드 검증 */
  validateField: (name: keyof T) => Promise<boolean>;
  /** 전체 폼 검증 */
  validateForm: () => Promise<boolean>;
  /** 필드 에러 설정 */
  setFieldError: (name: keyof T, error: string | null) => void;
  /** 전체 에러 설정 */
  setErrors: (errors: FormErrors<T>) => void;
  /** 필드 값 설정 */
  setFieldValue: (name: keyof T, value: any) => void;
  /** 전체 값 설정 */
  setValues: (data: Partial<T>) => void;
  /** 필드 터치 상태 설정 */
  setFieldTouched: (name: keyof T, touched: boolean) => void;
  /** 폼 리셋 */
  reset: (data?: Partial<T>) => void;
  /** 폼 초기화 */
  clear: () => void;
}

interface FormState<T> {
  /** 현재 폼 데이터 */
  values: Partial<T>;
  /** 에러 메시지 */
  errors: FormErrors<T>;
  /** 터치된 필드 */
  touched: FormTouched<T>;
  /** 변경된 필드 */
  dirty: FormDirty<T>;
  /** 제출 중 상태 */
  isSubmitting: boolean;
  /** 검증 중 상태 */
  isValidating: boolean;
  /** 유효성 상태 */
  isValid: boolean;
  /** 변경 여부 */
  isDirty: boolean;
  /** 터치 여부 */
  isTouched: boolean;
  /** 제출 시도 횟수 */
  submitCount: number;
}

interface FormHandlers<T> {
  /** 값 변경 핸들러 */
  handleChange: (name: keyof T) => (value: any) => void;
  /** 블러 핸들러 */
  handleBlur: (name: keyof T) => () => void;
  /** 제출 핸들러 */
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  /** 리셋 핸들러 */
  handleReset: () => void;
}

type UseFormDataResult<T> = FormState<T> & FormHandlers<T> & FormHelpers<T>;

// === 기본 검증 함수들 ===

const defaultValidators = {
  required: (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return !!value;
  },

  minLength: (value: any, min: number): boolean => {
    if (typeof value === 'string') return value.length >= min;
    if (Array.isArray(value)) return value.length >= min;
    return true;
  },

  maxLength: (value: any, max: number): boolean => {
    if (typeof value === 'string') return value.length <= max;
    if (Array.isArray(value)) return value.length <= max;
    return true;
  },

  min: (value: any, min: number): boolean => {
    const num = Number(value);
    return !isNaN(num) && num >= min;
  },

  max: (value: any, max: number): boolean => {
    const num = Number(value);
    return !isNaN(num) && num <= max;
  },

  pattern: (value: any, pattern: RegExp): boolean => {
    if (typeof value !== 'string') return false;
    return pattern.test(value);
  },
};

// === 일반적인 검증 패턴들 ===
export const validationPatterns = {
  email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  phone: /^[0-9-+().\s]+$/,
  url: /^https?:\/\/(?:[-\w.])+(?:[:\d]+)?(?:\/(?:[\w._~!$&'()*+,;=:@]|%[\dA-F]{2})*)*(?:\?(?:[\w._~!$&'()*+,;=:@/?]|%[\dA-F]{2})*)?(?:#(?:[\w._~!$&'()*+,;=:@/?]|%[\dA-F]{2})*)?$/,
  korean: /^[가-힣\s]*$/,
  alphanumeric: /^[A-Za-z0-9]*$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
};

// === 일반적인 검증 규칙들 ===
export const commonValidations = {
  email: {
    required: true,
    pattern: { value: validationPatterns.email, message: '유효한 이메일 주소를 입력해주세요.' },
  },
  
  password: {
    required: true,
    minLength: { value: 8, message: '비밀번호는 최소 8자 이상이어야 합니다.' },
    pattern: { value: validationPatterns.strongPassword, message: '대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.' },
  },
  
  phone: {
    required: true,
    pattern: { value: validationPatterns.phone, message: '유효한 전화번호를 입력해주세요.' },
  },
  
  name: {
    required: true,
    minLength: { value: 2, message: '이름은 2자 이상이어야 합니다.' },
    maxLength: { value: 50, message: '이름은 50자를 초과할 수 없습니다.' },
  },
  
  age: {
    required: true,
    min: { value: 1, message: '나이는 1 이상이어야 합니다.' },
    max: { value: 150, message: '나이는 150 이하여야 합니다.' },
  },
};

// === 유틸리티 함수들 ===

const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const setNestedValue = (obj: any, path: string, value: any): any => {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!(key in current)) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
  return { ...obj };
};

const formatErrorMessage = (rule: ValidationRule, fieldName: string): string => {
  if (typeof rule.required === 'string') return rule.required;
  if (rule.required) return `${fieldName}은(는) 필수 항목입니다.`;
  
  if (rule.minLength) {
    const message = typeof rule.minLength === 'object' ? rule.minLength.message : `최소 ${rule.minLength}자 이상 입력해주세요.`;
    return message;
  }
  
  if (rule.maxLength) {
    const message = typeof rule.maxLength === 'object' ? rule.maxLength.message : `최대 ${rule.maxLength}자까지만 입력 가능합니다.`;
    return message;
  }
  
  if (rule.min) {
    const message = typeof rule.min === 'object' ? rule.min.message : `${rule.min} 이상의 값을 입력해주세요.`;
    return message;
  }
  
  if (rule.max) {
    const message = typeof rule.max === 'object' ? rule.max.message : `${rule.max} 이하의 값을 입력해주세요.`;
    return message;
  }
  
  if (rule.pattern) {
    const message = typeof rule.pattern === 'object' ? rule.pattern.message : `올바른 형식으로 입력해주세요.`;
    return message;
  }
  
  return `${fieldName}이(가) 유효하지 않습니다.`;
};

// === 메인 Hook ===
export const useFormData = <T extends Record<string, any> = any>(
  options: UseFormDataOptions<T> = {}
): UseFormDataResult<T> => {
  const {
    initialData = {} as Partial<T>,
    validationRules = {},
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true,
    errorClearDelay = 5000,
    onSubmit,
    onChange,
    onError,
    onSuccess,
    transform,
  } = options;

  // === 상태 관리 ===
  const [state, setState] = useState<FormState<T>>(() => ({
    values: transform?.input ? transform.input(initialData) : initialData,
    errors: {},
    touched: {},
    dirty: {},
    isSubmitting: false,
    isValidating: false,
    isValid: true,
    isDirty: false,
    isTouched: false,
    submitCount: 0,
  }));

  // === Refs ===
  const initialDataRef = useRef(initialData);
  const errorTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
  const validationPromisesRef = useRef<Record<string, Promise<boolean>>>({});

  // === 상태 계산 ===
  const computedState = useMemo(() => ({
    ...state,
    isValid: Object.keys(state.errors).length === 0,
    isDirty: Object.keys(state.dirty).some(key => state.dirty[key as keyof T]),
    isTouched: Object.keys(state.touched).some(key => state.touched[key as keyof T]),
  }), [state]);

  // === 유틸리티 함수들 ===
  const updateState = useCallback((updater: (prev: FormState<T>) => FormState<T>) => {
    setState(updater);
  }, []);

  const clearErrorTimeout = useCallback((fieldName: string) => {
    if (errorTimeoutsRef.current[fieldName]) {
      clearTimeout(errorTimeoutsRef.current[fieldName]);
      delete errorTimeoutsRef.current[fieldName];
    }
  }, []);

  const setErrorTimeout = useCallback((fieldName: string) => {
    if (errorClearDelay > 0) {
      clearErrorTimeout(fieldName);
      errorTimeoutsRef.current[fieldName] = setTimeout(() => {
        updateState(prev => ({
          ...prev,
          errors: { ...prev.errors, [fieldName]: undefined },
        }));
        delete errorTimeoutsRef.current[fieldName];
      }, errorClearDelay);
    }
  }, [errorClearDelay, clearErrorTimeout, updateState]);

  // === 필드 검증 ===
  const validateField = useCallback(
    async (name: keyof T): Promise<boolean> => {
      const rule = validationRules[name];
      if (!rule) return true;

      const value = state.values[name];
      const fieldName = String(name);

      // 진행 중인 검증이 있으면 기다림
      if (validationPromisesRef.current[fieldName]) {
        return validationPromisesRef.current[fieldName];
      }

      const validationPromise = (async (): Promise<boolean> => {
        try {
          // Required 검증
          if (rule.required && !defaultValidators.required(value)) {
            const errorMessage = formatErrorMessage(rule, fieldName);
            updateState(prev => ({
              ...prev,
              errors: { ...prev.errors, [name]: errorMessage },
            }));
            setErrorTimeout(fieldName);
            return false;
          }

          // 값이 있을 때만 다른 검증 수행
          if (value !== null && value !== undefined && value !== '') {
            // MinLength 검증
            if (rule.minLength) {
              const minValue = typeof rule.minLength === 'object' ? rule.minLength.value : rule.minLength;
              if (!defaultValidators.minLength(value, minValue)) {
                const errorMessage = formatErrorMessage(rule, fieldName);
                updateState(prev => ({
                  ...prev,
                  errors: { ...prev.errors, [name]: errorMessage },
                }));
                setErrorTimeout(fieldName);
                return false;
              }
            }

            // MaxLength 검증
            if (rule.maxLength) {
              const maxValue = typeof rule.maxLength === 'object' ? rule.maxLength.value : rule.maxLength;
              if (!defaultValidators.maxLength(value, maxValue)) {
                const errorMessage = formatErrorMessage(rule, fieldName);
                updateState(prev => ({
                  ...prev,
                  errors: { ...prev.errors, [name]: errorMessage },
                }));
                setErrorTimeout(fieldName);
                return false;
              }
            }

            // Min 검증
            if (rule.min) {
              const minValue = typeof rule.min === 'object' ? rule.min.value : rule.min;
              if (!defaultValidators.min(value, minValue)) {
                const errorMessage = formatErrorMessage(rule, fieldName);
                updateState(prev => ({
                  ...prev,
                  errors: { ...prev.errors, [name]: errorMessage },
                }));
                setErrorTimeout(fieldName);
                return false;
              }
            }

            // Max 검증
            if (rule.max) {
              const maxValue = typeof rule.max === 'object' ? rule.max.value : rule.max;
              if (!defaultValidators.max(value, maxValue)) {
                const errorMessage = formatErrorMessage(rule, fieldName);
                updateState(prev => ({
                  ...prev,
                  errors: { ...prev.errors, [name]: errorMessage },
                }));
                setErrorTimeout(fieldName);
                return false;
              }
            }

            // Pattern 검증
            if (rule.pattern) {
              const patternValue = typeof rule.pattern === 'object' ? rule.pattern.value : rule.pattern;
              if (!defaultValidators.pattern(value, patternValue)) {
                const errorMessage = formatErrorMessage(rule, fieldName);
                updateState(prev => ({
                  ...prev,
                  errors: { ...prev.errors, [name]: errorMessage },
                }));
                setErrorTimeout(fieldName);
                return false;
              }
            }

            // 커스텀 검증
            if (rule.validate) {
              const result = await rule.validate(value, state.values as T);
              if (result !== true) {
                const errorMessage = typeof result === 'string' ? result : `${fieldName}이(가) 유효하지 않습니다.`;
                updateState(prev => ({
                  ...prev,
                  errors: { ...prev.errors, [name]: errorMessage },
                }));
                setErrorTimeout(fieldName);
                return false;
              }
            }
          }

          // 검증 성공 - 에러 제거
          clearErrorTimeout(fieldName);
          updateState(prev => ({
            ...prev,
            errors: { ...prev.errors, [name]: undefined },
          }));
          
          return true;
        } finally {
          delete validationPromisesRef.current[fieldName];
        }
      })();

      validationPromisesRef.current[fieldName] = validationPromise;
      return validationPromise;
    },
    [validationRules, state.values, updateState, setErrorTimeout, clearErrorTimeout]
  );

  // === 전체 폼 검증 ===
  const validateForm = useCallback(async (): Promise<boolean> => {
    updateState(prev => ({ ...prev, isValidating: true }));

    try {
      const fieldNames = Object.keys(validationRules) as (keyof T)[];
      const results = await Promise.all(
        fieldNames.map(name => validateField(name))
      );

      const isValid = results.every(result => result);

      // 의존성 검증
      for (const [fieldName, rule] of Object.entries(validationRules) as [keyof T, ValidationRule<T>][]) {
        if (rule.deps) {
          const dependentFields = rule.deps;
          const shouldRevalidate = dependentFields.some(depField => {
            const currentValue = state.values[depField];
            const initialValue = initialDataRef.current[depField];
            return currentValue !== initialValue;
          });

          if (shouldRevalidate) {
            await validateField(fieldName);
          }
        }
      }

      return isValid && Object.keys(state.errors).length === 0;
    } finally {
      updateState(prev => ({ ...prev, isValidating: false }));
    }
  }, [validationRules, validateField, state.errors, state.values]);

  // === 값 변경 핸들러 ===
  const handleChange = useCallback(
    (name: keyof T) => (value: any) => {
      const newValues = { ...state.values, [name]: value };

      updateState(prev => ({
        ...prev,
        values: newValues,
        dirty: { ...prev.dirty, [name]: true },
      }));

      // 변경 콜백
      onChange?.(name, value, newValues as T);

      // 실시간 검증
      if (validateOnChange && state.touched[name]) {
        validateField(name);
      }
    },
    [state.values, state.touched, updateState, onChange, validateOnChange, validateField]
  );

  // === 블러 핸들러 ===
  const handleBlur = useCallback(
    (name: keyof T) => () => {
      updateState(prev => ({
        ...prev,
        touched: { ...prev.touched, [name]: true },
      }));

      // 블러 시 검증
      if (validateOnBlur) {
        validateField(name);
      }
    },
    [updateState, validateOnBlur, validateField]
  );

  // === 제출 핸들러 ===
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      updateState(prev => ({
        ...prev,
        isSubmitting: true,
        submitCount: prev.submitCount + 1,
        touched: Object.keys(validationRules).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          prev.touched
        ),
      }));

      try {
        // 제출 전 검증
        if (validateOnSubmit) {
          const isValid = await validateForm();
          if (!isValid) {
            onError?.(state.errors);
            return;
          }
        }

        // 데이터 변환 및 제출
        const submitData = transform?.output 
          ? transform.output(state.values as T)
          : (state.values as T);

        await onSubmit?.(submitData, {
          validateField,
          validateForm,
          setFieldError,
          setErrors,
          setFieldValue,
          setValues,
          setFieldTouched,
          reset,
          clear,
        });

        onSuccess?.(submitData);
      } catch (error) {
        console.error('Form submission error:', error);
        if (error instanceof Error) {
          setFieldError('submit' as keyof T, error.message);
        }
      } finally {
        updateState(prev => ({ ...prev, isSubmitting: false }));
      }
    },
    [validationRules, validateOnSubmit, validateForm, state.errors, state.values, onError, onSubmit, onSuccess, transform, updateState]
  );

  // === 헬퍼 함수들 ===
  const setFieldError = useCallback((name: keyof T, error: string | null) => {
    clearErrorTimeout(String(name));
    updateState(prev => ({
      ...prev,
      errors: { ...prev.errors, [name]: error || undefined },
    }));
    if (error) {
      setErrorTimeout(String(name));
    }
  }, [clearErrorTimeout, updateState, setErrorTimeout]);

  const setErrors = useCallback((errors: FormErrors<T>) => {
    Object.keys(errorTimeoutsRef.current).forEach(clearErrorTimeout);
    updateState(prev => ({ ...prev, errors }));
    Object.keys(errors).forEach(key => {
      if (errors[key as keyof T]) {
        setErrorTimeout(key);
      }
    });
  }, [clearErrorTimeout, updateState, setErrorTimeout]);

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    updateState(prev => ({
      ...prev,
      values: { ...prev.values, [name]: value },
      dirty: { ...prev.dirty, [name]: true },
    }));
  }, [updateState]);

  const setValues = useCallback((data: Partial<T>) => {
    const transformedData = transform?.input ? transform.input(data) : data;
    updateState(prev => ({
      ...prev,
      values: { ...prev.values, ...transformedData },
      dirty: Object.keys(data).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        prev.dirty
      ),
    }));
  }, [transform, updateState]);

  const setFieldTouched = useCallback((name: keyof T, touched: boolean) => {
    updateState(prev => ({
      ...prev,
      touched: { ...prev.touched, [name]: touched },
    }));
  }, [updateState]);

  const reset = useCallback((data?: Partial<T>) => {
    const resetData = data || initialDataRef.current;
    const transformedData = transform?.input ? transform.input(resetData) : resetData;
    
    Object.keys(errorTimeoutsRef.current).forEach(clearErrorTimeout);
    
    updateState(() => ({
      values: transformedData,
      errors: {},
      touched: {},
      dirty: {},
      isSubmitting: false,
      isValidating: false,
      isValid: true,
      isDirty: false,
      isTouched: false,
      submitCount: 0,
    }));
  }, [transform, clearErrorTimeout, updateState]);

  const clear = useCallback(() => {
    Object.keys(errorTimeoutsRef.current).forEach(clearErrorTimeout);
    
    updateState(() => ({
      values: {} as Partial<T>,
      errors: {},
      touched: {},
      dirty: {},
      isSubmitting: false,
      isValidating: false,
      isValid: true,
      isDirty: false,
      isTouched: false,
      submitCount: 0,
    }));
  }, [clearErrorTimeout, updateState]);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  // === 의존성 검증 처리 ===
  useEffect(() => {
    const dependentFields = Object.entries(validationRules)
      .filter(([, rule]) => rule.deps)
      .map(([fieldName, rule]) => ({ fieldName: fieldName as keyof T, deps: rule.deps! }));

    if (dependentFields.length === 0) return;

    const changedFields = Object.keys(state.dirty).filter(key => state.dirty[key as keyof T]);
    
    for (const { fieldName, deps } of dependentFields) {
      if (deps.some(dep => changedFields.includes(String(dep))) && state.touched[fieldName]) {
        validateField(fieldName);
      }
    }
  }, [state.dirty, state.touched, validationRules, validateField]);

  // === 정리 작업 ===
  useEffect(() => {
    return () => {
      Object.values(errorTimeoutsRef.current).forEach(clearTimeout);
    };
  }, []);

  // === 반환값 ===
  return {
    ...computedState,
    handleChange,
    handleBlur,
    handleSubmit,
    handleReset,
    validateField,
    validateForm,
    setFieldError,
    setErrors,
    setFieldValue,
    setValues,
    setFieldTouched,
    reset,
    clear,
  };
};

// === 특수 Hook들 ===

/**
 * 간단한 폼을 위한 경량 Hook
 */
export const useSimpleForm = <T extends Record<string, any>>(
  initialData: Partial<T> = {},
  onSubmit?: (data: T) => void | Promise<void>
) => {
  const [values, setValues] = useState<Partial<T>>(initialData);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // 에러 클리어
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!onSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values as T);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialData);
    setErrors({});
    setIsSubmitting(false);
  }, [initialData]);

  return {
    values,
    errors,
    isSubmitting,
    setValue,
    setErrors,
    handleSubmit,
    reset,
  };
};

/**
 * 배열 필드 관리를 위한 Hook
 */
export const useFieldArray = <T = any>(
  name: string,
  control?: any // react-hook-form과의 호환성을 위해
) => {
  const [fields, setFields] = useState<T[]>([]);

  const append = useCallback((value: T) => {
    setFields(prev => [...prev, value]);
  }, []);

  const prepend = useCallback((value: T) => {
    setFields(prev => [value, ...prev]);
  }, []);

  const remove = useCallback((index: number) => {
    setFields(prev => prev.filter((_, i) => i !== index));
  }, []);

  const insert = useCallback((index: number, value: T) => {
    setFields(prev => [
      ...prev.slice(0, index),
      value,
      ...prev.slice(index),
    ]);
  }, []);

  const update = useCallback((index: number, value: T) => {
    setFields(prev => prev.map((item, i) => i === index ? value : item));
  }, []);

  const move = useCallback((from: number, to: number) => {
    setFields(prev => {
      const newFields = [...prev];
      const [movedItem] = newFields.splice(from, 1);
      newFields.splice(to, 0, movedItem);
      return newFields;
    });
  }, []);

  const swap = useCallback((indexA: number, indexB: number) => {
    setFields(prev => {
      const newFields = [...prev];
      [newFields[indexA], newFields[indexB]] = [newFields[indexB], newFields[indexA]];
      return newFields;
    });
  }, []);

  return {
    fields,
    append,
    prepend,
    remove,
    insert,
    update,
    move,
    swap,
  };
};

export default useFormData;