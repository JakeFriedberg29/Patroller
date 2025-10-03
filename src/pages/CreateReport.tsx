import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, ArrowLeft, Save, Send, ChevronLeft, ChevronRight, CalendarIcon, Upload } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { useReports } from "@/hooks/useReports";
import { ReportDivider } from "@/components/ReportDivider";
import { ReportPageBreak } from "@/components/ReportPageBreak";

export const reportTemplates = [
  {
    id: 1,
    name: "Incident Report",
    description: "Standard incident reporting form for emergency response situations",
    sections: [
      {
        name: "Incident Information",
        fields: [
          { name: "incidentId", label: "Incident ID / Report #", type: "text", required: true, placeholder: "Auto-generated", disabled: true },
          { name: "incidentDate", label: "Date of Incident", type: "date", required: true },
          { name: "incidentTime", label: "Time of Incident", type: "time", required: true },
          { name: "locationAddress", label: "Location (Address)", type: "text", required: true },
          { name: "locationGPS", label: "GPS Coordinates", type: "text", required: false },
          { name: "facilityArea", label: "Facility/Area", type: "text", required: false },
          { name: "incidentType", label: "Type of Incident", type: "select", options: ["Injury", "Fire", "Behavioral", "Equipment Failure", "Near Miss", "Other"], required: true },
          { name: "severityLevel", label: "Severity Level", type: "select", options: ["Minor", "Moderate", "Severe", "Life-threatening"], required: true },
          { name: "description", label: "Description / Narrative of Incident", type: "textarea", required: true },
          { name: "weatherConditions", label: "Weather / Environmental Conditions", type: "textarea", required: false }
        ]
      },
      {
        name: "People Involved",
        fields: [
          { name: "involvedNames", label: "Name(s)", type: "textarea", required: true },
          { name: "involvedRoles", label: "Role", type: "select", options: ["Patient", "Staff", "Visitor", "Bystander"], required: true },
          { name: "contactPhone", label: "Contact Phone", type: "text", required: false },
          { name: "contactEmail", label: "Contact Email", type: "email", required: false },
          { name: "contactAddress", label: "Contact Address", type: "textarea", required: false },
          { name: "ageDOB", label: "Age / DOB", type: "text", required: false },
          { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other", "Prefer not to say"], required: false },
          { name: "injuryIllness", label: "Injury/Illness?", type: "select", options: ["Yes", "No"], required: true },
          { name: "actionsTaken", label: "Actions Taken", type: "textarea", placeholder: "First aid, EMS activation, evacuation, etc.", required: true }
        ]
      },
      {
        name: "Patrollers / Witnesses",
        fields: [
          { name: "reportingPersonName", label: "Reporting Person Name", type: "text", required: true },
          { name: "reportingPersonRole", label: "Reporting Person Role", type: "text", required: true },
          { name: "reportingPersonContact", label: "Reporting Person Contact", type: "text", required: true },
          { name: "witnessNames", label: "Witness Name(s)", type: "textarea", required: false },
          { name: "witnessContact", label: "Witness Contact Info", type: "textarea", required: false },
          { name: "patrollerNames", label: "Patroller Name(s)", type: "textarea", required: false },
          { name: "patrollerAgency", label: "Patroller Agency", type: "text", required: false }
        ]
      },
      {
        name: "Follow-Up / Outcome",
        fields: [
          { name: "notifications", label: "Notifications Made", type: "textarea", placeholder: "Supervisor, safety officer, EMS, law enforcement", required: true },
          { name: "disposition", label: "Disposition", type: "select", options: ["Returned to activity", "Referred to EMS", "Transported", "Released", "Other"], required: true },
          { name: "correctiveActions", label: "Corrective Actions / Preventive Actions Logged", type: "textarea", required: false },
          { name: "followUpRequired", label: "Follow-Up Required", type: "select", options: ["Yes", "No"], required: true },
          { name: "status", label: "Status", type: "select", options: ["Open", "Closed", "Pending"], required: true }
        ]
      },
      {
        name: "Attachments",
        fields: [
          { name: "photoDocuments", label: "Photos / Documents Upload", type: "file", required: false },
          { name: "linkedReports", label: "Linked Reports", type: "textarea", placeholder: "Patient care report, injury log, etc.", required: false }
        ]
      },
      {
        name: "Administrative",
        fields: [
          { name: "reportCompletedBy", label: "Report Completed By", type: "text", required: true },
          { name: "reportReviewedBy", label: "Report Reviewed/Approved By", type: "text", required: false },
          { name: "dateSubmitted", label: "Date Submitted", type: "date", required: true }
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Patient Care Report",
    description: "Medical care documentation for patient treatment and transport",
    sections: [
      {
        name: "Patient Information",
        fields: [
          { name: "patientName", label: "Patient Name", type: "text", required: true },
          { name: "age", label: "Age", type: "number", required: true },
          { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"], required: true },
          { name: "chiefComplaint", label: "Chief Complaint", type: "textarea", required: true }
        ]
      },
      {
        name: "Medical Assessment",
        fields: [
          { name: "vitalSigns", label: "Vital Signs", type: "textarea", required: true },
          { name: "treatmentProvided", label: "Treatment Provided", type: "textarea", required: true },
          { name: "disposition", label: "Patient Disposition", type: "select", options: ["Transport to Hospital", "Refused Transport", "Released on Scene", "Other"], required: true }
        ]
      }
    ]
  }
  // Add more templates as needed
];

export default function CreateReport() {
  const { id: orgId, templateId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createReport, canSubmitReports } = useReports();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  
  const template = reportTemplates.find(t => t.id === Number(templateId)) || reportTemplates[0];
  const sections = template.sections || [];
  const currentSection = sections[currentStep] || { name: template.name, fields: [] };
  const totalSteps = sections.length;

  // Auto-generate incident ID for new reports
  useEffect(() => {
    if (template.id === 1 && !formData.incidentId) {
      const incidentId = `INC-${Date.now().toString().slice(-6)}`;
      setFormData(prev => ({ ...prev, incidentId }));
    }
  }, [template.id, formData.incidentId]);
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Validate current section before proceeding
    const missingFields = currentSection.fields
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

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft Saved",
      description: "Your report has been saved as a draft.",
    });
  };

  const handleSubmitReport = async () => {
    // Validate all required fields across all sections
    const allFields = sections.flatMap(section => section.fields);
    const missingFields = allFields
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

    if (!canSubmitReports) {
      toast({ title: "Permission Denied", description: "You cannot submit reports.", variant: "destructive" });
      return;
    }

    const success = await createReport({
      title: formData.incidentId ? `${template.name} ${formData.incidentId}` : template.name,
      description: formData.description || null,
      report_type: template.name,
      metadata: formData,
      template_id: String(template.id),
      account_scope: orgId ? { type: 'organization', id: orgId } : undefined,
    });

    if (success) {
      navigate(`/organization/${orgId}/reports`);
    }
  };

  const renderField = (field: any) => {
    const commonProps = {
      disabled: field.disabled || false,
      placeholder: field.placeholder || (field.type === 'date' || field.type === 'time' ? '' : `Enter ${field.label.toLowerCase()}`)
    };

    // Handle dividers and page breaks
    if (field.type === 'divider') {
      return <ReportDivider label={field.label} isPreview />;
    }
    if (field.type === 'page_break') {
      return <ReportPageBreak label={field.label} isPreview />;
    }

    switch (field.type) {
      case 'dropdown':
        if (field.multiSelect) {
          // Multi-select dropdown rendered as checkboxes
          return (
            <div className="space-y-2">
              {field.options?.map((option: string) => {
                const currentValues = formData[field.name] ? formData[field.name].split(',') : [];
                const isChecked = currentValues.includes(option);
                
                return (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${field.name}-${option}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        let newValues = [...currentValues];
                        if (checked) {
                          newValues.push(option);
                        } else {
                          newValues = newValues.filter(v => v !== option);
                        }
                        handleInputChange(field.name, newValues.join(','));
                      }}
                      disabled={commonProps.disabled}
                    />
                    <Label htmlFor={`${field.name}-${option}`}>{option}</Label>
                  </div>
                );
              })}
            </div>
          );
        } else {
          // Single-select dropdown
          return (
            <Select
              value={formData[field.name] || ""}
              onValueChange={(value) => handleInputChange(field.name, value)}
              disabled={commonProps.disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
      case 'select':
      case 'single_select':
        return (
          <Select
            value={formData[field.name] || ""}
            onValueChange={(value) => handleInputChange(field.name, value)}
            disabled={commonProps.disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'multi_select':
        return (
          <div className="space-y-2">
            {field.options?.map((option: string) => {
              const currentValues = formData[field.name] ? formData[field.name].split(',') : [];
              const isChecked = currentValues.includes(option);
              
              return (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.name}-${option}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      let newValues = [...currentValues];
                      if (checked) {
                        newValues.push(option);
                      } else {
                        newValues = newValues.filter(v => v !== option);
                      }
                      handleInputChange(field.name, newValues.join(','));
                    }}
                    disabled={commonProps.disabled}
                  />
                  <Label htmlFor={`${field.name}-${option}`}>{option}</Label>
                </div>
              );
            })}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option: string) => {
              const currentValues = formData[field.name] ? formData[field.name].split(',') : [];
              const isChecked = currentValues.includes(option);
              
              return (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.name}-${option}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      let newValues = [...currentValues];
                      if (checked) {
                        newValues.push(option);
                      } else {
                        newValues = newValues.filter(v => v !== option);
                      }
                      handleInputChange(field.name, newValues.join(','));
                    }}
                    disabled={commonProps.disabled}
                  />
                  <Label htmlFor={`${field.name}-${option}`}>{option}</Label>
                </div>
              );
            })}
          </div>
        );
      case 'textarea':
      case 'paragraph':
        return (
          <Textarea
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={commonProps.placeholder}
            rows={5}
            className="resize-y"
            disabled={commonProps.disabled}
          />
        );
      case 'date':
        const selectedDate = formData[field.name] ? new Date(formData[field.name]) : undefined;
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
                disabled={commonProps.disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    handleInputChange(field.name, format(date, "yyyy-MM-dd"));
                  }
                }}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        );
      case 'file':
      case 'file_upload':
        return (
          <div className="space-y-3">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleInputChange(field.name, file.name);
                  }
                }}
                multiple
                accept="image/*,application/pdf,.doc,.docx"
                disabled={commonProps.disabled}
                className="hidden"
                id={`file-${field.name}`}
              />
              <Label htmlFor={`file-${field.name}`} className="cursor-pointer">
                <Button variant="outline" size="sm" disabled={commonProps.disabled} asChild>
                  <span>Choose Files</span>
                </Button>
              </Label>
            </div>
          </div>
        );
      case 'number':
        return (
          <Input
            type="number"
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={commonProps.placeholder}
            disabled={commonProps.disabled}
          />
        );
      case 'short_answer':
        return (
          <div className="space-y-2">
            <Input
              type="text"
              value={formData[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={commonProps.placeholder}
              disabled={commonProps.disabled}
            />
            <Input
              type="text"
              value={formData[field.name + '_line2'] || ""}
              onChange={(e) => handleInputChange(field.name + '_line2', e.target.value)}
              placeholder="Second line (optional)"
              disabled={commonProps.disabled}
            />
          </div>
        );
      default:
        return (
          <Input
            type={field.type}
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={commonProps.placeholder}
            disabled={commonProps.disabled}
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
            onClick={() => navigate(`/organization/${orgId}/reports`)}
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
          {currentStep === totalSteps - 1 ? (
            <Button onClick={handleSubmitReport} className="gap-2">
              <Send className="h-4 w-4" />
              Submit Report
            </Button>
          ) : null}
        </div>
      </div>

      {totalSteps > 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Step {currentStep + 1} of {totalSteps}: {currentSection.name}
            </h2>
            <span className="text-sm text-muted-foreground">
              {Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete
            </span>
          </div>
          <Progress value={((currentStep + 1) / totalSteps) * 100} className="w-full" />
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>{totalSteps > 1 ? currentSection.name : template.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {totalSteps > 1 ? `Section ${currentStep + 1} of ${totalSteps}` : template.description}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-4">
            {currentSection.fields.map((field) => {
              // Skip rendering name/label for structural elements
              if (field.type === 'divider' || field.type === 'page_break') {
                return (
                  <div key={field.name} className="w-full">
                    {renderField(field)}
                  </div>
                );
              }

              // Determine width class based on field.width property
              const width = (field as any).width || 'full';
              const widthClass = width === '1/3' ? 'w-full md:w-[calc(33.333%-0.67rem)]' : 
                                 width === '1/2' ? 'w-full md:w-[calc(50%-0.5rem)]' : 
                                 'w-full';

              return (
                <div key={field.name} className={`${widthClass} space-y-2`}>
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-orange-500 ml-1">*</span>}
                  </Label>
                  {renderField(field)}
                </div>
              );
            })}
          </div>

          {totalSteps > 1 && (
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              {currentStep < totalSteps - 1 ? (
                <Button onClick={handleNext} className="gap-2">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmitReport} className="gap-2">
                  <Send className="h-4 w-4" />
                  Submit Report
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}