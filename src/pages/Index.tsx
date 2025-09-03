import { MetricCard } from "@/components/ui/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AccountsOverTimeChart, AccountsByTypeChart, UsersOverTimeChart, ReportsByTypeChart } from "@/components/DashboardCharts";
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
  const [timePeriod, setTimePeriod] = useState<string>("month");

  // Mock percentage changes based on selected time period
  const getChangePercent = (baseValue: number) => {
    const changes = {
      day: Math.random() * 4 - 2,
      // -2% to +2%
      week: Math.random() * 8 - 4,
      // -4% to +4%
      month: Math.random() * 15 - 7.5,
      // -7.5% to +7.5%
      quarter: Math.random() * 25 - 12.5,
      // -12.5% to +12.5%
      year: Math.random() * 50 - 25 // -25% to +25%
    };
    return changes[timePeriod as keyof typeof changes] || 0;
  };
  return <div className="space-y-6">
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
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {dateRange?.from ? dateRange.to ? <>
                      {format(dateRange.from, "LLL dd")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </> : format(dateRange.from, "LLL dd, y") : <span>Pick a date range</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} className={cn("p-3 pointer-events-auto")} />
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
        <MetricCard title="Total Accounts" value="12" description="All account types" icon={Building2} variant="neutral" changePercent={getChangePercent(12)} changePeriod={timePeriod} />
        <MetricCard title="Total Organizations" value="8" description="Active organizations" icon={Network} variant="neutral" changePercent={getChangePercent(8)} changePeriod={timePeriod} />
        <MetricCard title="Total Enterprises" value="4" description="Enterprise accounts" icon={Building2} variant="neutral" changePercent={getChangePercent(4)} changePeriod={timePeriod} />
        <MetricCard title="Total Account Users" value="156" description="All account users" icon={Users} variant="neutral" changePercent={getChangePercent(156)} changePeriod={timePeriod} />
        <MetricCard title="Total Organization Users" value="89" description="Organization members" icon={UserCheck} variant="neutral" changePercent={getChangePercent(89)} changePeriod={timePeriod} />
        <MetricCard title="Total Enterprise Users" value="67" description="Enterprise members" icon={UserCheck} variant="neutral" changePercent={getChangePercent(67)} changePeriod={timePeriod} />
        <MetricCard title="Reports Filed (Pending)" value="23" description="Awaiting review" icon={Clock} variant="warning" changePercent={getChangePercent(23)} changePeriod={timePeriod} />
        <MetricCard title="Total Logins" value="1,247" description="Last 30 days" icon={Shield} variant="neutral" changePercent={getChangePercent(1247)} changePeriod={timePeriod} />
      </div>

      {/* Active Operations */}
      <Card className="w-full">
      
        
      </Card>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AccountsOverTimeChart />
        <AccountsByTypeChart />
        <UsersOverTimeChart />
        <ReportsByTypeChart />
      </div>
    </div>;
};
export default Index;