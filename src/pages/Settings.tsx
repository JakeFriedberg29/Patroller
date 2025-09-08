import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings as SettingsIcon, Save, Mail, Phone, MapPin, Building2, UserX, Trash2, Plus, Users, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccounts, Account } from "@/hooks/useAccounts";
import { DeleteAccountModal } from "@/components/DeleteAccountModal";

const mockAccountData = {
  id: 1,
  name: "Mountain Rescue Team Alpha",
  type: "Organization",
  category: "Search & Rescue",
  status: "Active",
  primaryEmail: "dispatch@mrt-alpha.org",
  primaryPhone: "(555) 123-4567",
  secondaryEmail: "backup@mrt-alpha.org",
  secondaryPhone: "(555) 123-4568",
  address: "123 Mountain View Drive",
  city: "Alpine Valley",
  state: "Colorado",
  zip: "80424",
  created: "2024-08-26",
  members: 15,
  parentEnterprise: {
    id: 2,
    name: "Rocky Mountain Emergency Services",
    type: "Enterprise"
  }
};

const mockOrganizations = [
  { id: 3, name: "Mountain Rescue Team Bravo", category: "Search & Rescue", status: "Active", members: 12 },
  { id: 4, name: "Alpine Medical Response", category: "Event Medical", status: "Active", members: 8 },
  { id: 5, name: "Summit Park Rangers", category: "Park Service", status: "Inactive", members: 6 }
];

// Available organizations that can be added to the enterprise
const availableOrganizations = [
  {
    id: "org-005",
    name: "City Emergency Response",
    location: "New York, NY",
    users: 89,
    category: "Search & Rescue",
    description: "Urban emergency response and rescue operations"
  },
  {
    id: "org-006",
    name: "Coastal Lifeguard Services",
    location: "Miami, FL",
    users: 156,
    category: "Lifeguard Service",
    description: "Beach and coastal water safety operations"
  },
  {
    id: "org-007",
    name: "Mountain Rescue Team",
    location: "Denver, CO",
    users: 67,
    category: "Search & Rescue",
    description: "High altitude and wilderness rescue operations"
  },
  {
    id: "org-008",
    name: "Park Emergency Services",
    location: "Sacramento, CA",
    users: 134,
    category: "Park Service",
    description: "National and state park emergency services"
  },
  {
    id: "org-009",
    name: "Event Medical Response",
    location: "Las Vegas, NV",
    users: 78,
    category: "Event Medical",
    description: "Large event and concert medical support"
  }
];

export default function Settings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { accounts, loading, updateAccount, deleteAccount } = useAccounts();
  const [isAddOrgModalOpen, setIsAddOrgModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [organizations, setOrganizations] = useState(mockOrganizations);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "Organization",
    category: "",
    primaryEmail: "",
    primaryPhone: "",
    primaryContact: "",
    secondaryEmail: "",
    secondaryPhone: "",
    secondaryContact: "",
    address: "",
    city: "",
    state: "",
    zip: ""
  });

  // Load account data
  useEffect(() => {
    if (id && accounts.length > 0) {
      const account = accounts.find(acc => acc.id === id);
      if (account) {
        setCurrentAccount(account);
        setFormData({
          name: account.name,
          type: account.type,
          category: account.category,
          primaryEmail: account.email,
          primaryPhone: account.phone,
          primaryContact: "",
          secondaryEmail: "",
          secondaryPhone: "",
          secondaryContact: "",
          address: "",
          city: "",
          state: "",
          zip: ""
        });
      } else {
        toast({
          title: "Account Not Found",
          description: "The requested account could not be found.",
          variant: "destructive"
        });
        navigate('/accounts');
      }
    }
  }, [id, accounts, navigate, toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!currentAccount) return;
    
    try {
      const success = await updateAccount(currentAccount.id, {
        name: formData.name,
        type: formData.type as 'Enterprise' | 'Organization',
        category: formData.category,
        email: formData.primaryEmail,
        phone: formData.primaryPhone
      });
      
      if (success) {
        setIsEditing(false);
        toast({
          title: "Settings Updated Successfully",
          description: "Your changes have been saved.",
        });
      }
    } catch (error) {
      toast({
        title: "Error Saving Settings",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    if (!currentAccount) return;
    
    // Reset form data to original values
    setFormData({
      name: currentAccount.name,
      type: currentAccount.type,
      category: currentAccount.category,
      primaryEmail: currentAccount.email,
      primaryPhone: currentAccount.phone,
      primaryContact: "",
      secondaryEmail: "",
      secondaryPhone: "",
      secondaryContact: "",
      address: "",
      city: "",
      state: "",
      zip: ""
    });
    setIsEditing(false);
  };

  const handleDisableAccount = () => {
    console.log("Disabling account");
    // Here you would typically call an API to disable the account
  };

  const handleDeleteAccount = async (accountId: string) => {
    const success = await deleteAccount(accountId);
    if (success) {
      navigate('/accounts');
    }
    return success;
  };

  const handleAddOrganization = (org: typeof availableOrganizations[0]) => {
    try {
      const newOrg = {
        id: parseInt(org.id.split('-')[1]),
        name: org.name,
        category: org.category,
        status: "Active" as const,
        members: org.users
      };
      setOrganizations([...organizations, newOrg]);
      setIsAddOrgModalOpen(false);
      setSearchTerm("");
      
      toast({
        title: "Organization Added Successfully",
        description: `${org.name} has been added to the enterprise.`,
      });
    } catch (error) {
      toast({
        title: "Error Adding Organization",
        description: "Failed to add the organization. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter available organizations based on search term
  const filteredOrganizations = availableOrganizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isEnterprise = formData.type === "Enterprise";
  const isOrganization = formData.type === "Organization";

  // Show loading state
  if (loading || !currentAccount) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading account settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{isEnterprise ? 'Enterprise' : 'Organization'} Settings</h1>
            <p className="text-muted-foreground">Manage {isEnterprise ? 'enterprise' : 'organization'} details and configuration</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Edit Settings
            </Button>
          )}
        </div>
      </div>

      {/* Organization Details */}
      <Card>
        <CardHeader>
          <CardTitle>{isEnterprise ? 'Enterprise' : 'Organization'} Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">{isEnterprise ? 'Enterprise' : 'Organization'} Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleInputChange("type", value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Organization">Organization</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange("category", value)}
                disabled={!isEditing}
              >
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
          </div>
        </CardContent>
      </Card>

      {/* Parent Enterprise - Only for Organizations */}
      {isOrganization && mockAccountData.parentEnterprise && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Parent Enterprise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{mockAccountData.parentEnterprise.name}</h3>
                  <p className="text-sm text-muted-foreground">This organization is part of the above enterprise</p>
                </div>
                <Badge variant="secondary">{mockAccountData.parentEnterprise.type}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Organizations Management - Only for Enterprises */}
      {isEnterprise && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Organizations
              </div>
              <Dialog open={isAddOrgModalOpen} onOpenChange={setIsAddOrgModalOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Organization
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Add Organization to Enterprise
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search organizations by name, location, or category..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Search Results */}
                    <div className="space-y-3">
                      {filteredOrganizations.length > 0 ? (
                        filteredOrganizations.map((org) => (
                          <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                  <Building2 className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-semibold">{org.name}</h3>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    <span>{org.location}</span>
                                    <span>•</span>
                                    <span>{org.category}</span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground ml-11">
                                {org.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2 ml-11">
                                <Users className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{org.users} users</span>
                              </div>
                            </div>
                            <Button 
                              onClick={() => handleAddOrganization(org)}
                              className="ml-4"
                            >
                              Add to Enterprise
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No organizations found</h3>
                          <p className="text-muted-foreground">
                            {searchTerm ? "Try adjusting your search terms." : "No organizations available to add."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {organizations.map((org) => (
                <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{org.name}</h3>
                    <p className="text-sm text-muted-foreground">{org.category} • {org.members} members</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={org.status === "Active" ? "default" : "secondary"}>
                      {org.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="primaryEmail">Primary Email *</Label>
              <Input
                id="primaryEmail"
                type="email"
                value={formData.primaryEmail}
                onChange={(e) => handleInputChange("primaryEmail", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryPhone">Primary Phone *</Label>
              <Input
                id="primaryPhone"
                type="tel"
                value={formData.primaryPhone}
                onChange={(e) => handleInputChange("primaryPhone", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryContact">Primary Contact *</Label>
              <Input
                id="primaryContact"
                value={formData.primaryContact}
                onChange={(e) => handleInputChange("primaryContact", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryEmail">Secondary Email</Label>
              <Input
                id="secondaryEmail"
                type="email"
                value={formData.secondaryEmail}
                onChange={(e) => handleInputChange("secondaryEmail", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryPhone">Secondary Phone</Label>
              <Input
                id="secondaryPhone"
                type="tel"
                value={formData.secondaryPhone}
                onChange={(e) => handleInputChange("secondaryPhone", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryContact">Secondary Contact</Label>
              <Input
                id="secondaryContact"
                value={formData.secondaryContact}
                onChange={(e) => handleInputChange("secondaryContact", e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={formData.zip}
                  onChange={(e) => handleInputChange("zip", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5" />
            Account Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
              <div>
                <h3 className="font-semibold text-destructive">Disable Account</h3>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable this account. Users will not be able to access the platform.
                </p>
              </div>
              <Button 
                variant="outline" 
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={handleDisableAccount}
              >
                <UserX className="h-4 w-4 mr-2" />
                Disable Account
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-destructive rounded-lg bg-destructive/5">
              <div>
                <h3 className="font-semibold text-destructive">Delete Account</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this account and all associated data. This action cannot be undone.
                </p>
              </div>
              <Button 
                variant="destructive"
                onClick={() => setDeleteModalOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        account={currentAccount}
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}