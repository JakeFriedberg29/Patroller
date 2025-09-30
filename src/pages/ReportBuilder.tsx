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
import { ChevronLeft, Loader2, Plus, Trash2, Eye, Edit, Minus, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ReportDivider } from "@/components/ReportDivider";
import { ReportPageBreak } from "@/components/ReportPageBreak";
import { ReportFieldPreview } from "@/components/ReportFieldPreview";
import { getValidNextStates, type ReportStatus } from "@/utils/statusTransitions";

type FieldType = 'short_answer' | 'paragraph' | 'date' | 'checkbox' | 'dropdown' | 'file_upload' | 'divider' | 'page_break';

type FieldRow = { 
  id: string; 
  name: string; 
  type: FieldType;
  required: boolean;
  options?: string[];
  multiSelect?: boolean; // for dropdown fields
  label?: string; // for divider/page_break elements
};

export default function ReportBuilder() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const { profile } = useUserProfile();
  const { toast } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [status, setStatus] = useState<'draft' | 'ready' | 'published' | 'unpublished'>("draft");
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [fieldRows, setFieldRows] = useState<FieldRow[]>([]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      if (!templateId || templateId === 'new') {
        // Create mode
        setName("");
        setDescription("");
        setFieldRows([]);
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
            label: f.label || ''
          }))
        : [];
      setFieldRows(rows);
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
      label: ''
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
      label: r.label || ''
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
      } else {
        const { error } = await supabase
          .from('report_templates')
          .update({ name: name.trim(), description: description.trim() || null, template_schema: schema as any, status: status })
          .eq('id', templateId);
        if (error) throw error;
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
            onClick={() => setIsPreviewMode(!isPreviewMode)}
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

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Report Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Incident Report" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this report template" />
            </div>
          </div>

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
              {fieldRows.map((row, index) => {
                if (isPreviewMode) {
                  // Preview mode - show how patrollers will see it
                  if (row.type === 'divider') {
                    return <ReportDivider key={row.id} label={row.label} isPreview />;
                  }
                  if (row.type === 'page_break') {
                    return <ReportPageBreak key={row.id} label={row.label} isPreview />;
                  }
                  return (
                    <div key={row.id} className="p-4 border rounded-lg bg-muted/10">
                      <ReportFieldPreview field={row} />
                    </div>
                  );
                }

                // Edit mode - show configuration
                return (
                  <div key={row.id} className="space-y-4">
                    {row.type === 'divider' ? (
                      <div className="relative">
                        <ReportDivider 
                          label={row.label} 
                          onLabelChange={(label) => updateFieldRow(row.id, { label })} 
                        />
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
                      <div className="space-y-4 p-4 border rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        </div>

                        <div className="flex items-center space-x-2">
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
                          <div className="space-y-3">
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
                          <div className="space-y-2">
                            <Label>Options (one per line)</Label>
                            <Textarea
                              placeholder="Option 1&#10;Option 2&#10;Option 3"
                              value={row.options?.join('\n') || ''}
                              onChange={(e) => updateFieldRow(row.id, { options: e.target.value.split('\n').filter(opt => opt.trim()) })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.stopPropagation();
                                }
                              }}
                              rows={4}
                            />
                          </div>
                        )}

                        <div className="flex justify-end">
                          <Button variant="ghost" size="sm" onClick={() => removeFieldRow(row.id)} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Add Field button after each field in edit mode */}
                    {!isPreviewMode && (
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
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


