import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, FileText, RefreshCw } from "lucide-react";

interface AuditLogEntry {
  id: string;
  action_type: string;
  target_user_email: string;
  target_user_name: string;
  target_user_role: string;
  performed_by_email: string;
  account_type: string;
  details: any;
  created_at: string;
}

interface AdminAuditLogProps {
  accountType?: "platform" | "enterprise" | "organization";
  accountId?: string;
}

export function AdminAuditLog({ accountType, accountId }: AdminAuditLogProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState("25");

  useEffect(() => {
    loadAuditLogs();
  }, [accountType, accountId]);

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by account if specified
      if (accountType && accountType !== 'platform' && accountId) {
        query = query.eq('account_id', accountId);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        console.error('Error loading audit logs:', error);
        toast.error('Failed to load audit logs');
        return;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.target_user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performed_by_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action_type === actionFilter;
    
    return matchesSearch && matchesAction;
  });

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'delete': return 'destructive';
      case 'create': return 'default';
      case 'update': return 'secondary';
      case 'suspend': return 'outline';
      case 'activate': return 'outline';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionDetails = (log: AuditLogEntry) => {
    const details = log.details || {};
    if (log.action_type === 'delete') {
      return `${details.deletion_type === 'hard' ? 'Permanent' : 'Soft'} deletion${details.deletion_reason ? ` - ${details.deletion_reason}` : ''}`;
    }
    return JSON.stringify(details, null, 2);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle>Administrator Audit Log</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAuditLogs}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="suspend">Suspend</SelectItem>
                <SelectItem value="activate">Activate</SelectItem>
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
                <TableHead>Date/Time</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target Admin</TableHead>
                <TableHead>Performed By</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.slice(0, parseInt(rowsPerPage)).map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm">
                    {formatDate(log.created_at)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionBadgeVariant(log.action_type)}>
                      {log.action_type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{log.target_user_name}</div>
                      <div className="text-sm text-muted-foreground">{log.target_user_email}</div>
                      <Badge variant="outline" className="text-xs">{log.target_user_role}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {log.performed_by_email || 'System'}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="text-sm text-muted-foreground truncate">
                      {getActionDetails(log)}
                    </div>
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
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              of {filteredLogs.length} log entries
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Showing {Math.min(parseInt(rowsPerPage), filteredLogs.length)} of {filteredLogs.length} results
          </div>
        </div>
      </CardContent>
    </Card>
  );
}