import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText } from "lucide-react";
import { useOrganizationReportTemplates } from "@/hooks/useReportTemplates";
import { useReports } from "@/hooks/useReports";
import { useTemplateVisibility } from "@/hooks/useTemplateVisibility";
import { useFolderManagement } from "@/hooks/useFolderManagement";
import { TemplatesTab } from "@/components/organization-reports/TemplatesTab";
import { SubmissionsTab } from "@/components/organization-reports/SubmissionsTab";
import { FilesTab } from "@/components/organization-reports/FilesTab";

export default function OrganizationReports() {
  const { id } = useParams();
  
  // Data fetching hooks
  const { templates, loading: loadingTemplates } = useOrganizationReportTemplates(id);
  const { reports, loading: loadingReports } = useReports();
  
  // Feature hooks
  const { visibilityByTemplate, toggleVisibility } = useTemplateVisibility(id, templates);
  const { folders, createFolder } = useFolderManagement();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="text-muted-foreground">View and generate organization reports</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates">
          <TemplatesTab
            organizationId={id}
            templates={templates}
            loading={loadingTemplates}
            visibilityByTemplate={visibilityByTemplate}
            onToggleVisibility={toggleVisibility}
          />
        </TabsContent>

        <TabsContent value="submissions">
          <SubmissionsTab
            reports={reports}
            templates={templates}
            loading={loadingReports}
          />
        </TabsContent>
        
        <TabsContent value="files">
          <FilesTab
            folders={folders}
            onCreateFolder={createFolder}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
