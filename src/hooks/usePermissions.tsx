import { useUserProfile } from './useUserProfile';

export const usePermissions = () => {
  const { profile } = useUserProfile();

  const isPlatformAdmin = profile?.roleType === 'platform_admin';
  const isEnterpriseAdmin = profile?.roleType === 'enterprise_admin';
  const isOrganizationAdmin = profile?.roleType === 'organization_admin' || profile?.roleType === 'team_leader';
  const isResponder = profile?.roleType === 'responder' || profile?.roleType === 'member';

  const orgAdminPermission = (profile?.profileData?.org_admin_permission as 'full' | 'view' | undefined) || 'full';
  const isOrgAdminViewOnly = isOrganizationAdmin && orgAdminPermission === 'view';
  
  const canManageUsers = isPlatformAdmin || isEnterpriseAdmin || (isOrganizationAdmin && !isOrgAdminViewOnly);
  const canManageEquipment = isPlatformAdmin || (isOrganizationAdmin && !isOrgAdminViewOnly);
  const canManageLocations = isPlatformAdmin || (isOrganizationAdmin && !isOrgAdminViewOnly);
  const canManageIncidents = isPlatformAdmin || isEnterpriseAdmin || (isOrganizationAdmin && !isOrgAdminViewOnly);
  const canReportIncidents = true; // All users can report incidents
  const canSubmitReports = true; // Responders can submit reports
  const canViewAllData = isPlatformAdmin;
  const canManageOrganizations = isPlatformAdmin || isEnterpriseAdmin;
  const canManageEnterprise = isPlatformAdmin || isEnterpriseAdmin;
  const canManageOrgSettings = isPlatformAdmin || (isOrganizationAdmin && !isOrgAdminViewOnly);

  return {
    isPlatformAdmin,
    isEnterpriseAdmin,
    isOrganizationAdmin,
    isResponder,
    isOrgAdminViewOnly,
    canManageUsers,
    canManageEquipment,
    canManageLocations,
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