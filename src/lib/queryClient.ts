import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Query keys for consistent cache management
export const queryKeys = {
  userProfile: (userId?: string) => ['user-profile', userId] as const,
  permissions: (userId?: string) => ['permissions', userId] as const,
  accounts: (type?: string) => ['accounts', type] as const,
  accountDetail: (id: string) => ['account', id] as const,
  reports: (orgId?: string) => ['reports', orgId] as const,
  teamMembers: (orgId?: string) => ['team-members', orgId] as const,
  auditLogs: (filters: any) => ['audit-logs', filters] as const,
  reportTemplates: (orgId?: string, tenantId?: string) => ['report-templates', orgId, tenantId] as const,
};
