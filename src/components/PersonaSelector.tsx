import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PersonaSelectorProps {
  availablePersonas: string[];
  onPersonaSelected?: () => void;
}

export function PersonaSelector({ availablePersonas, onPersonaSelected }: PersonaSelectorProps) {
  const [selecting, setSelecting] = useState(false);
  const navigate = useNavigate();

  const handleSelectPersona = async (persona: 'admin' | 'patroller') => {
    setSelecting(true);
    try {
      const { error } = await supabase.rpc('set_user_active_persona', {
        p_persona: persona
      });

      if (error) throw error;

      toast.success(`Switched to ${persona} persona`);
      
      // Reload to update permissions
      window.location.reload();
      
      onPersonaSelected?.();
    } catch (error) {
      console.error('Error selecting persona:', error);
      toast.error('Failed to select persona');
    } finally {
      setSelecting(false);
    }
  };

  const hasAdmin = availablePersonas.some(p => 
    ['platform_admin', 'enterprise_admin', 'organization_admin', 'team_leader'].includes(p)
  );
  const hasPatroller = availablePersonas.some(p => 
    ['patroller', 'member', 'responder'].includes(p)
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background to-muted/20">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Select Your Persona</h1>
          <p className="text-muted-foreground">
            You have access to multiple roles. Choose how you'd like to use the platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {hasAdmin && (
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <CardTitle>Admin</CardTitle>
                </div>
                <CardDescription>
                  Manage settings, users, and view analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => handleSelectPersona('admin')}
                  disabled={selecting}
                >
                  Continue as Admin
                </Button>
              </CardContent>
            </Card>
          )}

          {hasPatroller && (
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-6 w-6 text-primary" />
                  <CardTitle>Patroller</CardTitle>
                </div>
                <CardDescription>
                  Submit reports and manage incidents in the field
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => handleSelectPersona('patroller')}
                  disabled={selecting}
                >
                  Continue as Patroller
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
