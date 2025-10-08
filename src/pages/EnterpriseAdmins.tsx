import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Shield, 
  Search, 
  Plus, 
  MoreHorizontal,
  Mail,
  Phone,
  Filter,
  Send,
  Edit, 
  Trash2
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useUserManagement } from "@/hooks/useUserManagement";
// Removed status components to simplify table to Name, Role, Contact
import { AddAdminModal } from "@/components/AddAdminModal";
import { EditAdminModal } from "@/components/EditAdminModal";
import { DeleteAdminModal } from "@/components/DeleteAdminModal";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useEmailService } from "@/hooks/useEmailService";

interface EnterpriseAdmin {
  id: string;
  user_id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  activation_status: "pending" | "active" | "suspended";
  
  location: string;
  lastLogin: string;
  createdDate: string;
  permissions: string[];
  avatar: string;
  activation_sent_at?: string;
}

export default function EnterpriseUsers() {
  const { id: tenantId } = useParams();
  const { toast } = useToast();
  // Force rebuild to clear cache
  const { createUser, isLoading: isCreatingUser } = useUserManagement();
  const [admins, setAdmins] = useState<EnterpriseAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<EnterpriseAdmin | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);
  const [isResending, setIsResending] = useState(false);
  const { sendActivationEmail } = useEmailService();

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
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Query users directly and filter out platform admins
      const { data: accountUsersData, error } = await supabase
        .from('account_users')
        .select(`
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
        `)
        .eq('tenant_id', tenantId)
        .is('organization_id', null)
        .eq('is_active', true);

      if (error) {
        console.error('Error loading enterprise admins:', error);
        toast({
          title: "Error Loading Admins",
          description: "Failed to load enterprise administrators.",
          variant: "destructive",
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
        const status = user.status === 'active' ? 'active' : user.status === 'pending' ? 'pending' : 'suspended';
        return {
          id: accountUser.id,
          user_id: user.id,
          firstName: user.full_name?.split(' ')[0] || '',
          lastName: user.full_name?.split(' ').slice(1).join(' ') || '',
          email: user.email,
          phone: '',
          role: accountUser.access_role === 'write' ? 'Admin' : 'User',
          activation_status: status as "pending" | "active" | "suspended",
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
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch = 
      admin.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || admin.activation_status.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  const totalPages = Math.ceil(filteredAdmins.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedAdmins = filteredAdmins.slice(startIndex, startIndex + rowsPerPage);

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'default';
      case 'suspended': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    }
    return `${Math.floor(diffInHours / 24)} days ago`;
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

  const handleSelectAdmin = (adminId: string, checked: boolean) => {
    if (checked) {
      setSelectedAdmins(prev => [...prev, adminId]);
    } else {
      setSelectedAdmins(prev => prev.filter(id => id !== adminId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAdmins(paginatedAdmins.map(a => a.id));
    } else {
      setSelectedAdmins([]);
    }
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

  return (
    <div className="space-y-6">
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

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search administrators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
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
        </div>
      </div>

      {/* Admins Table (Common design) */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedAdmins.length === paginatedAdmins.length && paginatedAdmins.length > 0}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  />
                </TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: rowsPerPage }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><div className="h-10 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-10 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-10 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-10 bg-muted animate-pulse rounded" /></TableCell>
                  </TableRow>
                ))
              ) : (
                paginatedAdmins.map((admin) => (
                  <TableRow key={admin.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedAdmins.includes(admin.id)}
                        onCheckedChange={(checked) => handleSelectAdmin(admin.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={admin.avatar} alt={`${admin.firstName} ${admin.lastName}`} />
                          <AvatarFallback>
                            {admin.firstName[0]}{admin.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{admin.firstName} {admin.lastName}</div>
                          <div className="text-sm text-muted-foreground">Joined {formatDate(admin.createdDate)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                        {admin.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select value={rowsPerPage.toString()} onValueChange={(value) => {
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
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredAdmins.length)} of {filteredAdmins.length}
              </span>
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Bulk Actions */}
      {selectedAdmins.length > 0 && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleBulkResend} disabled={isResending}>
            <Send className="h-4 w-4" />
            {isResending ? 'Resending...' : `Resend Activation Email (${selectedAdmins.length})`}
          </Button>
        </div>
      )}

      

      <AddAdminModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        accountType="enterprise"
        onSuccess={handleAddAdminSuccess}
      />

      <EditAdminModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        admin={selectedAdmin}
        accountType="enterprise"
        onSuccess={handleEditSuccess}
      />

      <DeleteAdminModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        admin={selectedAdmin}
        accountType="enterprise"
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}