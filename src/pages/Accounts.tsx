import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Plus, Search, Building2, Mail, Phone, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const accounts = [
  {
    id: 1,
    name: "Mountain Rescue Team Alpha",
    type: "Search & Rescue",
    members: 0,
    email: "dispatch@mrt-alpha.org",
    phone: "(555) 123-4567",
    created: "8/26/2025"
  },
  {
    id: 2,
    name: "Coastal Lifeguard Services",
    type: "Lifeguard Service",
    members: 0,
    email: "ops@coastallifeguard.org",
    phone: "(555) 987-6543",
    created: "8/26/2025"
  },
  {
    id: 3,
    name: "Wilderness Adventures Inc",
    type: "Adventure Tourism",
    members: 0,
    email: "safety@wildadventures.com",
    phone: "(555) 456-7890",
    created: "8/26/2025"
  },
  {
    id: 4,
    name: "Coastal Lifeguard Division",
    type: "Lifeguard Service",
    members: 1,
    email: "operations@coastallifeguard.gov",
    phone: "(555) 987-6543",
    created: "8/26/2025"
  },
  {
    id: 5,
    name: "Mountain Ridge SAR",
    type: "Search & Rescue",
    members: 0,
    email: "dispatch@mountainridgesar.org",
    phone: "(555) 123-4567",
    created: "8/26/2025"
  }
];

const typeColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "Search & Rescue": "destructive",
  "Lifeguard Service": "default",
  "Adventure Tourism": "secondary"
};

const Accounts = () => {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    category: "",
    primaryEmail: "",
    primaryPhone: "",
    secondaryEmail: "",
    secondaryPhone: "",
    address: "",
    city: "",
    state: "",
    zip: ""
  });

  const handleViewAccount = (accountId: number) => {
    navigate(`/accounts/${accountId}`);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    // Here you would typically submit to an API
    console.log("Creating account:", formData);
    setIsAddModalOpen(false);
    // Reset form
    setFormData({
      name: "",
      type: "",
      category: "",
      primaryEmail: "",
      primaryPhone: "",
      secondaryEmail: "",
      secondaryPhone: "",
      address: "",
      city: "",
      state: "",
      zip: ""
    });
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            Accounts
          </h1>
          <p className="text-muted-foreground mt-1">Manage accounts and their settings</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search accounts by name or email..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Building2 className="h-4 w-4" />
          All Types
        </Button>
      </div>

      {/* Accounts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Team Members</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">{account.name}</div>
                        <div className="text-sm text-muted-foreground">Created {account.created}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={typeColors[account.type] || "default"}>
                      {account.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {account.type}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{account.members}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{account.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{account.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewAccount(account.id)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Account Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Account</DialogTitle>
            <DialogDescription>
              Create a new account in the system.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                  <SelectItem value="Organization">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Search & Rescue">Search & Rescue</SelectItem>
                  <SelectItem value="Lifeguard Service">Lifeguard Service</SelectItem>
                  <SelectItem value="Park Service">Park Service</SelectItem>
                  <SelectItem value="Event Medical">Event Medical</SelectItem>
                  <SelectItem value="Ski Patrol">Ski Patrol</SelectItem>
                  <SelectItem value="Harbor Master">Harbor Master</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryEmail">Primary Email *</Label>
              <Input
                id="primaryEmail"
                type="email"
                value={formData.primaryEmail}
                onChange={(e) => handleInputChange("primaryEmail", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryPhone">Primary Phone *</Label>
              <Input
                id="primaryPhone"
                type="tel"
                value={formData.primaryPhone}
                onChange={(e) => handleInputChange("primaryPhone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryEmail">Secondary Email</Label>
              <Input
                id="secondaryEmail"
                type="email"
                value={formData.secondaryEmail}
                onChange={(e) => handleInputChange("secondaryEmail", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryPhone">Secondary Phone</Label>
              <Input
                id="secondaryPhone"
                type="tel"
                value={formData.secondaryPhone}
                onChange={(e) => handleInputChange("secondaryPhone", e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                value={formData.zip}
                onChange={(e) => handleInputChange("zip", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Accounts;