/**
 * UUID Validation Middleware
 * 
 * Validates UUIDs at application boundaries to prevent invalid data
 * from propagating through the system.
 */

import { isValidUUID, assertValidUUID, UUID_ERROR_MESSAGES } from './uuidValidation';
import { toast } from 'sonner';

/**
 * Validates a UUID parameter from route or props
 * Shows error toast and returns null if invalid
 */
export function validateRouteUUID(
  value: unknown,
  fieldName: string = 'ID'
): string | null {
  if (!isValidUUID(value)) {
    console.error(`Invalid ${fieldName} in route:`, value);
    toast.error(UUID_ERROR_MESSAGES.MISSING_ID);
    return null;
  }
  return value;
}

/**
 * Validates multiple UUID fields in an object
 * Throws error if any are invalid
 */
export function validateUUIDFields<T extends Record<string, unknown>>(
  obj: T,
  fields: Array<keyof T>
): void {
  for (const field of fields) {
    const value = obj[field];
    if (value !== null && value !== undefined) {
      assertValidUUID(value, String(field));
    }
  }
}

/**
 * Safely extracts UUID from database query result
 * Returns null if invalid instead of throwing
 */
export function safeExtractUUID(
  data: any,
  path: string
): string | null {
  const parts = path.split('.');
  let value = data;
  
  for (const part of parts) {
    if (value == null) return null;
    value = value[part];
  }
  
  return isValidUUID(value) ? value : null;
}

/**
 * Validates form data before submission
 * Returns validation errors or null if valid
 */
export function validateFormUUIDs(
  formData: Record<string, unknown>,
  uuidFields: string[]
): string | null {
  for (const field of uuidFields) {
    const value = formData[field];
    
    // Skip optional fields
    if (value === null || value === undefined || value === '') {
      continue;
    }
    
    if (!isValidUUID(value)) {
      return `Invalid ${field}. Please refresh the page and try again.`;
    }
  }
  
  return null;
}

/**
 * Wraps a function to validate UUID parameters before execution
 */
export function withUUIDValidation<T extends (...args: any[]) => any>(
  fn: T,
  paramIndices: number[]
): T {
  return ((...args: Parameters<T>) => {
    for (const index of paramIndices) {
      if (index < args.length) {
        assertValidUUID(args[index], `parameter ${index}`);
      }
    }
    return fn(...args);
  }) as T;
}
