import { MetricCard } from "@/components/ui/metric-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AccountsOverTimeChart, UsersOverTimeChart, ReportsByTypeChart } from "@/components/DashboardCharts";
import { CleanupDataButton } from "@/components/CleanupDataButton";
import { Users, FileText, Shield, RefreshCw, Calendar as CalendarIcon, Building2 } from "lucide-react";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useGlobalDashboardData } from "@/hooks/useGlobalDashboardData";
import type { OrganizationSubtype, ReportTypeFilter, UserRoleFilter, AccountTypeFilter, EnterpriseSubtype } from "@/hooks/useGlobalDashboardData";
import { Constants } from "@/integrations/supabase/types";

const ENTERPRISE_SUBTYPE_OPTIONS: EnterpriseSubtype[] = [
  "Resort Chain",
  "Municipality",
  "Park Agency",
  "Event Management",
];

const Index = () => {
  // Redirect users to their tenant/organization dashboards based on role and profile
  useAuthRedirect();

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date()
  });

  // Filters
  const [accountType, setAccountType] = useState<AccountTypeFilter>("all");
  // Multi-select filters (empty set = all)
  const [selectedAccountOrgSubtypes, setSelectedAccountOrgSubtypes] = useState<Set<OrganizationSubtype>>(new Set());
  const [selectedEnterpriseSubtypes, setSelectedEnterpriseSubtypes] = useState<Set<EnterpriseSubtype>>(new Set());
  const [selectedUserRoles, setSelectedUserRoles] = useState<Set<UserRoleFilter>>(new Set());
  const [selectedReportTypes, setSelectedReportTypes] = useState<Set<ReportTypeFilter>>(new Set(["incident"]));
  const [selectedReportsOrgSubtypes, setSelectedReportsOrgSubtypes] = useState<Set<OrganizationSubtype>>(new Set());

  const toggleSetValue = <T extends string>(setter: React.Dispatch<React.SetStateAction<Set<T>>>) => (value: T) => {
    setter(prev => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value); else next.add(value);
      return next;
    });
  };

  const orgSubtypeOptions = [...Constants.public.Enums.organization_type] as OrganizationSubtype[];
  const userRoleOptions: UserRoleFilter[] = ["patroller", "enterprise_user", "organization_user"];
  const reportTypeOptions: ReportTypeFilter[] = ["incident"]; // Extend when report instances exist

  const { kpis, accountsOverTime, usersOverTime, reportsByType, loading } = useGlobalDashboardData(dateRange, {
    accountType,
    accountsOrgSubtypes: Array.from(selectedAccountOrgSubtypes),
    accountsEnterpriseSubtypes: Array.from(selectedEnterpriseSubtypes),
    usersRoleFilters: Array.from(selectedUserRoles),
    reportsTypeFilters: Array.from(selectedReportTypes),
    reportsOrgSubtypes: Array.from(selectedReportsOrgSubtypes),
  });

  const headerDate = useMemo(() => new Date(), []);

  return <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Global Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Platform-wide operations overview • {format(headerDate, "EEEE, LLL dd, yyyy • HH:mm")}</p>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {dateRange?.from ? dateRange.to ? <>
                      {format(dateRange.from, "LLL dd")} - {" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </> : format(dateRange.from, "LLL dd, y") : <span>Pick a date range</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setDateRange({ ...dateRange })}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <CleanupDataButton />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </>
        ) : (
          <>
            <MetricCard title="Total Accounts" value={kpis.totalAccounts.toLocaleString()} description="Enterprises + Organizations" icon={Building2} variant="neutral" />
            <MetricCard title="Total Users" value={kpis.totalUsers.toLocaleString()} description="Includes patrollers" icon={Users} variant="neutral" />
            <MetricCard title="Total Reports Submitted" value={kpis.totalReports.toLocaleString()} description="All report types" icon={FileText} variant="neutral" />
          </>
        )}
      </div>

      {/* Core Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AccountsOverTimeChart
          data={accountsOverTime}
          accountType={accountType}
          onAccountTypeChange={setAccountType}
          orgSubtypes={orgSubtypeOptions}
          selectedOrgSubtypes={selectedAccountOrgSubtypes}
          onToggleOrgSubtype={toggleSetValue(setSelectedAccountOrgSubtypes)}
          enterpriseSubtypes={ENTERPRISE_SUBTYPE_OPTIONS}
          selectedEnterpriseSubtypes={selectedEnterpriseSubtypes}
          onToggleEnterpriseSubtype={toggleSetValue(setSelectedEnterpriseSubtypes)}
        />

        <UsersOverTimeChart
          data={usersOverTime}
          roleOptions={userRoleOptions}
          selectedRoles={selectedUserRoles}
          onToggleRole={toggleSetValue(setSelectedUserRoles)}
        />

        <ReportsByTypeChart
          data={reportsByType}
          typeOptions={reportTypeOptions}
          selectedTypes={selectedReportTypes}
          onToggleType={toggleSetValue(setSelectedReportTypes)}
          orgSubtypes={orgSubtypeOptions}
          selectedOrgSubtypes={selectedReportsOrgSubtypes}
          onToggleOrgSubtype={toggleSetValue(setSelectedReportsOrgSubtypes)}
        />
      </div>
    </div>;
};
export default Index;