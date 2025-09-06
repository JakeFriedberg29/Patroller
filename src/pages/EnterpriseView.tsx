import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, AlertTriangle, CheckCircle, Activity, TrendingUp, Plus } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "react-router-dom";
import { useEnterpriseData } from "@/hooks/useEnterpriseData";
import { usePermissions } from "@/hooks/usePermissions";
export default function EnterpriseView() {
  const { id } = useParams();
  const { toast } = useToast();
  const { isPlatformAdmin } = usePermissions();
  
  const { enterpriseData, organizations, loading } = useEnterpriseData(id);

  const formatOrganizationType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getLocationString = (location: any) => {
    if (!location) return 'No location set';
    if (typeof location === 'string') return location;
    if (typeof location === 'object') {
      return [location.city, location.state, location.country].filter(Boolean).join(', ') || 'Location set';
    }
    return 'Location set';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!enterpriseData) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Enterprise not found</h3>
        <p className="text-muted-foreground">The requested enterprise could not be loaded.</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Building2 className="h-8 w-8" />
            {enterpriseData.name}
          </h1>
          <p className="text-muted-foreground">{enterpriseData.description}</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard 
          title="Organizations" 
          value={enterpriseData.totalOrganizations.toString()} 
          description="Active organizations" 
          icon={Building2} 
        />
        <MetricCard 
          title="Total Users" 
          value={enterpriseData.totalUsers.toLocaleString()} 
          description="Across all organizations" 
          icon={Users} 
        />
        <MetricCard 
          title="Active Incidents" 
          value={enterpriseData.activeIncidents.toString()} 
          description="Requiring attention" 
          icon={AlertTriangle} 
          variant={enterpriseData.activeIncidents > 0 ? "critical" : "success"}
        />
        <MetricCard 
          title="Resolved Today" 
          value={enterpriseData.resolvedToday.toString()} 
          description="Incidents closed" 
          icon={CheckCircle} 
          variant="success" 
        />
        <MetricCard 
          title="Compliance Score" 
          value={`${enterpriseData.complianceScore}%`} 
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
          {isPlatformAdmin && (
            <Button variant="outline" size="sm" onClick={() => {
              toast({
                title: "Feature Coming Soon",
                description: "Organization management will be available soon.",
              });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Organization
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {organizations.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No organizations found</h3>
                <p className="text-muted-foreground">
                  This enterprise doesn't have any organizations yet.
                </p>
              </div>
            ) : (
              organizations.map((org) => (
                <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{org.name}</h3>
                      <Badge variant={org.status === 'Active' ? 'default' : 'destructive'}>
                        {org.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getLocationString(org.location)} • {formatOrganizationType(org.organization_type)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {org.users} users • Last activity: {org.lastActivity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className={`h-4 w-4 ${org.status === 'Active' ? 'text-green-500' : 'text-yellow-500'}`} />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = `/organization/${org.id}/mission-control`}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}