import { PersonaSelector } from "@/components/PersonaSelector";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Navigate } from "react-router-dom";

export default function PersonaSelection() {
  const { profile, loading } = useUserProfile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user doesn't have multiple personas, redirect
  if (!profile?.availablePersonas || profile.availablePersonas.length <= 1) {
    return <Navigate to="/" replace />;
  }

  // If persona already selected, redirect
  if (profile.activePersona) {
    return <Navigate to="/" replace />;
  }

  return <PersonaSelector availablePersonas={profile.availablePersonas} />;
}
