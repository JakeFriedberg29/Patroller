/**
 * Common type definitions used across the application
 */

// Branded types for type safety
export type UUID = string & { readonly __brand: 'UUID' };
export type Email = string & { readonly __brand: 'Email' };
export type PhoneNumber = string & { readonly __brand: 'PhoneNumber' };
export type Slug = string & { readonly __brand: 'Slug' };
export type ISODateString = string & { readonly __brand: 'ISODateString' };

// Type guards
export const isValidUUID = (value: string): value is UUID => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

export const isValidEmail = (value: string): value is Email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

export const isValidPhoneNumber = (value: string): value is PhoneNumber => {
  return value.length >= 10 && /^\+?[\d\s-()]+$/.test(value);
};

// Utility types
export type NonEmptyArray<T> = [T, ...T[]];
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Nullable<T> = T | null;
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
export type DeepReadonly<T> = T extends object ? { readonly [P in keyof T]: DeepReadonly<T[P]> } : T;

// Base entity interface
export interface BaseEntity {
  readonly id: UUID;
  readonly created_at: ISODateString;
  readonly updated_at: ISODateString;
}

// Address interface
export interface Address {
  readonly street?: string;
  readonly city?: string;
  readonly state?: string;
  readonly zip?: string;
  readonly country: string;
}

// Pagination types
export interface PaginationParams {
  readonly page: number;
  readonly limit: number;
}

export interface PaginatedResponse<T> {
  readonly data: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}

// API Response types
export type ApiSuccess<T> = {
  readonly success: true;
  readonly data: T;
};

export type ApiError = {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Filter types
export interface FilterOption<T = string> {
  readonly value: T;
  readonly label: string;
}

export interface FilterConfig<T = string> {
  readonly key: string;
  readonly label: string;
  readonly options: readonly FilterOption<T>[];
}

// Sort types
export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T = string> {
  readonly field: T;
  readonly direction: SortDirection;
}
