import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
import { Settings as SettingsIcon, Save, Mail, Phone, MapPin, Building2, UserX, Trash2, Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccounts, Account } from "@/hooks/useAccounts";
import { useEnterpriseData } from "@/hooks/useEnterpriseData";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/hooks/usePermissions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

// Removed legacy mock data and dummy lists

export default function Settings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { accounts, loading, updateAccount, deleteAccount } = useAccounts();
  const { isPlatformAdmin } = usePermissions();
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

  const loadEnterprises = async (q: string) => {
    try {
      setLoadingEnterprises(true);
      const query = supabase
        .from('enterprises')
        .select('id, name')
        .order('name', { ascending: true })
        .limit(20);
      // @ts-ignore - supabase-js supports ilike
      if (q) query.ilike('name', `%${q}%`);
      const { data } = await query;
      setEnterprises((data || []).map((t: any) => ({ id: t.id, name: t.name })));
    } catch (e) {
      // no-op
    } finally {
      setLoadingEnterprises(false);
    }
  };

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
    return orgType ? (typeMap[orgType] || 'Search & Rescue') : 'Search & Rescue';
  };

  const loadAccountById = async (accountId: string) => {
    try {
      // Try organization first
      const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', accountId)
        .maybeSingle();
      if (org) {
        const account: Account = {
          id: org.id,
          name: org.name,
          type: 'Organization',
          category: mapOrgTypeToCategory(org.organization_type),
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
        setCurrentAccount(account);
        // Preload current enterprise
        if (org.tenant_id) {
          const { data: ent } = await supabase
            .from('enterprises')
            .select('id, name')
            .eq('id', org.tenant_id)
            .maybeSingle();
          if (ent) setCurrentEnterprise({ id: ent.id, name: ent.name });
        }
        setFormData({
          name: account.name,
          type: account.type,
          category: account.category,
          primaryEmail: account.email,
          primaryPhone: account.phone,
          primaryContact: "",
          secondaryEmail: "",
          secondaryPhone: "",
          secondaryContact: "",
          address: "",
          city: "",
          state: "",
          zip: ""
        });
        return true;
      }

      // Then try enterprise
      const { data: tenant } = await supabase
        .from('enterprises')
        .select('*')
        .eq('id', accountId)
        .maybeSingle();
      if (tenant) {
        const account: Account = {
          id: tenant.id,
          name: tenant.name,
          type: 'Enterprise',
          category: 'Enterprise Management',
          members: 0,
          email: (tenant.settings as any)?.contact_email || 'N/A',
          phone: (tenant.settings as any)?.contact_phone || 'N/A',
          created: new Date(tenant.created_at).toLocaleDateString(),
          tenant_id: tenant.id,
          is_active: tenant.subscription_status === 'active',
          settings: tenant.settings
        };
        setCurrentAccount(account);
        setFormData({
          name: account.name,
          type: account.type,
          category: account.category,
          primaryEmail: account.email,
          primaryPhone: account.phone,
          primaryContact: "",
          secondaryEmail: "",
          secondaryPhone: "",
          secondaryContact: "",
          address: "",
          city: "",
          state: "",
          zip: ""
        });
        return true;
      }
    } catch (e) {
      // ignore; upstream handles not-found
    }
    return false;
  };

  // Load account data
  useEffect(() => {
    const run = async () => {
      console.log("Settings component - useEffect triggered");
      console.log("ID from params:", id);
      console.log("Accounts length:", accounts.length);
      if (!id) return;

      // Try cache first when available
      if (accounts.length > 0) {
        const account = accounts.find(acc => acc.id === id);
        console.log("Found account in cache:", account);
        if (account) {
          setCurrentAccount(account);
          setFormData({
            name: account.name,
            type: account.type,
            category: account.category,
            primaryEmail: account.email,
            primaryPhone: account.phone,
            primaryContact: "",
            secondaryEmail: "",
            secondaryPhone: "",
            secondaryContact: "",
            address: "",
            city: "",
            state: "",
            zip: ""
          });
          return;
        }
      }

      // Fallback: fetch directly by id from DB before redirecting
      const loaded = await loadAccountById(id);
      if (!loaded) {
        toast({
          title: "Account Not Found",
          description: "The requested account could not be found.",
          variant: "destructive"
        });
        navigate('/accounts');
      }
    };
    run();
  }, [id, accounts, navigate, toast]);

  // When the currentEnterprise changes (e.g., after save), ensure Enterprise-related pages show new orgs
  useEffect(() => {
    // No direct action here; relevant pages read live from Supabase on mount.
    // This effect is a placeholder to indicate dependency and potential future refetch hooks.
  }, [currentEnterprise]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!currentAccount) return;
    
    try {
      const success = await updateAccount(currentAccount.id, {
        name: formData.name,
        type: formData.type as 'Enterprise' | 'Organization',
        category: formData.category,
        email: formData.primaryEmail,
        phone: formData.primaryPhone,
        // When editing an Organization, allow platform admins to set tenant
        ...(currentAccount.type === 'Organization' && pendingEnterpriseId ? { tenant_id: pendingEnterpriseId as any } : {})
      });
      
      if (success) {
        setIsEditing(false);
        if (pendingEnterpriseId) {
          setCurrentEnterprise(enterprises.find(e => e.id === pendingEnterpriseId) || currentEnterprise);
          setPendingEnterpriseId(null);
          // If we're in Enterprise Settings, refresh enterprise orgs list so the new org appears
          if (currentAccount.type === 'Enterprise') {
            refetchEnterpriseData();
          }
        }
        toast({
          title: "Settings Updated Successfully",
          description: "Your changes have been saved.",
        });
      }
    } catch (error) {
      toast({
        title: "Error Saving Settings",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    if (!currentAccount) return;
    
    // Reset form data to original values
    setFormData({
      name: currentAccount.name,
      type: currentAccount.type,
      category: currentAccount.category,
      primaryEmail: currentAccount.email,
      primaryPhone: currentAccount.phone,
      primaryContact: "",
      secondaryEmail: "",
      secondaryPhone: "",
      secondaryContact: "",
      address: "",
      city: "",
      state: "",
      zip: ""
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

  // Show loading state
  if (loading || !currentAccount) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading account settings...</span>
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
            <h1 className="text-3xl font-bold">{isEnterprise ? 'Enterprise' : 'Organization'} Settings</h1>
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
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Edit Settings
            </Button>
          )}
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
                disabled={!isEditing}
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
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange("category", value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {isEnterprise ? (
                    <>
                      <SelectItem value="Resort Chain">Resort Chain</SelectItem>
                      <SelectItem value="Municipality">Municipality</SelectItem>
                      <SelectItem value="Park Agency">Park Agency</SelectItem>
                      <SelectItem value="Event Management">Event Management</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Search & Rescue">Search & Rescue</SelectItem>
                      <SelectItem value="Lifeguard Service">Lifeguard Service</SelectItem>
                      <SelectItem value="Park Service">Park Service</SelectItem>
                      <SelectItem value="Event Medical">Event Medical</SelectItem>
                      <SelectItem value="Ski Patrol">Ski Patrol</SelectItem>
                      <SelectItem value="Harbor Master">Harbor Master</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parent Enterprise - Only for Organizations */}
      {isOrganization && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Parent Enterprise
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isPlatformAdmin && isEditing ? (
              <div className="space-y-2">
                <Label>Assign to Enterprise</Label>
                <Popover open={enterpriseSearchOpen} onOpenChange={setEnterpriseSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {pendingEnterpriseId
                        ? (enterprises.find(e => e.id === pendingEnterpriseId)?.name || 'Selected enterprise')
                        : (currentEnterprise?.name || 'Select enterprise...')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Search enterprises..." value={enterpriseQuery} onValueChange={(v) => {
                        setEnterpriseQuery(v);
                        loadEnterprises(v);
                      }} />
                      <CommandList>
                        <CommandEmpty>{loadingEnterprises ? 'Loading...' : 'No results found.'}</CommandEmpty>
                        <CommandGroup>
                          {enterprises.map((ent) => (
                            <CommandItem key={ent.id} value={ent.name} onSelect={() => {
                              setPendingEnterpriseId(ent.id);
                              setEnterpriseSearchOpen(false);
                            }}>
                              {ent.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {pendingEnterpriseId && (
                  <p className="text-xs text-muted-foreground">Pending change. Click Save to apply.</p>
                )}
              </div>
            ) : (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{currentEnterprise?.name || 'Unassigned'}</h3>
                    <p className="text-sm text-muted-foreground">{isPlatformAdmin ? 'Click Edit Settings to change the parent enterprise.' : 'Only platform admins can change the parent enterprise.'}</p>
                  </div>
                  <Badge variant="secondary">Enterprise</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Organizations Management - Only for Enterprises (real data only) */}
      {isEnterprise && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Organizations
            </CardTitle>
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
                    <Button variant="outline" size="sm" onClick={() => navigate(`/organization/${org.id}/mission-control`)}>
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
              {(!enterpriseOrganizations || enterpriseOrganizations.length === 0) && (
                <div className="text-sm text-muted-foreground">No organizations assigned to this enterprise.</div>
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
    </div>
  );
}