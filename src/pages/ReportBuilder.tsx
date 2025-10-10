import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronLeft, Loader2, Plus, Trash2, Eye, Edit, Minus, FileText, ChevronRight, GripVertical } from "lucide-react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ReportDivider } from "@/components/ReportDivider";
import { ReportPageBreak } from "@/components/ReportPageBreak";
import { ReportFieldPreview } from "@/components/ReportFieldPreview";
import { getValidNextStates, type ReportStatus } from "@/utils/statusTransitions";

type FieldType = 'short_answer' | 'paragraph' | 'date' | 'checkbox' | 'dropdown' | 'file_upload' | 'divider' | 'page_break';
type FieldWidth = '1/3' | '1/2' | 'full';

type FieldRow = { 
  id: string; 
  name: string; 
  type: FieldType;
  required: boolean;
  options?: string[];
  multiSelect?: boolean; // for dropdown fields
  label?: string; // for divider/page_break elements
  width?: FieldWidth; // layout width for the field
};

// Sortable field item component
function SortableFieldItem({ 
  row, 
  index,
  updateFieldRow, 
  removeFieldRow,
  addFieldRow 
}: { 
  row: FieldRow; 
  index: number;
  updateFieldRow: (id: string, patch: Partial<FieldRow>) => void;
  removeFieldRow: (id: string) => void;
  addFieldRow: (type: FieldType, insertAfterIndex?: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-4">
      {row.type === 'divider' ? (
        <div className="relative">
          <ReportDivider 
            label={row.label} 
            onLabelChange={(label) => updateFieldRow(row.id, { label })} 
          />
          <div className="absolute top-2 left-2 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => removeFieldRow(row.id)} 
            className="absolute top-2 right-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : row.type === 'page_break' ? (
        <div className="relative">
          <ReportPageBreak 
            label={row.label} 
            onLabelChange={(label) => updateFieldRow(row.id, { label })} 
          />
          <div className="absolute top-2 left-2 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => removeFieldRow(row.id)} 
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
                onChange={(e) => updateFieldRow(row.id, { name: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label>Field Type</Label>
              <Select value={row.type} onValueChange={(v) => updateFieldRow(row.id, { type: v as FieldType })}>
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
              <Select value={row.width || 'full'} onValueChange={(v) => updateFieldRow(row.id, { width: v as FieldWidth })}>
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
              onCheckedChange={(checked) => updateFieldRow(row.id, { required: Boolean(checked) })} 
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
                onValueChange={(value) => updateFieldRow(row.id, { multiSelect: value === "multi" })}
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
                onChange={(e) => updateFieldRow(row.id, { options: e.target.value.split('\n') })}
                rows={4}
              />
            </div>
          )}

          <div className="flex justify-end pl-8">
            <Button variant="ghost" size="sm" onClick={() => removeFieldRow(row.id)} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      )}

      {/* Add Field button after each field */}
      <div className="flex justify-center py-2">
        <Select onValueChange={(type) => addFieldRow(type as FieldType, index)}>
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
}

export default function ReportBuilder() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const { profile } = useUserProfile();
  const { toast } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [status, setStatus] = useState<'draft' | 'ready' | 'published' | 'unpublished' | 'archive'>("draft");
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [fieldRows, setFieldRows] = useState<FieldRow[]>([]);
  const [availableSubtypes, setAvailableSubtypes] = useState<string[]>([]);
  const [selectedSubtypes, setSelectedSubtypes] = useState<string[]>([]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFieldRows((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const loadTemplate = async () => {
    try {
      setLoading(true);
      
      // Load available organization subtypes
      const tenantId = profile?.profileData?.tenant_id;
      if (tenantId) {
        const { data: subtypes } = await supabase
          .from('organization_subtypes')
          .select('name')
          .eq('tenant_id', tenantId)
          .eq('is_active', true)
          .order('name', { ascending: true });
        setAvailableSubtypes((subtypes || []).map((s: any) => s.name));
      }
      
      if (!templateId || templateId === 'new') {
        // Create mode
        setName("");
        setDescription("");
        setFieldRows([]);
        setSelectedSubtypes([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('report_templates')
        .select('id,name,description,template_schema,status')
        .eq('id', templateId)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        toast({ title: 'Not found', description: 'Template not found', variant: 'destructive' });
        navigate('/repository');
        return;
      }
      setName(data.name || "");
      setDescription((data.description as string) || "");
      setStatus((data as any).status || 'draft');
      const schema = (data as any).template_schema as any;
      const rows: FieldRow[] = Array.isArray(schema?.fields)
        ? schema.fields.map((f: any) => ({ 
            id: crypto.randomUUID(), 
            name: String(f.name || ''), 
            type: (f.type === 'single_select' || f.type === 'multi_select') ? 'dropdown' : (f.type || 'short_answer') as FieldType,
            required: Boolean(f.required || false),
            options: f.options || [],
            multiSelect: f.type === 'multi_select' || f.multiSelect,
            label: f.label || '',
            width: f.width || 'full'
          }))
        : [];
      setFieldRows(rows);
      
      // Load existing assignments
      if (tenantId) {
        const { data: assignments } = await supabase
          .from('repository_assignments')
          .select('target_organization_subtype_id')
          .eq('tenant_id', tenantId)
          .eq('element_type', 'report_template')
          .eq('element_id', templateId)
          .eq('target_type', 'organization_type');
        
        const subtypeIds = (assignments || [])
          .map((a: any) => a.target_organization_subtype_id)
          .filter(Boolean);
        
        if (subtypeIds.length > 0) {
          const { data: subtypeNames } = await supabase
            .from('organization_subtypes')
            .select('name')
            .eq('tenant_id', tenantId)
            .in('id', subtypeIds as any);
          setSelectedSubtypes((subtypeNames || []).map((s: any) => s.name));
        }
      }
    } catch (e: any) {
      toast({ title: 'Error', description: 'Failed to load template', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (templateId) loadTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  const addFieldRow = (type: FieldType = 'short_answer', insertAfterIndex?: number) => {
    const newField: FieldRow = { 
      id: crypto.randomUUID(), 
      name: type === 'divider' ? '' : type === 'page_break' ? '' : '', 
      type, 
      required: false, 
      options: [],
      multiSelect: false,
      label: '',
      width: 'full'
    };
    
    if (insertAfterIndex !== undefined) {
      setFieldRows(prev => {
        const newRows = [...prev];
        newRows.splice(insertAfterIndex + 1, 0, newField);
        return newRows;
      });
    } else {
      setFieldRows(prev => [...prev, newField]);
    }
  };
  const updateFieldRow = (id: string, patch: Partial<FieldRow>) => {
    setFieldRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  };
  const removeFieldRow = (id: string) => {
    setFieldRows(prev => prev.filter(r => r.id !== id));
  };

  // Split fields into pages based on page_break positions
  const pages = useMemo(() => {
    const result: FieldRow[][] = [[]];
    let currentPageIndex = 0;

    fieldRows.forEach((field) => {
      if (field.type === 'page_break') {
        // Start a new page
        currentPageIndex++;
        result[currentPageIndex] = [];
      } else {
        result[currentPageIndex].push(field);
      }
    });

    return result;
  }, [fieldRows]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: 'Name required', description: 'Please provide a report name.', variant: 'destructive' });
      return;
    }
    
    // Ensure profile is loaded before proceeding
    if (!profile?.profileData?.user_id && (!templateId || templateId === 'new')) {
      toast({ title: 'Please wait', description: 'Loading user profile...', variant: 'destructive' });
      return;
    }
    const schema = { fields: fieldRows.map(r => ({ 
      name: r.name.trim(), 
      type: r.type === 'dropdown' ? (r.multiSelect ? 'multi_select' : 'single_select') : r.type, 
      required: r.required,
      options: r.options?.filter(opt => opt.trim()) || [],
      multiSelect: r.multiSelect,
      label: r.label || '',
      width: r.width || 'full'
    })) };
    setSaving(true);
    try {
      if (!templateId || templateId === 'new') {
        // Insert new template in current tenant
        const tenantId = profile?.profileData?.tenant_id;
        const createdBy = profile?.profileData?.user_id || null;
        
        // Validate required fields before insert
        if (!tenantId) {
          console.error('Missing tenant_id. Profile:', profile);
          throw new Error('Unable to determine tenant ID. Please refresh and try again.');
        }
        
        console.log('Inserting report template:', { 
          name: name.trim(), 
          tenantId, 
          createdBy, 
          status,
          fieldCount: fieldRows.length 
        });
        
        const { data, error } = await supabase
          .from('report_templates')
          .insert({
            name: name.trim(),
            description: description.trim() || null,
            template_schema: schema as any,
            is_active: true,
            status: status,
            tenant_id: tenantId,
            organization_id: null,
            created_by: createdBy,
          })
          .select();
        
        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        console.log('Successfully inserted report template:', data);
        
        // Save organization subtype assignments for new template
        if (data && data[0]?.id && selectedSubtypes.length > 0) {
          const newTemplateId = data[0].id;
          
          // Get subtype IDs
          const { data: subtypeData } = await supabase
            .from('organization_subtypes')
            .select('id, name')
            .eq('tenant_id', tenantId)
            .in('name', selectedSubtypes as any);
          
          const assignments = (subtypeData || []).map((subtype: any) => ({
            tenant_id: tenantId,
            element_type: 'report_template' as const,
            element_id: newTemplateId,
            target_type: 'organization_type' as const,
            target_organization_subtype_id: subtype.id,
          }));
          
          if (assignments.length > 0) {
            const { error: assignError } = await supabase
              .from('repository_assignments')
              .insert(assignments);
            
            if (assignError) {
              console.error('Assignment error:', assignError);
              // Don't fail the whole operation, just log it
            }
          }
        }
      } else {
        const { error } = await supabase
          .from('report_templates')
          .update({ name: name.trim(), description: description.trim() || null, template_schema: schema as any, status: status })
          .eq('id', templateId);
        if (error) throw error;
        
        // Update organization subtype assignments for existing template
        const tenantId = profile?.profileData?.tenant_id;
        if (tenantId) {
          // Delete existing assignments
          await supabase
            .from('repository_assignments')
            .delete()
            .eq('tenant_id', tenantId)
            .eq('element_type', 'report_template')
            .eq('element_id', templateId)
            .eq('target_type', 'organization_type');
          
          // Insert new assignments
          if (selectedSubtypes.length > 0) {
            const { data: subtypeData } = await supabase
              .from('organization_subtypes')
              .select('id, name')
              .eq('tenant_id', tenantId)
              .in('name', selectedSubtypes as any);
            
            const assignments = (subtypeData || []).map((subtype: any) => ({
              tenant_id: tenantId,
              element_type: 'report_template' as const,
              element_id: templateId,
              target_type: 'organization_type' as const,
              target_organization_subtype_id: subtype.id,
            }));
            
            if (assignments.length > 0) {
              await supabase
                .from('repository_assignments')
                .insert(assignments);
            }
          }
        }
      }
      toast({ title: 'Report saved', description: 'Changes saved successfully.' });
      navigate('/repository');
    } catch (e: any) {
      console.error('Save error:', e);
      let errorMsg = 'Could not save the report. Please try again.';
      
      // Handle specific error types
      if (e?.message?.includes('duplicate key') || e?.code === '23505') {
        errorMsg = `A report with the name "${name.trim()}" already exists. Please choose a different name.`;
      } else if (e?.message) {
        errorMsg = e.message;
      } else if (e?.hint) {
        errorMsg = e.hint;
      }
      
      toast({ title: 'Save failed', description: errorMsg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (next: 'draft' | 'ready' | 'published' | 'unpublished' | 'archive') => {
    try {
      setStatus(next);
      if (templateId && templateId !== 'new') {
        // Direct update using RLS policies
        const { error } = await supabase
          .from('report_templates')
          .update({ status: next })
          .eq('id', templateId);
        
        if (error) {
          console.error('Status update error:', error);
          throw error;
        }
        
        toast({ title: 'Status updated', description: `Report set to ${next}.` });
      }
    } catch (e: any) {
      console.error('Status change error:', e);
      let errorMsg = 'Could not update status.';
      
      if (e?.message?.includes('Invalid status transition')) {
        errorMsg = `Invalid status change. ${e.message}`;
      } else if (e?.message) {
        errorMsg = `Update failed: ${e.message}`;
      }
      
      toast({ title: 'Update failed', description: errorMsg, variant: 'destructive' });
    }
  };

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
            onClick={() => {
              setIsPreviewMode(!isPreviewMode);
              setCurrentPage(0); // Reset to first page when toggling preview
            }}
            className="gap-2"
          >
            {isPreviewMode ? <Edit className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {isPreviewMode ? "Edit" : "Preview"}
          </Button>
          <Select value={status} onValueChange={(v) => handleStatusChange(v as any)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
              {getValidNextStates(status as ReportStatus).map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => navigate('/repository')} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
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
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Incident Report" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this report template" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Assign to Organization Subtypes</Label>
                <p className="text-sm text-muted-foreground">Select which organization subtypes can access this report</p>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 border rounded-lg">
                  {availableSubtypes.length === 0 ? (
                    <p className="text-sm text-muted-foreground col-span-2">No organization subtypes available</p>
                  ) : (
                    availableSubtypes.map((subtype) => (
                      <div key={subtype} className="flex items-center space-x-2">
                        <Checkbox
                          id={`subtype-${subtype}`}
                          checked={selectedSubtypes.includes(subtype)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSubtypes([...selectedSubtypes, subtype]);
                            } else {
                              setSelectedSubtypes(selectedSubtypes.filter(s => s !== subtype));
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
              {!isPreviewMode && fieldRows.length === 0 && (
                <Button variant="outline" size="sm" className="gap-2" onClick={() => addFieldRow()}>
                  <Plus className="h-4 w-4" /> Add First Field
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {fieldRows.length === 0 && (
                <div className="text-sm text-muted-foreground">No form elements configured.</div>
              )}
              {isPreviewMode ? (
                // Preview mode - show with layout and pagination
                <div className="space-y-6">
                  {/* Show report name and description only on first page */}
                  {currentPage === 0 && (
                    <div className="p-6 border rounded-lg bg-muted/5 space-y-3">
                      <h2 className="text-2xl font-semibold">{name || "Untitled Report"}</h2>
                      {description && (
                        <p className="text-muted-foreground">{description}</p>
                      )}
                    </div>
                  )}
                  
                  {pages.length > 1 && (
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="text-sm text-muted-foreground">
                        Step {currentPage + 1} of {pages.length}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                          disabled={currentPage === 0}
                          className="gap-2"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Back
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(pages.length - 1, prev + 1))}
                          disabled={currentPage === pages.length - 1}
                          className="gap-2"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4">
                    {pages[currentPage]?.map((row) => {
                      if (row.type === 'divider') {
                        return <div key={row.id} className="w-full"><ReportDivider label={row.label} isPreview /></div>;
                      }
                      
                      const widthClass = row.width === '1/3' ? 'w-full md:w-[calc(33.333%-0.67rem)]' : 
                                         row.width === '1/2' ? 'w-full md:w-[calc(50%-0.5rem)]' : 
                                         'w-full';
                      
                      return (
                        <div key={row.id} className={`${widthClass} p-4 border rounded-lg bg-muted/10`}>
                          <ReportFieldPreview field={row} />
                        </div>
                      );
                    })}
                  </div>
                  {pages.length > 1 && (
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                        disabled={currentPage === 0}
                        className="gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        variant="default"
                        onClick={() => setCurrentPage(prev => Math.min(pages.length - 1, prev + 1))}
                        disabled={currentPage === pages.length - 1}
                        className="gap-2"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                // Edit mode - show configuration with drag-and-drop
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={fieldRows.map(row => row.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {fieldRows.map((row, index) => (
                      <SortableFieldItem
                        key={row.id}
                        row={row}
                        index={index}
                        updateFieldRow={updateFieldRow}
                        removeFieldRow={removeFieldRow}
                        addFieldRow={addFieldRow}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


