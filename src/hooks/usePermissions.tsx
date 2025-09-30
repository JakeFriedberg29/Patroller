import { useUserProfile } from './useUserProfile';

export const usePermissions = () => {
  const { profile } = useUserProfile();

  const isPlatformAdmin = profile?.roleType === 'platform_admin';
  const isEnterpriseAdmin = profile?.roleType === 'enterprise_admin';
  const isOrganizationAdmin = profile?.roleType === 'organization_admin' || profile?.roleType === 'team_leader';
  const isPatroller = profile?.roleType === 'patroller' || profile?.roleType === 'member';
  const isOrgViewer = profile?.roleType === 'observer';

  const orgAdminPermission = (profile?.profileData?.org_admin_permission as 'full' | 'view' | undefined) || 'full';
  const isOrgAdminViewOnly = isOrganizationAdmin && orgAdminPermission === 'view';
  
  const canManageUsers = (isPlatformAdmin || isEnterpriseAdmin || (isOrganizationAdmin && !isOrgAdminViewOnly)) && !isOrgViewer;
  const canManageIncidents = (isPlatformAdmin || isEnterpriseAdmin || (isOrganizationAdmin && !isOrgAdminViewOnly)) && !isOrgViewer;
  const canReportIncidents = isPatroller || isOrganizationAdmin || isEnterpriseAdmin || isPlatformAdmin; // viewers cannot report
  const canSubmitReports = isPatroller; // only Patrollers submit reports
  const canViewAllData = isPlatformAdmin;
  const canManageOrganizations = isPlatformAdmin || isEnterpriseAdmin;
  const canManageEnterprise = isPlatformAdmin || isEnterpriseAdmin;
  const canManageOrgSettings = (isPlatformAdmin || (isOrganizationAdmin && !isOrgAdminViewOnly)) && !isOrgViewer;

  return {
    isPlatformAdmin,
    isEnterpriseAdmin,
    isOrganizationAdmin,
    isPatroller,
    isOrgAdminViewOnly,
    isOrgViewer,
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