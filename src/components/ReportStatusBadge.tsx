import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ReportStatusBadgeProps {
  status: 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  className?: string;
}

export const ReportStatusBadge = ({ status, className }: ReportStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          label: 'Pending',
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400'
        };
      case 'submitted':
        return {
          label: 'Submitted',
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400'
        };
      case 'under_review':
        return {
          label: 'Under Review',
          className: 'bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400'
        };
      case 'approved':
        return {
          label: 'Approved',
          className: 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400'
        };
      case 'rejected':
        return {
          label: 'Rejected',
          className: 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400'
        };
      default:
        return {
          label: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
          className: 'bg-muted text-muted-foreground hover:bg-muted'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
};
