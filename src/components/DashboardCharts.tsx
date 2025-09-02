import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const accountsOverTimeData = [
  { month: "Jan", totalAccounts: 8, organizations: 5, enterprises: 3 },
  { month: "Feb", totalAccounts: 9, organizations: 6, enterprises: 3 },
  { month: "Mar", totalAccounts: 10, organizations: 6, enterprises: 4 },
  { month: "Apr", totalAccounts: 11, organizations: 7, enterprises: 4 },
  { month: "May", totalAccounts: 12, organizations: 8, enterprises: 4 },
];

const accountsByTypeData = [
  { name: "Organizations", value: 8, color: "hsl(var(--info))" },
  { name: "Enterprises", value: 4, color: "hsl(var(--primary))" },
];

const usersOverTimeData = [
  { month: "Jan", enterpriseUsers: 45, organizationUsers: 67 },
  { month: "Feb", enterpriseUsers: 52, organizationUsers: 73 },
  { month: "Mar", enterpriseUsers: 58, organizationUsers: 79 },
  { month: "Apr", enterpriseUsers: 63, organizationUsers: 84 },
  { month: "May", enterpriseUsers: 67, organizationUsers: 89 },
];

const reportsByTypeData = [
  { type: "Incident", pending: 12, approved: 45, rejected: 3 },
  { type: "Maintenance", pending: 8, approved: 32, rejected: 2 },
  { type: "Emergency", pending: 3, approved: 18, rejected: 1 },
];

const chartConfig = {
  totalAccounts: {
    label: "Total Accounts",
    color: "hsl(var(--primary))",
  },
  organizations: {
    label: "Organizations",
    color: "hsl(var(--info))",
  },
  enterprises: {
    label: "Enterprises",
    color: "hsl(var(--accent-foreground))",
  },
  enterpriseUsers: {
    label: "Enterprise Users",
    color: "hsl(var(--primary))",
  },
  organizationUsers: {
    label: "Organization Users",
    color: "hsl(var(--info))",
  },
  pending: {
    label: "Pending",
    color: "hsl(var(--warning))",
  },
  approved: {
    label: "Approved",
    color: "hsl(var(--success))",
  },
  rejected: {
    label: "Rejected",
    color: "hsl(var(--critical))",
  },
};

export function AccountsOverTimeChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounts Growth Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <LineChart data={accountsOverTimeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line 
              type="monotone" 
              dataKey="totalAccounts" 
              stroke="var(--color-totalAccounts)" 
              strokeWidth={3}
            />
            <Line 
              type="monotone" 
              dataKey="organizations" 
              stroke="var(--color-organizations)" 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="enterprises" 
              stroke="var(--color-enterprises)" 
              strokeWidth={2}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function AccountsByTypeChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounts by Type</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <PieChart>
            <Pie
              data={accountsByTypeData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              {accountsByTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function UsersOverTimeChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users Growth Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <BarChart data={usersOverTimeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="enterpriseUsers" fill="var(--color-enterpriseUsers)" />
            <Bar dataKey="organizationUsers" fill="var(--color-organizationUsers)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function ReportsByTypeChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports by Type and Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <BarChart data={reportsByTypeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="pending" fill="var(--color-pending)" />
            <Bar dataKey="approved" fill="var(--color-approved)" />
            <Bar dataKey="rejected" fill="var(--color-rejected)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}