import { Badge } from "@/components/ui/badge";

interface IncidentStatusBadgeProps {
  status: string;
}

export function IncidentStatusBadge({ status }: IncidentStatusBadgeProps) {
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'destructive';
      case 'in_progress':
        return 'default';
      case 'resolved':
        return 'secondary';
      case 'closed':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in_progress':
        return 'In Progress';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <Badge variant={getStatusVariant(status) as any}>
      {getStatusLabel(status)}
    </Badge>
  );
}