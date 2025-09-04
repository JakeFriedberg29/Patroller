import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Settings, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuditLogEntry {
  id: string;
  created_at: string;
  action: string;
  resource_type: string;
  resource_id: string;
  user_id: string;
  metadata: any;
  new_values: any;
  old_values: any;
}

interface AdminAuditLogProps {
  accountType: "platform" | "enterprise" | "organization";
  accountId?: string;
  limit?: number;
}

export const AdminAuditLog = ({ accountType, accountId, limit = 50 }: AdminAuditLogProps) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuditLogs();
  }, [accountType, accountId]);

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

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

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return <User className="h-4 w-4" />;
      case 'update':
        return <Settings className="h-4 w-4" />;
      case 'delete':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActionVariant = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'default';
      case 'update':
        return 'secondary';
      case 'delete':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Admin Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading audit logs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Admin Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No audit logs found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getActionVariant(log.action) as any}>
                      {log.action}
                    </Badge>
                    <Badge variant="outline">
                      {log.resource_type}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">
                    {log.metadata?.user_name || log.metadata?.user_email || 'System'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(log.created_at)}
                  </p>
                  {log.metadata?.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {log.metadata.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};