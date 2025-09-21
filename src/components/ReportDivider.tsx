import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ReportDividerProps {
  label?: string;
  isPreview?: boolean;
  onLabelChange?: (label: string) => void;
}

export function ReportDivider({ label, isPreview, onLabelChange }: ReportDividerProps) {
  if (isPreview) {
    return (
      <div className="my-6">
        {label && (
          <div className="text-center mb-4">
            <h3 className="text-lg font-medium text-foreground">{label}</h3>
          </div>
        )}
        <Separator className="bg-border" />
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 border border-dashed border-muted-foreground rounded-lg bg-muted/20">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-sm text-muted-foreground">Section Divider</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="divider-label" className="text-sm">Section Label (optional)</Label>
        <Input
          id="divider-label"
          placeholder="e.g., Personal Information, Incident Details"
          value={label || ''}
          onChange={(e) => onLabelChange?.(e.target.value)}
        />
      </div>
    </div>
  );
}