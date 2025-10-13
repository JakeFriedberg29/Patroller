import { useState, useEffect } from "react";
import { Plus, Send, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserManagement } from "@/hooks/useUserManagement";
import { ResendActivationButton } from "@/components/ResendActivationButton";
import { UserStatusBadge } from "@/components/UserStatusBadge";
import { EditAdminModal } from "@/components/EditAdminModal";
import { DeleteAdminModal } from "@/components/DeleteAdminModal";
import { useSeedData } from "@/hooks/useSeedData";
import { useEmailService } from "@/hooks/useEmailService";
import { DataTable, type ColumnDef, type FilterConfig } from "@/components/ui/data-table";
import { useDataTable } from "@/hooks/useDataTable";
// import { DeleteAdminModal } from "@/components/DeleteAdminModal";
// import { BulkDeleteAdminModal } from "@/components/BulkDeleteAdminModal";
// import { AdminAuditLog } from "@/components/AdminAuditLog";
interface PlatformAdmin {
  id: string;
  user_id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  activation_status: "pending" | "active" | "disabled" | "deleted";
  activation_sent_at?: string;
}
// Remove mock data - will be loaded from database
export default function PlatformAdmins() {
  const {
    toast
  } = useToast();
  const {
    createUser,
    isLoading: isCreatingUser
  } = useUserManagement();
  const {
    createAuthUsers,
    isLoading: isCreatingAuthUsers
  } = useSeedData();
  const [admins, setAdmins] = useState<PlatformAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);
  const [isResending, setIsResending] = useState(false);
  const {
    sendActivationEmail
  } = useEmailService();
  const [currentAdmin, setCurrentAdmin] = useState<PlatformAdmin | null>(null);
  const [newAdmin, setNewAdmin] = useState({
    fullName: "",
    email: "",
    phone: "",
    accessRole: "read" as "read" | "write"
  });

  // Load platform admins from database
  useEffect(() => {
    loadPlatformAdmins();
  }, []);
  const loadPlatformAdmins = async () => {
    setIsLoading(true);
    try {
      console.log('Loading platform admins...');
      // Load platform admins from users table with role information
      const {
        data,
        error
      } = await supabase.from('users').select(`
          id,
          email,
          full_name,
          first_name,
          last_name,
          phone,
          status,
          created_at,
          profile_data,
          user_roles!user_roles_user_id_fkey!inner(role_type, is_active)
        `).eq('user_roles.role_type', 'platform_admin').eq('user_roles.is_active', true).order('created_at', {
        ascending: false
      });
      
      console.log('Platform admins query result:', { data, error });
      if (error) {
        console.error('Error loading platform admins:', error);
        toast({
          title: "Error Loading Admins",
          description: "Failed to load platform administrators.",
          variant: "destructive"
        });
        return;
      }
      const transformedAdmins: PlatformAdmin[] = data.map((user: any) => ({
        id: user.id,
        user_id: user.id,
        // In our new structure, user_id is same as id
        firstName: user.first_name || user.full_name?.split(' ')[0] || '',
        lastName: user.last_name || user.full_name?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        phone: user.phone || '',
        role: 'Platform Admin',
        activation_status: user.status as "pending" | "active" | "disabled" | "deleted",
        activation_sent_at: user.profile_data?.activation_sent_at
      }));
      setAdmins(transformedAdmins);
    } catch (error) {
      console.error('Error loading platform admins:', error);
      toast({
        title: "Error Loading Admins",
        description: "Failed to load platform administrators.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleAddAdmin = async () => {
    if (newAdmin.fullName && newAdmin.email) {
      // Resolve a valid tenant_id for platform admins
      let tenantIdToUse: string | undefined;
      try {
        // Prefer a known platform tenant slug if it exists
        const {
          data: platformTenant
        } = await supabase.from('enterprises').select('id, slug').eq('slug', 'patroller-console').maybeSingle();
        if (platformTenant?.id) {
          tenantIdToUse = platformTenant.id;
        } else {
          // Fallback: pick the first existing tenant
          const {
            data: anyTenant
          } = await supabase.from('enterprises').select('id, slug').order('created_at', {
            ascending: true
          }).limit(1);
          if (anyTenant && anyTenant.length > 0) {
            tenantIdToUse = anyTenant[0].id;
          } else {
            // If no enterprises exist, create a platform enterprise
            const {
              data: createdTenant,
              error: createTenantErr
            } = await supabase.from('enterprises').insert({
              name: 'Patroller Console',
              slug: 'patroller-console',
              subscription_tier: 'enterprise',
              subscription_status: 'active',
              settings: {}
            }).select('id').single();
            if (createTenantErr) {
              throw createTenantErr;
            }
            tenantIdToUse = createdTenant?.id;
          }
        }
      } catch (e: any) {
        console.error('Failed to resolve tenant for platform admin:', e);
        toast({
          title: 'Tenant Resolution Failed',
          description: 'Could not resolve or create a tenant for the new platform admin.',
          variant: 'destructive'
        });
        return;
      }
      if (!tenantIdToUse) {
        toast({
          title: 'No Tenant Found',
          description: 'Unable to find or create a tenant. Please try again.',
          variant: 'destructive'
        });
        return;
      }
      const result = await createUser({
        email: newAdmin.email,
        fullName: newAdmin.fullName,
        role: 'Platform Admin',
        accessRole: newAdmin.accessRole,
        tenantId: tenantIdToUse,
        phone: newAdmin.phone
      });
      if (result.success) {
        setNewAdmin({
          fullName: "",
          email: "",
          phone: "",
          accessRole: "read"
        });
        setIsAddDialogOpen(false);
        loadPlatformAdmins(); // Refresh the list
      }
    }
  };
  const handleEditAdmin = (admin: PlatformAdmin) => {
    setCurrentAdmin(admin);
    setIsEditDialogOpen(true);
  };
  const handleEditSuccess = () => {
    loadPlatformAdmins();
    setCurrentAdmin(null);
  };
  const handleDeleteAdmin = (admin: PlatformAdmin) => {
    setCurrentAdmin(admin);
    setIsDeleteDialogOpen(true);
  };
  const handleDeleteSuccess = () => {
    loadPlatformAdmins();
    setCurrentAdmin(null);
    setSelectedAdmins([]);
  };
  
  const handleBulkResend = async () => {
    if (selectedAdmins.length === 0) return;
    setIsResending(true);
    try {
      const selected = admins.filter(a => selectedAdmins.includes(a.id));
      for (const admin of selected) {
        await sendActivationEmail({
          userId: admin.user_id,
          email: admin.email,
          fullName: `${admin.firstName} ${admin.lastName}`,
          isResend: true,
          organizationName: 'Emergency Management Platform'
        });
      }
    } finally {
      setIsResending(false);
    }
  };

  const filterConfigs: FilterConfig[] = [
    {
      key: 'activation_status',
      label: 'Status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Pending', value: 'pending' },
        { label: 'Disabled', value: 'disabled' },
        { label: 'Deleted', value: 'deleted' },
      ]
    }
  ];

  const columns: ColumnDef<PlatformAdmin>[] = [
    {
      key: 'select',
      header: '',
      render: (admin) => (
        <Checkbox 
          checked={selectedAdmins.includes(admin.id)} 
          onCheckedChange={(checked) => {
            setSelectedAdmins(prev => 
              checked ? [...prev, admin.id] : prev.filter(id => id !== admin.id)
            );
          }} 
        />
      ),
    },
    {
      key: 'firstName',
      header: 'Name',
      render: (admin) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Plus className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-semibold">{admin.firstName} {admin.lastName}</div>
            <div className="text-sm text-muted-foreground">{admin.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (admin) => (
        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
          {admin.role}
        </Badge>
      ),
    },
    {
      key: 'activation_status',
      header: 'Status',
      render: (admin) => (
        <div className="flex items-center gap-2">
          <UserStatusBadge status={admin.activation_status} />
          {admin.activation_status === 'pending' && (
            <ResendActivationButton 
              userId={admin.user_id} 
              email={admin.email} 
              fullName={`${admin.firstName} ${admin.lastName}`} 
              size="sm" 
            />
          )}
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Contact',
      render: (admin) => admin.phone ? <div className="text-sm">{admin.phone}</div> : null,
    },
    {
      key: 'actions',
      header: '',
      render: (admin) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEditAdmin(admin)} className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDeleteAdmin(admin)} 
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const dataTable = useDataTable({
    data: admins,
    searchableFields: ['firstName', 'lastName', 'email'],
    filterConfigs,
  });
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Platform Admins</h1>
            <p className="text-muted-foreground">Manage platform administrators and system access</p>
          </div>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Platform Admin
        </Button>
      </div>

      <DataTable
        data={dataTable.paginatedData}
        columns={columns}
        searchPlaceholder="Search platform admins by name or email..."
        isLoading={isLoading}
        emptyMessage="No platform admins found"
        searchValue={dataTable.searchTerm}
        onSearchChange={dataTable.handleSearch}
        filterValues={dataTable.filters}
        onFilterChange={dataTable.handleFilter}
        filters={filterConfigs}
        currentPage={dataTable.currentPage}
        totalPages={dataTable.totalPages}
        rowsPerPage={dataTable.rowsPerPage}
        totalRecords={dataTable.totalRecords}
        onPageChange={dataTable.handlePageChange}
        onRowsPerPageChange={dataTable.handleRowsPerPageChange}
        actions={
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2" 
            onClick={handleBulkResend} 
            disabled={selectedAdmins.length === 0 || isResending}
          >
            <Send className="h-4 w-4" />
            {isResending ? 'Resending...' : `Resend Activation Email${selectedAdmins.length ? ` (${selectedAdmins.length})` : ''}`}
          </Button>
        }
      />

      {/* Add Admin Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">Add Platform Admin</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground mt-1">
                    Add a new administrator to the platform.
                  </DialogDescription>
                </div>
              </div>
              
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" className="bg-white" value={newAdmin.fullName} onChange={e => setNewAdmin({
                ...newAdmin,
                fullName: e.target.value
              })} placeholder="John Doe" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email" className="bg-white" value={newAdmin.email} onChange={e => setNewAdmin({
              ...newAdmin,
              email: e.target.value
            })} placeholder="admin@platform.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" className="bg-white" value={newAdmin.phone} onChange={e => setNewAdmin({
              ...newAdmin,
              phone: e.target.value
            })} placeholder="(555) 123-4567" />
            </div>

            <div className="space-y-3">
              <Label>Access *</Label>
              <RadioGroup 
                value={newAdmin.accessRole} 
                onValueChange={(value: "read" | "write") => setNewAdmin({
                  ...newAdmin,
                  accessRole: value
                })}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-3 space-y-0">
                  <RadioGroupItem value="write" id="write" />
                  <Label htmlFor="write" className="font-normal cursor-pointer">
                    Write (manage)
                  </Label>
                </div>
                <div className="flex items-center space-x-3 space-y-0">
                  <RadioGroupItem value="read" id="read" />
                  <Label htmlFor="read" className="font-normal cursor-pointer">
                    Read (view only)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAdmin} disabled={!newAdmin.fullName || !newAdmin.email || isCreatingUser}>
              {isCreatingUser ? 'Creating...' : 'Add Platform Admin'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      {currentAdmin && <EditAdminModal open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} admin={currentAdmin} accountType="platform" onSuccess={handleEditSuccess} />}

      {/* Delete Admin Dialog */}
      {currentAdmin && <DeleteAdminModal open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} admin={currentAdmin as any} accountType="platform" onSuccess={handleDeleteSuccess} />}
      {/* BulkDelete coming soon */}
    </div>;
}