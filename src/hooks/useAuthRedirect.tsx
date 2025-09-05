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

    switch (primaryRole) {
      case 'platform_admin':
        navigate('/', { replace: true });
        break;
      case 'enterprise_admin':
        // For enterprise admin, try to find their tenant's first organization
        // For now, redirect to platform view
        navigate('/', { replace: true });
        break;
      case 'organization_admin':
        // Navigate to organization view if we have org info
        if (organizationId) {
          navigate(`/organization/${organizationId}`, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
        break;
      default:
        // Regular users (responder, supervisor, member) go to organization dashboard
        if (organizationId) {
          navigate(`/organization/${organizationId}`, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
        break;
    }
  }, [user, profile, navigate]);
};