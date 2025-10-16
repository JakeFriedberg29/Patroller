/**
 * User-related type definitions
 */

import type { BaseEntity, UUID, Email, PhoneNumber, ISODateString, Nullable } from './common';

// User status enum
export type UserStatus = 'pending' | 'active' | 'disabled' | 'deleted';

// Role types
export type RoleType = 
  | 'platform_admin'
  | 'enterprise_admin'
  | 'organization_admin'
  | 'patroller';

export type AccessRole = 'read' | 'write';

// Persona types
export type Persona = 'admin' | 'patroller';

// User preferences
export interface UserPreferences {
  readonly active_persona?: Persona;
  readonly notifications_enabled?: boolean;
  readonly theme?: 'light' | 'dark' | 'system';
}

// User profile data
export interface UserProfileData {
  readonly activation_token?: string;
  readonly activation_expires?: ISODateString;
  readonly temp_password?: string;
  readonly [key: string]: unknown;
}

// User entity
export interface User extends BaseEntity {
  readonly email: Email;
  readonly full_name: string;
  readonly first_name: Nullable<string>;
  readonly last_name: Nullable<string>;
  readonly phone: Nullable<PhoneNumber>;
  readonly employee_id: Nullable<string>;
  readonly status: UserStatus;
  readonly email_verified: boolean;
  readonly last_login_at: Nullable<ISODateString>;
  readonly tenant_id: Nullable<UUID>;
  readonly organization_id: Nullable<UUID>;
  readonly auth_user_id: Nullable<UUID>;
  readonly profile_data: UserProfileData;
  readonly preferences: UserPreferences;
}

// User role entity
export interface UserRole extends BaseEntity {
  readonly user_id: UUID;
  readonly role_type: RoleType;
  readonly organization_id: Nullable<UUID>;
  readonly email: Nullable<Email>;
  readonly permission: string;
  readonly is_active: boolean;
  readonly expires_at: Nullable<ISODateString>;
  readonly granted_at: ISODateString;
  readonly granted_by: Nullable<UUID>;
}

// User with roles
export interface UserWithRoles extends User {
  readonly roles: readonly UserRole[];
  readonly active_role: Nullable<UserRole>;
}

// Create user request
export interface CreateUserRequest {
  readonly email: Email;
  readonly full_name: string;
  readonly phone?: PhoneNumber;
  readonly role_type: RoleType;
  readonly tenant_id: UUID;
  readonly organization_id?: UUID;
}

// Update user request
export interface UpdateUserRequest {
  readonly full_name?: string;
  readonly phone?: PhoneNumber;
  readonly status?: UserStatus;
  readonly preferences?: Partial<UserPreferences>;
}

// User credentials
export interface UserCredentials {
  readonly email: Email;
  readonly password: string;
}

// Account user (for account_users table)
export interface AccountUser extends BaseEntity {
  readonly user_id: UUID;
  readonly tenant_id: UUID;
  readonly organization_id: Nullable<UUID>;
  readonly access_role: AccessRole;
  readonly is_active: boolean;
}

// User session
export interface UserSession extends BaseEntity {
  readonly user_id: UUID;
  readonly session_token: string;
  readonly ip_address: Nullable<string>;
  readonly user_agent: Nullable<string>;
  readonly expires_at: ISODateString;
}

// User profile view (for UI)
export interface UserProfile {
  readonly id: UUID;
  readonly email: Email;
  readonly fullName: string;
  readonly role: RoleType;
  readonly status: UserStatus;
  readonly profileData: UserProfileData;
  readonly availablePersonas: readonly Persona[];
  readonly activePersona: Nullable<Persona>;
}

// User form data (for forms)
export interface UserFormData {
  readonly fullName: string;
  readonly email: string;
  readonly phone: string;
  readonly accessRole: AccessRole;
}

// Type guards
export const isValidUserStatus = (value: string): value is UserStatus => {
  return ['pending', 'active', 'disabled', 'deleted'].includes(value);
};

export const isValidRoleType = (value: string): value is RoleType => {
  return ['platform_admin', 'enterprise_admin', 'organization_admin', 'patroller'].includes(value);
};

export const isValidPersona = (value: string): value is Persona => {
  return ['admin', 'patroller'].includes(value);
};
