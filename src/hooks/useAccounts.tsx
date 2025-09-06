import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

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
  return typeMap[orgType] || 'Search & Rescue';
};

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isPlatformAdmin } = usePermissions();

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
        .from('tenants')
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
        
        const account = {
          id: tenant.id,
          name: tenant.name,
          type: 'Enterprise' as const,
          category: 'Enterprise Management',
          members: memberCount,
          email: (tenant.settings as any)?.contact_email || 'N/A',
          phone: (tenant.settings as any)?.contact_phone || 'N/A',
          created: new Date(tenant.created_at).toLocaleDateString(),
          tenant_id: tenant.id,
          is_active: tenant.subscription_status === 'active',
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
          category: mapOrgTypeToCategory(org.organization_type),
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

      console.log("Final accounts array:", [...enterpriseAccounts, ...organizationAccounts]);
      setAccounts([...enterpriseAccounts, ...organizationAccounts]);
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
      const address = {
        street: accountData.address || '',
        city: accountData.city || '',
        state: accountData.state || '',
        zip: accountData.zip || '',
        country: 'USA'
      };

      if (accountData.type === 'Enterprise') {
        // Create Enterprise (Tenant with default organization)
        const { data, error } = await supabase.rpc('create_tenant_with_organization', {
          p_tenant_name: accountData.name,
          p_tenant_slug: accountData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          p_org_name: `${accountData.name} - Main Office`,
          p_org_slug: `${accountData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-main`,
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
        // Create standalone Organization
        // First need to get a tenant to assign to
        const { data: tenants } = await supabase
          .from('tenants')
          .select('id')
          .eq('subscription_tier', 'enterprise')
          .limit(1);

        if (!tenants || tenants.length === 0) {
          toast({
            title: "Error",
            description: "No available enterprise tenant found",
            variant: "destructive"
          });
          return false;
        }

        const { error } = await supabase
          .from('organizations')
          .insert({
            tenant_id: tenants[0].id,
            name: accountData.name,
            slug: accountData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            organization_type: mapCategoryToOrgType(accountData.category) as any,
            contact_email: accountData.primaryEmail,
            contact_phone: accountData.primaryPhone,
            address: address,
            description: `${accountData.category} organization`,
            settings: {
              secondary_email: accountData.secondaryEmail,
              secondary_phone: accountData.secondaryPhone
            }
          });

        if (error) throw error;

        toast({
          title: "Organization Created",
          description: `${accountData.name} has been created successfully`,
        });
      }

      // Refresh the accounts list
      fetchAccounts();
      return true;
    } catch (error) {
      console.error('Error creating account:', error);
      toast({
        title: "Error",
        description: "Failed to create account",
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
        // Update tenant
        const { error } = await supabase
          .from('tenants')
          .update({
            name: updates.name,
            settings: {
              ...account.settings,
              contact_email: updates.email,
              contact_phone: updates.phone
            }
          })
          .eq('id', id);

        if (error) throw error;
      } else {
        // Update organization
        const { error } = await supabase
          .from('organizations')
          .update({
            name: updates.name,
            contact_email: updates.email,
            contact_phone: updates.phone,
            organization_type: updates.category ? (mapCategoryToOrgType(updates.category) as any) : undefined,
            is_active: updates.is_active,
            address: updates.address
          })
          .eq('id', id);

        if (error) throw error;
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
        // Soft delete tenant by marking as inactive
        const { error } = await supabase
          .from('tenants')
          .update({ subscription_status: 'cancelled' })
          .eq('id', id);

        if (error) throw error;
      } else {
        // Soft delete organization by marking as inactive
        const { error } = await supabase
          .from('organizations')
          .update({ is_active: false })
          .eq('id', id);

        if (error) throw error;
      }

      toast({
        title: "Account Deactivated",
        description: "Account has been deactivated successfully",
      });

      // Refresh the accounts list
      fetchAccounts();
      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate account",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    if (isPlatformAdmin) {
      fetchAccounts();
    }
  }, [isPlatformAdmin]);

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