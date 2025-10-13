import type { FilterConfig } from "@/components/ui/data-table";

/**
 * Creates a status filter configuration
 * @param statuses - Array of status values to filter by
 * @returns FilterConfig for status filtering
 */
export function createStatusFilter(statuses: string[]): FilterConfig {
  return {
    key: 'status',
    label: 'Status',
    options: statuses.map(status => ({
      label: status.charAt(0).toUpperCase() + status.slice(1),
      value: status
    }))
  };
}

/**
 * Creates an activation status filter configuration
 * Common for user management pages
 */
export function createActivationStatusFilter(): FilterConfig {
  return {
    key: 'activation_status',
    label: 'Status',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Pending', value: 'pending' },
      { label: 'Disabled', value: 'disabled' },
      { label: 'Deleted', value: 'deleted' },
    ]
  };
}

/**
 * Creates a role type filter configuration
 * @param roles - Array of role types to filter by
 */
export function createRoleFilter(roles: string[]): FilterConfig {
  return {
    key: 'role_type',
    label: 'Role',
    options: roles.map(role => ({
      label: role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: role
    }))
  };
}

/**
 * Creates a permission filter configuration
 */
export function createPermissionFilter(): FilterConfig {
  return {
    key: 'permission',
    label: 'Permission',
    options: [
      { label: 'Full Access', value: 'full' },
      { label: 'View Only', value: 'view_only' },
    ]
  };
}

/**
 * Creates a type filter configuration
 * @param types - Array of types to filter by
 * @param label - Label for the filter (defaults to 'Type')
 */
export function createTypeFilter(types: string[], label: string = 'Type'): FilterConfig {
  return {
    key: 'type',
    label,
    options: types.map(type => ({
      label: type,
      value: type
    }))
  };
}

/**
 * Creates a category/subtype filter configuration
 * @param categories - Array of categories to filter by
 * @param label - Label for the filter (defaults to 'Category')
 */
export function createCategoryFilter(categories: string[], label: string = 'Category'): FilterConfig {
  return {
    key: 'category',
    label,
    options: categories.map(category => ({
      label: category,
      value: category
    }))
  };
}

/**
 * Creates a date range filter configuration
 * @param key - The data field key to filter
 * @param label - Label for the filter
 */
export function createDateRangeFilter(key: string, label: string): FilterConfig {
  return {
    key,
    label,
    options: [
      { label: 'Last 7 days', value: '7d' },
      { label: 'Last 30 days', value: '30d' },
      { label: 'Last 90 days', value: '90d' },
      { label: 'Last year', value: '1y' },
      { label: 'All time', value: 'all' },
    ]
  };
}

/**
 * Creates a boolean filter configuration
 * @param key - The data field key to filter
 * @param label - Label for the filter
 * @param trueLabel - Label for true value (defaults to 'Yes')
 * @param falseLabel - Label for false value (defaults to 'No')
 */
export function createBooleanFilter(
  key: string,
  label: string,
  trueLabel: string = 'Yes',
  falseLabel: string = 'No'
): FilterConfig {
  return {
    key,
    label,
    options: [
      { label: trueLabel, value: 'true' },
      { label: falseLabel, value: 'false' },
    ]
  };
}

/**
 * Extracts unique values from data array for a given key
 * @param data - Array of data objects
 * @param key - Key to extract values from
 * @returns Array of unique values
 */
export function extractUniqueValues<T>(data: T[], key: keyof T): string[] {
  return [...new Set(data.map(item => String(item[key])))].filter(Boolean);
}

/**
 * Creates a dynamic filter from data
 * @param data - Array of data objects
 * @param key - Key to create filter for
 * @param label - Label for the filter
 */
export function createDynamicFilter<T>(data: T[], key: keyof T, label: string): FilterConfig {
  const values = extractUniqueValues(data, key);
  return {
    key: String(key),
    label,
    options: values.map(value => ({
      label: value,
      value
    }))
  };
}
