import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Search, Filter, Download, Calendar } from "lucide-react";

const mockLogs = [
  {
    id: 1,
    timestamp: "2024-08-31 14:32:15",
    level: "INFO",
    category: "Operation",
    message: "Search and rescue operation initiated at Grid Reference 34.052235, -118.243685",
    user: "Sarah Johnson"
  },
  {
    id: 2,
    timestamp: "2024-08-31 14:15:42",
    level: "WARNING", 
    category: "Equipment",
    message: "Rescue Boat Alpha fuel level below 25%",
    user: "System"
  },
  {
    id: 3,
    timestamp: "2024-08-31 13:45:18",
    level: "INFO",
    category: "Personnel",
    message: "Mike Chen checked in for duty shift",
    user: "Mike Chen"
  },
  {
    id: 4,
    timestamp: "2024-08-31 12:22:03",
    level: "ERROR",
    category: "Communication",
    message: "Radio communication failure on Channel 3",
    user: "Emily Rodriguez"
  },
  {
    id: 5,
    timestamp: "2024-08-31 11:30:17",
    level: "INFO",
    category: "Training",
    message: "Weekly training session completed - Water rescue protocols",
    user: "Sarah Johnson"
  }
];

export default function OrganizationLogs() {
  const { id } = useParams();

  const getLevelColor = (level: string) => {
    switch (level) {
      case "INFO": return "default";
      case "WARNING": return "secondary";
      case "ERROR": return "destructive";
      case "DEBUG": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Activity Logs</h1>
            <p className="text-muted-foreground">Monitor organization activity and events</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search logs..." className="pl-10" />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Log Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">156</div>
              <div className="text-sm text-muted-foreground">Total Today</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">3</div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">12</div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">98.1%</div>
              <div className="text-sm text-muted-foreground">System Health</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Log Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <Badge variant={getLevelColor(log.level) as any} className="mt-1">
                  {log.level}
                </Badge>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{log.category}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-sm">{log.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">by {log.user}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}