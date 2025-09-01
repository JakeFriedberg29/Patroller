import { useState } from "react";
import { Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data for system activity logs
const activityLogs = [
  {
    id: 1,
    action: "Member Deleted",
    description: "Team member jakefriedberg32@gmail.com was removed.",
    user: "current_user",
    timestamp: "5 days ago"
  }
];

const filterOptions = [
  "All",
  "Incident Created",
  "Incident Updated", 
  "Incident Closed",
  "Member Added",
  "Member Updated",
  "Member Deleted",
  "Report Generated",
  "Status Changed",
  "Login",
  "Logout"
];

export default function Logs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "All" || log.action === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Activity Logs</h1>
          <p className="text-muted-foreground mt-1">
            A chronological record of all actions and events in the platform
          </p>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-[200px] bg-muted/50">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border">
                  {filterOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {activityLogs.length} records
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Logs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Action</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="font-semibold">User</TableHead>
                <TableHead className="font-semibold">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell>{log.description}</TableCell>
                    <TableCell className="text-muted-foreground">{log.user}</TableCell>
                    <TableCell className="text-muted-foreground">{log.timestamp}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No activity logs found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}