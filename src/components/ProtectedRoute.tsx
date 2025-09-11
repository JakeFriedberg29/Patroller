import { ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { usePlatformAdminAssignments } from "@/hooks/usePlatformAdminAssignments";
import { useUserProfile } from "@/hooks/useUserProfile";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAssignment?: boolean;
  accountType?: "Enterprise" | "Organization";
}

const ProtectedRoute = ({ children, requireAssignment, accountType }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { isPlatformAdmin } = usePermissions();
  const { assignments, loading: loadingAssignments } = usePlatformAdminAssignments();
  const params = useParams();
  const { profile } = useUserProfile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If platform admin access must be scoped by assignment
  if (requireAssignment && isPlatformAdmin) {
    if (loadingAssignments) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }
    const routeAccountId = params.id;
    if (routeAccountId) {
      const allowed = assignments.some(a => a.account_id === routeAccountId && (!accountType || a.account_type === accountType));
      if (!allowed) {
        return <Navigate to="/accounts" replace />;
      }
    }
  }

  // Enterprise admins: prevent navigating to other enterprises
  if (!isPlatformAdmin && accountType === 'Enterprise' && params.id && profile?.profileData?.tenant_id) {
    if (params.id !== profile.profileData.tenant_id) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;