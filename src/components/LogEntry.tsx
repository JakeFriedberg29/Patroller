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
      case 'equipment':
        return <Settings className={iconClass} />;
      default:
        return <Database className={iconClass} />;
    }
  };

  const generateDescription = () => {
    const performer = userName || userEmail || 'System';
    
    // Use detailed description from metadata if available
    if (metadata?.action_description) {
      return metadata.action_description;
    }

    // Generate detailed descriptions based on action and metadata
    const targetName = metadata?.target_admin_name || newValues?.full_name || newValues?.name || newValues?.email;
    const targetEmail = metadata?.target_admin_email || newValues?.email;
    const targetRole = metadata?.target_admin_role || newValues?.role_type || newValues?.role;

    switch (`${action.toLowerCase()}_${resourceType.toLowerCase()}`) {
      case 'create_user':
        if (targetName && targetEmail && targetRole) {
          return `${performer} created admin '${targetName} (${targetEmail})' with role '${targetRole}'`;
        }
        return `${performer} created user account${targetName ? ` for ${targetName}` : ''}`;
        
      case 'update_user':
        if (targetName && targetEmail) {
          const changes = [];
          if (oldValues && newValues) {
            if (oldValues.full_name !== newValues.full_name) changes.push('name');
            if (oldValues.email !== newValues.email) changes.push('email');
            if (oldValues.phone !== newValues.phone) changes.push('phone');
            if (oldValues.status !== newValues.status) changes.push('status');
          }
          const changeText = changes.length > 0 ? ` (updated: ${changes.join(', ')})` : '';
          return `${performer} updated admin '${targetName} (${targetEmail})'${changeText}`;
        }
        return `${performer} updated user ${targetName || 'profile'}`;
        
      case 'delete_user':
        if (targetName && targetEmail && targetRole) {
          return `${performer} deleted admin '${targetName} (${targetEmail})' with role '${targetRole}'`;
        }
        return `${performer} deleted user ${targetName || 'account'}`;
        
      case 'suspend_user':
        if (targetName && targetEmail) {
          return `${performer} suspended admin '${targetName} (${targetEmail})'`;
        }
        return `${performer} suspended user account`;
        
      case 'unsuspend_user':
        if (targetName && targetEmail) {
          return `${performer} unsuspended admin '${targetName} (${targetEmail})'`;
        }
        return `${performer} unsuspended user account`;
        
      case 'activate_user':
        if (targetName && targetEmail) {
          return `${performer} activated admin account for '${targetName} (${targetEmail})'`;
        }
        return `${performer} activated user account${targetName ? ` for ${targetName}` : ''}`;
        
      case 'login_session':
        return `${performer} signed in to the platform`;
        
      case 'logout_session':
        return `${performer} signed out of the platform`;
        
      case 'create_organization':
        const orgName = newValues?.name || metadata?.organization_name;
        return `${performer} created organization${orgName ? ` '${orgName}'` : ''}`;
        
      case 'update_organization':
        const updatedOrgName = newValues?.name || metadata?.organization_name;
        return `${performer} updated organization${updatedOrgName ? ` '${updatedOrgName}'` : ''}`;
        
      case 'assign_equipment':
        const equipmentName = metadata?.equipment_name || newValues?.name;
        const assignedTo = metadata?.assigned_to_name || newValues?.assigned_to;
        return `${performer} assigned equipment${equipmentName ? ` '${equipmentName}'` : ''} ${assignedTo ? `to ${assignedTo}` : ''}`;
        
      case 'create_incident':
        const incidentTitle = newValues?.title || metadata?.incident_title;
        return `${performer} created incident${incidentTitle ? ` '${incidentTitle}'` : ''}`;
        
      default:
        // Fallback for any other action types
        if (targetName) {
          return `${performer} performed ${action.toLowerCase()} on ${resourceType} '${targetName}'`;
        }
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
    
    // Role information
    if (newValues?.role_type || newValues?.role) {
      details.push(`Role: ${newValues.role_type || newValues.role}`);
    }
    
    // Status changes
    if (oldValues?.status && newValues?.status && oldValues.status !== newValues.status) {
      details.push(`Status: ${oldValues.status} → ${newValues.status}`);
    } else if (newValues?.status) {
      details.push(`Status: ${newValues.status}`);
    }
    
    // Account type for admin operations
    if (metadata?.account_type) {
      details.push(`Type: ${metadata.account_type}`);
    }
    
    // Bulk operation count
    if (metadata?.bulk_operation_count) {
      details.push(`Bulk operation: ${metadata.bulk_operation_count} items`);
    }
    
    // Setup method for user creation
    if (metadata?.setup_method) {
      details.push(`Method: ${metadata.setup_method.replace('_', ' ')}`);
    }
    
    // Department and location for admin profiles
    if (newValues?.department || metadata?.target_department) {
      details.push(`Dept: ${newValues?.department || metadata?.target_department || 'N/A'}`);
    }
    
    if (newValues?.location || metadata?.target_location) {
      details.push(`Location: ${newValues?.location || metadata?.target_location || 'N/A'}`);
    }
    
    // Equipment-specific details
    if (resourceType === 'equipment') {
      if (metadata?.equipment_name) {
        details.push(`Equipment: ${metadata.equipment_name}`);
      }
      if (newValues?.category) {
        details.push(`Category: ${newValues.category}`);
      }
      if (newValues?.assigned_to || metadata?.assigned_to_name) {
        details.push(`Assigned to: ${metadata.assigned_to_name || newValues.assigned_to}`);
      }
    }
    
    // Incident-specific details
    if (resourceType === 'incident') {
      if (newValues?.priority) {
        details.push(`Priority: ${newValues.priority}`);
      }
      if (newValues?.incident_type) {
        details.push(`Type: ${newValues.incident_type}`);
      }
    }
    
    // IP address (always show if available)
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