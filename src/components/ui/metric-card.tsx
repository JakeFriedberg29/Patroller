import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  variant?: 'critical' | 'warning' | 'success' | 'info' | 'neutral';
  className?: string;
  changePercent?: number;
  changePeriod?: string;
}

const variantStyles = {
  critical: "border-critical/20 bg-critical-bg",
  warning: "border-warning/20 bg-warning-bg", 
  success: "border-success/20 bg-success-bg",
  info: "border-info/20 bg-info-bg",
  neutral: "border-border bg-card"
};

const iconStyles = {
  critical: "text-critical",
  warning: "text-warning",
  success: "text-success", 
  info: "text-info",
  neutral: "text-muted-foreground"
};

export function MetricCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  variant = 'neutral',
  className,
  changePercent,
  changePeriod
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
            {changePercent !== undefined && changePeriod && (
              <div className="flex items-center gap-1 mt-2">
                <span className={`text-xs font-medium ${changePercent >= 0 ? 'text-success' : 'text-critical'}`}>
                  {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">vs last {changePeriod}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}