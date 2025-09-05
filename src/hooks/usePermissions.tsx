import { useUserProfile } from './useUserProfile';

export const usePermissions = () => {
  const { profile } = useUserProfile();

  const isPlatformAdmin = profile?.roleType === 'platform_admin';
  const isEnterpriseAdmin = profile?.roleType === 'enterprise_admin';
  const isOrganizationAdmin = profile?.roleType === 'organization_admin';
  
  const canManageUsers = isPlatformAdmin || isEnterpriseAdmin || isOrganizationAdmin;
  const canManageEquipment = isPlatformAdmin || isOrganizationAdmin;
  const canManageLocations = isPlatformAdmin || isOrganizationAdmin;
  const canManageIncidents = isPlatformAdmin || isOrganizationAdmin;
  const canViewAllData = isPlatformAdmin;
  const canManageOrganizations = isPlatformAdmin || isEnterpriseAdmin;
  const canManageEnterprise = isPlatformAdmin || isEnterpriseAdmin;

  return {
    isPlatformAdmin,
    isEnterpriseAdmin,
    isOrganizationAdmin,
    canManageUsers,
    canManageEquipment,
    canManageLocations,
    canManageIncidents,
    canViewAllData,
    canManageOrganizations,
    canManageEnterprise,
    profile
  };
};