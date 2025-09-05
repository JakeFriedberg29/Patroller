import { useParams } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Users, Plus, Search, Phone, Mail, Filter, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddMemberModal } from "@/components/AddMemberModal";
import { useToast } from "@/hooks/use-toast";
import { useTeamMembers } from "@/hooks/useTeamMembers";

const mockTeamMembers = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Team Lead",
    status: "Available",
    phone: "(555) 123-4567",
    email: "sarah.johnson@example.com",
    certification: "EMT-P",
    department: "Emergency Services"
  },
  {
    id: 2,
    name: "Mike Chen",
    role: "Rescue Specialist", 
    status: "On Mission",
    phone: "(555) 234-5678",
    email: "mike.chen@example.com",
    certification: "Technical Rescue",
    department: "Operations"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Communications",
    status: "Available",
    phone: "(555) 345-6789", 
    email: "emily.rodriguez@example.com",
    certification: "Radio Operator",
    department: "Communications"
  }
];

export default function TeamDirectory() {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All Status");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const { toast } = useToast();
  const { teamMembers, loading, updateTeamMember, canManageUsers } = useTeamMembers();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "default";
      case "inactive": return "secondary"; 
      case "pending": return "destructive";
      default: return "outline";
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getRoleFromUserRoles = (userRoles: any[]) => {
    if (!userRoles || userRoles.length === 0) return 'Member';
    const activeRole = userRoles.find(role => role.is_active);
    if (!activeRole) return 'Member';
    
    switch (activeRole.role_type) {
      case 'platform_admin': return 'Platform Admin';
      case 'enterprise_admin': return 'Enterprise Admin';
      case 'organization_admin': return 'Organization Admin';
      case 'supervisor': return 'Team Lead';
      case 'responder': return 'Responder';
      default: return 'Member';
    }
  };

  // Use database team members instead of mock data
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "All Status" || member.status === selectedFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredMembers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + rowsPerPage);

  const statusOptions = [...new Set(mockTeamMembers.map(member => member.status))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Team Directory</h1>
            <p className="text-muted-foreground">Manage team members and contacts</p>
          </div>
        </div>
        {canManageUsers && (
          <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Member
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search team members..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Status">All Status</SelectItem>
            {statusOptions.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Team Members Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Certification</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMembers.map((member) => (
                <TableRow key={member.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="space-y-1">
                      <div className="font-medium">{member.full_name}</div>
                      <div className="text-sm text-muted-foreground">{getRoleFromUserRoles(member.user_roles)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(member.status) as any}>
                      {formatStatus(member.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{member.phone || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{member.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{member.profile_data?.specialization || 'General'}</Badge>
                  </TableCell>
                  <TableCell>
                    {canManageUsers && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedMember(member);
                              setIsEditModalOpen(true);
                            }}
                          >
                            Edit Member
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              toast({
                                title: "View Profile",
                                description: `Viewing profile for ${member.full_name}`,
                              });
                            }}
                          >
                            View Profile
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
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
                {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredMembers.length)} of {filteredMembers.length}
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

      <AddMemberModal 
        open={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen} 
      />

      {/* Edit Member Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  defaultValue={selectedMember.full_name}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  defaultValue={selectedMember.email}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  defaultValue={selectedMember.phone || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select defaultValue={selectedMember.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              const updatedData = {
                full_name: (document.getElementById('edit-name') as HTMLInputElement)?.value,
                email: (document.getElementById('edit-email') as HTMLInputElement)?.value,
                phone: (document.getElementById('edit-phone') as HTMLInputElement)?.value,
                status: selectedMember?.status // Get from select component if needed
              };
              
              updateTeamMember(selectedMember?.id, updatedData).then((success) => {
                if (success) {
                  setIsEditModalOpen(false);
                  setSelectedMember(null);
                }
              });
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}