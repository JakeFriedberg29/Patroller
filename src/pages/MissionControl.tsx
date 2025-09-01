import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, AlertTriangle, Users, Activity } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";

export default function MissionControl() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Monitor className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Mission Control</h1>
          <p className="text-muted-foreground">Real-time operations dashboard</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Incidents"
          value="3"
          description="Currently in progress"
          icon={AlertTriangle}
          variant="critical"
        />
        <MetricCard
          title="Available Personnel"
          value="24"
          description="Ready for deployment"
          icon={Users}
          variant="success"
        />
        <MetricCard
          title="Equipment Status"
          value="98%"
          description="Operational readiness"
          icon={Activity}
          variant="success"
        />
        <MetricCard
          title="Response Time Avg"
          value="4.2min"
          description="Last 7 days"
          icon={Monitor}
          variant="info"
        />
      </div>

      {/* Active Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Active Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No active operations at this time
          </div>
        </CardContent>
      </Card>
    </div>
  );
}