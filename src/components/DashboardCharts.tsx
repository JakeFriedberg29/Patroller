import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import type { AccountsOverTimePoint, ReportsByTypePoint, UsersOverTimePoint } from "@/hooks/useGlobalDashboardData";
import type { OrganizationSubtype, ReportTypeFilter, UserRoleFilter, AccountTypeFilter, EnterpriseSubtype } from "@/hooks/useGlobalDashboardData";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";

const chartConfig = {
  totalAccounts: { label: "Total Accounts", color: "hsl(var(--primary))" },
  organizations: { label: "Organizations", color: "hsl(var(--info))" },
  enterprises: { label: "Enterprises", color: "hsl(var(--accent-foreground))" },
  users: { label: "Users", color: "hsl(var(--primary))" },
  pending: { label: "Pending", color: "hsl(var(--warning))" },
  approved: { label: "Approved", color: "hsl(var(--success))" },
  rejected: { label: "Rejected", color: "hsl(var(--critical))" },
};

function MultiSelectFilter<T extends string>(props: {
  label: string;
  options: T[];
  selected: Set<T>;
  onToggle: (value: T) => void;
  renderOption?: (v: T) => string;
  includeAll?: boolean;
  onToggleAll?: () => void;
}) {
  const { label, options, selected, onToggle, renderOption, includeAll, onToggleAll } = props;
  const allSelected = selected.size === 0;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {label}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <div className="space-y-2">
          {includeAll && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={allSelected} onCheckedChange={onToggleAll} />
              <span>All</span>
            </label>
          )}
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={selected.has(opt)} onCheckedChange={() => onToggle(opt)} />
              <span>{renderOption ? renderOption(opt) : (opt as string)}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SingleSelectFilter<T extends string>(props: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const { label, value, options, onChange } = props;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {label}: {options.find(o => o.value === value)?.label}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <div className="space-y-2">
          {options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={opt.value === value} onCheckedChange={() => onChange(opt.value)} />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function CombinedSubtypesFilter(props: {
  orgOptions: OrganizationSubtype[];
  selectedOrg: Set<OrganizationSubtype>;
  onToggleOrg: (v: OrganizationSubtype) => void;
  enterpriseOptions: EnterpriseSubtype[];
  selectedEnterprise: Set<EnterpriseSubtype>;
  onToggleEnterprise: (v: EnterpriseSubtype) => void;
}) {
  const { orgOptions, selectedOrg, onToggleOrg, enterpriseOptions, selectedEnterprise, onToggleEnterprise } = props;
  const orgAll = selectedOrg.size === 0;
  const entAll = selectedEnterprise.size === 0;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          Subtypes
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-3">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">Organization Subtypes</div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={orgAll} onCheckedChange={() => {
                  if (orgAll) {
                    orgOptions.forEach(onToggleOrg);
                  } else {
                    Array.from(selectedOrg).forEach(onToggleOrg);
                  }
                }} />
                <span>All</span>
              </label>
              {orgOptions.map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={selectedOrg.has(opt)} onCheckedChange={() => onToggleOrg(opt)} />
                  <span>{(opt as string).replace(/_/g, " ")}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">Enterprise Subtypes</div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={entAll} onCheckedChange={() => {
                  if (entAll) {
                    enterpriseOptions.forEach(onToggleEnterprise);
                  } else {
                    Array.from(selectedEnterprise).forEach(onToggleEnterprise);
                  }
                }} />
                <span>All</span>
              </label>
              {enterpriseOptions.map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={selectedEnterprise.has(opt)} onCheckedChange={() => onToggleEnterprise(opt)} />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function AccountsOverTimeChart(props: {
  data: AccountsOverTimePoint[];
  accountType: AccountTypeFilter;
  onAccountTypeChange: (v: AccountTypeFilter) => void;
  orgSubtypes: OrganizationSubtype[];
  selectedOrgSubtypes: Set<OrganizationSubtype>;
  onToggleOrgSubtype: (v: OrganizationSubtype) => void;
  enterpriseSubtypes: EnterpriseSubtype[];
  selectedEnterpriseSubtypes: Set<EnterpriseSubtype>;
  onToggleEnterpriseSubtype: (v: EnterpriseSubtype) => void;
}) {
  const { data, accountType, onAccountTypeChange, orgSubtypes, selectedOrgSubtypes, onToggleOrgSubtype, enterpriseSubtypes, selectedEnterpriseSubtypes, onToggleEnterpriseSubtype } = props;

  const xLegend = `Months • ${accountType === "all" ? "All accounts" : accountType} ${selectedOrgSubtypes.size ? `• ${selectedOrgSubtypes.size} organization subtype(s)` : "• All organization subtypes"} ${selectedEnterpriseSubtypes.size ? `• ${selectedEnterpriseSubtypes.size} enterprise subtype(s)` : "• All enterprise subtypes"}`;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between space-y-0">
        <CardTitle>Accounts Growth Over Time</CardTitle>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <SingleSelectFilter
            label="Account Type"
            value={accountType}
            options={[{ value: "all", label: "All" }, { value: "organizations", label: "Organizations" }, { value: "enterprises", label: "Enterprises" }]}
            onChange={onAccountTypeChange}
          />
          <CombinedSubtypesFilter
            orgOptions={orgSubtypes}
            selectedOrg={selectedOrgSubtypes}
            onToggleOrg={onToggleOrgSubtype}
            enterpriseOptions={enterpriseSubtypes}
            selectedEnterprise={selectedEnterpriseSubtypes}
            onToggleEnterprise={onToggleEnterpriseSubtype}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" label={{ value: xLegend, position: "insideBottom", offset: -2 }} />
            <YAxis allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line type="monotone" dataKey="totalAccounts" stroke="var(--color-totalAccounts)" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="organizations" stroke="var(--color-organizations)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="enterprises" stroke="var(--color-enterprises)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function UsersOverTimeChart(props: {
  data: UsersOverTimePoint[];
  roleOptions: UserRoleFilter[];
  selectedRoles: Set<UserRoleFilter>;
  onToggleRole: (v: UserRoleFilter) => void;
}) {
  const { data, roleOptions, selectedRoles, onToggleRole } = props;

  const xLegend = `Months${selectedRoles.size ? ` • ${selectedRoles.size} user type(s)` : " • All user types"}`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Users Over Time</CardTitle>
        <MultiSelectFilter
          label="User types"
          options={roleOptions}
          selected={selectedRoles}
          onToggle={onToggleRole}
          renderOption={(t) => (t as string).replace(/_/g, " ")}
          includeAll
          onToggleAll={() => {
            if (selectedRoles.size === 0) {
              roleOptions.forEach(onToggleRole);
            } else {
              Array.from(selectedRoles).forEach(onToggleRole);
            }
          }}
        />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" label={{ value: xLegend, position: "insideBottom", offset: -2 }} />
            <YAxis allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={3} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function ReportsByTypeChart(props: {
  data: ReportsByTypePoint[];
  typeOptions: ReportTypeFilter[];
  selectedTypes: Set<ReportTypeFilter>;
  onToggleType: (v: ReportTypeFilter) => void;
  orgSubtypes: OrganizationSubtype[];
  selectedOrgSubtypes: Set<OrganizationSubtype>;
  onToggleOrgSubtype: (v: OrganizationSubtype) => void;
}) {
  const { data, typeOptions, selectedTypes, onToggleType, orgSubtypes, selectedOrgSubtypes, onToggleOrgSubtype } = props;

  const xLegend = `Report Type${selectedTypes.size ? ` • ${selectedTypes.size} selected` : " • All"}${selectedOrgSubtypes.size ? ` • ${selectedOrgSubtypes.size} organization subtype(s)` : ""}`;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
        <CardTitle>Reports by Type and Status</CardTitle>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <MultiSelectFilter label="Report types" options={typeOptions} selected={selectedTypes} onToggle={onToggleType} renderOption={(t) => (t as string).replace(/_/g, " ")} includeAll onToggleAll={() => {
            if (selectedTypes.size === 0) typeOptions.forEach(onToggleType); else Array.from(selectedTypes).forEach(onToggleType);
          }} />
          <MultiSelectFilter label="Organization Subtypes" options={orgSubtypes} selected={selectedOrgSubtypes} onToggle={onToggleOrgSubtype} renderOption={(t) => (t as string).replace(/_/g, " ")} includeAll onToggleAll={() => {
            if (selectedOrgSubtypes.size === 0) orgSubtypes.forEach(onToggleOrgSubtype); else Array.from(selectedOrgSubtypes).forEach(onToggleOrgSubtype);
          }} />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" label={{ value: xLegend, position: "insideBottom", offset: -2 }} />
            <YAxis allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="pending" stackId="a" fill="var(--color-pending)" />
            <Bar dataKey="approved" stackId="a" fill="var(--color-approved)" />
            <Bar dataKey="rejected" stackId="a" fill="var(--color-rejected)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}