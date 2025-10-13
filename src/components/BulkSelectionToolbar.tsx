import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkActionButton {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  disabled?: boolean;
}

interface BulkSelectionToolbarProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  actions: BulkActionButton[];
  className?: string;
}

export const BulkSelectionToolbar = ({
  selectedCount,
  totalCount,
  onClearSelection,
  actions,
  className,
}: BulkSelectionToolbarProps) => {
  if (selectedCount === 0) return null;

  return (
    <div 
      className={cn(
        "sticky top-0 z-10 flex items-center justify-between gap-4 bg-muted/80 backdrop-blur-sm border-b border-border px-4 py-3 animate-fade-in",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear selection</span>
        </Button>
        <div className="text-sm font-medium">
          <span className="text-foreground">{selectedCount}</span>
          <span className="text-muted-foreground"> of {totalCount} selected</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              {action.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
