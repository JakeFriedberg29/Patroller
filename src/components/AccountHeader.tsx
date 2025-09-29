import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Building2, Users } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";

export function AccountHeader() {
  const location = useLocation();
  const params = useParams();
  const { isPlatformAdmin, isEnterpriseUser } = usePermissions();

  // Determine context
  const isInEnterprise = location.pathname.startsWith('/enterprises/');
  const isInOrganization = location.pathname.startsWith('/organization/');

  const accountId = params.id;

  const [enterpriseName, setEnterpriseName] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);

  // Fetch enterprise name only for platform admins
  useEffect(() => {
    let isCancelled = false;
    const fetchEnterprise = async () => {
      if (!(isInEnterprise && accountId && isPlatformAdmin)) {
        setEnterpriseName(null);
        return;
      }
      const { data } = await supabase
        .from('enterprises')
        .select('name')
        .eq('id', accountId)
        .single();
      if (!isCancelled) {
        setEnterpriseName(data?.name ?? null);
      }
    };
    fetchEnterprise();
    return () => { isCancelled = true; };
  }, [isInEnterprise, accountId, isPlatformAdmin]);

  // Fetch organization name for platform or enterprise users
  useEffect(() => {
    let isCancelled = false;
    const fetchOrganization = async () => {
      if (!(isInOrganization && accountId && (isPlatformAdmin || isEnterpriseUser))) {
        setOrganizationName(null);
        return;
      }
      const { data } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', accountId)
        .single();
      if (!isCancelled) {
        setOrganizationName(data?.name ?? null);
      }
    };
    fetchOrganization();
    return () => { isCancelled = true; };
  }, [isInOrganization, accountId, isPlatformAdmin, isEnterpriseUser]);

  // Hide header entirely if not in enterprise/org context
  if (!isInEnterprise && !isInOrganization) return null;

  // Enterprise header (Platform Admin only)
  if (isInEnterprise && isPlatformAdmin && enterpriseName) {
    return (
      <div className="border-b bg-card/50 backdrop-blur-sm w-full">
        <div className="px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Currently viewing Enterprise:</span>
              <span className="font-semibold text-foreground">{enterpriseName}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Organization header (Platform or Enterprise User)
  if (isInOrganization && (isPlatformAdmin || isEnterpriseUser) && organizationName) {
    return (
      <div className="border-b bg-card/50 backdrop-blur-sm w-full">
        <div className="px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Currently viewing Organization:</span>
              <span className="font-semibold text-foreground">{organizationName}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}