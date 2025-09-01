import { useParams } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings as SettingsIcon, Save, Mail, Phone, MapPin, Building2, UserX, Trash2, Plus, Users } from "lucide-react";

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

export default function Settings() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: mockAccountData.name,
    type: mockAccountData.type,
    category: mockAccountData.category,
    primaryEmail: mockAccountData.primaryEmail,
    primaryPhone: mockAccountData.primaryPhone,
    primaryContact: "John Doe",
    secondaryEmail: mockAccountData.secondaryEmail,
    secondaryPhone: mockAccountData.secondaryPhone,
    secondaryContact: "Jane Smith",
    address: mockAccountData.address,
    city: mockAccountData.city,
    state: mockAccountData.state,
    zip: mockAccountData.zip
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Here you would typically save to an API
    console.log("Saving settings:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: mockAccountData.name,
      type: mockAccountData.type,
      category: mockAccountData.category,
      primaryEmail: mockAccountData.primaryEmail,
      primaryPhone: mockAccountData.primaryPhone,
      primaryContact: "John Doe",
      secondaryEmail: mockAccountData.secondaryEmail,
      secondaryPhone: mockAccountData.secondaryPhone,
      secondaryContact: "Jane Smith",
      address: mockAccountData.address,
      city: mockAccountData.city,
      state: mockAccountData.state,
      zip: mockAccountData.zip
    });
    setIsEditing(false);
  };

  const handleDisableAccount = () => {
    console.log("Disabling account");
    // Here you would typically call an API to disable the account
  };

  const handleDeleteAccount = () => {
    console.log("Deleting account");
    // Here you would typically show a confirmation dialog and then call an API
  };

  const handleAddOrganization = () => {
    console.log("Adding new organization");
    // Here you would typically open a dialog to create a new organization
  };

  const isEnterprise = formData.type === "Enterprise";
  const isOrganization = formData.type === "Organization";

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
              <Button onClick={handleAddOrganization} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Organization
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockOrganizations.map((org) => (
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
                onClick={handleDeleteAccount}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}