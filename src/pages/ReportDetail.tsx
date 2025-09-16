import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, ArrowLeft } from "lucide-react";
import { reportTemplates } from "@/pages/CreateReport";

export default function ReportDetail() {
  const navigate = useNavigate();
  const { templateId } = useParams();

  const template = reportTemplates.find(t => t.id === Number(templateId)) || reportTemplates[0];
  const sections = template.sections || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>{template.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {sections.length === 0 ? (
            <div className="text-muted-foreground">No fields available for this report.</div>
          ) : (
            sections.map((section: any) => (
              <div key={section.name} className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{section.name}</h3>
                  <Separator className="mt-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.fields.map((field: any) => (
                    <div key={field.name} className="space-y-1">
                      <div className="text-sm font-medium">
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {field.type === 'select' && field.options ? (
                          <span>Options: {field.options.join(", ")}</span>
                        ) : field.placeholder ? (
                          <span>{field.placeholder}</span>
                        ) : (
                          <span>Read-only</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}


