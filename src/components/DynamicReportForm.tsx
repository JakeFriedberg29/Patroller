import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FieldSchema {
  id: string;
  name: string;
  type: 'short_answer' | 'paragraph' | 'date' | 'checkbox' | 'dropdown' | 'divider' | 'page_break';
  required?: boolean;
  options?: string[];
  width?: 'full' | 'half';
}

interface TemplateSchema {
  fields: FieldSchema[];
}

interface DynamicReportFormProps {
  templateSchema: TemplateSchema;
  templateId: string;
  templateName: string;
  onSubmit: (formData: Record<string, any>) => Promise<void>;
  onCancel: () => void;
}

export function DynamicReportForm({ templateSchema, templateId, templateName, onSubmit, onCancel }: DynamicReportFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const validateForm = (): boolean => {
    const requiredFields = templateSchema.fields.filter(f => f.required);
    for (const field of requiredFields) {
      if (!formData[field.id] || formData[field.id] === '') {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FieldSchema) => {
    if (field.type === 'divider' || field.type === 'page_break') {
      return null;
    }

    const value = formData[field.id] || '';

    switch (field.type) {
      case 'short_answer':
        return (
          <div key={field.id} className={field.width === 'half' ? 'md:col-span-1' : 'col-span-2'}>
            <Label htmlFor={field.id}>
              {field.name}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              value={value}
              onChange={(e) => updateField(field.id, e.target.value)}
              required={field.required}
            />
          </div>
        );

      case 'paragraph':
        return (
          <div key={field.id} className="col-span-2">
            <Label htmlFor={field.id}>
              {field.name}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              value={value}
              onChange={(e) => updateField(field.id, e.target.value)}
              required={field.required}
              rows={4}
            />
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className={field.width === 'half' ? 'md:col-span-1' : 'col-span-2'}>
            <Label>
              {field.name}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !value && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value ? format(new Date(value), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={value ? new Date(value) : undefined}
                  onSelect={(date) => updateField(field.id, date?.toISOString())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      case 'dropdown':
        return (
          <div key={field.id} className={field.width === 'half' ? 'md:col-span-1' : 'col-span-2'}>
            <Label htmlFor={field.id}>
              {field.name}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select value={value} onValueChange={(val) => updateField(field.id, val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {(field.options || []).map((option, idx) => (
                  <SelectItem key={idx} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="col-span-2 space-y-2">
            <Label>
              {field.name}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {(field.options || []).map((option, idx) => {
                const checked = Array.isArray(value) ? value.includes(option) : false;
                return (
                  <div key={idx} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${field.id}-${idx}`}
                      checked={checked}
                      onCheckedChange={(isChecked) => {
                        const current = Array.isArray(value) ? value : [];
                        if (isChecked) {
                          updateField(field.id, [...current, option]);
                        } else {
                          updateField(field.id, current.filter((v: string) => v !== option));
                        }
                      }}
                    />
                    <label htmlFor={`${field.id}-${idx}`} className="text-sm cursor-pointer">
                      {option}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {templateSchema.fields.map(field => renderField(field))}
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </Button>
      </div>
    </form>
  );
}
