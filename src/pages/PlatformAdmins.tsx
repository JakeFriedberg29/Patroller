import { useState, useEffect } from "react";
import { Plus, Search, Send, MoreHorizontal, X, Filter, Edit, Trash2, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserManagement } from "@/hooks/useUserManagement";
import { ResendActivationButton } from "@/components/ResendActivationButton";
import { UserStatusBadge } from "@/components/UserStatusBadge";
import { AddAdminModal } from "@/components/AddAdminModal";
import { EditAdminModal } from "@/components/EditAdminModal";
import { DeleteAdminModal } from "@/components/DeleteAdminModal";
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
  activation_status: "pending" | "active" | "suspended";
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
  const [admins, setAdmins] = useState<PlatformAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All Status");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<PlatformAdmin | null>(null);
  const [newAdmin, setNewAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });

  // Load platform admins from database
  useEffect(() => {
    loadPlatformAdmins();
  }, []);
  const loadPlatformAdmins = async () => {
    setIsLoading(true);
    try {
      // Load platform admins from users table with role information
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          first_name,
          last_name,
          phone,
          status,
          created_at,
          profile_data,
          user_roles!user_roles_user_id_fkey!inner(role_type)
        `)
        .eq('user_roles.role_type', 'platform_admin')
        .eq('user_roles.is_active', true)
        .neq('status', 'inactive')  // Exclude soft-deleted users
        .order('created_at', { ascending: false });

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
        user_id: user.id, // In our new structure, user_id is same as id
        firstName: user.first_name || user.full_name?.split(' ')[0] || '',
        lastName: user.last_name || user.full_name?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        phone: user.phone || '',
        role: 'Platform Admin',
        activation_status: user.status as "pending" | "active" | "suspended",
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
    if (newAdmin.firstName && newAdmin.lastName && newAdmin.email) {
      // Log admin creation attempt
      try {
        await supabase.rpc('log_user_action', {
          p_action: 'CREATE_ATTEMPT',
          p_resource_type: 'platform_admin',
          p_resource_id: null,
          p_metadata: {
            target_email: newAdmin.email,
            target_name: `${newAdmin.firstName} ${newAdmin.lastName}`,
            action_context: 'platform_admin_creation'
          }
        });
      } catch (logError) {
        console.warn('Failed to log admin creation attempt:', logError);
      }

      const result = await createUser({
        email: newAdmin.email,
        fullName: `${newAdmin.firstName} ${newAdmin.lastName}`,
        role: 'Platform Admin',
        tenantId: '95d3bca1-40f0-4630-a60e-1d98dacf3e60', // Demo tenant
        phone: newAdmin.phone
      });
      
      if (result.success) {
        // Log successful admin creation
        try {
          await supabase.rpc('log_user_action', {
            p_action: 'CREATE',
            p_resource_type: 'platform_admin',
            p_resource_id: result.userId,
            p_metadata: {
              admin_email: newAdmin.email,
              admin_name: `${newAdmin.firstName} ${newAdmin.lastName}`,
              admin_phone: newAdmin.phone || null
            }
          });
        } catch (logError) {
          console.warn('Failed to log successful admin creation:', logError);
        }

        setNewAdmin({
          firstName: "",
          lastName: "",
          email: "",
          phone: ""
        });
        setIsAddModalOpen(false);
        loadPlatformAdmins(); // Refresh the list
      }
    }
  };
  const handleEditAdmin = (admin: PlatformAdmin) => {
    setCurrentAdmin(admin);
    setIsEditDialogOpen(true);
  };
  const handleEditSuccess = () => {
    // Log will be handled by EditAdminModal
    loadPlatformAdmins();
    setCurrentAdmin(null);
  };
  const handleDeleteAdmin = (admin: PlatformAdmin) => {
    setCurrentAdmin(admin);
    setIsDeleteDialogOpen(true);
  };
  const handleBulkDelete = () => {
    if (selectedAdmins.length === 0) return;
    setIsBulkDeleteOpen(true);
  };
  const handleDeleteSuccess = () => {
    // Log will be handled by DeleteAdminModal
    loadPlatformAdmins();
    setCurrentAdmin(null);
    setSelectedAdmins([]);
  };
  const handleSelectAdmin = (adminId: string, checked: boolean) => {
    if (checked) {
      setSelectedAdmins([...selectedAdmins, adminId]);
    } else {
      setSelectedAdmins(selectedAdmins.filter(id => id !== adminId));
    }
  };
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAdmins(admins.map(admin => admin.id));
    } else {
      setSelectedAdmins([]);
    }
  };
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || admin.lastName.toLowerCase().includes(searchQuery.toLowerCase()) || admin.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === "All Status" || admin.activation_status === selectedFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });
  const totalPages = Math.ceil(filteredAdmins.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedAdmins = filteredAdmins.slice(startIndex, startIndex + rowsPerPage);
  const statusOptions = [...new Set(admins.map(admin => admin.activation_status))];
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default";
      case "Pending":
        return "secondary";
      case "Inactive":
        return "outline";
      default:
        return "default";
    }
  };
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
        <div className="flex gap-2">
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Platform Admin
        </Button>
          
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search platform admins by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Status">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
        </Select>
      </div>

      {/* Admin List */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox checked={selectedAdmins.length === paginatedAdmins.length && paginatedAdmins.length > 0} onCheckedChange={handleSelectAll} />
                </TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAdmins.map(admin => <TableRow key={admin.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox checked={selectedAdmins.includes(admin.id)} onCheckedChange={checked => handleSelectAdmin(admin.id, checked as boolean)} />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Plus className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">{admin.firstName} {admin.lastName}</div>
                        <div className="text-sm text-muted-foreground">{admin.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                      {admin.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserStatusBadge status={admin.activation_status} />
                      {admin.activation_status === 'pending' && <ResendActivationButton userId={admin.user_id} email={admin.email} fullName={`${admin.firstName} ${admin.lastName}`} size="sm" />}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {admin.phone && <div className="text-sm">{admin.phone}</div>}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => handleEditAdmin(admin)} 
                          className="cursor-pointer"
                        >
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
                  </TableCell>
                </TableRow>)}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select value={rowsPerPage.toString()} onValueChange={value => {
              setRowsPerPage(Number(value));
              setCurrentPage(1);
            }}>
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              {selectedAdmins.length > 0 && <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Send className="h-4 w-4" />
                    Resend Activation Email ({selectedAdmins.length})
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Selected ({selectedAdmins.length})
                  </Button>
                </div>}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredAdmins.length)} of {filteredAdmins.length}
              </span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Section - Coming Soon */}
      {/* showAuditLog && <AdminAuditLog accountType="platform" /> */}

      <AddAdminModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        accountType="platform"
        onSuccess={() => {
          loadPlatformAdmins();
          setIsAddModalOpen(false);
        }}
      />

      {/* Edit Admin Dialog */}
      {currentAdmin && (
        <EditAdminModal
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          admin={currentAdmin}
          accountType="platform"
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Admin Modal */}
      <DeleteAdminModal
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        admin={currentAdmin}
        accountType="platform"
        onSuccess={handleDeleteSuccess}
      />
    </div>;
}