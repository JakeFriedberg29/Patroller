import { useEffect, useState } from 'react';
import { useUserProfile } from './useUserProfile';
import { supabase } from '@/integrations/supabase/client';

export const usePermissions = () => {
  const { profile } = useUserProfile();
  
  // Get active persona - defaults to admin if not set
  const activePersona = profile?.activePersona || 'admin';

  const [hasTenantWrite, setHasTenantWrite] = useState(false);
  const [hasTenantRead, setHasTenantRead] = useState(false);
  const [hasOrgWrite, setHasOrgWrite] = useState(false);
  const [hasOrgRead, setHasOrgRead] = useState(false);

  useEffect(() => {
    const loadAccess = async () => {
      setHasTenantWrite(false);
      setHasTenantRead(false);
      setHasOrgWrite(false);
      setHasOrgRead(false);

      const userId = profile?.profileData?.user_id as string | undefined;
      const tenantId = profile?.profileData?.tenant_id as string | undefined;
      const organizationId = profile?.profileData?.organization_id as string | undefined;
      if (!userId || !tenantId) return;

      const { data, error } = await supabase
        .from('account_users')
        .select('tenant_id, organization_id, access_role, is_active')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .eq('is_active', true);

      if (error || !data) return;

      const tenantRow = data.find(r => r.tenant_id === tenantId && r.organization_id == null);
      const orgRow = organizationId ? data.find(r => r.organization_id === organizationId) : undefined;

      setHasTenantWrite(!!tenantRow && tenantRow.access_role === 'write');
      setHasTenantRead(!!tenantRow);
      setHasOrgWrite(!!orgRow && orgRow.access_role === 'write');
      setHasOrgRead(!!orgRow);
    };

    loadAccess();
  }, [profile?.profileData?.user_id, profile?.profileData?.tenant_id, profile?.profileData?.organization_id]);

  const isPlatformAdmin = profile?.roleType === 'platform_admin';
  const isPatroller = profile?.roleType === 'patroller' || profile?.roleType === 'member';

  // Respect active persona when determining capabilities
  const isActiveAdmin = activePersona === 'admin';
  const isActivePatroller = activePersona === 'patroller';

  const canManageUsers = isActiveAdmin && (isPlatformAdmin || hasTenantWrite || hasOrgWrite);
  const canManageIncidents = isActiveAdmin ? (isPlatformAdmin || hasOrgWrite) : isActivePatroller && isPatroller;
  const canReportIncidents = isActivePatroller && isPatroller;
  const canSubmitReports = isActivePatroller && isPatroller;
  const canViewAllData = isActiveAdmin && isPlatformAdmin;
  const canManageOrganizations = isActiveAdmin && (isPlatformAdmin || hasTenantWrite);
  const canManageEnterprise = isActiveAdmin && (isPlatformAdmin || hasTenantWrite);
  const canManageOrgSettings = isActiveAdmin && (isPlatformAdmin || hasOrgWrite);

  return {
    // core actors
    isPlatformAdmin,
    isPatroller,

    // active persona
    activePersona,
    isActiveAdmin,
    isActivePatroller,

    // new access model
    hasTenantWrite,
    hasTenantRead,
    hasOrgWrite,
    hasOrgRead,

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