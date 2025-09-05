import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search, Filter, RefreshCw } from "lucide-react";
import { AccountHeader } from "@/components/AccountHeader";

interface UserRole {
  id: string;
  user_id: string;
  role_type: string;
  organization_id: string | null;
  is_active: boolean;
  granted_at: string;
  granted_by: string | null;
  expires_at: string | null;
  user: {
    email: string;
    full_name: string;
    status: string;
  };
}

const UserRoles = () => {
  const navigate = useNavigate();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const loadUserRoles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          user:users!user_roles_user_id_fkey(
            email,
            full_name,
            status
          )
        `)
        .order('granted_at', { ascending: false });

      if (error) {
        console.error('Error loading user roles:', error);
        toast.error('Failed to load user roles');
        return;
      }

      if (data) {
        setUserRoles(data as UserRole[]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserRoles();
  }, []);

  const filteredRoles = userRoles.filter(role => {
    const matchesSearch = 
      role.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.role_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || role.role_type === roleFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && role.is_active) ||
      (statusFilter === "inactive" && !role.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const toggleRoleStatus = async (roleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: !currentStatus })
        .eq('id', roleId);

      if (error) {
        console.error('Error updating role status:', error);
        toast.error('Failed to update role status');
        return;
      }

      toast.success('Role status updated successfully');
      loadUserRoles();
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const getRoleVariant = (roleType: string) => {
    switch (roleType) {
      case 'platform_admin': return 'destructive';
      case 'enterprise_admin': return 'default';
      case 'organization_admin': return 'secondary';
      case 'supervisor': return 'outline';
      default: return 'outline';
    }
  };

  const formatRoleDisplay = (roleType: string) => {
    return roleType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <AccountHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">User Roles Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions across the platform
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Roles</CardTitle>
                <CardDescription>
                  View and manage user role assignments
                </CardDescription>
              </div>
              <Button onClick={loadUserRoles} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email, name, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="platform_admin">Platform Admin</SelectItem>
                  <SelectItem value="enterprise_admin">Enterprise Admin</SelectItem>
                  <SelectItem value="organization_admin">Organization Admin</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Email</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Role Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Granted Date</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading user roles...
                      </TableCell>
                    </TableRow>
                  ) : filteredRoles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No user roles found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRoles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">
                          {role.user?.email || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {role.user?.full_name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleVariant(role.role_type)}>
                            {formatRoleDisplay(role.role_type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={role.is_active ? "default" : "secondary"}>
                            {role.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(role.granted_at)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {role.expires_at ? formatDate(role.expires_at) : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleRoleStatus(role.id, role.is_active)}
                          >
                            {role.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserRoles;