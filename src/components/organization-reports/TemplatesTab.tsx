import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileIcon, Download, Plus, MoreHorizontal, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ReportTemplateSummary } from "@/hooks/useReportTemplates";

interface TemplatesTabProps {
  organizationId: string | undefined;
  templates: ReportTemplateSummary[];
  loading: boolean;
  visibilityByTemplate: Record<string, boolean>;
  onToggleVisibility: (templateId: string, visible: boolean) => void;
}

export function TemplatesTab({ 
  organizationId, 
  templates, 
  loading, 
  visibilityByTemplate, 
  onToggleVisibility 
}: TemplatesTabProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDownloadTemplate = (template: ReportTemplateSummary) => {
    try {
      // Create a simple Word document template download
      const content = `${template.name}\n\n${template.description}\n\n[Template fields would be here]`;
      const blob = new Blob([content], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${template.name.replace(/\s+/g, '_')}_Template.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Template Downloaded",
        description: `${template.name} template has been downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateReport = (template: ReportTemplateSummary) => {
    navigate(`/organization/${organizationId}/reports/create/${template.id}`);
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Report Name</TableHead>
              <TableHead className="font-semibold">Description</TableHead>
              <TableHead className="font-semibold">Publish</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-sm text-muted-foreground">
                  Loading report templates…
                </TableCell>
              </TableRow>
            ) : templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-sm text-muted-foreground">
                  No report templates available.
                </TableCell>
              </TableRow>
            ) : (
              templates.map(template => (
                <TableRow key={template.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <FileIcon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-semibold">{template.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {template.description}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={!!visibilityByTemplate[template.id]}
                      onCheckedChange={(checked) => onToggleVisibility(template.id, Boolean(checked))}
                    />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={() => navigate(`/reports/${template.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Report
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadTemplate(template)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download Template
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCreateReport(template)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
