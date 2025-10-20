import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "./useUserProfile";
import { queryKeys, queryConfig } from "@/lib/queryClient";
import { useMemo } from "react";
import { isValidUUID } from "@/lib/uuidValidation";
import { toast } from "sonner";

interface PermissionsData {
  hasTenantWrite: boolean;
  hasTenantRead: boolean;
  hasOrgWrite: boolean;
  hasOrgRead: boolean;
}

const fetchPermissions = async (
  userId: string | undefined,
  tenantId: string | undefined,
  organizationId: string | undefined
): Promise<PermissionsData> => {
  if (!userId || !tenantId) {
    return {
      hasTenantWrite: false,
      hasTenantRead: false,
      hasOrgWrite: false,
      hasOrgRead: false,
    };
  }
  
  // Validate UUIDs before database queries
  if (!isValidUUID(userId)) {
    console.error("Invalid user ID when checking permissions:", userId);
    toast.error("Authentication error. Please sign in again.");
    throw new Error("Invalid user ID");
  }
  
  if (!isValidUUID(tenantId)) {
    console.error("Invalid tenant ID:", tenantId);
    toast.error("Invalid account data. Please refresh the page.");
    throw new Error("Invalid tenant ID");
  }

  const { data, error } = await supabase
    .from('account_users')
    .select('tenant_id, organization_id, access_role, is_active')
    .eq('user_id', userId)
    .eq('tenant_id', tenantId)
    .eq('is_active', true);

  if (error || !data) {
    return {
      hasTenantWrite: false,
      hasTenantRead: false,
      hasOrgWrite: false,
      hasOrgRead: false,
    };
  }

  const tenantRow = data.find(r => r.tenant_id === tenantId && r.organization_id == null);
  const orgRow = organizationId ? data.find(r => r.organization_id === organizationId) : undefined;

  return {
    hasTenantWrite: !!tenantRow && tenantRow.access_role === 'write',
    hasTenantRead: !!tenantRow,
    hasOrgWrite: !!orgRow && orgRow.access_role === 'write',
    hasOrgRead: !!orgRow,
  };
};

export const usePermissions = () => {
  const { profile } = useUserProfile();
  
  // Get active persona - defaults to admin if not set
  const activePersona = profile?.activePersona || 'admin';

  const { data: permissions } = useQuery({
    queryKey: queryKeys.permissions(profile?.id),
    queryFn: () => fetchPermissions(
      profile?.profileData?.user_id,
      profile?.profileData?.tenant_id,
      profile?.profileData?.organization_id
    ),
    enabled: !!profile?.id && !!profile?.profileData?.tenant_id,
    ...queryConfig.permissions, // 5 minute stale time
    initialData: {
      hasTenantWrite: false,
      hasTenantRead: false,
      hasOrgWrite: false,
      hasOrgRead: false,
    },
  });

  const isPlatformAdmin = profile?.roleType === 'platform_admin';
  const isPatroller = profile?.roleType === 'patroller';

  // Respect active persona when determining capabilities
  const isActiveAdmin = activePersona === 'admin';
  const isActivePatroller = activePersona === 'patroller';

  // Memoize derived capabilities to prevent unnecessary re-renders
  const capabilities = useMemo(() => ({
    canManageUsers: isActiveAdmin && (isPlatformAdmin || permissions.hasTenantWrite || permissions.hasOrgWrite),
    canManageIncidents: isActiveAdmin ? (isPlatformAdmin || permissions.hasOrgWrite) : isActivePatroller && isPatroller,
    canReportIncidents: isActivePatroller && isPatroller,
    canSubmitReports: isActivePatroller && isPatroller,
    canViewAllData: isActiveAdmin && isPlatformAdmin,
    canManageOrganizations: isActiveAdmin && (isPlatformAdmin || permissions.hasTenantWrite),
    canManageEnterprise: isActiveAdmin && (isPlatformAdmin || permissions.hasTenantWrite),
    canManageOrgSettings: isActiveAdmin && (isPlatformAdmin || permissions.hasOrgWrite),
  }), [isActiveAdmin, isActivePatroller, isPlatformAdmin, isPatroller, permissions]);

  return {
    // core actors
    isPlatformAdmin,
    isPatroller,

    // active persona
    activePersona,
    isActiveAdmin,
    isActivePatroller,

    // new access model
    ...permissions,

    // capabilities (memoized)
    ...capabilities,

    profile
  };
};
