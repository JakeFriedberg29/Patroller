import { useState } from "react";
import { Plus, Search, Send, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface PlatformAdmin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  status: "Active" | "Pending" | "Inactive";
}

const mockAdmins: PlatformAdmin[] = [
  {
    id: "1",
    firstName: "Jake",
    lastName: "Friedberg",
    email: "jakefriedberg32@gmail.com",
    role: "Platform Admin",
    status: "Pending"
  }
];

export default function PlatformAdmins() {
  const [admins, setAdmins] = useState<PlatformAdmin[]>(mockAdmins);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCount, setShowCount] = useState("10");
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
      setNewAdmin({ firstName: "", lastName: "", email: "", phone: "" });
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

  const filteredAdmins = admins.filter(admin => 
    admin.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active": return "default";
      case "Pending": return "secondary";
      case "Inactive": return "outline";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
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

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search platform admins by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Admin List */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-foreground">
                Platform Admins ({filteredAdmins.length})
              </h2>
              {selectedAdmins.length > 0 && (
                <Button variant="outline" size="sm" className="gap-2">
                  <Send className="h-4 w-4" />
                  Resend Activation Email
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Show:</span>
              <Select value={showCount} onValueChange={setShowCount}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground w-12">
                  <Checkbox
                    checked={selectedAdmins.length === filteredAdmins.length && filteredAdmins.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">First Name</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Last Name</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Account Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Contact</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map((admin) => (
                <tr key={admin.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <Checkbox
                      checked={selectedAdmins.includes(admin.id)}
                      onCheckedChange={(checked) => handleSelectAdmin(admin.id, checked as boolean)}
                    />
                  </td>
                  <td className="p-4 font-medium text-foreground">{admin.firstName}</td>
                  <td className="p-4 font-medium text-foreground">{admin.lastName}</td>
                  <td className="p-4">
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                      {admin.role}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge 
                      variant={getStatusBadgeVariant(admin.status)}
                      className={admin.status === "Pending" ? "bg-orange-100 text-orange-800 hover:bg-orange-200" : ""}
                    >
                      {admin.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-primary hover:text-primary/80">{admin.email}</td>
                  <td className="p-4">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddDialogOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={newAdmin.firstName}
                  onChange={(e) => setNewAdmin({ ...newAdmin, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={newAdmin.lastName}
                  onChange={(e) => setNewAdmin({ ...newAdmin, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                placeholder="responder@organization.org"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={newAdmin.phone}
                onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddAdmin}
              disabled={!newAdmin.firstName || !newAdmin.lastName || !newAdmin.email}
            >
              Add Admin
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}