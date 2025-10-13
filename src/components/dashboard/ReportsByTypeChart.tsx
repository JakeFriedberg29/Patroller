import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import type { ReportsByTypePoint, ReportTypeFilter, OrganizationSubtype } from "@/hooks/useGlobalDashboardData";
import { MultiSelectFilter } from "./ChartFilters";

const chartConfig = {
  pending: { label: "Pending", color: "hsl(var(--warning))" },
  approved: { label: "Approved", color: "hsl(var(--success))" },
  rejected: { label: "Rejected", color: "hsl(var(--critical))" },
};

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
          <MultiSelectFilter label="Subtypes" options={orgSubtypes} selected={selectedOrgSubtypes} onToggle={onToggleOrgSubtype} renderOption={(t) => (t as string).replace(/_/g, " ")} includeAll onToggleAll={() => {
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
