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

    // Check if user has multiple personas and hasn't selected one yet
    const hasMultiplePersonas = profile.availablePersonas && profile.availablePersonas.length > 1;
    const hasAdminRole = profile.availablePersonas?.some(p => 
      ['platform_admin', 'enterprise_admin', 'organization_admin', 'team_leader'].includes(p)
    );
    const hasPatrollerRole = profile.availablePersonas?.some(p => 
      ['patroller', 'member', 'responder'].includes(p)
    );
    
    if (hasMultiplePersonas && hasAdminRole && hasPatrollerRole && !profile.activePersona) {
      navigate('/persona-selection', { replace: true });
      return;
    }

    // Get the user's primary role from profile data
    const primaryRole = profile.roleType;
    const activePersona = profile.activePersona || 'admin';
    const organizationId = profile.profileData?.organization_id;
    const tenantId = profile.profileData?.tenant_id;

    // Route based on active persona
    if (activePersona === 'patroller') {
      if (organizationId) {
        navigate(`/organization/${organizationId}/patroller-dashboard`, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
      return;
    }

    // Admin persona routing
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
      case 'responder':
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