import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, GripVertical } from "lucide-react";
import { ReportDivider } from "@/components/ReportDivider";
import { ReportPageBreak } from "@/components/ReportPageBreak";
import { memo, useCallback, useMemo } from "react";

export type FieldType = 'short_answer' | 'paragraph' | 'date' | 'checkbox' | 'dropdown' | 'file_upload' | 'divider' | 'page_break';
export type FieldWidth = '1/3' | '1/2' | 'full';

export type FieldRow = { 
  id: string; 
  name: string; 
  type: FieldType;
  required: boolean;
  options?: string[];
  multiSelect?: boolean;
  label?: string;
  width?: FieldWidth;
};

interface FieldEditorProps {
  row: FieldRow;
  index: number;
  updateFieldRow: (id: string, patch: Partial<FieldRow>) => void;
  removeFieldRow: (id: string) => void;
  addFieldRow: (type: FieldType, insertAfterIndex?: number) => void;
}

export const FieldEditor = memo(function FieldEditor({ 
  row, 
  index,
  updateFieldRow, 
  removeFieldRow,
  addFieldRow 
}: FieldEditorProps) {
  // Memoize sortable config
  const sortableConfig = useMemo(() => ({ id: row.id }), [row.id]);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable(sortableConfig);

  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }), [transform, transition, isDragging]);

  // Memoize callbacks
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateFieldRow(row.id, { name: e.target.value });
  }, [row.id, updateFieldRow]);

  const handleTypeChange = useCallback((v: string) => {
    updateFieldRow(row.id, { type: v as FieldType });
  }, [row.id, updateFieldRow]);

  const handleWidthChange = useCallback((v: string) => {
    updateFieldRow(row.id, { width: v as FieldWidth });
  }, [row.id, updateFieldRow]);

  const handleRequiredChange = useCallback((checked: boolean) => {
    updateFieldRow(row.id, { required: checked });
  }, [row.id, updateFieldRow]);

  const handleLabelChange = useCallback((label: string) => {
    updateFieldRow(row.id, { label });
  }, [row.id, updateFieldRow]);

  const handleRemove = useCallback(() => {
    removeFieldRow(row.id);
  }, [row.id, removeFieldRow]);

  const handleMultiSelectChange = useCallback((value: string) => {
    updateFieldRow(row.id, { multiSelect: value === "multi" });
  }, [row.id, updateFieldRow]);

  const handleOptionsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateFieldRow(row.id, { options: e.target.value.split('\n') });
  }, [row.id, updateFieldRow]);

  const handleAddField = useCallback((type: string) => {
    addFieldRow(type as FieldType, index);
  }, [addFieldRow, index]);

  return (
    <div ref={setNodeRef} style={style} className="space-y-4">
      {row.type === 'divider' ? (
        <div className="relative">
          <ReportDivider 
            label={row.label} 
            onLabelChange={handleLabelChange} 
          />
          <div className="absolute top-2 left-2 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRemove} 
            className="absolute top-2 right-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : row.type === 'page_break' ? (
        <div className="relative">
          <ReportPageBreak 
            label={row.label} 
            onLabelChange={handleLabelChange} 
          />
          <div className="absolute top-2 left-2 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRemove} 
            className="absolute top-2 right-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-4 p-4 border rounded-lg relative">
          <div className="absolute top-2 left-2 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-8">
            <div className="space-y-2">
              <Label>
                Field Name
                {row.required && <span className="text-orange-500 ml-1">*</span>}
              </Label>
              <Input 
                placeholder="Enter field name" 
                value={row.name} 
                onChange={handleNameChange} 
              />
            </div>
            <div className="space-y-2">
              <Label>Field Type</Label>
              <Select value={row.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select field type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short_answer">Short Answer</SelectItem>
                  <SelectItem value="paragraph">Paragraph</SelectItem>
                  <SelectItem value="date">Date Selector</SelectItem>
                  <SelectItem value="dropdown">Dropdown</SelectItem>
                  <SelectItem value="checkbox">Checkboxes</SelectItem>
                  <SelectItem value="file_upload">File Upload</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Field Width</Label>
              <Select value={row.width || 'full'} onValueChange={handleWidthChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select width" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Width</SelectItem>
                  <SelectItem value="1/2">Half Width (1/2)</SelectItem>
                  <SelectItem value="1/3">Third Width (1/3)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2 pl-8">
            <Checkbox 
              id={`required-${row.id}`}
              checked={row.required} 
              onCheckedChange={handleRequiredChange} 
            />
            <Label htmlFor={`required-${row.id}`} className="text-sm">
              Required field
            </Label>
          </div>

          {row.type === 'dropdown' && (
            <div className="space-y-3 pl-8">
              <Label>Selection Type</Label>
              <RadioGroup 
                value={row.multiSelect ? "multi" : "single"} 
                onValueChange={handleMultiSelectChange}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id={`single-${row.id}`} />
                  <Label htmlFor={`single-${row.id}`}>Single select</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="multi" id={`multi-${row.id}`} />
                  <Label htmlFor={`multi-${row.id}`}>Multi-select</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {(row.type === 'dropdown' || row.type === 'checkbox') && (
            <div className="space-y-2 pl-8">
              <Label>Options (one per line)</Label>
              <Textarea
                placeholder="Option 1&#10;Option 2&#10;Option 3"
                value={row.options?.join('\n') || ''}
                onChange={handleOptionsChange}
                rows={4}
              />
            </div>
          )}

          <div className="flex justify-end pl-8">
            <Button variant="ghost" size="sm" onClick={handleRemove} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      )}

      {/* Add Field button after each field */}
      <div className="flex justify-center py-2">
        <Select onValueChange={handleAddField}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="+ Add Field" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="short_answer">Short Answer</SelectItem>
            <SelectItem value="paragraph">Paragraph</SelectItem>
            <SelectItem value="date">Date Selector</SelectItem>
            <SelectItem value="dropdown">Dropdown</SelectItem>
            <SelectItem value="checkbox">Checkboxes</SelectItem>
            <SelectItem value="file_upload">File Upload</SelectItem>
            <SelectItem value="divider">Section Divider</SelectItem>
            <SelectItem value="page_break">Page Break</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});
