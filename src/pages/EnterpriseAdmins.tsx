import { useState } from "react";
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
  Shield, 
  Search, 
  Plus, 
  MoreHorizontal,
  Mail,
  Phone,
  Filter,
  Calendar,
  MapPin
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const mockAdmins = [
  {
    id: "admin-001",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@megacorp.com",
    phone: "+1 (555) 123-4567",
    role: "Enterprise Admin",
    status: "Active",
    department: "Operations",
    location: "Detroit, MI",
    lastLogin: "2024-01-15T10:30:00Z",
    createdDate: "2023-03-15T00:00:00Z",
    permissions: ["Full Access", "User Management", "Organization Management"],
    avatar: ""
  },
  {
    id: "admin-002", 
    firstName: "Mike",
    lastName: "Chen",
    email: "mike.chen@megacorp.com",
    phone: "+1 (555) 234-5678",
    role: "Enterprise Admin",
    status: "Active",
    department: "Logistics",
    location: "Atlanta, GA",
    lastLogin: "2024-01-15T08:45:00Z",
    createdDate: "2023-05-22T00:00:00Z",
    permissions: ["Organization Management", "Reporting", "User Management"],
    avatar: ""
  },
  {
    id: "admin-003",
    firstName: "Dr. Emily",
    lastName: "Rodriguez",
    email: "emily.rodriguez@megacorp.com", 
    phone: "+1 (555) 345-6789",
    role: "Enterprise Admin",
    status: "Active",
    department: "Research & Development",
    location: "San Francisco, CA",
    lastLogin: "2024-01-14T16:20:00Z",
    createdDate: "2023-01-10T00:00:00Z",
    permissions: ["Full Access", "Analytics", "System Configuration"],
    avatar: ""
  },
  {
    id: "admin-004",
    firstName: "Robert",
    lastName: "Davis",
    email: "robert.davis@megacorp.com",
    phone: "+1 (555) 456-7890",
    role: "Enterprise Admin",
    status: "Suspended",
    department: "Energy Division",
    location: "Houston, TX",
    lastLogin: "2024-01-10T14:15:00Z",
    createdDate: "2023-07-03T00:00:00Z",
    permissions: ["User Management", "Reporting"],
    avatar: ""
  },
  {
    id: "admin-005",
    firstName: "Dr. Lisa",
    lastName: "Thompson",
    email: "lisa.thompson@megacorp.com",
    phone: "+1 (555) 567-8901",
    role: "Enterprise Admin", 
    status: "Active",
    department: "Healthcare",
    location: "Boston, MA",
    lastLogin: "2024-01-15T11:10:00Z",
    createdDate: "2023-04-18T00:00:00Z",
    permissions: ["Organization Management", "Compliance", "Reporting"],
    avatar: ""
  }
];

export default function EnterpriseAdmins() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState("10");

  const filteredAdmins = mockAdmins.filter((admin) => {
    const matchesSearch = 
      admin.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || admin.status.toLowerCase() === statusFilter;
    const matchesDepartment = departmentFilter === "all" || admin.department.toLowerCase().includes(departmentFilter);
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'default';
      case 'suspended': return 'destructive';
      case 'inactive': return 'secondary';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8" />
            Enterprise Admins
          </h1>
          <p className="text-muted-foreground">Manage administrators across your enterprise</p>
        </div>
        <Button>
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
                  <SelectItem value="suspended">Suspended</SelectItem>
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
                  <SelectItem value="logistics">Logistics</SelectItem>
                  <SelectItem value="research">Research & Development</SelectItem>
                  <SelectItem value="energy">Energy Division</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
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
                          {admin.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{admin.department}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {admin.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(admin.status)}>
                        {admin.status}
                      </Badge>
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
                          <DropdownMenuItem>
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Edit Administrator
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Manage Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            View Activity Log
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            {admin.status === 'Active' ? 'Suspend' : 'Activate'}
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
    </div>
  );
}