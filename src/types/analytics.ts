/**
 * Analytics and dashboard-related type definitions
 */

import type { UUID, ISODateString } from './common';
import type { OrganizationType } from './account';

// Date range
export interface DateRange {
  readonly from: Date;
  readonly to: Date;
}

// KPI (Key Performance Indicator)
export interface KPI {
  readonly value: number;
  readonly change?: number;
  readonly trend?: 'up' | 'down' | 'stable';
  readonly label: string;
}

// Time series data point
export interface TimeSeriesDataPoint {
  readonly date: string;
  readonly value: number;
  readonly label?: string;
}

// Chart data
export interface ChartData<T = unknown> {
  readonly labels: readonly string[];
  readonly datasets: readonly {
    readonly label: string;
    readonly data: readonly T[];
    readonly color?: string;
  }[];
}

// Global dashboard KPIs
export interface GlobalKPIs {
  readonly totalAccounts: number;
  readonly totalUsers: number;
  readonly totalReports: number;
  readonly activeUsers: number;
}

// Organization analytics data
export interface OrganizationAnalyticsData {
  readonly totalUsers: number;
  readonly totalReportsSubmitted: number;
  readonly avgTimeToReportHours: number;
  readonly totalLogins: number;
  readonly reportsByType: readonly {
    readonly report_type: string;
    readonly count: number;
  }[];
}

// Organization summary (for enterprise view)
export interface OrganizationSummary {
  readonly id: UUID;
  readonly name: string;
  readonly organization_type: OrganizationType;
  readonly totalUsers: number;
  readonly totalAdmins: number;
  readonly totalPatrollers: number;
  readonly is_active: boolean;
}

// Enterprise analytics data
export interface EnterpriseAnalyticsData {
  readonly totalOrganizations: number;
  readonly totalUsers: number;
  readonly totalAdmins: number;
  readonly totalPatrollers: number;
  readonly totalReportsSubmitted: number;
}

// Reports by organization
export interface ReportsByOrganization {
  readonly organization_id: UUID;
  readonly organization_name: string;
  readonly count: number;
}

// Accounts over time data point
export interface AccountsOverTimePoint {
  readonly month: string;
  readonly enterprises: number;
  readonly organizations: number;
}

// Users over time data point
export interface UsersOverTimePoint {
  readonly month: string;
  readonly active_users: number;
}

// Reports by type data point
export interface ReportsByTypePoint {
  readonly month: string;
  readonly [reportType: string]: number | string;
}

// Enterprise subtype distribution
export interface EnterpriseSubtypeSlice {
  readonly subtype: string;
  readonly count: number;
  readonly percentage: number;
}

// Dashboard filter options
export interface DashboardFilters {
  readonly dateRange?: DateRange;
  readonly accountType?: 'Enterprise' | 'Organization' | 'all';
  readonly userRole?: 'platform_admin' | 'enterprise_admin' | 'organization_admin' | 'patroller' | 'all';
  readonly reportType?: string;
  readonly organizationType?: OrganizationType | 'all';
}

// Global dashboard data
export interface GlobalDashboardData {
  readonly kpis: GlobalKPIs;
  readonly accountsOverTime: readonly AccountsOverTimePoint[];
  readonly usersOverTime: readonly UsersOverTimePoint[];
  readonly reportsByType: readonly ReportsByTypePoint[];
  readonly enterpriseSubtypeDistribution: readonly EnterpriseSubtypeSlice[];
}

// Metric card props (for UI components)
export interface MetricCardData {
  readonly title: string;
  readonly value: string | number;
  readonly description?: string;
  readonly trend?: {
    readonly value: number;
    readonly direction: 'up' | 'down';
    readonly label: string;
  };
  readonly icon?: string;
}
