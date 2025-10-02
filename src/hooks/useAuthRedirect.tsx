import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useUserProfile();

  useEffect(() => {
    // Fallback: if user is authenticated but profile hasn't loaded yet,
    // send them to the global dashboard. When profile loads, it will
    // re-run and route them more specifically if needed.
    if (user && (!profile || !profile.roleType)) {
      navigate('/', { replace: true });
      return;
    }

    if (!user || !profile || !profile.roleType) return;

    // Get the user's primary role from profile data
    const primaryRole = profile.roleType;
    const organizationId = (profile as any).organizationId || (profile as any).organization_id;
    const tenantId = (profile as any).profileData?.tenant_id || (profile as any).tenant_id;

    switch (primaryRole) {
      case 'platform_admin':
        navigate('/', { replace: true });
        break;
      case 'enterprise_admin':
        if (tenantId) {
          navigate(`/enterprises/${tenantId}/analytics`, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
        break;
      case 'organization_admin':
      case 'team_leader':
        if (organizationId) {
          navigate(`/organization/${organizationId}/analytics`, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
        break;
      case 'patroller':
      case 'member':
      case 'observer':
        if (organizationId) {
          navigate(`/organization/${organizationId}/patroller-dashboard`, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
        break;
      default:
        if (organizationId) {
          navigate(`/organization/${organizationId}/analytics`, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
        break;
    }
  }, [user, profile, navigate]);
};