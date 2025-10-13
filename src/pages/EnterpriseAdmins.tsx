import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Shield, Plus, MoreHorizontal, Mail, Phone, Send, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useUserManagement } from "@/hooks/useUserManagement";
import { AddAdminModal } from "@/components/AddAdminModal";
import { EditAdminModal } from "@/components/EditAdminModal";
import { DeleteAdminModal } from "@/components/DeleteAdminModal";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useEmailService } from "@/hooks/useEmailService";
import { UserStatusBadge } from "@/components/UserStatusBadge";
import { ResendActivationButton } from "@/components/ResendActivationButton";
import { DataTable, type ColumnDef, type FilterConfig } from "@/components/ui/data-table";
import { useDataTable } from "@/hooks/useDataTable";
interface EnterpriseAdmin {
  id: string;
  user_id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  activation_status: "pending" | "active" | "disabled" | "deleted";
  location: string;
  lastLogin: string;
  createdDate: string;
  permissions: string[];
  avatar: string;
  activation_sent_at?: string;
}
export default function EnterpriseUsers() {
  const {
    id: tenantId
  } = useParams();
  const {
    toast
  } = useToast();
  // Force rebuild to clear cache
  const {
    createUser,
    isLoading: isCreatingUser
  } = useUserManagement();
  const [admins, setAdmins] = useState<EnterpriseAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<EnterpriseAdmin | null>(null);
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);
  const [isResending, setIsResending] = useState(false);
  const {
    sendActivationEmail
  } = useEmailService();

  // Load enterprise users from database
  useEffect(() => {
    loadEnterpriseAdmins();
  }, [tenantId]);
  const loadEnterpriseAdmins = async () => {
    setIsLoading(true);
    try {
      if (!tenantId) {
        toast({
          title: "Error",
          description: "Enterprise ID not found",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Query users directly and filter out platform admins
      const {
        data: accountUsersData,
        error
      } = await supabase.from('account_users').select(`
          *,
          users!inner (
            id,
            email,
            full_name,
            status,
            profile_data,
            user_roles!user_roles_user_id_fkey (
              role_type,
              is_active
            )
          )
        `).eq('tenant_id', tenantId).is('organization_id', null).eq('is_active', true);
      if (error) {
        console.error('Error loading enterprise admins:', error);
        toast({
          title: "Error Loading Admins",
          description: "Failed to load enterprise administrators.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Filter out platform admins and transform the data
      const filteredUsers = (accountUsersData || []).filter(accountUser => {
        const user = accountUser.users as any;
        const roles = user?.user_roles || [];
        // Exclude users who have platform_admin role
        return !roles.some((role: any) => role.role_type === 'platform_admin' && role.is_active);
      });
      const transformedAdmins: EnterpriseAdmin[] = filteredUsers.map(accountUser => {
        const user = accountUser.users as any;
        const status = user.status || 'pending';
        return {
          id: accountUser.id,
          user_id: user.id,
          firstName: user.full_name?.split(' ')[0] || '',
          lastName: user.full_name?.split(' ').slice(1).join(' ') || '',
          email: user.email,
          phone: '',
          role: accountUser.access_role === 'write' ? 'Admin' : 'User',
          activation_status: status as "pending" | "active" | "disabled" | "deleted",
          location: '',
          lastLogin: '',
          createdDate: '',
          permissions: accountUser.access_role === 'write' ? ['User Management', 'Organization Management'] : ['Read Only'],
          avatar: '',
          activation_sent_at: user.profile_data?.activation_sent_at
        };
      }).sort((a, b) => a.firstName.localeCompare(b.firstName));
      setAdmins(transformedAdmins);
    } catch (error) {
      console.error('Error loading enterprise admins:', error);
      toast({
        title: "Error Loading Admins",
        description: "Failed to load enterprise administrators.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };
  const handleAddAdminSuccess = () => {
    loadEnterpriseAdmins();
  };
  const handleEditAdmin = (admin: EnterpriseAdmin) => {
    setSelectedAdmin(admin);
    setIsEditModalOpen(true);
  };
  const handleDeleteAdmin = (admin: EnterpriseAdmin) => {
    setSelectedAdmin(admin);
    setIsDeleteModalOpen(true);
  };
  const handleEditSuccess = () => {
    loadEnterpriseAdmins();
    setSelectedAdmin(null);
  };
  const handleDeleteSuccess = () => {
    loadEnterpriseAdmins();
    setSelectedAdmin(null);
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

  const columns: ColumnDef<EnterpriseAdmin>[] = [
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
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {admin.firstName[0]}{admin.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{admin.firstName} {admin.lastName}</div>
            {admin.createdDate && <div className="text-sm text-muted-foreground">Joined {formatDate(admin.createdDate)}</div>}
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
      key: 'email',
      header: 'Contact',
      render: (admin) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            {admin.email}
          </div>
          {admin.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              {admin.phone}
            </div>
          )}
        </div>
      ),
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
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => handleEditAdmin(admin)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Administrator
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteAdmin(admin)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Administrator
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Users
          </h1>
          <p className="text-muted-foreground">Manage users across your enterprise</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <DataTable
        data={dataTable.paginatedData}
        columns={columns}
        searchPlaceholder="Search administrators..."
        isLoading={isLoading}
        emptyMessage="No administrators found"
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

      <AddAdminModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} accountType="enterprise" onSuccess={handleAddAdminSuccess} />

      <EditAdminModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} admin={selectedAdmin} accountType="enterprise" onSuccess={handleEditSuccess} />

      <DeleteAdminModal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen} admin={selectedAdmin} accountType="enterprise" onSuccess={handleDeleteSuccess} />
    </div>;
}