import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportTemplateSummary } from "@/hooks/useReportTemplates";

interface SubmissionsTabProps {
  reports: any[]; // Using any to match ReportRecord from useReports
  templates: ReportTemplateSummary[];
  loading: boolean;
}

export function SubmissionsTab({ reports, templates, loading }: SubmissionsTabProps) {
  const getTemplateName = (templateId: string | null): string => {
    if (!templateId) return 'N/A';
    const template = templates.find(t => t.id === templateId);
    return template ? template.name : 'Template';
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Title</TableHead>
              <TableHead className="font-semibold">Template</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Submitted</TableHead>
              <TableHead className="font-semibold">Submitted By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-sm text-muted-foreground">
                  Loading submissions…
                </TableCell>
              </TableRow>
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-sm text-muted-foreground">
                  No submissions yet.
                </TableCell>
              </TableRow>
            ) : (
              reports.map(report => (
                <TableRow key={report.id} className="hover:bg-muted/50 cursor-pointer">
                  <TableCell className="font-medium">
                    {report.title || report.report_type}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {getTemplateName(report.template_id)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {report.report_type}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(report.submitted_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {report.created_by || 'Unknown'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
