import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import type { AccountsOverTimePoint, OrganizationSubtype, AccountTypeFilter, EnterpriseSubtype } from "@/hooks/useGlobalDashboardData";
import { SingleSelectFilter, CombinedSubtypesFilter } from "./ChartFilters";

const chartConfig = {
  totalAccounts: { label: "Total Accounts", color: "hsl(var(--primary))" },
  organizations: { label: "Organizations", color: "hsl(var(--info))" },
  enterprises: { label: "Enterprises", color: "hsl(var(--accent-foreground))" },
};

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
