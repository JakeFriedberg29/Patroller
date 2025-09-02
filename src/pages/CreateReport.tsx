import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, ArrowLeft, Save, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const reportTemplates = [
  {
    id: 1,
    name: "Incident Report",
    description: "Standard incident reporting form for emergency response situations",
    fields: [
      { name: "incidentDate", label: "Incident Date", type: "date", required: true },
      { name: "incidentTime", label: "Incident Time", type: "time", required: true },
      { name: "location", label: "Location", type: "text", required: true },
      { name: "incidentType", label: "Incident Type", type: "select", options: ["Fire", "Medical", "Rescue", "Hazmat", "Other"], required: true },
      { name: "description", label: "Incident Description", type: "textarea", required: true },
      { name: "injuries", label: "Injuries Reported", type: "select", options: ["None", "Minor", "Serious", "Fatal"], required: true },
      { name: "responseTime", label: "Response Time (minutes)", type: "number", required: true },
      { name: "unitNumber", label: "Unit Number", type: "text", required: true }
    ]
  },
  {
    id: 2,
    name: "Patient Care Report",
    description: "Medical care documentation for patient treatment and transport",
    fields: [
      { name: "patientName", label: "Patient Name", type: "text", required: true },
      { name: "age", label: "Age", type: "number", required: true },
      { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"], required: true },
      { name: "chiefComplaint", label: "Chief Complaint", type: "textarea", required: true },
      { name: "vitalSigns", label: "Vital Signs", type: "textarea", required: true },
      { name: "treatmentProvided", label: "Treatment Provided", type: "textarea", required: true },
      { name: "disposition", label: "Patient Disposition", type: "select", options: ["Transport to Hospital", "Refused Transport", "Released on Scene", "Other"], required: true }
    ]
  }
  // Add more templates as needed
];

export default function CreateReport() {
  const { accountId, templateId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, string>>({});
  
  const template = reportTemplates.find(t => t.id === Number(templateId)) || reportTemplates[0];
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft Saved",
      description: "Your report has been saved as a draft.",
    });
  };

  const handleSubmitReport = () => {
    // Validate required fields
    const missingFields = template.fields
      .filter(field => field.required && !formData[field.name])
      .map(field => field.label);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Report Submitted",
      description: "Your report has been successfully submitted.",
    });
    
    navigate(`/accounts/${accountId}/reports`);
  };

  const renderField = (field: any) => {
    switch (field.type) {
      case 'select':
        return (
          <Select
            value={formData[field.name] || ""}
            onValueChange={(value) => handleInputChange(field.name, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'textarea':
        return (
          <Textarea
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            rows={4}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
      default:
        return (
          <Input
            type={field.type}
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.type === 'date' || field.type === 'time' ? '' : `Enter ${field.label.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/accounts/${accountId}/reports`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft} className="gap-2">
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button onClick={handleSubmitReport} className="gap-2">
            <Send className="h-4 w-4" />
            Submit Report
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
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {template.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {renderField(field)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}