import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Building2, 
  Search, 
  Plus, 
  MoreHorizontal,
  MapPin,
  Users,
  Activity,
  Filter
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const mockOrganizations = [
  {
    id: "org-001",
    name: "MegaCorp Manufacturing",
    location: "Detroit, MI",
    address: "1234 Industrial Blvd, Detroit, MI 48201",
    users: 456,
    status: "Active",
    type: "Manufacturing",
    lastActivity: "2 hours ago",
    createdDate: "2023-03-15",
    adminContact: "Sarah Johnson",
    email: "sarah.johnson@megacorp.com"
  },
  {
    id: "org-002",
    name: "MegaCorp Logistics", 
    location: "Atlanta, GA",
    address: "5678 Freight Ave, Atlanta, GA 30309",
    users: 203,
    status: "Active",
    type: "Logistics",
    lastActivity: "30 minutes ago",
    createdDate: "2023-05-22",
    adminContact: "Mike Chen",
    email: "mike.chen@megacorp.com"
  },
  {
    id: "org-003",
    name: "MegaCorp R&D",
    location: "San Francisco, CA",
    address: "910 Innovation Dr, San Francisco, CA 94102",
    users: 189,
    status: "Active", 
    type: "Research",
    lastActivity: "1 hour ago",
    createdDate: "2023-01-10",
    adminContact: "Dr. Emily Rodriguez",
    email: "emily.rodriguez@megacorp.com"
  },
  {
    id: "org-004",
    name: "MegaCorp Energy",
    location: "Houston, TX",
    address: "2468 Energy Plaza, Houston, TX 77002",
    users: 334,
    status: "Warning",
    type: "Energy",
    lastActivity: "5 hours ago",
    createdDate: "2023-07-03",
    adminContact: "Robert Davis",
    email: "robert.davis@megacorp.com"
  },
  {
    id: "org-005",
    name: "MegaCorp Healthcare",
    location: "Boston, MA",
    address: "1357 Medical Center Dr, Boston, MA 02101",
    users: 267,
    status: "Active",
    type: "Healthcare",
    lastActivity: "45 minutes ago",
    createdDate: "2023-04-18",
    adminContact: "Dr. Lisa Thompson",
    email: "lisa.thompson@megacorp.com"
  },
  {
    id: "org-006",
    name: "MegaCorp Finance",
    location: "New York, NY",
    address: "7890 Wall Street, New York, NY 10005",
    users: 145,
    status: "Inactive",
    type: "Finance",
    lastActivity: "3 days ago",
    createdDate: "2023-02-28",
    adminContact: "James Wilson",
    email: "james.wilson@megacorp.com"
  }
];

export default function EnterpriseOrganizations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState("10");

  const filteredOrganizations = mockOrganizations.filter((org) => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || org.status.toLowerCase() === statusFilter;
    const matchesType = typeFilter === "all" || org.type.toLowerCase() === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'default';
      case 'warning': return 'destructive';
      case 'inactive': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Building2 className="h-8 w-8" />
            Organizations
          </h1>
          <p className="text-muted-foreground">Manage all organizations within your enterprise</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Organization
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Directory</CardTitle>
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search organizations..."
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
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="logistics">Logistics</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="energy">Energy</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
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
                  <TableHead>Organization</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Admin Contact</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganizations.slice(0, parseInt(rowsPerPage)).map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{org.name}</div>
                        <div className="text-sm text-muted-foreground">ID: {org.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{org.location}</div>
                          <div className="text-sm text-muted-foreground">{org.address}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{org.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {org.users}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(org.status)}>
                        {org.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        {org.lastActivity}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{org.adminContact}</div>
                        <div className="text-sm text-muted-foreground">{org.email}</div>
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
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Edit Organization
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Manage Users
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            View Logs
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Deactivate
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
                of {filteredOrganizations.length} organizations
              </span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Showing {Math.min(parseInt(rowsPerPage), filteredOrganizations.length)} of {filteredOrganizations.length} results
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}