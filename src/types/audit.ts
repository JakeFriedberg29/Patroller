/**
 * Audit log and security-related type definitions
 */

import type { BaseEntity, UUID, ISODateString, Nullable } from './common';

// Audit actions
export type AuditAction = 
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'ACTIVATE'
  | 'DEACTIVATE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'PASSWORD_RESET'
  | 'STATUS_CHANGE'
  | 'ROLE_CHANGE'
  | 'PERMISSION_CHANGE'
  | string; // Allow custom actions

// Resource types
export type ResourceType = 
  | 'user'
  | 'organization'
  | 'enterprise'
  | 'report_template'
  | 'report_submission'
  | 'equipment'
  | 'location'
  | 'notification'
  | string; // Allow custom resources

// Audit log entity
export interface AuditLog extends BaseEntity {
  readonly tenant_id: UUID;
  readonly user_id: Nullable<UUID>;
  readonly action: AuditAction;
  readonly resource_type: ResourceType;
  readonly resource_id: Nullable<UUID>;
  readonly old_values: Nullable<Record<string, unknown>>;
  readonly new_values: Nullable<Record<string, unknown>>;
  readonly metadata: Record<string, unknown>;
  readonly ip_address: Nullable<string>;
  readonly user_agent: Nullable<string>;
}

// Audit log with user info (for UI)
export interface AuditLogEntry extends AuditLog {
  readonly user_name: Nullable<string>;
  readonly user_email: Nullable<string>;
}

// Security event severity
export type SecurityEventSeverity = 'info' | 'warning' | 'critical';

// Security event types
export type SecurityEventType = 
  | 'failed_login'
  | 'suspicious_activity'
  | 'unauthorized_access'
  | 'data_breach'
  | 'policy_violation'
  | string;

// Security event entity
export interface SecurityEvent extends BaseEntity {
  readonly tenant_id: UUID;
  readonly user_id: Nullable<UUID>;
  readonly event_type: SecurityEventType;
  readonly severity: SecurityEventSeverity;
  readonly description: string;
  readonly metadata: Record<string, unknown>;
  readonly ip_address: Nullable<string>;
  readonly resolved: boolean;
  readonly resolved_at: Nullable<ISODateString>;
  readonly resolved_by: Nullable<UUID>;
}

// Notification types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

// Notification entity
export interface Notification extends BaseEntity {
  readonly tenant_id: UUID;
  readonly user_id: UUID;
  readonly title: string;
  readonly message: string;
  readonly type: NotificationType;
  readonly read: boolean;
  readonly expires_at: Nullable<ISODateString>;
  readonly metadata: Record<string, unknown>;
}

// Email notification log entity
export interface EmailNotificationLog extends BaseEntity {
  readonly tenant_id: UUID;
  readonly user_id: Nullable<UUID>;
  readonly notification_key: string;
  readonly recipient_email: string;
  readonly status: 'pending' | 'sent' | 'failed' | 'bounced';
  readonly provider: Nullable<string>;
  readonly provider_message_id: Nullable<string>;
  readonly error_message: Nullable<string>;
  readonly sent_at: ISODateString;
}

// Email notification template entity
export interface EmailNotificationTemplate extends BaseEntity {
  readonly tenant_id: UUID;
  readonly notification_key: string;
  readonly subject: Nullable<string>;
  readonly body_text: Nullable<string>;
  readonly body_html: Nullable<string>;
  readonly is_enabled: boolean;
  readonly last_sent_at: Nullable<ISODateString>;
  readonly last_sent_to: Nullable<string>;
}

// Audit log filters
export interface AuditLogFilters {
  readonly search?: string;
  readonly action?: AuditAction;
  readonly resourceType?: ResourceType;
  readonly userId?: UUID;
  readonly startDate?: ISODateString;
  readonly endDate?: ISODateString;
}

// Type guards
export const isValidNotificationType = (value: string): value is NotificationType => {
  return ['info', 'success', 'warning', 'error'].includes(value);
};

export const isValidSecurityEventSeverity = (value: string): value is SecurityEventSeverity => {
  return ['info', 'warning', 'critical'].includes(value);
};
