import { useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReportDivider } from "@/components/ReportDivider";
import { ReportFieldPreview } from "@/components/ReportFieldPreview";
import type { FieldRow } from './FieldEditor';

interface ReportPreviewProps {
  name: string;
  description: string;
  fieldRows: FieldRow[];
}

export function ReportPreview({ name, description, fieldRows }: ReportPreviewProps) {
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Split fields into pages based on page_break positions
  const pages = useMemo(() => {
    const result: FieldRow[][] = [[]];
    let currentPageIndex = 0;

    fieldRows.forEach((field) => {
      if (field.type === 'page_break') {
        // Start a new page
        currentPageIndex++;
        result[currentPageIndex] = [];
      } else {
        result[currentPageIndex].push(field);
      }
    });

    return result;
  }, [fieldRows]);

  return (
    <div className="space-y-6">
      {/* Show report name and description only on first page */}
      {currentPage === 0 && (
        <div className="p-6 border rounded-lg bg-muted/5 space-y-3">
          <h2 className="text-2xl font-semibold">{name || "Untitled Report"}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      
      {pages.length > 1 && (
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="text-sm text-muted-foreground">
            Step {currentPage + 1} of {pages.length}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(pages.length - 1, prev + 1))}
              disabled={currentPage === pages.length - 1}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex flex-wrap gap-4">
        {pages[currentPage]?.map((row) => {
          if (row.type === 'divider') {
            return <div key={row.id} className="w-full"><ReportDivider label={row.label} isPreview /></div>;
          }
          
          const widthClass = row.width === '1/3' ? 'w-full md:w-[calc(33.333%-0.67rem)]' : 
                             row.width === '1/2' ? 'w-full md:w-[calc(50%-0.5rem)]' : 
                             'w-full';
          
          return (
            <div key={row.id} className={`${widthClass} p-4 border rounded-lg bg-muted/10`}>
              <ReportFieldPreview field={row} />
            </div>
          );
        })}
      </div>
      
      {pages.length > 1 && (
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            variant="default"
            onClick={() => setCurrentPage(prev => Math.min(pages.length - 1, prev + 1))}
            disabled={currentPage === pages.length - 1}
            className="gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
