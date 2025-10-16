/**
 * Permission and access control type definitions
 */

import type { UUID, Nullable } from './common';
import type { RoleType, Persona } from './user';

// Permission flags
export interface PermissionsData {
  readonly platform_admin: boolean;
  readonly tenant_read: boolean;
  readonly tenant_write: boolean;
  readonly org_read: boolean;
  readonly org_write: boolean;
  readonly tenant_id: Nullable<UUID>;
  readonly organization_id: Nullable<UUID>;
}

// Capability flags (derived from permissions)
export interface Capabilities {
  readonly canManageUsers: boolean;
  readonly canManageAccounts: boolean;
  readonly canManageOrganizations: boolean;
  readonly canViewAllData: boolean;
  readonly canManageReports: boolean;
  readonly canManageIncidents: boolean;
  readonly canManageSettings: boolean;
  readonly canViewAnalytics: boolean;
  readonly canManageRoles: boolean;
  readonly canManageNotifications: boolean;
  readonly canManageAuditLogs: boolean;
  readonly canSubmitReports: boolean;
}

// Complete permissions context
export interface PermissionsContext extends PermissionsData, Capabilities {
  readonly isPlatformAdmin: boolean;
  readonly isEnterpriseAdmin: boolean;
  readonly isOrganizationAdmin: boolean;
  readonly isPatroller: boolean;
  readonly hasAdminPersona: boolean;
  readonly hasPatrollerPersona: boolean;
  readonly activePersona: Nullable<Persona>;
  readonly activeRole: Nullable<RoleType>;
  readonly profile: Nullable<{
    readonly id: UUID;
    readonly email: string;
    readonly fullName: string;
  }>;
}

// Route protection configuration
export interface RouteProtectionConfig {
  readonly requireAuth: boolean;
  readonly requireRole?: RoleType | readonly RoleType[];
  readonly requireAssignment?: boolean;
  readonly accountType?: 'Enterprise' | 'Organization';
  readonly fallbackPath?: string;
}

// Access check result
export interface AccessCheckResult {
  readonly allowed: boolean;
  readonly reason?: string;
  readonly redirect?: string;
}

// Type guards and validators
export const hasPermission = (
  permissions: PermissionsData,
  required: keyof PermissionsData
): boolean => {
  return Boolean(permissions[required]);
};

export const hasAnyRole = (
  roles: readonly RoleType[],
  required: readonly RoleType[]
): boolean => {
  return required.some(role => roles.includes(role));
};

export const hasAllRoles = (
  roles: readonly RoleType[],
  required: readonly RoleType[]
): boolean => {
  return required.every(role => roles.includes(role));
};

export const canAccessAccount = (
  permissions: PermissionsContext,
  accountType: 'Enterprise' | 'Organization',
  accountId: UUID
): AccessCheckResult => {
  if (permissions.isPlatformAdmin) {
    return { allowed: true };
  }

  if (accountType === 'Enterprise' && permissions.tenant_id === accountId) {
    return { allowed: true };
  }

  if (accountType === 'Organization' && permissions.organization_id === accountId) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'Insufficient permissions to access this account',
    redirect: '/'
  };
};
