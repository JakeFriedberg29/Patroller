import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  RefreshCw,
  Calendar,
  Shield,
  Activity
} from "lucide-react";
import { LogEntry } from "@/components/LogEntry";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const actionOptions = [
  { value: "ALL", label: "All Actions" },
  { value: "CREATE", label: "Create" },
  { value: "UPDATE", label: "Update" },
  { value: "DELETE", label: "Delete" },
  { value: "SUSPEND", label: "Suspend" },
  { value: "UNSUSPEND", label: "Unsuspend" },
  { value: "LOGIN", label: "Login" },
  { value: "LOGOUT", label: "Logout" }
];

const resourceOptions = [
  { value: "ALL", label: "All Resources" },
  { value: "user", label: "Users" },
  { value: "organization", label: "Organizations" },
  { value: "tenant", label: "Tenants" },
  { value: "notification", label: "Notifications" },
  { value: "session", label: "Sessions" }
];

export default function EnterpriseLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [resourceFilter, setResourceFilter] = useState("ALL");
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const { toast } = useToast();

  const { logs, loading, error, refetch } = useAuditLogs({
    searchTerm,
    actionFilter,
    resourceFilter,
    limit: rowsPerPage
  });

  const handleExportLogs = () => {
    if (logs.length === 0) {
      toast({
        title: "No Data",
        description: "No logs available to export.",
        variant: "destructive",
      });
      return;
    }

    const csvData = logs.map(log => ({
      Timestamp: new Date(log.created_at).toISOString(),
      Action: log.action,
      Resource: log.resource_type,
      User: log.user_name || log.user_email || 'System',
      'Target Admin': log.metadata?.target_admin_name || 'N/A',
      'Target Email': log.metadata?.target_admin_email || 'N/A',
      Description: log.metadata?.action_description || `${log.action} ${log.resource_type}`,
      'IP Address': log.ip_address || 'N/A'
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `enterprise-audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Enterprise audit logs exported successfully.",
    });
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refetch}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExportLogs}
            disabled={loading || logs.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export Logs
          </Button>
        </div>
      </div>

      <Tabs defaultValue="audit" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="summary">Summary & Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search logs by action, user, or admin details..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    {actionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={resourceFilter} onValueChange={setResourceFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by resource" />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={rowsPerPage.toString()} onValueChange={(value) => setRowsPerPage(Number(value))}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 rows</SelectItem>
                    <SelectItem value="50">50 rows</SelectItem>
                    <SelectItem value="100">100 rows</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Active Filters */}
              {(actionFilter !== "ALL" || resourceFilter !== "ALL" || searchTerm) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {actionFilter !== "ALL" && (
                    <Badge variant="secondary" className="gap-1">
                      Action: {actionOptions.find(o => o.value === actionFilter)?.label}
                      <button onClick={() => setActionFilter("ALL")} className="ml-1 hover:bg-background rounded-full">
                        ×
                      </button>
                    </Badge>
                  )}
                  {resourceFilter !== "ALL" && (
                    <Badge variant="secondary" className="gap-1">
                      Resource: {resourceOptions.find(o => o.value === resourceFilter)?.label}
                      <button onClick={() => setResourceFilter("ALL")} className="ml-1 hover:bg-background rounded-full">
                        ×
                      </button>
                    </Badge>
                  )}
                  {searchTerm && (
                    <Badge variant="secondary" className="gap-1">
                      Search: "{searchTerm}"
                      <button onClick={() => setSearchTerm("")} className="ml-1 hover:bg-background rounded-full">
                        ×
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Enterprise Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-4">Loading enterprise logs...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-destructive mb-4">Error: {error}</p>
                  <Button onClick={refetch} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm || actionFilter !== "ALL" || resourceFilter !== "ALL" 
                      ? "No logs found matching your criteria."
                      : "No enterprise logs available yet. Activity will appear here as administrators interact with the system."
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-0">
                  {logs.map((log) => (
                    <LogEntry
                      key={log.id}
                      id={log.id}
                      action={log.action}
                      resourceType={log.resource_type}
                      createdAt={log.created_at}
                      userName={log.user_name}
                      userEmail={log.user_email}
                      metadata={log.metadata}
                      newValues={log.new_values}
                      oldValues={log.old_values}
                      ipAddress={log.ip_address}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{logs.length}</div>
                <p className="text-xs text-muted-foreground">Total Actions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {logs.filter(log => log.action === 'CREATE').length}
                </div>
                <p className="text-xs text-muted-foreground">Items Created</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {logs.filter(log => log.action === 'DELETE').length}
                </div>
                <p className="text-xs text-muted-foreground">Items Deleted</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {new Set(logs.map(log => log.user_email)).size}
                </div>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logs.slice(0, 10).map((log) => (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">
                              {log.action}
                            </Badge>
                            <span className="font-medium">{log.resource_type}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">
                          {log.metadata?.action_description || 
                           `${log.user_name || log.user_email || 'System'} performed ${log.action.toLowerCase()} on ${log.resource_type}`}
                        </p>
                        {log.metadata?.target_admin_email && (
                          <p className="text-xs text-muted-foreground">
                            Target: {log.metadata.target_admin_name} ({log.metadata.target_admin_email})
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}