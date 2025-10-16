import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes default
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

// Query keys with optimized stale times
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

// Optimized query configurations
export const queryConfig = {
  // Session data - changes rarely mid-session
  userProfile: { staleTime: 1000 * 60 * 1 }, // 1 minute
  permissions: { staleTime: 1000 * 60 * 5 }, // 5 minutes
  
  // Static/semi-static data
  subtypes: { staleTime: 1000 * 60 * 15 }, // 15 minutes
  reportTemplates: { staleTime: 1000 * 60 * 10 }, // 10 minutes
  
  // Frequently changing data
  accounts: { staleTime: 1000 * 60 * 2 }, // 2 minutes
  reports: { staleTime: 1000 * 60 * 1 }, // 1 minute
  auditLogs: { staleTime: 1000 * 30 }, // 30 seconds
  
  // Real-time data
  notifications: { staleTime: 0 }, // Always fresh
};
