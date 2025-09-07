import { useState } from "react";
import { Search, Filter, RefreshCw, Download, Calendar, User, UserPlus, UserX, Settings, Shield, FileText, CheckCircle, Clock, Database, Key, Building, MoreHorizontal } from "lucide-react";
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
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const actionOptions = [
  { value: "ALL", label: "All Actions" },
  { value: "CREATE", label: "Create" },
  { value: "UPDATE", label: "Update" },
  { value: "DELETE", label: "Delete" },
  { value: "LOGIN", label: "Login" },
  { value: "LOGOUT", label: "Logout" },
  { value: "ACTIVATE", label: "Activate" },
  { value: "ASSIGN", label: "Assign" }
];

const resourceOptions = [
  { value: "ALL", label: "All Resources" },
  { value: "user", label: "Users" },
  { value: "organization", label: "Organizations" },
  { value: "report", label: "Reports" },
  { value: "equipment", label: "Equipment" },
  { value: "session", label: "Sessions" }
];

export default function Logs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [resourceFilter, setResourceFilter] = useState("ALL");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const { logs, loading, error, refetch } = useAuditLogs({
    searchTerm,
    actionFilter,
    resourceFilter,
    limit: rowsPerPage * 10 // Get more logs for proper pagination
  });

  const getActionIcon = (action: string) => {
    const iconClass = "h-4 w-4";
    switch (action.toLowerCase()) {
      case 'create':
        return <UserPlus className={iconClass} />;
      case 'update':
        return <Settings className={iconClass} />;
      case 'delete':
        return <UserX className={iconClass} />;
      case 'login':
        return <Key className={iconClass} />;
      case 'logout':
        return <Key className={iconClass} />;
      case 'activate':
        return <CheckCircle className={iconClass} />;
      case 'assign':
        return <Shield className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  };

  const getActionVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'activate':
        return 'default';
      case 'update':
        return 'secondary';
      case 'delete':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getResourceIcon = (resourceType: string) => {
    const iconClass = "h-3 w-3";
    switch (resourceType.toLowerCase()) {
      case 'user':
        return <User className={iconClass} />;
      case 'organization':
        return <Building className={iconClass} />;
      case 'report':
        return <FileText className={iconClass} />;
      case 'equipment':
        return <Settings className={iconClass} />;
      default:
        return <Database className={iconClass} />;
    }
  };

  const generateDescription = (log: any) => {
    const performer = log.user_name || log.user_email || 'System';
    const target = log.new_values?.email || log.new_values?.name || log.new_values?.title || 'item';
    
    switch (`${log.action.toLowerCase()}_${log.resource_type.toLowerCase()}`) {
      case 'create_user':
        return `Created user account for ${target}`;
      case 'update_user':
        return `Updated user ${target}`;
      case 'delete_user':
        return `Deleted user ${target}`;
      case 'activate_user':
        return `Activated user account for ${target}`;
      case 'login_session':
        return `Signed in`;
      case 'logout_session':
        return `Signed out`;
      case 'create_organization':
        return `Created organization ${target}`;
      case 'update_organization':
        return `Updated organization ${target}`;
      default:
        return `Performed ${log.action.toLowerCase()} on ${log.resource_type}`;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return new Date(timestamp).toLocaleString();
    }
  };

  // Filter and pagination logic
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource_type?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + rowsPerPage);

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
      'IP Address': log.ip_address || 'N/A',
      Details: JSON.stringify(log.metadata || {})
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Audit logs have been exported successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">System Activity Logs</h1>
            <p className="text-muted-foreground mt-1">
              Complete audit trail of all platform activities and user actions
            </p>
          </div>
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
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search logs by action, user, or details..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
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
            <Filter className="h-4 w-4 mr-2" />
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
      </div>

      {/* Active Filters */}
      {(actionFilter !== "ALL" || resourceFilter !== "ALL" || searchTerm) && (
        <div className="flex flex-wrap gap-2">
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

      {/* Activity Logs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Action</TableHead>
                <TableHead className="font-semibold">Resource</TableHead>
                <TableHead className="font-semibold">User</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="font-semibold">Timestamp</TableHead>
                <TableHead className="font-semibold">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-4">Loading audit logs...</p>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <p className="text-destructive mb-4">Error: {error}</p>
                    <Button onClick={refetch} variant="outline">
                      Try Again
                    </Button>
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm || actionFilter !== "ALL" || resourceFilter !== "ALL" 
                        ? "No logs found matching your criteria."
                        : "No audit logs available yet. Activity will appear here as users interact with the system."
                      }
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <Badge variant={getActionVariant(log.action)}>
                          {log.action.toUpperCase()}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getResourceIcon(log.resource_type)}
                        <span className="capitalize">{log.resource_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {log.user_name || log.user_email || 'System'}
                        </div>
                        {log.ip_address && (
                          <div className="text-xs text-muted-foreground">
                            IP: {log.ip_address}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="text-sm">{generateDescription(log)}</p>
                        {(log.new_values?.role_type || log.new_values?.status || log.metadata?.setup_method) && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {log.new_values?.role_type && (
                              <Badge variant="outline" className="text-xs">
                                Role: {log.new_values.role_type}
                              </Badge>
                            )}
                            {log.new_values?.status && (
                              <Badge variant="outline" className="text-xs">
                                Status: {log.new_values.status}
                              </Badge>
                            )}
                            {log.metadata?.setup_method && (
                              <Badge variant="outline" className="text-xs">
                                Setup: {log.metadata.setup_method}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatTimestamp(log.created_at)}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {(log.metadata || log.new_values || log.old_values) && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {filteredLogs.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <Select value={rowsPerPage.toString()} onValueChange={(value) => {
                  setRowsPerPage(Number(value));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredLogs.length)} of {filteredLogs.length}
                </span>
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}