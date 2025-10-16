import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "./useUserProfile";
import { queryKeys } from "@/lib/queryClient";

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

  const canManageUsers = isActiveAdmin && (isPlatformAdmin || permissions.hasTenantWrite || permissions.hasOrgWrite);
  const canManageIncidents = isActiveAdmin ? (isPlatformAdmin || permissions.hasOrgWrite) : isActivePatroller && isPatroller;
  const canReportIncidents = isActivePatroller && isPatroller;
  const canSubmitReports = isActivePatroller && isPatroller;
  const canViewAllData = isActiveAdmin && isPlatformAdmin;
  const canManageOrganizations = isActiveAdmin && (isPlatformAdmin || permissions.hasTenantWrite);
  const canManageEnterprise = isActiveAdmin && (isPlatformAdmin || permissions.hasTenantWrite);
  const canManageOrgSettings = isActiveAdmin && (isPlatformAdmin || permissions.hasOrgWrite);

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

    // capabilities
    canManageUsers,
    canManageIncidents,
    canViewAllData,
    canManageOrganizations,
    canManageEnterprise,
    canReportIncidents,
    canSubmitReports,
    canManageOrgSettings,

    profile
  };
};
