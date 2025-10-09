import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UserStatusBadgeProps {
  status: 'pending' | 'active' | 'disabled' | 'deleted' | 'suspended';
  className?: string;
}

export const UserStatusBadge = ({ status, className }: UserStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending Activation',
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400'
        };
      case 'active':
        return {
          label: 'Active',
          className: 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400'
        };
      case 'disabled':
        return {
          label: 'Disabled',
          className: 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400'
        };
      case 'deleted':
        return {
          label: 'Deleted',
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400'
        };
      case 'suspended':
        return {
          label: 'Disabled',
          className: 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400'
        };
      default:
        return {
          label: 'Unknown',
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge 
      variant="secondary" 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
};