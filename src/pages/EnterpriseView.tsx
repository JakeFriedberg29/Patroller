import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  TrendingUp,
  Settings,
  Plus
} from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";

const mockEnterprise = {
  id: "ent-001",
  name: "MegaCorp Industries",
  type: "Enterprise",
  status: "Active",
  description: "Large multi-national corporation with diverse operations",
  totalOrganizations: 12,
  totalUsers: 2847,
  activeIncidents: 3,
  resolvedToday: 15,
  complianceScore: 94
};

const mockOrganizations = [
  {
    id: "org-001",
    name: "MegaCorp Manufacturing",
    location: "Detroit, MI",
    users: 456,
    status: "Active",
    lastActivity: "2 hours ago",
    type: "Manufacturing"
  },
  {
    id: "org-002", 
    name: "MegaCorp Logistics",
    location: "Atlanta, GA",
    users: 203,
    status: "Active",
    lastActivity: "30 minutes ago",
    type: "Logistics"
  },
  {
    id: "org-003",
    name: "MegaCorp R&D",
    location: "San Francisco, CA", 
    users: 189,
    status: "Active",
    lastActivity: "1 hour ago",
    type: "Research"
  },
  {
    id: "org-004",
    name: "MegaCorp Energy",
    location: "Houston, TX",
    users: 334,
    status: "Warning",
    lastActivity: "5 hours ago",
    type: "Energy"
  }
];

export default function EnterpriseView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Building2 className="h-8 w-8" />
            {mockEnterprise.name}
          </h1>
          <p className="text-muted-foreground">{mockEnterprise.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={mockEnterprise.status === 'Active' ? 'default' : 'secondary'}>
            {mockEnterprise.status}
          </Badge>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Manage Enterprise
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard
          title="Organizations"
          value={mockEnterprise.totalOrganizations.toString()}
          description="Active organizations"
          icon={Building2}
        />
        <MetricCard
          title="Total Users"
          value={mockEnterprise.totalUsers.toLocaleString()}
          description="Across all organizations"
          icon={Users}
        />
        <MetricCard
          title="Active Incidents"
          value={mockEnterprise.activeIncidents.toString()}
          description="Requiring attention"
          icon={AlertTriangle}
          variant="critical"
        />
        <MetricCard
          title="Resolved Today"
          value={mockEnterprise.resolvedToday.toString()}
          description="Incidents closed"
          icon={CheckCircle}
          variant="success"
        />
        <MetricCard
          title="Compliance Score"
          value={`${mockEnterprise.complianceScore}%`}
          description="Overall compliance"
          icon={TrendingUp}
        />
      </div>

      {/* Organizations Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organizations Overview
          </CardTitle>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Organization
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockOrganizations.map((org) => (
              <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
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
                  <Activity className={`h-4 w-4 ${
                    org.status === 'Active' ? 'text-green-500' : 'text-yellow-500'
                  }`} />
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
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
    </div>
  );
}