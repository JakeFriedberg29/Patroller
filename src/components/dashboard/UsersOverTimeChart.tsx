import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import type { UsersOverTimePoint, UserRoleFilter } from "@/hooks/useGlobalDashboardData";
import { MultiSelectFilter } from "./ChartFilters";

const chartConfig = {
  users: { label: "Users", color: "hsl(var(--primary))" },
};

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
