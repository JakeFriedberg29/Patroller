import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Monitor, AlertTriangle, Users, MapPin, Package, FileText, Shield, RefreshCw, Calendar as CalendarIcon } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { useMissionControlData } from "@/hooks/useMissionControlData";

export default function MissionControl() {
  const { id } = useParams();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2024, 0, 1),
    to: new Date()
  });
  
  const { data, loading, refetch } = useMissionControlData(id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <Monitor className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Mission Control</h1>
            <p className="text-muted-foreground">Real-time operations dashboard</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" className="gap-2" onClick={refetch}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Users"
            value={data.totalUsers.toString()}
            description="Active account users"
            icon={Users}
            variant="info"
          />
          <MetricCard
            title="Total Locations"
            value={data.totalLocations.toString()}
            description="Monitored locations"
            icon={MapPin}
            variant="success"
          />
          <MetricCard
            title="Total Equipment"
            value={data.totalEquipment.toString()}
            description="Equipment units"
            icon={Package}
            variant="success"
          />
          <MetricCard
            title="Active Incidents"
            value={data.activeIncidents.toString()}
            description="Open incidents"
            icon={AlertTriangle}
            variant={data.activeIncidents > 0 ? "warning" : "success"}
          />
          <MetricCard
            title="Reports Filed (Pending)"
            value={data.reportsPending.toString()}
            description="Awaiting review"
            icon={FileText}
            variant="warning"
          />
          <MetricCard
            title="Reports Filed (Approved)"
            value={data.reportsApproved.toString()}
            description="Last 30 days"
            icon={FileText}
            variant="success"
          />
          <MetricCard
            title="Reports Filed (Rejected)"
            value={data.reportsRejected.toString()}
            description="Last 30 days"
            icon={FileText}
            variant="critical"
          />
          <MetricCard
            title="Total Logins"
            value={data.totalLogins.toString()}
            description="Last 30 days"
            icon={Shield}
            variant="info"
          />
        </div>
      )}

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