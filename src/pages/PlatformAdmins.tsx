import { useState, useEffect } from "react";
import { Plus, Search, Send, MoreHorizontal, X, Filter, Edit, Trash2 } from "lucide-react";
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
  const { toast } = useToast();
  const { createUser, isLoading: isCreatingUser } = useUserManagement();
  const [admins, setAdmins] = useState<PlatformAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'Platform Admin')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading platform admins:', error);
        toast({
          title: "Error Loading Admins",
          description: "Failed to load platform administrators.",
          variant: "destructive",
        });
        return;
      }

      const transformedAdmins: PlatformAdmin[] = data.map(profile => ({
        id: profile.id,
        user_id: profile.user_id,
        firstName: profile.full_name?.split(' ')[0] || '',
        lastName: profile.full_name?.split(' ').slice(1).join(' ') || '',
        email: profile.email,
        phone: '', // Add phone to profiles table if needed
        role: profile.role || 'Platform Admin',
        activation_status: (profile.activation_status as "pending" | "active" | "suspended") || 'pending',
        activation_sent_at: profile.activation_sent_at
      }));

      setAdmins(transformedAdmins);
    } catch (error) {
      console.error('Error loading platform admins:', error);
      toast({
        title: "Error Loading Admins",
        description: "Failed to load platform administrators.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const [editAdmin, setEditAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });
  const handleAddAdmin = async () => {
    if (newAdmin.firstName && newAdmin.lastName && newAdmin.email) {
      const result = await createUser({
        email: newAdmin.email,
        fullName: `${newAdmin.firstName} ${newAdmin.lastName}`,
        role: 'Platform Admin',
        accountType: 'platform'
      });

      if (result.success) {
        setNewAdmin({
          firstName: "",
          lastName: "",
          email: "",
          phone: ""
        });
        setIsAddDialogOpen(false);
        loadPlatformAdmins(); // Refresh the list
      }
    }
  };

  const handleEditAdmin = (admin: PlatformAdmin) => {
    setCurrentAdmin(admin);
    setEditAdmin({
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      phone: admin.phone || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateAdmin = () => {
    if (currentAdmin && editAdmin.firstName && editAdmin.lastName && editAdmin.email) {
      try {
        const updatedAdmins = admins.map(admin => 
          admin.id === currentAdmin.id 
            ? {
                ...admin,
                firstName: editAdmin.firstName,
                lastName: editAdmin.lastName,
                email: editAdmin.email,
                phone: editAdmin.phone
              }
            : admin
        );
        setAdmins(updatedAdmins);
        setIsEditDialogOpen(false);
        setCurrentAdmin(null);
        setEditAdmin({
          firstName: "",
          lastName: "",
          email: "",
          phone: ""
        });
        
        toast({
          title: "Admin Updated Successfully",
          description: `${editAdmin.firstName} ${editAdmin.lastName}'s information has been updated.`,
        });
      } catch (error) {
        toast({
          title: "Error Updating Admin",
          description: "Failed to update the administrator. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteAdmin = (admin: PlatformAdmin) => {
    setCurrentAdmin(admin);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (currentAdmin) {
      try {
        const updatedAdmins = admins.filter(admin => admin.id !== currentAdmin.id);
        setAdmins(updatedAdmins);
        setIsDeleteDialogOpen(false);
        
        toast({
          title: "Admin Deleted Successfully",
          description: `${currentAdmin.firstName} ${currentAdmin.lastName} has been removed from the platform.`,
        });
        
        setCurrentAdmin(null);
      } catch (error) {
        toast({
          title: "Error Deleting Admin",
          description: "Failed to delete the administrator. Please try again.",
          variant: "destructive",
        });
      }
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
                        <DropdownMenuItem onClick={() => handleEditAdmin(admin)} className="cursor-pointer">
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
                  <DialogDescription className="text-sm text-muted-foreground mt-1">
                    Add a new administrator to the platform.
                  </DialogDescription>
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

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAdmin} disabled={!newAdmin.firstName || !newAdmin.lastName || !newAdmin.email || isCreatingUser}>
              {isCreatingUser ? 'Creating...' : 'Add Admin'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Edit className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">Edit Platform Admin</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground mt-1">
                    Update administrator information.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editFirstName">First Name *</Label>
                <Input 
                  id="editFirstName" 
                  value={editAdmin.firstName} 
                  onChange={e => setEditAdmin({
                    ...editAdmin,
                    firstName: e.target.value
                  })} 
                  placeholder="John" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLastName">Last Name *</Label>
                <Input 
                  id="editLastName" 
                  value={editAdmin.lastName} 
                  onChange={e => setEditAdmin({
                    ...editAdmin,
                    lastName: e.target.value
                  })} 
                  placeholder="Doe" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editEmail">Email Address *</Label>
              <Input 
                id="editEmail" 
                type="email" 
                value={editAdmin.email} 
                onChange={e => setEditAdmin({
                  ...editAdmin,
                  email: e.target.value
                })} 
                placeholder="responder@organization.org" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editPhone">Phone</Label>
              <Input 
                id="editPhone" 
                type="tel" 
                value={editAdmin.phone} 
                onChange={e => setEditAdmin({
                  ...editAdmin,
                  phone: e.target.value
                })} 
                placeholder="(555) 123-4567" 
              />
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateAdmin} 
              disabled={!editAdmin.firstName || !editAdmin.lastName || !editAdmin.email}
            >
              Update Admin
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl font-bold">Delete Platform Admin</AlertDialogTitle>
                <AlertDialogDescription className="mt-1">
                  This action cannot be undone. This will permanently remove the administrator from the platform.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          
          {currentAdmin && (
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold mb-2">Administrator Details</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Name:</span> {currentAdmin.firstName} {currentAdmin.lastName}</p>
                <p><span className="font-medium">Email:</span> {currentAdmin.email}</p>
                <p><span className="font-medium">Role:</span> {currentAdmin.role}</p>
                <p><span className="font-medium">Status:</span> {currentAdmin.activation_status}</p>
              </div>
            </div>
          )}

          <AlertDialogFooter className="flex justify-between">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
}