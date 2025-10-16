/**
 * Account-related type definitions (Enterprises & Organizations)
 */

import type { BaseEntity, UUID, Email, PhoneNumber, Address, ISODateString, Nullable } from './common';

// Account types
export type AccountType = 'Enterprise' | 'Organization';

// Organization types
export type OrganizationType = 
  | 'search_and_rescue'
  | 'lifeguard_service'
  | 'park_service'
  | 'event_medical'
  | 'ski_patrol'
  | 'harbor_master'
  | 'volunteer_emergency_services';

// Subscription tiers
export type SubscriptionTier = 'bronze' | 'silver' | 'gold' | 'platinum';

// Subscription status
export type SubscriptionStatus = 'active' | 'inactive' | 'suspended' | 'cancelled';

// Enterprise settings
export interface EnterpriseSettings {
  readonly contact_email?: Email;
  readonly contact_phone?: PhoneNumber;
  readonly contact_primary_name?: string;
  readonly enterprise_subtype?: string;
  readonly address?: Address;
  readonly [key: string]: unknown;
}

// Enterprise entity
export interface Enterprise extends BaseEntity {
  readonly name: string;
  readonly slug: string;
  readonly subscription_tier: SubscriptionTier;
  readonly subscription_status: SubscriptionStatus;
  readonly subscription_expires_at: Nullable<ISODateString>;
  readonly max_organizations: Nullable<number>;
  readonly max_users: Nullable<number>;
  readonly settings: EnterpriseSettings;
}

// Organization settings
export interface OrganizationSettings {
  readonly secondary_email?: Email;
  readonly secondary_phone?: PhoneNumber;
  readonly [key: string]: unknown;
}

// Organization entity
export interface Organization extends BaseEntity {
  readonly tenant_id: Nullable<UUID>;
  readonly name: string;
  readonly slug: string;
  readonly description: Nullable<string>;
  readonly organization_type: OrganizationType;
  readonly organization_subtype: Nullable<string>;
  readonly contact_email: Nullable<Email>;
  readonly contact_phone: Nullable<PhoneNumber>;
  readonly is_active: boolean;
  readonly address: Address;
  readonly settings: OrganizationSettings;
}

// Organization subtype entity
export interface OrganizationSubtype extends BaseEntity {
  readonly tenant_id: UUID;
  readonly name: string;
  readonly is_active: boolean;
}

// Enterprise subtype entity
export interface EnterpriseSubtype extends BaseEntity {
  readonly tenant_id: UUID;
  readonly name: string;
  readonly is_active: boolean;
}

// Account (unified view for UI)
export interface Account {
  readonly id: UUID;
  readonly name: string;
  readonly type: AccountType;
  readonly category: string;
  readonly members: number;
  readonly email: Email | 'N/A';
  readonly phone: PhoneNumber | 'N/A';
  readonly created: string;
  readonly tenant_id?: UUID;
  readonly organization_type?: OrganizationType;
  readonly is_active: boolean;
  readonly primaryContact?: string;
  readonly address?: Address;
  readonly settings?: EnterpriseSettings | OrganizationSettings;
}

// Create account request
export interface CreateAccountRequest {
  readonly name: string;
  readonly type: AccountType;
  readonly category: string;
  readonly primaryEmail: Email;
  readonly primaryPhone: PhoneNumber;
  readonly secondaryEmail?: Email;
  readonly secondaryPhone?: PhoneNumber;
  readonly address?: string;
  readonly city?: string;
  readonly state?: string;
  readonly zip?: string;
  readonly tenantId?: UUID;
}

// Update account request
export interface UpdateAccountRequest {
  readonly name?: string;
  readonly email?: Email;
  readonly phone?: PhoneNumber;
  readonly category?: string;
  readonly is_active?: boolean;
  readonly address?: Address;
  readonly tenant_id?: UUID;
  readonly primaryContact?: string;
}

// Platform admin account assignment
export interface PlatformAdminAccountAssignment extends BaseEntity {
  readonly platform_admin_id: UUID;
  readonly account_id: UUID;
  readonly account_type: AccountType;
  readonly is_active: boolean;
  readonly assigned_by: Nullable<UUID>;
  readonly assigned_at: ISODateString;
}

// Account assignment for UI
export interface AccountAssignment {
  readonly id: UUID;
  readonly account_id: UUID;
  readonly account_name: string;
  readonly account_type: AccountType;
  readonly is_active: boolean;
  readonly assigned_at: ISODateString;
}

// Type guards
export const isValidAccountType = (value: string): value is AccountType => {
  return ['Enterprise', 'Organization'].includes(value);
};

export const isValidOrganizationType = (value: string): value is OrganizationType => {
  return [
    'search_and_rescue',
    'lifeguard_service',
    'park_service',
    'event_medical',
    'ski_patrol',
    'harbor_master',
    'volunteer_emergency_services'
  ].includes(value);
};

export const isValidSubscriptionTier = (value: string): value is SubscriptionTier => {
  return ['bronze', 'silver', 'gold', 'platinum'].includes(value);
};

export const isEnterprise = (account: Account): account is Account & { type: 'Enterprise' } => {
  return account.type === 'Enterprise';
};

export const isOrganization = (account: Account): account is Account & { type: 'Organization' } => {
  return account.type === 'Organization';
};
