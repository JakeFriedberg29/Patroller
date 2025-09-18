import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";

type FieldRow = { id: string; name: string; type: 'text' | 'date' };

export default function ReportBuilder() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const { profile } = useUserProfile();
  const { toast } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [status, setStatus] = useState<'draft' | 'ready' | 'published' | 'unpublished'>("draft");

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
        ? schema.fields.map((f: any) => ({ id: crypto.randomUUID(), name: String(f.name || ''), type: (f.type === 'date' ? 'date' : 'text') as 'text' | 'date' }))
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

  const addFieldRow = () => {
    setFieldRows(prev => [...prev, { id: crypto.randomUUID(), name: "", type: 'text' }]);
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
    const schema = { fields: fieldRows.map(r => ({ name: r.name.trim(), type: r.type })) };
    setSaving(true);
    try {
      if (!templateId || templateId === 'new') {
        // Insert new template in current tenant
        const { data: prof } = await supabase
          .from('users')
          .select('id, tenant_id')
          .eq('id', profile?.profileData?.user_id || '')
          .maybeSingle();
        const tenantId = prof?.tenant_id || profile?.profileData?.tenant_id;
        const createdBy = profile?.profileData?.user_id || null;
        const { error } = await supabase
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
          });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('report_templates')
          .update({ name: name.trim(), description: description.trim() || null, template_schema: schema as any, status: status })
          .eq('id', templateId);
        if (error) throw error;
      }
      toast({ title: 'Report updated', description: 'Changes saved successfully.' });
      navigate('/repository');
    } catch (e: any) {
      toast({ title: 'Update failed', description: 'Could not update the report.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (next: 'draft' | 'ready' | 'published' | 'unpublished') => {
    try {
      setStatus(next);
      if (templateId && templateId !== 'new') {
        const { data, error } = await supabase.rpc('set_report_template_status' as any, {
          p_template_id: templateId,
          p_status: next,
        });
        const ok = (data as any)?.success !== false;
        if (error || !ok) throw error || new Error((data as any)?.error || 'update_failed');
        toast({ title: 'Status updated', description: `Report set to ${next}.` });
      }
    } catch (e: any) {
      toast({ title: 'Update failed', description: 'Could not update status.', variant: 'destructive' });
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
          <Select value={status} onValueChange={(v) => handleStatusChange(v as any)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="unpublished">Unpublished</SelectItem>
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
              <Label>Fields</Label>
              <Button variant="outline" size="sm" className="gap-2" onClick={addFieldRow}>
                <Plus className="h-4 w-4" /> Add Field
              </Button>
            </div>
            <div className="space-y-2">
              {fieldRows.length === 0 && (
                <div className="text-sm text-muted-foreground">No fields configured.</div>
              )}
              {fieldRows.map(row => (
                <div key={row.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
                  <div className="md:col-span-3">
                    <Input placeholder="Field name" value={row.name} onChange={(e) => updateFieldRow(row.id, { name: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <Select value={row.type} onValueChange={(v) => updateFieldRow(row.id, { type: v as 'text' | 'date' })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date Selector</SelectItem>
                        <SelectItem value="text">Input Field</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    <Button variant="ghost" size="icon" onClick={() => removeFieldRow(row.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


