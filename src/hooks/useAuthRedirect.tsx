import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useUserProfile();

  useEffect(() => {
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
        // Navigate to enterprise dashboard using tenant_id
        if (tenantId) {
          navigate(`/enterprises/${tenantId}/enterprise-view`, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
        break;
      case 'organization_admin':
        // Navigate to organization mission control dashboard
        if (organizationId) {
          navigate(`/organization/${organizationId}/mission-control`, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
        break;
      default:
        // Regular users (responder, supervisor, member) go to organization mission control dashboard
        if (organizationId) {
          navigate(`/organization/${organizationId}/mission-control`, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
        break;
    }
  }, [user, profile, navigate]);
};