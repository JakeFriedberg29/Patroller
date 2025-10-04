import { useState } from "react";
import { Shield, UserCheck, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserProfile } from "@/hooks/useUserProfile";

export function PersonaSwitcher() {
  const { profile } = useUserProfile();
  const [switching, setSwitching] = useState(false);

  if (!profile?.availablePersonas || profile.availablePersonas.length <= 1) {
    return null;
  }

  const hasAdmin = profile.availablePersonas.some(p => 
    ['platform_admin', 'enterprise_admin', 'organization_admin', 'team_leader'].includes(p)
  );
  const hasPatroller = profile.availablePersonas.some(p => 
    ['patroller', 'member', 'responder'].includes(p)
  );

  const currentPersona = profile.activePersona || 'admin';

  const handleSwitch = async (persona: 'admin' | 'patroller') => {
    if (persona === currentPersona) return;

    setSwitching(true);
    try {
      const { error } = await supabase.rpc('user_set_active_persona', {
        p_persona: persona
      });

      if (error) throw error;

      toast.success(`Switched to ${persona} persona`);
      
      // Reload to update permissions and UI
      window.location.reload();
    } catch (error) {
      console.error('Error switching persona:', error);
      toast.error('Failed to switch persona');
      setSwitching(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={switching}>
          {currentPersona === 'admin' ? (
            <Shield className="h-4 w-4 mr-2" />
          ) : (
            <UserCheck className="h-4 w-4 mr-2" />
          )}
          {currentPersona === 'admin' ? 'Admin' : 'Patroller'}
          {switching && <RefreshCw className="h-3 w-3 ml-2 animate-spin" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Switch Persona</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hasAdmin && (
          <DropdownMenuItem 
            onClick={() => handleSwitch('admin')}
            disabled={currentPersona === 'admin' || switching}
          >
            <Shield className="h-4 w-4 mr-2" />
            Admin
            {currentPersona === 'admin' && (
              <span className="ml-auto text-xs text-muted-foreground">Active</span>
            )}
          </DropdownMenuItem>
        )}
        {hasPatroller && (
          <DropdownMenuItem 
            onClick={() => handleSwitch('patroller')}
            disabled={currentPersona === 'patroller' || switching}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Patroller
            {currentPersona === 'patroller' && (
              <span className="ml-auto text-xs text-muted-foreground">Active</span>
            )}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
