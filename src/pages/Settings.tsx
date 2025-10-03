import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
// Removed unused Dialog components for dummy add-org flow
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings as SettingsIcon, Save, Mail, Phone, MapPin, Building2, UserX, Trash2, Users, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccounts, Account } from "@/hooks/useAccounts";
import { useEnterpriseData } from "@/hooks/useEnterpriseData";
import { supabase } from "@/integrations/supabase/client";
import { safeMutation } from "@/lib/safeMutation";
import { usePermissions } from "@/hooks/usePermissions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

// Removed legacy mock data and dummy lists

export default function Settings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { accounts, loading, updateAccount, deleteAccount } = useAccounts();
  const { isPlatformAdmin, canManageOrgSettings } = usePermissions();
  // Removed dummy add-org modal state and mock organizations
  const [isEditing, setIsEditing] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "Organization",
    category: "",
    primaryEmail: "",
    primaryPhone: "",
    primaryContact: "",
    secondaryEmail: "",
    secondaryPhone: "",
    secondaryContact: "",
    address: "",
    city: "",
    state: "",
    zip: ""
  });

  // Parent Enterprise assign/search state
  const [enterpriseSearchOpen, setEnterpriseSearchOpen] = useState(false);
  const [enterpriseQuery, setEnterpriseQuery] = useState("");
  const [enterprises, setEnterprises] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingEnterprises, setLoadingEnterprises] = useState(false);
  const [currentEnterprise, setCurrentEnterprise] = useState<{ id: string; name: string } | null>(null);
  const [pendingEnterpriseId, setPendingEnterpriseId] = useState<string | null>(null);
  const [unassigningOrgId, setUnassigningOrgId] = useState<string | null>(null);

  // Assign organizations to enterprise state
  const [orgSearchOpen, setOrgSearchOpen] = useState(false);
  const [orgQuery, setOrgQuery] = useState("");
  const [unassignedOrgs, setUnassignedOrgs] = useState<Array<{ id: string; name: string; type: string }>>([]);
  const [loadingUnassignedOrgs, setLoadingUnassignedOrgs] = useState(false);
  const [assigningOrgId, setAssigningOrgId] = useState<string | null>(null);

  // Subtypes state
  const [enterpriseSubtypes, setEnterpriseSubtypes] = useState<string[]>([]);
  const [organizationSubtypes, setOrganizationSubtypes] = useState<string[]>([]);
  const [loadingEnterpriseSubtypes, setLoadingEnterpriseSubtypes] = useState(false);
  const [loadingOrgSubtypes, setLoadingOrgSubtypes] = useState(false);
  const [forceDbReload, setForceDbReload] = useState(false);

  // Include legacy enum labels so previously saved enum values appear in the dropdown
  const legacyOrganizationSubtypeLabels = [
    'Search & Rescue',
    'Lifeguard Service',
    'Park Service',
    'Event Medical',
    'Ski Patrol',
    'Harbor Master',
    'Volunteer Emergency Services'
  ];
  const combinedOrganizationSubtypes = Array.from(new Set([
    ...organizationSubtypes,
    ...legacyOrganizationSubtypeLabels
  ]));

  const loadEnterprises = async (q: string) => {
    try {
      setLoadingEnterprises(true);
      const query = supabase
        .from('enterprises')
        .select('id, name, slug')
        .order('name', { ascending: true })
        .limit(20);
      // @ts-ignore - supabase-js supports ilike
      if (q) query.ilike('name', `%${q}%`);
      const { data } = await query;
      setEnterprises(
        (data || [])
          .filter((t: any) => t.slug !== 'patroller-root' && t.name !== 'Patroller Root')
          .map((t: any) => ({ id: t.id, name: t.name }))
      );
    } catch (e) {
      // no-op
    } finally {
      setLoadingEnterprises(false);
    }
  };

  const loadUnassignedOrganizations = async (q: string) => {
    try {
      setLoadingUnassignedOrgs(true);
      // Get the platform root tenant ID
      const { data: platformTenant } = await supabase
        .from('enterprises')
        .select('id')
        .eq('slug', 'patroller-root')
        .maybeSingle();
      
      if (!platformTenant) return;

      const query = supabase
        .from('organizations')
        .select('id, name, organization_type, organization_subtype')
        .eq('tenant_id', platformTenant.id)
        .order('name', { ascending: true })
        .limit(20);
      
      // @ts-ignore - supabase-js supports ilike
      if (q) query.ilike('name', `%${q}%`);
      
      const { data } = await query;
      setUnassignedOrgs(
        (data || []).map((org: any) => ({
          id: org.id,
          name: org.name,
          type: org.organization_subtype || mapOrgTypeToCategory(org.organization_type)
        }))
      );
    } catch (e) {
      console.error('Error loading unassigned organizations:', e);
    } finally {
      setLoadingUnassignedOrgs(false);
    }
  };

  const loadEnterpriseSubtypes = useCallback(async () => {
    try {
      setLoadingEnterpriseSubtypes(true);
      
      // Get the platform-level tenant (root tenant)
      const { data: platformTenant, error: tenantError } = await supabase
        .from('enterprises')
        .select('id')
        .eq('slug', 'patroller-root')
        .maybeSingle();
      
      if (tenantError || !platformTenant) {
        console.error('Error loading platform tenant:', tenantError);
        setEnterpriseSubtypes([]);
        return;
      }
      
      console.log('Loading enterprise subtypes from platform tenant:', platformTenant.id);
      const { data, error } = await supabase
        .from('enterprise_subtypes')
        .select('name')
        .eq('tenant_id', platformTenant.id)
        .eq('is_active', true)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error loading enterprise subtypes:', error);
        setEnterpriseSubtypes([]);
      } else {
        console.log('Loaded enterprise subtypes:', data);
        setEnterpriseSubtypes((data || []).map((row: any) => row.name));
      }
    } catch (e) {
      console.error('Exception loading enterprise subtypes:', e);
      setEnterpriseSubtypes([]);
    } finally {
      setLoadingEnterpriseSubtypes(false);
    }
  }, []);

  const loadOrganizationSubtypes = useCallback(async () => {
    try {
      setLoadingOrgSubtypes(true);
      
      // Get the platform-level tenant (root tenant)
      const { data: platformTenant, error: tenantError } = await supabase
        .from('enterprises')
        .select('id')
        .eq('slug', 'patroller-root')
        .maybeSingle();
      
      if (tenantError || !platformTenant) {
        console.error('Error loading platform tenant:', tenantError);
        setOrganizationSubtypes([]);
        return;
      }
      
      console.log('Loading org subtypes from platform tenant:', platformTenant.id);
      const { data, error } = await supabase
        .from('organization_subtypes')
        .select('name')
        .eq('tenant_id', platformTenant.id)
        .eq('is_active', true)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error loading organization subtypes:', error);
        setOrganizationSubtypes([]);
      } else {
        console.log('Loaded org subtypes:', data);
        setOrganizationSubtypes((data || []).map((row: any) => row.name));
      }
    } catch (e) {
      console.error('Exception loading organization subtypes:', e);
      setOrganizationSubtypes([]);
    } finally {
      setLoadingOrgSubtypes(false);
    }
  }, []);

  // Enterprise organizations (for Enterprise Settings listing)
  const {
    organizations: enterpriseOrganizations,
    loading: loadingEnterpriseOrgs,
    refetch: refetchEnterpriseData
  } = useEnterpriseData((currentAccount?.type === 'Enterprise' ? currentAccount?.id : undefined) as string | undefined);

  // Map database organization types to UI categories (duplicate of internal map in useAccounts)
  const mapOrgTypeToCategory = (orgType?: string): string => {
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
    return orgType ? (typeMap[orgType] || orgType) : 'Search & Rescue';
  };

  const loadAccountById = async (accountId: string) => {
    console.log('loadAccountById called with ID:', accountId);
    try {
      // Try organization first
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', accountId)
        .maybeSingle();
      
      console.log('Organization query result:', { org, orgError });
      
      if (org) {
        // Use organization_subtype if it exists, otherwise fallback to organization_type for display
        const displayCategory = org.organization_subtype || mapOrgTypeToCategory(org.organization_type);
        
        const account: Account = {
          id: org.id,
          name: org.name,
          type: 'Organization',
          category: displayCategory,
          members: 0,
          email: org.contact_email || 'N/A',
          phone: org.contact_phone || 'N/A',
          created: new Date(org.created_at).toLocaleDateString(),
          tenant_id: org.tenant_id,
          organization_type: org.organization_type,
          is_active: org.is_active,
          address: org.address,
          settings: org.settings
        };
        console.log('Setting currentAccount (org):', account);
        setCurrentAccount(account);
        // Preload current enterprise
        if (org.tenant_id) {
          const { data: ent } = await supabase
            .from('enterprises')
            .select('id, name, slug')
            .eq('id', org.tenant_id)
            .maybeSingle();
          if (ent) {
            const isPlatformRoot = (ent as any).slug === 'patroller-root' || ent.name === 'Patroller Root';
            if (isPlatformRoot) {
              setCurrentEnterprise(null);
            } else {
              setCurrentEnterprise({ id: ent.id, name: ent.name });
            }
          } else {
            setCurrentEnterprise(null);
          }
        } else {
          setCurrentEnterprise(null);
        }
        const addr = (org.address || {}) as any;
        setFormData({
          name: account.name,
          type: account.type,
          // Use organization_subtype if it exists, otherwise map legacy enum to display label
          category: org.organization_subtype || mapOrgTypeToCategory(org.organization_type),
          primaryEmail: account.email,
          primaryPhone: account.phone,
          primaryContact: "",
          secondaryEmail: "",
          secondaryPhone: "",
          secondaryContact: "",
          address: addr.street || "",
          city: addr.city || "",
          state: addr.state || "",
          zip: addr.zip || ""
        });
        console.log('Form data set successfully for organization');
        return true;
      }

      // Then try enterprise
      console.log('Not an organization, trying enterprise...');
      const { data: tenant, error: tenantError } = await supabase
        .from('enterprises')
        .select('*')
        .eq('id', accountId)
        .maybeSingle();
      
      console.log('Enterprise query result:', { tenant, tenantError });
      
      if (tenant) {
        const tenantSettings: any = tenant.settings || {};
        const isPlatformRoot = tenant.slug === 'patroller-root' || tenant.name === 'Patroller Root';
        const enterpriseSubtype: string = isPlatformRoot ? 'Root Account' : (tenantSettings.enterprise_subtype || 'Municipality');
        const account: Account = {
          id: tenant.id,
          name: tenant.name,
          type: 'Enterprise',
          category: enterpriseSubtype,
          members: 0,
          email: (tenant.settings as any)?.contact_email || 'N/A',
          phone: (tenant.settings as any)?.contact_phone || 'N/A',
          created: new Date(tenant.created_at).toLocaleDateString(),
          tenant_id: tenant.id,
          is_active: tenant.subscription_status === 'active',
          settings: tenant.settings
        };
        console.log('Setting currentAccount (enterprise):', account);
        setCurrentAccount(account);
        setFormData({
          name: account.name,
          type: account.type,
          category: enterpriseSubtype,
          primaryEmail: (tenant.settings as any)?.contact_email || '',
          primaryPhone: (tenant.settings as any)?.contact_phone || '',
          primaryContact: tenantSettings.contact_primary_name || '',
          secondaryEmail: "",
          secondaryPhone: "",
          secondaryContact: "",
          address: (tenantSettings.address && tenantSettings.address.street) || '',
          city: (tenantSettings.address && tenantSettings.address.city) || '',
          state: (tenantSettings.address && tenantSettings.address.state) || '',
          zip: (tenantSettings.address && tenantSettings.address.zip) || ''
        });
        console.log('Form data set successfully for enterprise');
        return true;
      }
      
      console.log('No account found (neither org nor enterprise)');
    } catch (e) {
      console.error('Exception in loadAccountById:', e);
    }
    return false;
  };

  // Load account data
  useEffect(() => {
    const run = async () => {
      console.log("Settings component - useEffect triggered");
      console.log("ID from params:", id);
      console.log("Accounts length:", accounts.length);
      console.log("isPlatformAdmin:", isPlatformAdmin);
      console.log("Force DB reload:", forceDbReload);
      if (!id) return;

      // Always fetch directly from DB to ensure we have the latest data
      // This ensures that if the organization was unassigned from Enterprise Settings,
      // we see the updated state when viewing Organization Settings
      const loaded = await loadAccountById(id);
      if (!loaded) {
        toast({
          title: "Account Not Found",
          description: "The requested account could not be found.",
          variant: "destructive"
        });
        // Only redirect to /accounts if platform admin, otherwise go to their default page
        if (isPlatformAdmin) {
          navigate('/accounts');
        } else {
          navigate('/');
        }
      }
      
      // Reset force reload flag after loading
      if (forceDbReload) {
        setForceDbReload(false);
      }
    };
    run();
  }, [id, navigate, toast, isPlatformAdmin, forceDbReload]);

  // When the currentEnterprise changes (e.g., after save), ensure Enterprise-related pages show new orgs
  useEffect(() => {
    // No direct action here; relevant pages read live from Supabase on mount.
    // This effect is a placeholder to indicate dependency and potential future refetch hooks.
  }, [currentEnterprise]);

  // Load enterprise subtypes when account is loaded and is an enterprise
  useEffect(() => {
    if (currentAccount && currentAccount.type === 'Enterprise') {
      loadEnterpriseSubtypes();
    }
  }, [currentAccount?.id, currentAccount?.type, loadEnterpriseSubtypes]);

  // Load organization subtypes when account is loaded and is an organization
  useEffect(() => {
    if (currentAccount && currentAccount.type === 'Organization') {
      loadOrganizationSubtypes();
    }
  }, [currentAccount?.id, currentAccount?.type, loadOrganizationSubtypes]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!currentAccount) return;
    
    try {
      // Platform admins use the useAccounts hook
      if (isPlatformAdmin) {
        // Determine the tenant_id value to send
        let tenantIdUpdate = {};
        if (currentAccount.type === 'Organization' && pendingEnterpriseId !== undefined && pendingEnterpriseId !== null) {
          // 'CLEAR' means set to null, otherwise use the actual ID
          tenantIdUpdate = { tenant_id: (pendingEnterpriseId === 'CLEAR' ? null : pendingEnterpriseId) as any };
        }

        const success = await updateAccount(currentAccount.id, {
          name: formData.name,
          type: formData.type as 'Enterprise' | 'Organization',
          category: formData.category,
          email: formData.primaryEmail,
          phone: formData.primaryPhone,
          primaryContact: formData.primaryContact,
          address: {
            street: formData.address,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: 'USA'
          } as any,
          ...tenantIdUpdate
        });
        
        if (!success) {
          throw new Error("Update failed");
        }
      } else {
        // Non-platform admins update directly via Supabase (RLS policies will enforce permissions)
        if (currentAccount.type === 'Organization') {
          // Check if the category is a dynamic subtype or a legacy enum value
          const legacyEnumMap: { [key: string]: string } = {
            'Search & Rescue': 'search_and_rescue',
            'Lifeguard Service': 'lifeguard_service',
            'Park Service': 'park_service',
            'Event Medical': 'event_medical',
            'Ski Patrol': 'ski_patrol',
            'Harbor Master': 'harbor_master',
            'Volunteer Emergency Services': 'volunteer_emergency_services'
          };
          
          // Determine if it's a legacy enum or dynamic subtype
          const isLegacyEnum = legacyEnumMap[formData.category] !== undefined;
          const orgType = isLegacyEnum ? legacyEnumMap[formData.category] : 'search_and_rescue'; // Default fallback
          const orgSubtype = isLegacyEnum ? null : formData.category; // Store dynamic subtype

          const { error } = await supabase
            .from('organizations')
            .update({
              name: formData.name,
              contact_email: formData.primaryEmail,
              contact_phone: formData.primaryPhone,
              organization_type: orgType as any,
              organization_subtype: orgSubtype,
              address: {
                street: formData.address,
                city: formData.city,
                state: formData.state,
                zip: formData.zip,
                country: 'USA'
              }
            })
            .eq('id', currentAccount.id);

          if (error) throw error;
        } else {
          // For enterprises, update settings via RPC
          const currentSettings = currentAccount.settings || {};
          const payload = {
            name: formData.name,
            settings: {
              ...currentSettings,
              contact_email: formData.primaryEmail,
              contact_phone: formData.primaryPhone,
              contact_primary_name: formData.primaryContact,
              enterprise_subtype: formData.category,
              address: {
                street: formData.address,
                city: formData.city,
                state: formData.state,
                zip: formData.zip,
                country: 'USA'
              }
            }
          } as any;
          const requestId = crypto.randomUUID();
          const ok = await safeMutation(`update-enterprise:${currentAccount.id}:${requestId}`, {
            op: () => supabase.rpc('update_enterprise_settings_tx', {
              p_tenant_id: currentAccount.id,
              p_payload: payload,
              p_request_id: requestId,
            }),
            name: 'update_enterprise_settings_tx',
            tags: { request_id: requestId },
          });
          if (!ok) throw new Error('Enterprise update failed');
        }
      }

      setIsEditing(false);
      if (pendingEnterpriseId !== undefined && pendingEnterpriseId !== null) {
        if (pendingEnterpriseId === 'CLEAR') {
          setCurrentEnterprise(null);
        } else {
          setCurrentEnterprise(enterprises.find(e => e.id === pendingEnterpriseId) || currentEnterprise);
        }
        setPendingEnterpriseId(null);
        // If we're in Enterprise Settings, refresh enterprise orgs list
        if (currentAccount.type === 'Enterprise') {
          refetchEnterpriseData();
        }
      }
      
      // Force a database reload to ensure we get the latest saved data
      setForceDbReload(true);
      
      toast({
        title: "Settings Updated Successfully",
        description: "Your changes have been saved.",
      });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error Saving Settings",
        description: error?.message || "Failed to save your changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAssignOrganization = async (orgId: string) => {
    if (!isPlatformAdmin || !currentAccount || currentAccount.type !== 'Enterprise') return;

    try {
      setAssigningOrgId(orgId);

      // Assign the organization to this enterprise
      const requestId = crypto.randomUUID();
      const ok = await safeMutation(`assign-org:${orgId}:${requestId}`, {
        op: () => supabase.rpc('update_or_delete_organization_tx', {
          p_org_id: orgId,
          p_mode: 'update',
          p_payload: { tenant_id: currentAccount.id },
          p_request_id: requestId,
        }),
        name: 'update_or_delete_organization_tx',
        tags: { request_id: requestId },
        refetch: () => refetchEnterpriseData(),
      });
      
      if (!ok) throw new Error('Assignment failed');

      toast({
        title: "Organization Assigned",
        description: "The organization has been assigned to this enterprise.",
      });

      // Refresh the enterprise organizations list
      refetchEnterpriseData();
      // Clear the search to force reload of unassigned orgs
      setOrgQuery("");
      setUnassignedOrgs([]);
      setOrgSearchOpen(false);
    } catch (error: any) {
      console.error("Error assigning organization:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to assign organization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAssigningOrgId(null);
    }
  };

  const handleUnassignOrganization = async (orgId: string) => {
    console.log('handleUnassignOrganization called with orgId:', orgId);
    console.log('isPlatformAdmin:', isPlatformAdmin);
    
    if (!isPlatformAdmin) {
      console.log('Access denied - not platform admin');
      toast({
        title: "Access Denied",
        description: "Only Platform Admins can unassign organizations from enterprises.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Setting unassigningOrgId to:', orgId);
      setUnassigningOrgId(orgId);

      // Get the platform root tenant ID
      const { data: platformTenant } = await supabase
        .from('enterprises')
        .select('id')
        .eq('slug', 'patroller-root')
        .maybeSingle();
      
      if (!platformTenant) {
        throw new Error('Platform tenant not found');
      }

      console.log('Attempting to update organization in database...');
      // Update the organization to set tenant_id to platform root (unassigned)
      const requestId = crypto.randomUUID();
      const ok = await safeMutation(`unassign-org:${orgId}:${requestId}`, {
        op: () => supabase.rpc('update_or_delete_organization_tx', {
          p_org_id: orgId,
          p_mode: 'update',
          p_payload: { tenant_id: platformTenant.id },
          p_request_id: requestId,
        }),
        name: 'update_or_delete_organization_tx',
        tags: { request_id: requestId },
        refetch: () => refetchEnterpriseData(),
      });
      if (!ok) throw new Error('Unassign failed');

      console.log('Successfully unassigned organization');
      toast({
        title: "Organization Unassigned",
        description: "The organization has been unassigned from this enterprise.",
      });

      // Refresh the enterprise organizations list
      console.log('Calling refetchEnterpriseData...');
      refetchEnterpriseData();
    } catch (error: any) {
      console.error("Error unassigning organization:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to unassign organization. Please try again.",
        variant: "destructive",
      });
    } finally {
      console.log('Resetting unassigningOrgId to null');
      setUnassigningOrgId(null);
    }
  };

  const handleCancel = () => {
    if (!currentAccount) return;
    
    // Reset form data to original values
    const addr = (currentAccount.address || {}) as any;
    setFormData({
      name: currentAccount.name,
      type: currentAccount.type,
      category: currentAccount.category,
      primaryEmail: currentAccount.email,
      primaryPhone: currentAccount.phone,
      primaryContact: currentAccount.primaryContact || "",
      secondaryEmail: "",
      secondaryPhone: "",
      secondaryContact: "",
      address: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      zip: addr.zip || ""
    });
    // Reset any pending enterprise assignment edits
    setPendingEnterpriseId(null);
    setEnterpriseSearchOpen(false);
    setEnterpriseQuery("");
    setIsEditing(false);
  };

  const handleDisableAccount = () => {
    console.log("Disabling account");
    // Here you would typically call an API to disable the account
  };

  const handleDeleteAccount = async () => {
    if (!currentAccount) return;
    
    try {
      const success = await deleteAccount(currentAccount.id);
      if (success) {
        navigate('/accounts');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive"
      });
    }
  };

  // Removed legacy add-organization handlers and filters

  const isEnterprise = formData.type === "Enterprise";
  const isOrganization = formData.type === "Organization";
  const isRootEnterprise = isEnterprise && (formData.name === 'Patroller Root' || formData.category === 'Root Account');
  // Compute display label for subtype when not editing
  const displaySubtypeLabel = isEnterprise && isRootEnterprise
    ? 'Root Account'
    : (formData.category || (isOrganization ? mapOrgTypeToCategory(currentAccount?.organization_type) : ''));

  // Show loading state - only show loading if we're waiting for platform admin accounts or if we don't have currentAccount yet
  if ((isPlatformAdmin && loading) || (!currentAccount && id)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading account settings...</span>
        </div>
      </div>
    );
  }

  // If we still don't have an account after loading, something went wrong
  if (!currentAccount) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <span className="text-muted-foreground">Unable to load account settings</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Account Details</h1>
            <p className="text-muted-foreground">Manage {isEnterprise ? 'enterprise' : 'organization'} details and configuration</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </>
          ) : canManageOrgSettings ? (
            <Button onClick={() => setIsEditing(true)}>
              Edit Settings
            </Button>
          ) : null}
        </div>
      </div>

      {/* Organization Details */}
      <Card>
        <CardHeader>
          <CardTitle>{isEnterprise ? 'Enterprise' : 'Organization'} Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">{isEnterprise ? 'Enterprise' : 'Organization'} Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleInputChange("type", value)}
                disabled={!isEditing || !isPlatformAdmin}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Organization">Organization</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Subtype *</Label>
              {isEnterprise && isRootEnterprise ? (
                <div className="p-2 border rounded-md bg-muted/50 text-sm">Root Account</div>
              ) : (
                isEditing ? (
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleInputChange("category", value)}
                    disabled={(isEnterprise && loadingEnterpriseSubtypes) || (isOrganization && loadingOrgSubtypes)}
                  >
                    <SelectTrigger>
                      <span>{formData.category || 'Select a subtype...'}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {isEnterprise ? (
                        loadingEnterpriseSubtypes ? (
                          <SelectItem value="_loading" disabled>Loading subtypes...</SelectItem>
                        ) : enterpriseSubtypes.length > 0 ? (
                          enterpriseSubtypes.map((subtype) => (
                            <SelectItem key={subtype} value={subtype}>
                              {subtype}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="_none" disabled>No subtypes available</SelectItem>
                        )
                      ) : loadingOrgSubtypes ? (
                        <SelectItem value="_loading" disabled>Loading subtypes...</SelectItem>
                      ) : combinedOrganizationSubtypes.length > 0 ? (
                        combinedOrganizationSubtypes.map((subtype) => (
                          <SelectItem key={subtype} value={subtype}>
                            {subtype}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="_none" disabled>No subtypes available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-2 border rounded-md bg-muted/50 text-sm">
                    {displaySubtypeLabel || '—'}
                  </div>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parent Enterprise - Only for Organizations (Read-only) */}
      {isOrganization && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Parent Enterprise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{currentEnterprise?.name || 'Unassigned'}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentEnterprise 
                      ? 'This organization is assigned to an enterprise. To change, update from the enterprise settings page.' 
                      : 'This organization is not assigned to any enterprise.'}
                  </p>
                </div>
                {currentEnterprise && <Badge variant="secondary">Enterprise</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Organizations Management - Only for Enterprises (real data only) */}
      {isEnterprise && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Organizations
              </CardTitle>
              {isPlatformAdmin && (
                <Popover open={orgSearchOpen} onOpenChange={setOrgSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Organization
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-80">
                    <Command>
                      <CommandInput 
                        placeholder="Search unassigned organizations..." 
                        value={orgQuery} 
                        onValueChange={(v) => {
                          setOrgQuery(v);
                          loadUnassignedOrganizations(v);
                        }} 
                      />
                      <CommandList>
                        <CommandEmpty>
                          {loadingUnassignedOrgs ? 'Loading...' : 'No unassigned organizations found.'}
                        </CommandEmpty>
                        <CommandGroup>
                          {unassignedOrgs.map((org) => (
                            <CommandItem 
                              key={org.id} 
                              value={org.name}
                              onSelect={() => handleAssignOrganization(org.id)}
                              disabled={assigningOrgId === org.id}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{org.name}</span>
                                <span className="text-xs text-muted-foreground">{org.type}</span>
                              </div>
                              {assigningOrgId === org.id && (
                                <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(enterpriseOrganizations || []).map((org) => (
                <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{org.name}</h3>
                    <p className="text-sm text-muted-foreground">{org.organization_type} • {org.users} members</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Active</Badge>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/organization/${org.id}/analytics`)}>
                      Manage
                    </Button>
                    {isPlatformAdmin && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleUnassignOrganization(org.id)}
                        disabled={unassigningOrgId === org.id}
                      >
                        {unassigningOrgId === org.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Unassigning...
                          </>
                        ) : (
                          <>
                            <UserX className="h-4 w-4 mr-1" />
                            Unassign
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {(!enterpriseOrganizations || enterpriseOrganizations.length === 0) && (
                <div className="text-sm text-muted-foreground">
                  No organizations assigned to this enterprise.
                  {isPlatformAdmin && ' Click "Add Organization" to add organizations.'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="primaryEmail">Primary Email *</Label>
              <Input
                id="primaryEmail"
                type="email"
                value={formData.primaryEmail}
                onChange={(e) => handleInputChange("primaryEmail", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryPhone">Primary Phone *</Label>
              <Input
                id="primaryPhone"
                type="tel"
                value={formData.primaryPhone}
                onChange={(e) => handleInputChange("primaryPhone", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryContact">Primary Contact *</Label>
              <Input
                id="primaryContact"
                value={formData.primaryContact}
                onChange={(e) => handleInputChange("primaryContact", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryEmail">Secondary Email</Label>
              <Input
                id="secondaryEmail"
                type="email"
                value={formData.secondaryEmail}
                onChange={(e) => handleInputChange("secondaryEmail", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryPhone">Secondary Phone</Label>
              <Input
                id="secondaryPhone"
                type="tel"
                value={formData.secondaryPhone}
                onChange={(e) => handleInputChange("secondaryPhone", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryContact">Secondary Contact</Label>
              <Input
                id="secondaryContact"
                value={formData.secondaryContact}
                onChange={(e) => handleInputChange("secondaryContact", e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={formData.zip}
                  onChange={(e) => handleInputChange("zip", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Management */}
      {!isRootEnterprise && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5" />
            Account Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
              <div>
                <h3 className="font-semibold text-destructive">Disable Account</h3>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable this account. Users will not be able to access the platform.
                </p>
              </div>
              <Button 
                variant="outline" 
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={handleDisableAccount}
              >
                <UserX className="h-4 w-4 mr-2" />
                Disable Account
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-destructive rounded-lg bg-destructive/5">
              <div>
                <h3 className="font-semibold text-destructive">Delete Account</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this account and all associated data. This action cannot be undone.
                </p>
              </div>
              <Button 
                variant="destructive"
                onClick={handleDeleteAccount}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}