import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Building2, Users, AlertTriangle, CheckCircle, Activity, TrendingUp, Settings, Plus, Search, MapPin, Monitor } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
const mockEnterprise = {
  id: "ent-001",
  name: "MegaCorp Industries",
  type: "Enterprise",
  status: "Active",
  description: "Real-time operations dashboard",
  totalOrganizations: 12,
  totalUsers: 2847,
  activeIncidents: 3,
  resolvedToday: 15,
  complianceScore: 94
};
const mockOrganizations = [{
  id: "org-001",
  name: "MegaCorp Manufacturing",
  location: "Detroit, MI",
  users: 456,
  status: "Active",
  lastActivity: "2 hours ago",
  type: "Manufacturing"
}, {
  id: "org-002",
  name: "MegaCorp Logistics",
  location: "Atlanta, GA",
  users: 203,
  status: "Active",
  lastActivity: "30 minutes ago",
  type: "Logistics"
}, {
  id: "org-003",
  name: "MegaCorp R&D",
  location: "San Francisco, CA",
  users: 189,
  status: "Active",
  lastActivity: "1 hour ago",
  type: "Research"
}, {
  id: "org-004",
  name: "MegaCorp Energy",
  location: "Houston, TX",
  users: 334,
  status: "Warning",
  lastActivity: "5 hours ago",
  type: "Energy"
}];

// Available organizations that can be added to the enterprise
const availableOrganizations = [{
  id: "org-005",
  name: "City Emergency Response",
  location: "New York, NY",
  users: 89,
  type: "Search & Rescue",
  description: "Urban emergency response and rescue operations"
}, {
  id: "org-006",
  name: "Coastal Lifeguard Services",
  location: "Miami, FL",
  users: 156,
  type: "Lifeguard Service",
  description: "Beach and coastal water safety operations"
}, {
  id: "org-007",
  name: "Mountain Rescue Team",
  location: "Denver, CO",
  users: 67,
  type: "Search & Rescue",
  description: "High altitude and wilderness rescue operations"
}, {
  id: "org-008",
  name: "Park Emergency Services",
  location: "Sacramento, CA",
  users: 134,
  type: "Park Service",
  description: "National and state park emergency services"
}, {
  id: "org-009",
  name: "Event Medical Response",
  location: "Las Vegas, NV",
  users: 78,
  type: "Event Medical",
  description: "Large event and concert medical support"
}];
export default function EnterpriseView() {
  const { toast } = useToast();
  const [isAddOrgModalOpen, setIsAddOrgModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [organizations, setOrganizations] = useState(mockOrganizations);

  // Filter available organizations based on search term
  const filteredOrganizations = availableOrganizations.filter(org => org.name.toLowerCase().includes(searchTerm.toLowerCase()) || org.location.toLowerCase().includes(searchTerm.toLowerCase()) || org.type.toLowerCase().includes(searchTerm.toLowerCase()));
  const handleAddOrganization = (org: typeof availableOrganizations[0]) => {
    try {
      const newOrg = {
        ...org,
        status: "Active" as const,
        lastActivity: "Just added"
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
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Monitor className="h-8 w-8" />
            Enterprise View
          </h1>
          <p className="text-muted-foreground">{mockEnterprise.description}</p>
        </div>
        
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard title="Organizations" value={mockEnterprise.totalOrganizations.toString()} description="Active organizations" icon={Building2} />
        <MetricCard title="Total Users" value={mockEnterprise.totalUsers.toLocaleString()} description="Across all organizations" icon={Users} />
        <MetricCard title="Active Incidents" value={mockEnterprise.activeIncidents.toString()} description="Requiring attention" icon={AlertTriangle} variant="critical" />
        <MetricCard title="Resolved Today" value={mockEnterprise.resolvedToday.toString()} description="Incidents closed" icon={CheckCircle} variant="success" />
        <MetricCard title="Compliance Score" value={`${mockEnterprise.complianceScore}%`} description="Overall compliance" icon={TrendingUp} />
      </div>

      {/* Organizations Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organizations Overview
          </CardTitle>
          <Dialog open={isAddOrgModalOpen} onOpenChange={setIsAddOrgModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
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
                  <Input placeholder="Search organizations by name, location, or type..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>

                {/* Search Results */}
                <div className="space-y-3">
                  {filteredOrganizations.length > 0 ? filteredOrganizations.map(org => <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
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
                                <span>{org.type}</span>
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
                        <Button onClick={() => handleAddOrganization(org)} className="ml-4">
                          Add to Enterprise
                        </Button>
                      </div>) : <div className="text-center py-12">
                      <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No organizations found</h3>
                      <p className="text-muted-foreground">
                        {searchTerm ? "Try adjusting your search terms." : "No organizations available to add."}
                      </p>
                    </div>}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {organizations.map(org => <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{org.name}</h3>
                    <Badge variant={org.status === 'Active' ? 'default' : 'destructive'}>
                      {org.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{org.location} • {org.type}</p>
                  <p className="text-sm text-muted-foreground">
                    {org.users} users • Last activity: {org.lastActivity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className={`h-4 w-4 ${org.status === 'Active' ? 'text-green-500' : 'text-yellow-500'}`} />
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>)}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center space-y-2">
              <Users className="h-8 w-8 mx-auto text-primary" />
              <h3 className="font-semibold">Manage Organizations</h3>
              <p className="text-sm text-muted-foreground">View and manage all organizations</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center space-y-2">
              <AlertTriangle className="h-8 w-8 mx-auto text-primary" />
              <h3 className="font-semibold">View Incidents</h3>
              <p className="text-sm text-muted-foreground">Monitor active incidents across all orgs</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center space-y-2">
              <TrendingUp className="h-8 w-8 mx-auto text-primary" />
              <h3 className="font-semibold">Analytics Dashboard</h3>
              <p className="text-sm text-muted-foreground">View enterprise-wide analytics</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}