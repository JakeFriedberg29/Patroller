import { MetricCard } from "@/components/ui/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Users, FileText, Shield, RefreshCw } from "lucide-react";

const Index = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Mission Control
          </h1>
          <p className="text-muted-foreground mt-1">Platform-wide operations overview • Wednesday, August 27, 2025 • 09:10</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Incidents"
          value="0"
          description="Across all organizations"
          icon={AlertTriangle}
          variant="critical"
        />
        <MetricCard
          title="Pending Reports"
          value="0"
          description="Platform-wide pending"
          icon={Clock}
          variant="warning"
        />
        <MetricCard
          title="Total Team Members"
          value="1"
          description="All organizations"
          icon={Users}
          variant="success"
        />
        <MetricCard
          title="Today's Incidents"
          value="0"
          description="Platform-wide today"
          icon={FileText}
          variant="info"
        />
      </div>

      {/* Active Operations */}
      <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-critical" />
          <CardTitle>Active Operations (All Organizations)</CardTitle>
        </div>
      </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10 mb-4">
              <Shield className="h-10 w-10 text-success" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">All Clear</h3>
            <p className="text-muted-foreground max-w-sm">No active incidents across all organizations</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
