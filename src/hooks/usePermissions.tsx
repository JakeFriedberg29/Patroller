import { useUserProfile } from './useUserProfile';

export const usePermissions = () => {
  const { profile } = useUserProfile();

  const isPlatformAdmin = profile?.roleType === 'platform_admin';
  const isEnterpriseUser = profile?.roleType === 'enterprise_user';
  const isOrganizationUser = profile?.roleType === 'organization_user' || profile?.roleType === 'team_leader';
  const isResponder = profile?.roleType === 'responder' || profile?.roleType === 'member';
  const isOrgViewer = profile?.roleType === 'observer';

  // Check permission level from profileData
  const userPermission = (profile?.profileData?.permission as 'full' | 'view' | undefined) || 'full';
  const hasFullPermission = userPermission === 'full';
  const hasViewOnlyPermission = userPermission === 'view';
  
  const canManageUsers = (isPlatformAdmin || (isEnterpriseUser && hasFullPermission) || (isOrganizationUser && hasFullPermission)) && !isOrgViewer;
  const canManageIncidents = (isPlatformAdmin || (isEnterpriseUser && hasFullPermission) || (isOrganizationUser && hasFullPermission)) && !isOrgViewer;
  const canReportIncidents = isResponder || isOrganizationUser || isEnterpriseUser || isPlatformAdmin;
  const canSubmitReports = isResponder;
  const canViewAllData = isPlatformAdmin;
  const canManageOrganizations = isPlatformAdmin || (isEnterpriseUser && hasFullPermission);
  const canManageEnterprise = isPlatformAdmin || (isEnterpriseUser && hasFullPermission);
  const canManageOrgSettings = (isPlatformAdmin || (isOrganizationUser && hasFullPermission)) && !isOrgViewer;

  return {
    isPlatformAdmin,
    isEnterpriseUser,
    isOrganizationUser,
    isResponder,
    hasFullPermission,
    hasViewOnlyPermission,
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