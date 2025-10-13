import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TemplateStatusBadgeProps {
  status: 'draft' | 'ready' | 'published' | 'unpublished' | 'archive';
  className?: string;
}

export const TemplateStatusBadge = ({ status, className }: TemplateStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return {
          label: 'Draft',
          className: 'bg-muted text-muted-foreground hover:bg-muted border-border'
        };
      case 'ready':
        return {
          label: 'Ready',
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400'
        };
      case 'published':
        return {
          label: 'Published',
          className: 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400'
        };
      case 'unpublished':
        return {
          label: 'Unpublished',
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400'
        };
      case 'archive':
        return {
          label: 'Archived',
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400'
        };
      default:
        return {
          label: status.charAt(0).toUpperCase() + status.slice(1),
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
