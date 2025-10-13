import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, Loader2, Plus, Eye, Edit } from "lucide-react";
import { useReportBuilderForm } from "@/hooks/useReportBuilderForm";
import { FieldList } from "@/components/report-builder/FieldList";
import { ReportPreview } from "@/components/report-builder/ReportPreview";
import { getValidNextStates, type ReportStatus } from "@/utils/statusTransitions";

export default function ReportBuilder() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  const form = useReportBuilderForm(templateId);

  useEffect(() => {
    if (templateId) form.loadTemplate();
  }, [templateId]);

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Report Builder</h1>
          <Button variant="ghost" size="sm" className="gap-2 w-fit" onClick={() => navigate('/repository')}>
            <ChevronLeft className="h-4 w-4" />
            Back to Repository
          </Button>
        </div>
        <div className="flex gap-2 items-center">
          <Button
            variant={isPreviewMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="gap-2"
          >
            {isPreviewMode ? <Edit className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {isPreviewMode ? "Edit" : "Preview"}
          </Button>
          <Select value={form.status} onValueChange={(v) => form.handleStatusChange(v as any)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={form.status}>
                {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
              </SelectItem>
              {getValidNextStates(form.status as ReportStatus).map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => navigate('/repository')} disabled={form.saving}>Cancel</Button>
          <Button onClick={form.handleSave} disabled={form.saving} className="gap-2">
            {form.saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Report Name and Description Card - only shown in edit mode */}
      {!isPreviewMode && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Report Name</Label>
                <Input value={form.name} onChange={(e) => form.setName(e.target.value)} placeholder="Incident Report" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea rows={3} value={form.description} onChange={(e) => form.setDescription(e.target.value)} placeholder="Describe this report template" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Assignment Options</Label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg bg-muted/20">
                    <Checkbox
                      id="assign-all-orgs"
                      checked={form.assignToAllOrgs}
                      onCheckedChange={(checked) => {
                        form.setAssignToAllOrgs(Boolean(checked));
                        if (checked) {
                          form.setSelectedSubtypes([]);
                        }
                      }}
                    />
                    <div className="flex-1">
                      <Label htmlFor="assign-all-orgs" className="font-medium cursor-pointer">
                        Assign to entire enterprise (all organizations)
                      </Label>
                      <p className="text-sm text-muted-foreground">Make this report available to all organizations in this enterprise</p>
                    </div>
                  </div>

                  {!form.assignToAllOrgs && (
                    <div className="space-y-2">
                      <Label>Or assign to specific organization subtypes:</Label>
                      <p className="text-sm text-muted-foreground">Select which organization subtypes can access this report</p>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 border rounded-lg">
                        {form.availableSubtypes.length === 0 ? (
                          <p className="text-sm text-muted-foreground col-span-2">No organization subtypes available</p>
                        ) : (
                          form.availableSubtypes.map((subtype) => (
                            <div key={subtype} className="flex items-center space-x-2">
                              <Checkbox
                                id={`subtype-${subtype}`}
                                checked={form.selectedSubtypes.includes(subtype)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    form.setSelectedSubtypes([...form.selectedSubtypes, subtype]);
                                  } else {
                                    form.setSelectedSubtypes(form.selectedSubtypes.filter(s => s !== subtype));
                                  }
                                }}
                              />
                              <Label htmlFor={`subtype-${subtype}`} className="text-sm font-normal cursor-pointer">
                                {subtype}
                              </Label>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Elements Card */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Form Elements</Label>
              {!isPreviewMode && form.fieldRows.length === 0 && (
                <Button variant="outline" size="sm" className="gap-2" onClick={() => form.addFieldRow()}>
                  <Plus className="h-4 w-4" /> Add First Field
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {form.fieldRows.length === 0 && (
                <div className="text-sm text-muted-foreground">No form elements configured.</div>
              )}
              {isPreviewMode ? (
                <ReportPreview 
                  name={form.name}
                  description={form.description}
                  fieldRows={form.fieldRows}
                />
              ) : (
                <FieldList
                  fieldRows={form.fieldRows}
                  onReorder={form.setFieldRows}
                  updateFieldRow={form.updateFieldRow}
                  removeFieldRow={form.removeFieldRow}
                  addFieldRow={form.addFieldRow}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
