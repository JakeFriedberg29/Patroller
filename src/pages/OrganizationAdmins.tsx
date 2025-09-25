import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Users, 
  Search, 
  Plus, 
  MoreHorizontal,
  Mail,
  Phone,
  Filter,
  Calendar,
  MapPin,
  Edit, 
  Trash2
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { ResendActivationButton } from "@/components/ResendActivationButton";
import { UserStatusBadge } from "@/components/UserStatusBadge";
import { AddAdminModal } from "@/components/AddAdminModal";
import { EditAdminModal } from "@/components/EditAdminModal";
import { DeleteAdminModal } from "@/components/DeleteAdminModal";
import { useToast } from "@/hooks/use-toast";

interface OrganizationAdmin {
  id: string;
  user_id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  activation_status: "pending" | "active" | "suspended";
  department: string;
  location: string;
  lastLogin: string;
  createdDate: string;
  permissions: string[];
  avatar: string;
  activation_sent_at?: string;
}

export default function OrganizationAdmins() {
  const { id: organizationId } = useParams();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<OrganizationAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<OrganizationAdmin | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState("10");

  // Load organization admins from database
  useEffect(() => {
    loadOrganizationAdmins();
  }, [organizationId]);

  const loadOrganizationAdmins = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          user_roles!user_roles_user_id_fkey!inner(role_type, is_active)
        `)
        .eq('user_roles.role_type', 'organization_admin')
        .eq('user_roles.is_active', true)
        .eq('organization_id', organizationId)
        .neq('status', 'inactive') // Exclude soft-deleted users
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading organization admins:', error);
        toast({
          title: "Error Loading Admins",
          description: "Failed to load organization administrators.",
          variant: "destructive",
        });
        return;
      }

      const transformedAdmins: OrganizationAdmin[] = data.map(user => {
        const profileData = user.profile_data as { 
          department?: string; 
          location?: string; 
          permissions?: string[];
          avatar?: string;
          activation_sent_at?: string;
        } || {};
        
        return {
          id: user.id,
          user_id: user.id,
          firstName: user.first_name || user.full_name?.split(' ')[0] || '',
          lastName: user.last_name || user.full_name?.split(' ').slice(1).join(' ') || '',
          email: user.email,
          phone: user.phone || '',
          role: 'Organization Admin',
          activation_status: user.status === 'active' ? 'active' : user.status === 'pending' ? 'pending' : 'suspended',
          department: profileData.department || '',
          location: profileData.location || '',
          lastLogin: user.last_login_at || user.updated_at || '',
          createdDate: user.created_at || '',
          permissions: profileData.permissions || ['Team Management', 'Report Management'],
          avatar: profileData.avatar || '',
          activation_sent_at: profileData.activation_sent_at
        };
      });

      setAdmins(transformedAdmins);
    } catch (error) {
      console.error('Error loading organization admins:', error);
      toast({
        title: "Error Loading Admins",
        description: "Failed to load organization administrators.",
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
      admin.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || admin.activation_status.toLowerCase() === statusFilter;
    const matchesDepartment = departmentFilter === "all" || admin.department.toLowerCase().includes(departmentFilter);
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

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
    loadOrganizationAdmins();
  };

  const handleEditAdmin = (admin: OrganizationAdmin) => {
    setSelectedAdmin(admin);
    setIsEditModalOpen(true);
  };

  const handleDeleteAdmin = (admin: OrganizationAdmin) => {
    setSelectedAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  const handleEditSuccess = () => {
    loadOrganizationAdmins();
    setSelectedAdmin(null);
  };

  const handleDeleteSuccess = () => {
    loadOrganizationAdmins();
    setSelectedAdmin(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8" />
            Organization Admins
          </h1>
          <p className="text-muted-foreground">Manage administrators for this organization</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Admin
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Administrator Directory</CardTitle>
          
          {/* Search and Filters */}
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
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="reports">Reports</SelectItem>
                  <SelectItem value="communications">Communications</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Administrator</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.slice(0, parseInt(rowsPerPage)).map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={admin.avatar} alt={`${admin.firstName} ${admin.lastName}`} />
                          <AvatarFallback>
                            {admin.firstName[0]}{admin.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="font-medium">{admin.firstName} {admin.lastName}</div>
                          <div className="text-sm text-muted-foreground">{admin.role}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {admin.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {admin.phone || 'Not provided'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{admin.department || 'Not assigned'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {admin.location || 'Not assigned'}
                      </div>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{formatLastLogin(admin.lastLogin)}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Joined {formatDate(admin.createdDate)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-48">
                      <div className="flex flex-wrap gap-1">
                        {admin.permissions.slice(0, 2).map((permission) => (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                        {admin.permissions.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{admin.permissions.length - 2} more
                          </Badge>
                        )}
                        {admin.permissions.length === 0 && (
                          <span className="text-xs text-muted-foreground">No permissions set</span>
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
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <Select value={rowsPerPage} onValueChange={setRowsPerPage}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                of {filteredAdmins.length} administrators
              </span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Showing {Math.min(parseInt(rowsPerPage), filteredAdmins.length)} of {filteredAdmins.length} results
            </div>
          </div>
        </CardContent>
      </Card>

      <AddAdminModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        accountType="organization"
        onSuccess={handleAddAdminSuccess}
      />

      <EditAdminModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        admin={selectedAdmin}
        accountType="organization"
        onSuccess={handleEditSuccess}
      />

      <DeleteAdminModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        admin={selectedAdmin}
        accountType="organization"
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}