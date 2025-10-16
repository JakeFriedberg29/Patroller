/**
 * UUID Validation Utilities
 * 
 * Provides consistent UUID validation across the application to prevent
 * "undefined" or invalid UUID errors that cause database failures.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates if a value is a properly formatted UUID
 * @param value - The value to validate
 * @returns true if value is a valid UUID, false otherwise
 */
export function isValidUUID(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (!value || value === 'undefined' || value === 'null') return false;
  if (value.length !== 36) return false;
  return UUID_REGEX.test(value);
}

/**
 * Asserts that a value is a valid UUID, throwing an error if not
 * @param value - The value to validate
 * @param fieldName - The name of the field being validated (for error messages)
 * @throws Error if the value is not a valid UUID
 */
export function assertValidUUID(value: unknown, fieldName: string = 'ID'): asserts value is string {
  if (!isValidUUID(value)) {
    throw new Error(`Invalid ${fieldName}: expected a valid UUID but received ${JSON.stringify(value)}`);
  }
}

/**
 * Safely gets a UUID from an object property, returning null if invalid
 * @param obj - The object containing the UUID
 * @param key - The property key
 * @returns The UUID string if valid, null otherwise
 */
export function getValidUUID<T>(obj: T, key: keyof T): string | null {
  const value = obj[key];
  return isValidUUID(value) ? value : null;
}

/**
 * Filters an array of items to only those with valid IDs
 * @param items - Array of items with id properties
 * @returns Filtered array containing only items with valid UUID ids
 */
export function filterValidIds<T extends { id: unknown }>(items: T[]): Array<T & { id: string }> {
  return items.filter((item): item is T & { id: string } => isValidUUID(item.id));
}

/**
 * Creates user-friendly error messages for common UUID validation failures
 */
export const UUID_ERROR_MESSAGES = {
  INVALID_USER: 'Invalid user ID. The user may not exist or the data is corrupted.',
  INVALID_ACCOUNT: 'Invalid account ID. Please refresh the page and try again.',
  INVALID_ORGANIZATION: 'Invalid organization ID. Please select a valid organization.',
  INVALID_TENANT: 'Invalid tenant ID. Please contact support.',
  MISSING_ID: 'Required ID is missing. Please refresh the page and try again.',
  OPERATION_FAILED: 'Operation failed due to invalid data. Please try again.',
} as const;
