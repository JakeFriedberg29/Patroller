import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  User, 
  UserPlus, 
  UserX, 
  Settings, 
  Shield, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Key,
  Building
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LogEntryProps {
  id: string;
  action: string;
  resourceType: string;
  createdAt: string;
  userName?: string | null;
  userEmail?: string | null;
  metadata?: any;
  newValues?: any;
  oldValues?: any;
  ipAddress?: string | null;
}

export const LogEntry: React.FC<LogEntryProps> = ({
  action,
  resourceType,
  createdAt,
  userName,
  userEmail,
  metadata,
  newValues,
  oldValues,
  ipAddress
}) => {
  const getActionIcon = () => {
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

  const getActionVariant = (): "default" | "secondary" | "destructive" | "outline" => {
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

  const getResourceIcon = () => {
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
  };

  const generateDescription = () => {
    const performer = userName || userEmail || 'System';
    const target = newValues?.email || newValues?.name || newValues?.title || 'item';
    
    switch (`${action.toLowerCase()}_${resourceType.toLowerCase()}`) {
      case 'create_user':
        return `${performer} created user account for ${target}`;
      case 'update_user':
        return `${performer} updated user ${target}`;
      case 'delete_user':
        return `${performer} deleted user ${target}`;
      case 'activate_user':
        return `${performer} activated user account for ${target}`;
      case 'login_session':
        return `${performer} signed in`;
      case 'logout_session':
        return `${performer} signed out`;
      case 'create_organization':
        return `${performer} created organization ${target}`;
      case 'update_organization':
        return `${performer} updated organization ${target}`;
      default:
        return `${performer} performed ${action.toLowerCase()} on ${resourceType}`;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return new Date(timestamp).toLocaleString();
    }
  };

  const getDetails = () => {
    const details = [];
    
    if (newValues?.role_type) {
      details.push(`Role: ${newValues.role_type}`);
    }
    
    if (newValues?.status) {
      details.push(`Status: ${newValues.status}`);
    }
    
    if (metadata?.setup_method) {
      details.push(`Setup: ${metadata.setup_method}`);
    }
    
    if (ipAddress) {
      details.push(`IP: ${ipAddress}`);
    }
    
    return details;
  };

  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getActionIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant={getActionVariant()}>
                {action.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {getResourceIcon()}
                <span className="ml-1">{resourceType}</span>
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(createdAt)}
              </span>
            </div>
            
            <p className="text-sm font-medium text-foreground mb-1">
              {generateDescription()}
            </p>
            
            {getDetails().length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {getDetails().map((detail, index) => (
                  <span key={index} className="text-xs bg-muted px-2 py-1 rounded">
                    {detail}
                  </span>
                ))}
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              {new Date(createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};