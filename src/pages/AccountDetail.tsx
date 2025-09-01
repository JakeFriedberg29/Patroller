import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Mail, Phone, Users, Calendar, MapPin } from "lucide-react";

// Mock data - this would come from an API based on the account ID
const getAccountById = (id: string) => {
  const accounts = [
    {
      id: 1,
      name: "Mountain Rescue Team Alpha",
      type: "Search & Rescue",
      members: 0,
      email: "dispatch@mrt-alpha.org",
      phone: "(555) 123-4567",
      created: "8/26/2025",
      address: "123 Mountain View Dr, Alpine, CO 80424",
      status: "Active",
      description: "Specialized mountain rescue operations covering the Alpine region."
    },
    {
      id: 2,
      name: "Coastal Lifeguard Services",
      type: "Lifeguard Service",
      members: 0,
      email: "ops@coastallifeguard.org",
      phone: "(555) 987-6543",
      created: "8/26/2025",
      address: "456 Beach Front Ave, Coastal City, CA 90210",
      status: "Active",
      description: "Professional lifeguard services for coastal areas and beaches."
    },
    {
      id: 3,
      name: "Wilderness Adventures Inc",
      type: "Adventure Tourism",
      members: 0,
      email: "safety@wildadventures.com",
      phone: "(555) 456-7890",
      created: "8/26/2025",
      address: "789 Trail Head Rd, Adventure Park, UT 84532",
      status: "Active",
      description: "Adventure tourism company specializing in wilderness expeditions."
    },
    {
      id: 4,
      name: "Coastal Lifeguard Division",
      type: "Lifeguard Service",
      members: 1,
      email: "operations@coastallifeguard.gov",
      phone: "(555) 987-6543",
      created: "8/26/2025",
      address: "321 Government Pier, Harbor City, CA 90211",
      status: "Active",
      description: "Government lifeguard division responsible for public beach safety."
    },
    {
      id: 5,
      name: "Mountain Ridge SAR",
      type: "Search & Rescue",
      members: 0,
      email: "dispatch@mountainridgesar.org",
      phone: "(555) 123-4567",
      created: "8/26/2025",
      address: "654 Ridge Line Blvd, Mountain View, CO 80425",
      status: "Active",
      description: "Search and rescue operations for the Mountain Ridge area."
    }
  ];

  return accounts.find(account => account.id === parseInt(id));
};

const typeColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "Search & Rescue": "destructive",
  "Lifeguard Service": "default",
  "Adventure Tourism": "secondary"
};

export default function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const account = id ? getAccountById(id) : null;

  if (!account) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/accounts")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Accounts
          </Button>
        </div>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-foreground">Account Not Found</h1>
          <p className="text-muted-foreground mt-2">The requested account could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/accounts")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Accounts
        </Button>
      </div>

      {/* Account Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">{account.name}</h1>
            <Badge variant={typeColors[account.type] || "default"}>{account.type}</Badge>
            <Badge variant="outline" className="text-green-600 border-green-600">
              {account.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">{account.description}</p>
        </div>
      </div>

      {/* Account Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{account.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{account.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Address</p>
                <p className="text-sm text-muted-foreground">{account.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Members</p>
                <p className="text-sm text-muted-foreground">{account.members} active members</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Created</p>
                <p className="text-sm text-muted-foreground">{account.created}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline">Edit Account</Button>
            <Button variant="outline">Manage Members</Button>
            <Button variant="outline">View Activity</Button>
            <Button variant="destructive">Deactivate Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}