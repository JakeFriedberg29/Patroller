import { UserPlus, Settings, UserX, Key, CheckCircle, Shield, Clock, User, Building, FileText, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export const actionOptions = [
  { label: 'All Actions', value: 'all' },
  { label: 'Create', value: 'CREATE' },
  { label: 'Update', value: 'UPDATE' },
  { label: 'Delete', value: 'DELETE' },
  { label: 'Login', value: 'LOGIN' },
  { label: 'Logout', value: 'LOGOUT' },
  { label: 'Activate', value: 'ACTIVATE' },
  { label: 'Assign', value: 'ASSIGN' }
];

export const resourceOptions = [
  { label: 'All Resources', value: 'all' },
  { label: 'Users', value: 'user' },
  { label: 'Organizations', value: 'organization' },
  { label: 'Reports', value: 'report' },
  { label: 'Sessions', value: 'session' }
];

export function getActionIcon(action: string) {
  const iconClass = "h-4 w-4";
  switch (action.toLowerCase()) {
    case 'create':
      return <UserPlus className={iconClass} />;
    case 'update':
      return <Settings className={iconClass} />;
    case 'delete':
      return <UserX className={iconClass} />;
    case 'login':
    case 'logout':
      return <Key className={iconClass} />;
    case 'activate':
      return <CheckCircle className={iconClass} />;
    case 'assign':
      return <Shield className={iconClass} />;
    default:
      return <Clock className={iconClass} />;
  }
}

export function getActionVariant(action: string): "default" | "secondary" | "destructive" | "outline" {
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
}

export function getResourceIcon(resourceType: string) {
  const iconClass = "h-3 w-3";
  switch (resourceType.toLowerCase()) {
    case 'user':
      return <User className={iconClass} />;
    case 'organization':
      return <Building className={iconClass} />;
    case 'report':
      return <FileText className={iconClass} />;
    default:
      return <Database className={iconClass} />;
  }
}

export function generateDescription(log: any) {
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
    case 'create_report':
      return `Created report ${target}`;
    default:
      return `Performed ${log.action.toLowerCase()} on ${log.resource_type}`;
  }
}

export function formatTimestamp(timestamp: string) {
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch {
    return new Date(timestamp).toLocaleString();
  }
}

export function ActionCell({ log }: { log: any }) {
  return (
    <div className="flex items-center gap-2">
      {getActionIcon(log.action)}
      <Badge variant={getActionVariant(log.action)}>
        {log.action.toUpperCase()}
      </Badge>
    </div>
  );
}

export function ResourceCell({ log }: { log: any }) {
  return (
    <div className="flex items-center gap-2">
      {getResourceIcon(log.resource_type)}
      <span className="capitalize">{log.resource_type}</span>
    </div>
  );
}

export function UserCell({ log }: { log: any }) {
  return (
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
  );
}

export function DescriptionCell({ log }: { log: any }) {
  return (
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
  );
}

export function TimestampCell({ log }: { log: any }) {
  return (
    <div className="text-sm">
      <div>{formatTimestamp(log.created_at)}</div>
      <div className="text-xs text-muted-foreground">
        {new Date(log.created_at).toLocaleString()}
      </div>
    </div>
  );
}

export function exportLogsToCSV(logs: any[], filename: string) {
  if (logs.length === 0) return false;

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
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  return true;
}
