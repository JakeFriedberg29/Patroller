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
import { UserModal } from "@/components/user-management/UserModal";
import { DeleteUserModal } from "@/components/user-management/DeleteUserModal";
import { SuspendUserModal } from "@/components/user-management/SuspendUserModal";
import { useUserModal } from "@/hooks/useUserModal";
import { useSeedData } from "@/hooks/useSeedData";
import { useEmailService } from "@/hooks/useEmailService";
import { DataTable, type ColumnDef, type FilterConfig } from "@/components/ui/data-table";
import { useDataTable } from "@/hooks/useDataTable";
import { useCrudModals } from "@/hooks/useCrudModals";
import { BulkSelectionToolbar } from "@/components/BulkSelectionToolbar";
import { BulkDeleteAdminModal } from "@/components/BulkDeleteAdminModal";
import { createActivationStatusFilter } from "@/lib/filterConfigs";
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
  const modals = useCrudModals<PlatformAdmin>();
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [userToSuspend, setUserToSuspend] = useState<PlatformAdmin | null>(null);
  const { isSuspending, handleSuspendToggle } = useUserModal({ 
    accountType: "platform", 
    mode: "edit",
    userId: userToSuspend?.user_id 
  });
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);
  const [isResending, setIsResending] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const {
    sendActivationEmail
  } = useEmailService();

  const handleAddSuccess = () => {
    loadPlatformAdmins();
  };

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
        `).eq('user_roles.role_type', 'platform_admin').eq('user_roles.is_active', true).neq('status', 'inactive').neq('status', 'deleted').order('created_at', {
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
  
  const handleEditSuccess = () => {
    loadPlatformAdmins();
    modals.edit.close();
  };
  const handleDeleteSuccess = () => {
    loadPlatformAdmins();
    modals.delete.close();
    setSelectedAdmins([]);
  };

  const handleBulkDeleteSuccess = () => {
    loadPlatformAdmins();
    setIsBulkDeleteOpen(false);
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
    createActivationStatusFilter()
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
      render: (admin) => <UserStatusBadge status={admin.activation_status} />,
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
            <DropdownMenuItem onClick={() => modals.edit.open(admin)} className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => modals.delete.open(admin)} 
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
        <Button onClick={modals.add.open} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Platform Admin
        </Button>
      </div>

      <BulkSelectionToolbar
        selectedCount={selectedAdmins.length}
        totalCount={admins.length}
        onClearSelection={() => setSelectedAdmins([])}
        actions={[
          {
            label: isResending ? 'Resending...' : 'Resend Activation',
            icon: Send,
            onClick: handleBulkResend,
            disabled: isResending,
            variant: 'outline',
          },
        ]}
      />

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
      />

      {/* Add User Dialog */}
      <UserModal
        open={modals.add.isOpen}
        onOpenChange={(open) => !open && modals.add.close()}
        mode="add"
        accountType="platform"
        onSuccess={handleAddSuccess}
      />

      {/* Edit User Dialog */}
      {modals.selected && (
        <UserModal 
          open={modals.edit.isOpen} 
          onOpenChange={(open) => !open && modals.edit.close()} 
          mode="edit"
          user={modals.selected} 
          accountType="platform" 
          onSuccess={handleEditSuccess}
          onSuspendClick={() => {
            setUserToSuspend(modals.selected);
            setShowSuspendDialog(true);
          }}
          onDeleteClick={() => modals.delete.open(modals.selected!)}
        />
      )}

      {/* Delete User Dialog */}
      {modals.selected && (
        <DeleteUserModal 
          open={modals.delete.isOpen} 
          onOpenChange={(open) => !open && modals.delete.close()} 
          user={modals.selected as any} 
          accountType="platform" 
          onSuccess={handleDeleteSuccess} 
        />
      )}

      {/* Suspend/Enable User Dialog */}
      {userToSuspend && (
        <SuspendUserModal
          open={showSuspendDialog}
          onOpenChange={setShowSuspendDialog}
          user={userToSuspend}
          isSuspending={isSuspending}
          onConfirm={async () => {
            const success = await handleSuspendToggle(userToSuspend.activation_status);
            if (success) {
              setShowSuspendDialog(false);
              setUserToSuspend(null);
              handleEditSuccess();
            }
          }}
        />
      )}
      
      {/* Bulk Delete Admin Dialog */}
      {selectedAdmins.length > 0 && (
        <BulkDeleteAdminModal
          open={isBulkDeleteOpen}
          onOpenChange={setIsBulkDeleteOpen}
          admins={admins.filter(a => selectedAdmins.includes(a.id)).map(a => ({
            id: a.id,
            user_id: a.user_id,
            firstName: a.firstName,
            lastName: a.lastName,
            name: `${a.firstName} ${a.lastName}`,
            email: a.email,
            role: a.role,
          }))}
          accountType="platform"
          onSuccess={handleBulkDeleteSuccess}
        />
      )}
    </div>;
}