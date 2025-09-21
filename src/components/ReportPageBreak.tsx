import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText } from "lucide-react";

interface ReportPageBreakProps {
  label?: string;
  isPreview?: boolean;
  onLabelChange?: (label: string) => void;
}

export function ReportPageBreak({ label, isPreview, onLabelChange }: ReportPageBreakProps) {
  if (isPreview) {
    return (
      <div className="my-8 py-6 border-y-2 border-dashed border-primary/30 bg-primary/5">
        <div className="text-center">
          <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
          <p className="text-sm font-medium text-primary">Page Break</p>
          {label && <p className="text-sm text-muted-foreground mt-1">{label}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 border-2 border-dashed border-primary/30 rounded-lg bg-primary/5">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-primary">Page Break</span>
      </div>
      <div className="space-y-2">
        <Label htmlFor="pagebreak-label" className="text-sm">Page Title (optional)</Label>
        <Input
          id="pagebreak-label"
          placeholder="e.g., Step 2: Incident Details"
          value={label || ''}
          onChange={(e) => onLabelChange?.(e.target.value)}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Creates a new step in the form with Next/Back navigation
      </p>
    </div>
  );
}