import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { safeMutation } from '@/lib/safeMutation';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { usePlatformAdminAssignments } from '@/hooks/usePlatformAdminAssignments';

export interface Account {
  id: string;
  name: string;
  type: 'Enterprise' | 'Organization';
  category: string;
  members: number;
  email: string;
  phone: string;
  created: string;
  tenant_id?: string;
  organization_type?: string;
  is_active: boolean;
  primaryContact?: string;
  address?: any;
  settings?: any;
}

export interface CreateAccountRequest {
  name: string;
  type: 'Enterprise' | 'Organization';
  category: string;
  primaryEmail: string;
  primaryPhone: string;
  secondaryEmail?: string;
  secondaryPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  tenantId?: string; // Optional - Organizations can exist independently without an Enterprise
}

// Map UI categories to database organization types
const mapCategoryToOrgType = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    'Search & Rescue': 'search_and_rescue',
    'Lifeguard Service': 'lifeguard_service',
    'Park Service': 'park_service',
    'Event Medical': 'event_medical',
    'Ski Patrol': 'ski_patrol',
    'Harbor Master': 'harbor_master',
    'Volunteer Emergency Services': 'volunteer_emergency_services'
  };
  return categoryMap[category] || 'search_and_rescue';
};

// Map database organization types to UI categories
const mapOrgTypeToCategory = (orgType: string): string => {
  const typeMap: { [key: string]: string } = {
    'search_and_rescue': 'Search & Rescue',
    'lifeguard_service': 'Lifeguard Service',
    'park_service': 'Park Service',
    'event_medical': 'Event Medical',
    'ski_patrol': 'Ski Patrol',
    'harbor_master': 'Harbor Master',
    'volunteer_emergency_services': 'Volunteer Emergency Services'
  };
  // If it's a legacy hardcoded type, map it; otherwise return as-is (dynamic subtype)
  return typeMap[orgType] || orgType;
};

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isPlatformAdmin } = usePermissions();
  const { assignments } = usePlatformAdminAssignments();

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      
      console.log("Fetching accounts - isPlatformAdmin:", isPlatformAdmin);
      
      if (!isPlatformAdmin) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view accounts",
          variant: "destructive"
        });
        return;
      }

      // Fetch tenants (Enterprises)
      const { data: tenants, error: tenantsError } = await supabase
        .from('enterprises')
        .select('*')
        .order('created_at', { ascending: false });

      if (tenantsError) throw tenantsError;
      console.log("Fetched tenants:", tenants);

      // Fetch organizations
      const { data: organizations, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (orgsError) throw orgsError;
      console.log("Fetched organizations:", organizations);

      // Get user counts for each tenant/organization
      const { data: userCounts, error: userCountsError } = await supabase
        .from('users')
        .select('tenant_id, organization_id')
        .eq('status', 'active');

      if (userCountsError) throw userCountsError;

      // Process tenants as Enterprise accounts
      const enterpriseAccounts: Account[] = (tenants || []).map(tenant => {
        const memberCount = userCounts?.filter(u => u.tenant_id === tenant.id).length || 0;
        
        // Validate tenant ID
        if (!tenant.id || tenant.id === 'undefined') {
          console.error("Invalid tenant ID found:", tenant);
          return null;
        }
        
        const settings: any = tenant.settings || {};
        let enterpriseSubtype = settings.enterprise_subtype || 'Municipality';
        const isPlatformRoot = (tenant as any)?.slug === 'patroller-console' || tenant.name === 'Patroller Console';
        if (isPlatformRoot) {
          enterpriseSubtype = 'Root Account';
        }
        const account = {
          id: tenant.id,
          name: tenant.name,
          type: 'Enterprise' as const,
          category: enterpriseSubtype,
          members: memberCount,
          email: (tenant.settings as any)?.contact_email || 'N/A',
          phone: (tenant.settings as any)?.contact_phone || 'N/A',
          created: new Date(tenant.created_at).toLocaleDateString(),
          tenant_id: tenant.id,
          is_active: tenant.subscription_status === 'active',
          primaryContact: settings.contact_primary_name || '',
          address: settings.address || undefined,
          settings: tenant.settings
        };
        
        console.log("Created enterprise account:", account);
        return account;
      }).filter(Boolean) as Account[];

      // Process organizations as Organization accounts
      const organizationAccounts: Account[] = (organizations || []).map(org => {
        const memberCount = userCounts?.filter(u => u.organization_id === org.id).length || 0;
        
        // Validate organization ID
        if (!org.id || org.id === 'undefined') {
          console.error("Invalid organization ID found:", org);
          return null;
        }
        
        const account = {
          id: org.id,
          name: org.name,
          type: 'Organization' as const,
          category: org.organization_subtype || mapOrgTypeToCategory(org.organization_type),
          members: memberCount,
          email: org.contact_email || 'N/A',
          phone: org.contact_phone || 'N/A',
          created: new Date(org.created_at).toLocaleDateString(),
          tenant_id: org.tenant_id,
          organization_type: org.organization_type,
          is_active: org.is_active,
          address: org.address,
          settings: org.settings
        };
        
        console.log("Created organization account:", account);
        return account;
      }).filter(Boolean) as Account[];

      // Platform admins have global access; do not restrict by assignments here.
      // Route-level enforcement is handled by ProtectedRoute.
      const combined = [...enterpriseAccounts, ...organizationAccounts];
      console.log("Final accounts array (after assignment filter if platform admin):", combined);
      setAccounts(combined);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast({
        title: "Error",
        description: "Failed to load accounts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (accountData: CreateAccountRequest) => {
    if (!isPlatformAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create accounts",
        variant: "destructive"
      });
      return false;
    }

    try {
      const slugify = (text: string) =>
        text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

      const getUniqueTenantSlug = async (base: string): Promise<string> => {
        let attempt = base;
        let counter = 2;
        // Ensure uniqueness across tenants.slug
        // RLS: platform admins have SELECT via policy
        // Loop will usually exit immediately
        // Guard against excessive loops
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { data } = await supabase
            .from('enterprises')
            .select('id')
            .eq('slug', attempt)
            .limit(1);
          if (!data || data.length === 0) return attempt;
          attempt = `${base}-${counter++}`;
          if (counter > 1000) return `${base}-${crypto.randomUUID().slice(0, 8)}`;
        }
      };

      const getUniqueOrgSlug = async (tenantId: string | null | undefined, base: string): Promise<string> => {
        let attempt = base;
        let counter = 2;
        // UNIQUE constraint: if tenantId is present, (tenant_id, slug) must be unique
        // If tenantId is NULL, slug must be globally unique
        // eslint-disable-next-line no-constant-condition
        while (true) {
          let query = supabase
            .from('organizations')
            .select('id')
            .eq('slug', attempt)
            .limit(1);
          
          // If tenant_id is provided, scope uniqueness check to that tenant
          if (tenantId) {
            query = query.eq('tenant_id', tenantId);
          } else {
            // For standalone orgs (no tenant), check globally
            query = query.is('tenant_id', null);
          }
          
          const { data } = await query;
          if (!data || data.length === 0) return attempt;
          attempt = `${base}-${counter++}`;
          if (counter > 1000) return `${base}-${crypto.randomUUID().slice(0, 8)}`;
        }
      };
      const address = {
        street: accountData.address || '',
        city: accountData.city || '',
        state: accountData.state || '',
        zip: accountData.zip || '',
        country: 'USA'
      };

      if (accountData.type === 'Enterprise') {
        // Create Enterprise (Tenant with default organization)
        const baseTenantSlug = slugify(accountData.name);
        const uniqueTenantSlug = await getUniqueTenantSlug(baseTenantSlug);
        const baseOrgSlug = slugify(`${accountData.name}-main`);
        // New tenant has no orgs yet; baseOrgSlug is fine

        const { data, error } = await supabase.rpc('tenant_create_with_org', {
          p_tenant_name: accountData.name,
          p_tenant_slug: uniqueTenantSlug,
          p_org_name: `${accountData.name} - Main Office`,
          p_org_slug: baseOrgSlug,
          p_org_type: mapCategoryToOrgType(accountData.category) as any,
          p_admin_email: accountData.primaryEmail,
          p_admin_name: `${accountData.name} Administrator`,
          p_subscription_tier: 'enterprise'
        });

        if (error) throw error;

        toast({
          title: "Enterprise Created",
          description: `${accountData.name} has been created successfully`,
        });
      } else {
        // Create Organization - enterprise assignment is optional
        const tenantId = accountData.tenantId || null;

        const baseOrgSlug = slugify(accountData.name);
        const uniqueOrgSlug = await getUniqueOrgSlug(tenantId, baseOrgSlug);

        // Determine if category is legacy enum or dynamic subtype
        const mapped = mapCategoryToOrgType(accountData.category);
        const isLegacyEnum = mapped !== 'search_and_rescue' || accountData.category === 'Search & Rescue';
        const orgType = isLegacyEnum ? mapped : 'search_and_rescue';
        const orgSubtype = isLegacyEnum ? null : accountData.category;

        const requestId = crypto.randomUUID();
        const ok = await safeMutation(`create-org:${uniqueOrgSlug}:${requestId}`, {
          op: async () => {
            const { error } = await supabase.rpc('organization_create_tx', {
              p_payload: {
                tenant_id: tenantId,
                name: accountData.name,
                slug: uniqueOrgSlug,
                organization_type: orgType as any,
                organization_subtype: orgSubtype,
                contact_email: accountData.primaryEmail,
                contact_phone: accountData.primaryPhone,
                address: address as any,
                description: `${accountData.category} organization`,
                settings: {
                  secondary_email: accountData.secondaryEmail,
                  secondary_phone: accountData.secondaryPhone
                },
                is_active: true,
              },
              p_request_id: requestId,
            });
            if (error) throw error;
          },
          refetch: () => fetchAccounts(),
          name: 'create_organization_tx',
          tags: { request_id: requestId },
        });
        if (!ok) throw new Error('Create organization failed');

        toast({
          title: "Organization Created",
          description: `${accountData.name} has been created successfully`,
        });
      }

      // Refresh the accounts list
      fetchAccounts();
      return true;
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast({
        title: "Error",
        description: error?.message ? `Failed to create account: ${error.message}` : "Failed to create account",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    if (!isPlatformAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to update accounts",
        variant: "destructive"
      });
      return false;
    }

    try {
      const account = accounts.find(a => a.id === id);
      if (!account) {
        toast({
          title: "Error",
          description: "Account not found",
          variant: "destructive"
        });
        return false;
      }

      if (account.type === 'Enterprise') {
        // Update enterprise settings and profile fields
        const isPlatformRoot = account.name === 'Patroller Console';
        const nextSettings: any = {
          ...(account.settings || {}),
          contact_email: updates.email ?? (account.settings as any)?.contact_email,
          contact_phone: updates.phone ?? (account.settings as any)?.contact_phone,
          contact_primary_name: updates.primaryContact ?? (account.settings as any)?.contact_primary_name,
          enterprise_subtype: isPlatformRoot ? 'Root Account' : (updates.category ?? (account.settings as any)?.enterprise_subtype),
          address: updates.address ?? (account.settings as any)?.address,
        };

        const payload: any = {
          name: updates.name,
          settings: nextSettings,
        };
        const requestId = crypto.randomUUID();
        const ok = await safeMutation(`update-enterprise:${id}:${requestId}`, {
          op: async () => {
            const { error } = await supabase.rpc('enterprise_update_settings_tx', {
              p_tenant_id: id,
              p_payload: payload,
              p_request_id: requestId,
            });
            if (error) throw error;
          },
          refetch: () => fetchAccounts(),
          name: 'update_enterprise_settings_tx',
          tags: { request_id: requestId },
        });
        if (!ok) throw new Error('Enterprise update failed');
      } else {
        // Update organization via transactional RPC
        let orgType: string | undefined = undefined;
        let orgSubtype: string | null = null;
        if (updates.category) {
          const mapped = mapCategoryToOrgType(updates.category);
          const isLegacyEnum = mapped !== 'search_and_rescue' || updates.category === 'Search & Rescue';
          if (isLegacyEnum) {
            orgType = mapped;
            orgSubtype = null;
          } else {
            orgType = 'search_and_rescue';
            orgSubtype = updates.category;
          }
        }
        const payload: any = {
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          organization_type: orgType as any,
          organization_subtype: orgSubtype,
          is_active: updates.is_active,
          address: updates.address,
          tenant_id: updates.tenant_id,
        };
        const requestId = crypto.randomUUID();
        const ok = await safeMutation(`update-org:${id}:${requestId}` ,{
          op: async () => {
            const { error } = await supabase.rpc('organization_update_or_delete', {
              p_org_id: id,
              p_mode: 'update',
              p_payload: payload,
              p_request_id: requestId,
            });
            if (error) throw error;
          },
          refetch: () => fetchAccounts(),
        });
        if (!ok) throw new Error('Update failed');
      }

      toast({
        title: "Account Updated",
        description: "Account has been updated successfully",
      });

      // Refresh the accounts list
      fetchAccounts();
      return true;
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        title: "Error",
        description: "Failed to update account",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteAccount = async (id: string) => {
    if (!isPlatformAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete accounts",
        variant: "destructive"
      });
      return false;
    }

    try {
      const account = accounts.find(a => a.id === id);
      if (!account) {
        toast({
          title: "Error",
          description: "Account not found",
          variant: "destructive"
        });
        return false;
      }

      if (account.type === 'Enterprise') {
        const requestId = crypto.randomUUID();
        const ok = await safeMutation(`delete-tenant:${id}:${requestId}`, {
          op: async () => {
            const { error } = await supabase.rpc('enterprise_delete_tx', {
              p_tenant_id: id,
              p_actor_id: '',
              p_force: true,
              p_request_id: requestId,
            });
            if (error) throw error;
          },
          refetch: () => fetchAccounts(),
          name: 'delete_enterprise_tx',
          tags: { request_id: requestId },
        });
        if (!ok) throw new Error('Delete enterprise failed');
      } else {
        const requestId = crypto.randomUUID();
        const ok = await safeMutation(`delete-org:${id}:${requestId}`, {
          op: async () => {
            const { error } = await supabase.rpc('organization_update_or_delete', {
              p_org_id: id,
              p_mode: 'delete',
              p_payload: {},
              p_request_id: requestId,
            });
            if (error) throw error;
          },
          refetch: () => fetchAccounts(),
        });
        if (!ok) throw new Error('Delete failed');
      }

      toast({
        title: "Account Deleted",
        description: "Account has been permanently deleted",
      });

      // Refresh the accounts list
      fetchAccounts();
      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    if (isPlatformAdmin) {
      fetchAccounts();
    } else {
      // If the user isn't a platform admin, there's nothing to fetch here.
      // Ensure the loading state doesn't hang so the UI can render Access Denied.
      setAccounts([]);
      setLoading(false);
    }
  }, [isPlatformAdmin, assignments]);

  return {
    accounts,
    loading,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    canManageAccounts: isPlatformAdmin
  };
};