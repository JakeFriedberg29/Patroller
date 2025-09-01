import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  variant?: 'critical' | 'warning' | 'success' | 'info';
  className?: string;
}

const variantStyles = {
  critical: "border-critical/20 bg-critical-bg",
  warning: "border-warning/20 bg-warning-bg", 
  success: "border-success/20 bg-success-bg",
  info: "border-info/20 bg-info-bg"
};

const iconStyles = {
  critical: "text-critical",
  warning: "text-warning",
  success: "text-success", 
  info: "text-info"
};

export function MetricCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  variant = 'info',
  className 
}: MetricCardProps) {
  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md border",
      variantStyles[variant],
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn("h-5 w-5", iconStyles[variant])} />
              <h3 className="font-medium text-sm text-muted-foreground">{title}</h3>
            </div>
            <div className="mb-1">
              <div className="text-3xl font-bold text-foreground">{value}</div>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}