import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  const handleViewAccount = (accountId: number) => {
    navigate(`/accounts/${accountId}`);
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
        <Button className="gap-2">
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

      {/* Organizations Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Accounts (5)</h2>
          <div className="text-sm text-muted-foreground">
            Show: <strong>10</strong>
          </div>
        </div>

        <div className="space-y-3">
          {accounts.map((account) => (
            <Card key={account.id} className="transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-foreground">{account.name}</h3>
                        <Badge variant={typeColors[account.type] || "default"}>{account.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Created {account.created}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{account.members}</span>
                    </div>
                    
                    <div className="hidden md:flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{account.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{account.phone}</span>
                      </div>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewAccount(account.id)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Accounts;