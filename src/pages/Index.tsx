import { MetricCard } from "@/components/ui/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertTriangle, Clock, Users, FileText, Shield, RefreshCw, Calendar as CalendarIcon, Building2, Network, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

const Index = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2024, 0, 1),
    to: new Date()
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Global View
          </h1>
          <p className="text-muted-foreground mt-1">Platform-wide operations overview • Wednesday, August 27, 2025 • 09:10</p>
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
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Accounts"
          value="12"
          description="All account types"
          icon={Building2}
          variant="info"
        />
        <MetricCard
          title="Total Organizations"
          value="8"
          description="Active organizations"
          icon={Network}
          variant="success"
        />
        <MetricCard
          title="Total Enterprises"
          value="4"
          description="Enterprise accounts"
          icon={Building2}
          variant="info"
        />
        <MetricCard
          title="Total Account Users"
          value="156"
          description="All account users"
          icon={Users}
          variant="success"
        />
        <MetricCard
          title="Total Organization Users"
          value="89"
          description="Organization members"
          icon={UserCheck}
          variant="success"
        />
        <MetricCard
          title="Total Enterprise Users"
          value="67"
          description="Enterprise members"
          icon={UserCheck}
          variant="success"
        />
        <MetricCard
          title="Reports Filed (Pending)"
          value="23"
          description="Awaiting review"
          icon={Clock}
          variant="warning"
        />
        <MetricCard
          title="Total Logins"
          value="1,247"
          description="Last 30 days"
          icon={Shield}
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
