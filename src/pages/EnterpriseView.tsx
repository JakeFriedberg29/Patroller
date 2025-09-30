import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, AlertTriangle, CheckCircle, Activity, TrendingUp, Plus, BarChart3 } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "react-router-dom";
import { useEnterpriseData } from "@/hooks/useEnterpriseData";
import { usePermissions } from "@/hooks/usePermissions";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function EnterpriseView() {
  const { id } = useParams();
  const { toast } = useToast();
  const { isPlatformAdmin } = usePermissions();
  
  const { enterpriseData, organizations, reportsByOrganization, loading } = useEnterpriseData(id);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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

  const chartConfig = {
    reports: { label: "Reports", color: "hsl(var(--primary))" },
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Organizations" 
          value={enterpriseData.totalOrganizations.toString()} 
          description="Under this enterprise" 
          icon={Building2} 
        />
        <MetricCard 
          title="Enterprise Users/Admins" 
          value={enterpriseData.totalEnterpriseAdminsAndUsers.toLocaleString()} 
          description="Across the enterprise" 
          icon={Users} 
        />
        <MetricCard 
          title="Organization Patrollers" 
          value={enterpriseData.totalOrganizationPatrollers.toLocaleString()} 
          description="Across all orgs" 
          icon={Users} 
        />
        <MetricCard 
          title="Reports Submitted Today" 
          value={enterpriseData.reportsSubmittedToday.toString()} 
          description="Since midnight" 
          icon={BarChart3} 
        />
      </div>

      {/* Reports by Organization */}
      <Card>
        <CardHeader>
          <CardTitle>Reports by Organization (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[320px]">
            <BarChart data={reportsByOrganization}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="orgName" interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="count" fill="var(--color-reports)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}