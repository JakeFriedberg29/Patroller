/**
 * Report-related type definitions
 */

import type { BaseEntity, UUID, ISODateString, Nullable } from './common';

// Report template status
export type ReportTemplateStatus = 'draft' | 'ready' | 'published' | 'unpublished' | 'archive';

// Report field types
export type ReportFieldType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'phone'
  | 'date'
  | 'datetime'
  | 'time'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'signature'
  | 'location'
  | 'divider'
  | 'page_break';

// Report field validation rules
export interface ValidationRules {
  readonly required?: boolean;
  readonly min?: number;
  readonly max?: number;
  readonly pattern?: string;
  readonly custom?: string;
}

// Report field option
export interface FieldOption {
  readonly value: string;
  readonly label: string;
}

// Report field schema
export interface FieldSchema {
  readonly id: string;
  readonly type: ReportFieldType;
  readonly label: string;
  readonly placeholder?: string;
  readonly helpText?: string;
  readonly defaultValue?: unknown;
  readonly options?: readonly FieldOption[];
  readonly validation?: ValidationRules;
  readonly conditional?: {
    readonly field: string;
    readonly operator: 'equals' | 'not_equals' | 'contains';
    readonly value: unknown;
  };
}

// Report template schema
export interface TemplateSchema {
  readonly version: number;
  readonly fields: readonly FieldSchema[];
}

// Report template entity
export interface ReportTemplate extends BaseEntity {
  readonly tenant_id: UUID;
  readonly organization_id: Nullable<UUID>;
  readonly name: string;
  readonly description: Nullable<string>;
  readonly template_schema: TemplateSchema;
  readonly status: ReportTemplateStatus;
  readonly is_active: boolean;
  readonly created_by: Nullable<UUID>;
}

// Report submission entity
export interface ReportSubmission extends BaseEntity {
  readonly tenant_id: UUID;
  readonly account_id: UUID;
  readonly account_type: string;
  readonly template_id: Nullable<UUID>;
  readonly template_version: Nullable<number>;
  readonly report_type: string;
  readonly title: Nullable<string>;
  readonly description: Nullable<string>;
  readonly submitted_at: ISODateString;
  readonly created_by: Nullable<UUID>;
  readonly metadata: Record<string, unknown>;
}

// Report visibility settings
export interface PatrollerReportVisibility extends BaseEntity {
  readonly tenant_id: UUID;
  readonly organization_id: UUID;
  readonly template_id: UUID;
  readonly visible_to_patrollers: boolean;
  readonly created_by: Nullable<UUID>;
}

// Repository assignment types
export type RepositoryElementType = 'report_template' | 'equipment_template';
export type RepositoryTargetType = 'organization' | 'organization_type';

// Repository assignment entity
export interface RepositoryAssignment extends BaseEntity {
  readonly tenant_id: UUID;
  readonly element_type: RepositoryElementType;
  readonly element_id: UUID;
  readonly target_type: RepositoryTargetType;
  readonly target_organization_id: Nullable<UUID>;
  readonly target_organization_type: Nullable<string>;
  readonly target_organization_subtype_id: Nullable<UUID>;
  readonly created_by: Nullable<UUID>;
}

// Report builder form data
export interface ReportBuilderFormData {
  readonly name: string;
  readonly description: string;
  readonly fieldRows: readonly FieldSchema[];
  readonly status: ReportTemplateStatus;
  readonly assignToAllOrgs: boolean;
  readonly selectedSubtypes: readonly UUID[];
}

// Status option for UI
export interface StatusOption {
  readonly value: ReportTemplateStatus;
  readonly label: string;
}

// Valid status transitions
export type ValidStatusTransition = {
  readonly from: ReportTemplateStatus;
  readonly to: readonly ReportTemplateStatus[];
};

// Type guards
export const isValidReportTemplateStatus = (value: string): value is ReportTemplateStatus => {
  return ['draft', 'ready', 'published', 'unpublished', 'archive'].includes(value);
};

export const isValidFieldType = (value: string): value is ReportFieldType => {
  return [
    'text', 'textarea', 'number', 'email', 'phone', 'date', 'datetime', 'time',
    'select', 'multiselect', 'checkbox', 'radio', 'file', 'signature', 'location',
    'divider', 'page_break'
  ].includes(value);
};

export const canDeleteReport = (status: ReportTemplateStatus): boolean => {
  return status === 'archive';
};
