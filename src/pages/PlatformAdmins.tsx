import { useState } from "react";
import { Plus, Search, Send, MoreHorizontal, X, Filter } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
interface PlatformAdmin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  status: "Active" | "Pending" | "Inactive";
}
const mockAdmins: PlatformAdmin[] = [{
  id: "1",
  firstName: "Jake",
  lastName: "Friedberg",
  email: "jakefriedberg32@gmail.com",
  role: "Platform Admin",
  status: "Pending"
}];
export default function PlatformAdmins() {
  const [admins, setAdmins] = useState<PlatformAdmin[]>(mockAdmins);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All Status");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);
  const [newAdmin, setNewAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });
  const handleAddAdmin = () => {
    if (newAdmin.firstName && newAdmin.lastName && newAdmin.email) {
      const admin: PlatformAdmin = {
        id: Date.now().toString(),
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        email: newAdmin.email,
        phone: newAdmin.phone,
        role: "Platform Admin",
        status: "Pending"
      };
      setAdmins([...admins, admin]);
      setNewAdmin({
        firstName: "",
        lastName: "",
        email: "",
        phone: ""
      });
      setIsAddDialogOpen(false);
    }
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
    const matchesFilter = selectedFilter === "All Status" || admin.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });
  const totalPages = Math.ceil(filteredAdmins.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedAdmins = filteredAdmins.slice(startIndex, startIndex + rowsPerPage);
  const statusOptions = [...new Set(admins.map(admin => admin.status))];
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
        
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Platform Admin
        </Button>
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
            {statusOptions.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
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
                    <Badge variant={getStatusBadgeVariant(admin.status)} className={admin.status === "Pending" ? "bg-orange-100 text-orange-800 hover:bg-orange-200" : ""}>
                      {admin.status}
                    </Badge>
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Admin</DropdownMenuItem>
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
              {selectedAdmins.length > 0 && <Button variant="outline" size="sm" className="gap-2 ml-4">
                  <Send className="h-4 w-4" />
                  Resend Activation Email ({selectedAdmins.length})
                </Button>}
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
                  <p className="text-sm text-muted-foreground mt-1">
                    Add a new administrator to the platform.
                  </p>
                </div>
              </div>
              
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" value={newAdmin.firstName} onChange={e => setNewAdmin({
                ...newAdmin,
                firstName: e.target.value
              })} placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" value={newAdmin.lastName} onChange={e => setNewAdmin({
                ...newAdmin,
                lastName: e.target.value
              })} placeholder="Doe" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email" value={newAdmin.email} onChange={e => setNewAdmin({
              ...newAdmin,
              email: e.target.value
            })} placeholder="responder@organization.org" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" value={newAdmin.phone} onChange={e => setNewAdmin({
              ...newAdmin,
              phone: e.target.value
            })} placeholder="(555) 123-4567" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAdmin} disabled={!newAdmin.firstName || !newAdmin.lastName || !newAdmin.email}>
              Add Admin
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
}