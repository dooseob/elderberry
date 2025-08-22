/**
 * 타입 안전성 검증을 위한 유틸리티 함수들
 * 런타임에서 타입 검증과 안전한 타입 변환을 제공
 */

// 기본 타입 검증 함수들
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

export function isNull(value: unknown): value is null {
  return value === null;
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

// 복합 타입 검증 함수들
export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

export function isNonNegativeNumber(value: unknown): value is number {
  return isNumber(value) && value >= 0;
}

export function isInteger(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value);
}

export function isPositiveInteger(value: unknown): value is number {
  return isInteger(value) && value > 0;
}

export function isArrayOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T
): value is T[] {
  return isArray(value) && value.every(guard);
}

export function isNonEmptyArray<T>(value: unknown): value is [T, ...T[]] {
  return isArray<T>(value) && value.length > 0;
}

// 객체 속성 검증 함수들
export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return isObject(obj) && key in obj;
}

export function hasStringProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, string> {
  return hasProperty(obj, key) && isString(obj[key]);
}

export function hasNumberProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, number> {
  return hasProperty(obj, key) && isNumber(obj[key]);
}

export function hasBooleanProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, boolean> {
  return hasProperty(obj, key) && isBoolean(obj[key]);
}

export function hasArrayProperty<K extends string, T>(
  obj: unknown,
  key: K
): obj is Record<K, T[]> {
  return hasProperty(obj, key) && isArray<T>(obj[key]);
}

export function hasObjectProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, Record<string, unknown>> {
  return hasProperty(obj, key) && isObject(obj[key]);
}

// 다중 속성 검증
export function hasRequiredProperties<T extends Record<string, unknown>>(
  obj: unknown,
  keys: (keyof T)[]
): obj is T {
  if (!isObject(obj)) return false;
  return keys.every(key => key in obj);
}

// 날짜 관련 검증
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

export function isValidDateString(value: unknown): value is string {
  if (!isString(value)) return false;
  const date = new Date(value);
  return isDate(date);
}

export function isISODateString(value: unknown): value is string {
  if (!isString(value)) return false;
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  return isoRegex.test(value);
}

// 이메일 검증
export function isEmail(value: unknown): value is string {
  if (!isString(value)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

// URL 검증
export function isUrl(value: unknown): value is string {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

// UUID 검증
export function isUuid(value: unknown): value is string {
  if (!isString(value)) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

// JSON 검증
export function isValidJSON(value: unknown): value is string {
  if (!isString(value)) return false;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

// Promise 검증
export function isPromise<T = unknown>(value: unknown): value is Promise<T> {
  return value instanceof Promise || (
    isObject(value) && 
    isFunction((value as any).then) && 
    isFunction((value as any).catch)
  );
}

// 에러 검증
export function isError(value: unknown): value is Error {
  return value instanceof Error || (
    isObject(value) &&
    hasStringProperty(value, 'message') &&
    hasStringProperty(value, 'name')
  );
}

// React 관련 검증
export function isReactElement(value: unknown): value is React.ReactElement {
  return (
    isObject(value) &&
    hasProperty(value, '$$typeof') &&
    hasProperty(value, 'type') &&
    hasProperty(value, 'props')
  );
}

// 열거형 검증
export function isOneOf<T extends readonly unknown[]>(
  value: unknown,
  allowedValues: T
): value is T[number] {
  return allowedValues.includes(value);
}

// 문자열 열거형 검증
export function isStringEnum<T extends Record<string, string>>(
  value: unknown,
  enumObject: T
): value is T[keyof T] {
  return isString(value) && Object.values(enumObject).includes(value);
}

// 숫자 열거형 검증
export function isNumberEnum<T extends Record<string, number>>(
  value: unknown,
  enumObject: T
): value is T[keyof T] {
  return isNumber(value) && Object.values(enumObject).includes(value);
}

// 안전한 타입 변환 함수들
export function toString(value: unknown, defaultValue = ''): string {
  if (isString(value)) return value;
  if (isNumber(value)) return value.toString();
  if (isBoolean(value)) return value.toString();
  return defaultValue;
}

export function toNumber(value: unknown, defaultValue = 0): number {
  if (isNumber(value)) return value;
  if (isString(value)) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

export function toBoolean(value: unknown, defaultValue = false): boolean {
  if (isBoolean(value)) return value;
  if (isString(value)) {
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === '1' || lower === 'yes') return true;
    if (lower === 'false' || lower === '0' || lower === 'no') return false;
  }
  if (isNumber(value)) {
    return value !== 0;
  }
  return defaultValue;
}

export function toDate(value: unknown, defaultValue?: Date): Date | undefined {
  if (isDate(value)) return value;
  if (isString(value) || isNumber(value)) {
    const date = new Date(value);
    return isDate(date) ? date : defaultValue;
  }
  return defaultValue;
}

export function toArray<T>(value: unknown, defaultValue: T[] = []): T[] {
  if (isArray<T>(value)) return value;
  if (isDefined(value)) return [value as T];
  return defaultValue;
}

// 깊은 복사 (타입 안전)
export function deepClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  
  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }
  
  if (value instanceof Array) {
    return value.map(item => deepClone(item)) as T;
  }
  
  if (typeof value === 'object') {
    const cloned = {} as T;
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        cloned[key] = deepClone(value[key]);
      }
    }
    return cloned;
  }
  
  return value;
}

// 객체 병합 (타입 안전)
export function safeMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key) && isDefined(source[key])) {
      result[key] = source[key] as T[Extract<keyof T, string>];
    }
  }
  
  return result;
}

// 중첩된 속성 안전 접근
export function getNestedProperty<T>(
  obj: unknown,
  path: string,
  defaultValue?: T
): T | undefined {
  if (!isObject(obj)) return defaultValue;
  
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (!isObject(current) || !(key in current)) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current as T;
}

// 배열의 안전한 접근
export function safeArrayAccess<T>(
  array: unknown,
  index: number,
  defaultValue?: T
): T | undefined {
  if (!isArray<T>(array) || !isInteger(index) || index < 0 || index >= array.length) {
    return defaultValue;
  }
  return array[index];
}

// 타입 변환 검증
export function assertIsString(value: unknown, message?: string): asserts value is string {
  if (!isString(value)) {
    throw new TypeError(message || `Expected string, got ${typeof value}`);
  }
}

export function assertIsNumber(value: unknown, message?: string): asserts value is number {
  if (!isNumber(value)) {
    throw new TypeError(message || `Expected number, got ${typeof value}`);
  }
}

export function assertIsObject(value: unknown, message?: string): asserts value is Record<string, unknown> {
  if (!isObject(value)) {
    throw new TypeError(message || `Expected object, got ${typeof value}`);
  }
}

export function assertIsArray<T>(value: unknown, message?: string): asserts value is T[] {
  if (!isArray<T>(value)) {
    throw new TypeError(message || `Expected array, got ${typeof value}`);
  }
}

// 런타임 스키마 검증 (간단한 형태)
export interface Schema {
  [key: string]: (value: unknown) => boolean;
}

export function validateSchema<T extends Record<string, unknown>>(
  obj: unknown,
  schema: Schema
): obj is T {
  if (!isObject(obj)) return false;
  
  for (const [key, validator] of Object.entries(schema)) {
    if (!(key in obj) || !validator(obj[key])) {
      return false;
    }
  }
  
  return true;
}

// 조건부 타입 검증
export function when<T, U>(
  condition: boolean,
  thenGuard: (value: unknown) => value is T,
  elseGuard: (value: unknown) => value is U
) {
  return (value: unknown): value is T | U => {
    return condition ? thenGuard(value) : elseGuard(value);
  };
}

// 선택적 타입 검증
export function optional<T>(
  guard: (value: unknown) => value is T
) {
  return (value: unknown): value is T | undefined => {
    return isUndefined(value) || guard(value);
  };
}

// nullable 타입 검증
export function nullable<T>(
  guard: (value: unknown) => value is T
) {
  return (value: unknown): value is T | null => {
    return isNull(value) || guard(value);
  };
}

// 타입 변환기 인터페이스
export interface TypeConverter<T, U> {
  guard: (value: unknown) => value is T;
  convert: (value: T) => U;
  defaultValue: U;
}

// 안전한 타입 변환
export function safeConvert<T, U>(
  value: unknown,
  converter: TypeConverter<T, U>
): U {
  if (converter.guard(value)) {
    try {
      return converter.convert(value);
    } catch {
      return converter.defaultValue;
    }
  }
  return converter.defaultValue;
}