import { Calendar, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type FieldType = 'short_answer' | 'paragraph' | 'date' | 'checkbox' | 'dropdown' | 'file_upload' | 'divider' | 'page_break';

interface FieldRow {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  multiSelect?: boolean;
  label?: string; // for divider/page_break
}

interface ReportFieldPreviewProps {
  field: FieldRow;
}

export function ReportFieldPreview({ field }: ReportFieldPreviewProps) {
  const renderField = () => {
    switch (field.type) {
      case 'short_answer':
        return (
          <div className="space-y-2">
            <Input placeholder="Enter your response..." />
            <Input placeholder="Second line..." />
          </div>
        );

      case 'paragraph':
        return (
          <Textarea 
            placeholder="Enter detailed response..." 
            rows={5}
            className="resize-y"
          />
        );

      case 'date':
        return (
          <div className="relative">
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal text-muted-foreground"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Pick a date
            </Button>
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox id={`${field.id}-${index}`} />
                <Label htmlFor={`${field.id}-${index}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'dropdown':
        if (field.multiSelect) {
          return (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Multi-select dropdown</div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select multiple options..." />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option, index) => (
                    <SelectItem key={index} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        } else {
          return (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Single-select dropdown</div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select an option..." />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option, index) => (
                    <SelectItem key={index} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

      case 'file_upload':
        return (
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
            <Button variant="outline" size="sm">
              Choose Files
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  if (field.type === 'divider' || field.type === 'page_break') {
    return null; // These are handled by their own components
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {field.name}
        {field.required && <span className="text-orange-500 ml-1">*</span>}
      </Label>
      {renderField()}
    </div>
  );
}