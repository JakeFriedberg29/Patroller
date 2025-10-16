/**
 * Central export point for all type definitions
 * 
 * Import types like this:
 * import type { User, Account, ReportTemplate } from '@/types';
 * 
 * Or import specific modules:
 * import type { UserStatus, RoleType } from '@/types/user';
 */

// Re-export all types
export * from './common';
export * from './user';
export * from './account';
export * from './report';
export * from './audit';
export * from './analytics';
export * from './permissions';

// Type utilities
export type { Database } from '@/integrations/supabase/types';

// Common type combinations
export type { 
  User,
  UserWithRoles,
  UserProfile,
} from './user';

export type {
  Enterprise,
  Organization,
  Account,
} from './account';

export type {
  ReportTemplate,
  ReportSubmission,
  FieldSchema,
  TemplateSchema,
} from './report';

export type {
  AuditLog,
  AuditLogEntry,
  SecurityEvent,
  Notification,
} from './audit';

export type {
  GlobalDashboardData,
  OrganizationAnalyticsData,
  EnterpriseAnalyticsData,
} from './analytics';

export type {
  PermissionsContext,
  Capabilities,
  RouteProtectionConfig,
} from './permissions';
