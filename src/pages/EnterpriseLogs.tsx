import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart3, 
  Search, 
  Download, 
  Filter,
  Calendar,
  User,
  Shield,
  Activity,
  AlertTriangle,
  Info,
  CheckCircle,
  Building2
} from "lucide-react";

const mockAuditLogs = [
  {
    id: "log-001",
    timestamp: "2024-01-15T14:30:25Z",
    user: "Sarah Johnson",
    action: "Created Organization",
    resource: "MegaCorp Healthcare",
    resourceType: "Organization",
    ip: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    status: "Success",
    details: "Created new organization with ID: org-005"
  },
  {
    id: "log-002", 
    timestamp: "2024-01-15T13:45:12Z",
    user: "Mike Chen",
    action: "User Permission Modified",
    resource: "admin-002",
    resourceType: "User",
    ip: "192.168.1.105",
    userAgent: "Mozilla/5.0 (macOS; Intel Mac OS X 10_15_7)",
    status: "Success",
    details: "Updated permissions for enterprise admin"
  },
  {
    id: "log-003",
    timestamp: "2024-01-15T12:20:33Z",
    user: "System",
    action: "Failed Login Attempt",
    resource: "robert.davis@megacorp.com",
    resourceType: "Authentication",
    ip: "203.0.113.45",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64)",
    status: "Failed",
    details: "Multiple failed login attempts detected"
  },
  {
    id: "log-004",
    timestamp: "2024-01-15T11:15:48Z",
    user: "Dr. Emily Rodriguez",
    action: "Notification Sent",
    resource: "System Maintenance Alert",
    resourceType: "Notification",
    ip: "192.168.1.110",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    status: "Success",
    details: "Sent notification to 2,847 users across all organizations"
  },
  {
    id: "log-005",
    timestamp: "2024-01-15T10:05:17Z",
    user: "Robert Davis",
    action: "Organization Settings Updated",
    resource: "MegaCorp Energy",
    resourceType: "Organization",
    ip: "192.168.1.120",
    userAgent: "Mozilla/5.0 (macOS; Intel Mac OS X 10_15_7)",
    status: "Success",
    details: "Updated security settings and compliance configuration"
  }
];

const mockSystemLogs = [
  {
    id: "sys-001",
    timestamp: "2024-01-15T14:35:00Z",
    level: "INFO",
    service: "Authentication Service",
    message: "User login successful",
    details: "User 'sarah.johnson@megacorp.com' logged in from IP 192.168.1.100"
  },
  {
    id: "sys-002",
    timestamp: "2024-01-15T14:30:15Z", 
    level: "WARN",
    service: "Database Service",
    message: "High query response time detected",
    details: "Query execution time exceeded 5 seconds for organization lookup"
  },
  {
    id: "sys-003",
    timestamp: "2024-01-15T14:25:42Z",
    level: "ERROR",
    service: "Notification Service",
    message: "Failed to send email notification",
    details: "SMTP connection timeout for notification ID notif-001"
  },
  {
    id: "sys-004",
    timestamp: "2024-01-15T14:20:33Z",
    level: "INFO",
    service: "Backup Service",
    message: "Automated backup completed successfully",
    details: "Database backup completed in 45 minutes, size: 2.3 GB"
  },
  {
    id: "sys-005",
    timestamp: "2024-01-15T14:15:12Z",
    level: "WARN",
    service: "Security Service",
    message: "Suspicious login activity detected",
    details: "Multiple failed login attempts from IP 203.0.113.45"
  }
];

const mockSecurityLogs = [
  {
    id: "sec-001",
    timestamp: "2024-01-15T13:45:00Z",
    event: "Failed Authentication",
    severity: "High",
    source: "Login System",
    target: "robert.davis@megacorp.com",
    description: "Multiple failed login attempts within 5 minutes",
    action: "Account temporarily locked"
  },
  {
    id: "sec-002",
    timestamp: "2024-01-15T12:30:15Z",
    event: "Permission Escalation",
    severity: "Medium",
    source: "Admin Panel",
    target: "User ID: admin-003",
    description: "User granted additional administrative privileges",
    action: "Change logged and approved"
  },
  {
    id: "sec-003",
    timestamp: "2024-01-15T11:20:45Z",
    event: "Suspicious API Access",
    severity: "Medium",
    source: "API Gateway",
    target: "Enterprise Data Endpoint",
    description: "Unusual API access pattern detected from external IP",
    action: "Access rate limited"
  },
  {
    id: "sec-004",
    timestamp: "2024-01-15T10:15:30Z",
    event: "Data Export",
    severity: "Low",
    source: "Admin Dashboard",
    target: "Organization Reports",
    description: "Large dataset export initiated by enterprise admin",
    action: "Export approved and logged"
  }
];

export default function EnterpriseLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState("10");

  const filteredAuditLogs = mockAuditLogs.filter((log) => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action.toLowerCase().includes(actionFilter);
    const matchesStatus = statusFilter === "all" || log.status.toLowerCase() === statusFilter;
    const matchesUser = userFilter === "all" || log.user.toLowerCase().includes(userFilter);
    
    return matchesSearch && matchesAction && matchesStatus && matchesUser;
  });

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success': return 'default';
      case 'failed': return 'destructive';
      case 'warning': return 'destructive';
      default: return 'secondary';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warn': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8" />
            Enterprise Logs
          </h1>
          <p className="text-muted-foreground">Monitor and analyze system activity across your enterprise</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <Tabs defaultValue="audit" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="system">System Logs</TabsTrigger>
          <TabsTrigger value="security">Security Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Audit Trail
              </CardTitle>
              
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search audit logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="created">Created</SelectItem>
                      <SelectItem value="modified">Modified</SelectItem>
                      <SelectItem value="deleted">Deleted</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAuditLogs.slice(0, parseInt(rowsPerPage)).map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatTimestamp(log.timestamp)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {log.user}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{log.resource}</div>
                            <div className="text-sm text-muted-foreground">{log.resourceType}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(log.status)}>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{log.ip}</TableCell>
                        <TableCell className="max-w-xs truncate" title={log.details}>
                          {log.details}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show</span>
                  <Select value={rowsPerPage} onValueChange={setRowsPerPage}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">
                    of {filteredAuditLogs.length} logs
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Logs
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {mockSystemLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      {getLevelIcon(log.level)}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant={log.level === 'ERROR' ? 'destructive' : log.level === 'WARN' ? 'default' : 'secondary'}>
                              {log.level}
                            </Badge>
                            <span className="font-medium">{log.service}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatTimestamp(log.timestamp)}
                          </span>
                        </div>
                        <p className="font-medium">{log.message}</p>
                        <p className="text-sm text-muted-foreground">{log.details}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Events
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Action Taken</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockSecurityLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatTimestamp(log.timestamp)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.event}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSeverityVariant(log.severity)}>
                            {log.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.source}</TableCell>
                        <TableCell className="font-mono text-sm">{log.target}</TableCell>
                        <TableCell className="max-w-xs">{log.description}</TableCell>
                        <TableCell className="max-w-xs text-sm text-muted-foreground">{log.action}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}