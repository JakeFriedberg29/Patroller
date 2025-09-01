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
import { Settings as SettingsIcon, Save, Mail, Phone, MapPin, Building2 } from "lucide-react";

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
  members: 15
};

export default function Settings() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: mockAccountData.name,
    category: mockAccountData.category,
    primaryEmail: mockAccountData.primaryEmail,
    primaryPhone: mockAccountData.primaryPhone,
    secondaryEmail: mockAccountData.secondaryEmail,
    secondaryPhone: mockAccountData.secondaryPhone,
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
      category: mockAccountData.category,
      primaryEmail: mockAccountData.primaryEmail,
      primaryPhone: mockAccountData.primaryPhone,
      secondaryEmail: mockAccountData.secondaryEmail,
      secondaryPhone: mockAccountData.secondaryPhone,
      address: mockAccountData.address,
      city: mockAccountData.city,
      state: mockAccountData.state,
      zip: mockAccountData.zip
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Organization Settings</h1>
            <p className="text-muted-foreground">Manage organization details and configuration</p>
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

      {/* Organization Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{mockAccountData.members}</div>
              <div className="text-sm text-muted-foreground">Team Members</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">Active</div>
              <div className="text-sm text-muted-foreground">Status</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{mockAccountData.type}</div>
              <div className="text-sm text-muted-foreground">Type</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{mockAccountData.created}</div>
              <div className="text-sm text-muted-foreground">Created</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Details */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={!isEditing}
              />
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
    </div>
  );
}