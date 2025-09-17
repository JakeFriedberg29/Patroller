import { useEffect, useState } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePermissions } from "@/hooks/usePermissions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, Plus, Trash2, Loader2, Layers as LayersIcon, ChevronRight, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Constants } from "@/integrations/supabase/types";

export default function Repository() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useUserProfile();
  const { isPlatformAdmin } = usePermissions();
  const tenantId = profile?.profileData?.tenant_id as string | undefined;

  const [platformTemplates, setPlatformTemplates] = useState<Array<{ id: string; name: string; description: string | null }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Add Report dialog state
  type FieldRow = { id: string; name: string; type: 'text' | 'date' };
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [newReportName, setNewReportName] = useState<string>("");
  const [newReportDescription, setNewReportDescription] = useState<string>("");
  const [fieldRows, setFieldRows] = useState<FieldRow[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const addFieldRow = () => {
    setFieldRows(prev => [...prev, { id: crypto.randomUUID(), name: "", type: 'text' }]);
  };
  const updateFieldRow = (id: string, patch: Partial<FieldRow>) => {
    setFieldRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  };
  const removeFieldRow = (id: string) => {
    setFieldRows(prev => prev.filter(r => r.id !== id));
  };
  const resetAddForm = () => {
    setNewReportName("");
    setNewReportDescription("");
    setFieldRows([]);
  };
  const handleOpenAdd = () => {
    resetAddForm();
    setIsAddOpen(true);
  };
  const handleSaveReport = async () => {
    if (!tenantId || !profile?.profileData?.user_id) return;
    if (!newReportName.trim()) {
      toast({ title: 'Name required', description: 'Please provide a report name.', variant: 'destructive' });
      return;
    }
    const schema = {
      fields: fieldRows.map(r => ({ name: r.name.trim(), type: r.type }))
    };
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .insert({
          name: newReportName.trim(),
          description: newReportDescription.trim() || null,
          template_schema: schema as any,
          is_active: true,
          created_by: profile.profileData.user_id,
          tenant_id: tenantId,
          organization_id: null,
        })
        .select('id,name,description')
        .single();
      if (error) throw error;
      setPlatformTemplates(prev => {
        const next = [ ...(prev || []), data as any ];
        return next.sort((a, b) => a.name.localeCompare(b.name));
      });
      setIsAddOpen(false);
      toast({ title: 'Report added', description: 'The report template has been created.' });
    } catch (e: any) {
      toast({ title: 'Error', description: 'Failed to create report template.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // Edit moved to full-page Report Builder

  // Assign Subtypes dialog state
  const allOrgTypes = Constants.public.Enums.organization_type as readonly string[];
  const [isAssignOpen, setIsAssignOpen] = useState<boolean>(false);
  const [assignTemplateId, setAssignTemplateId] = useState<string | null>(null);
  const [initialAssignedTypes, setInitialAssignedTypes] = useState<string[]>([]);
  const [leftList, setLeftList] = useState<string[]>([]);
  const [rightList, setRightList] = useState<string[]>([]);
  const [leftSelected, setLeftSelected] = useState<string[]>([]);
  const [rightSelected, setRightSelected] = useState<string[]>([]);
  const [savingAssign, setSavingAssign] = useState<boolean>(false);

  const openAssignModal = async (templateId: string) => {
    try {
      // Show subtype as selected if ANY tenant currently has it assigned
      const { data, error } = await supabase
        .from('platform_assignments')
        .select('target_organization_type')
        .eq('element_type', 'report_template')
        .eq('element_id', templateId)
        .eq('target_type', 'organization_type');
      if (error) throw error;
      const assignedDistinct = Array.from(new Set((data || [])
        .map((r: any) => String(r.target_organization_type))
        .filter(Boolean)));
      const available = allOrgTypes.filter(t => !assignedDistinct.includes(t));
      setAssignTemplateId(templateId);
      setInitialAssignedTypes(assignedDistinct);
      setRightList(assignedDistinct);
      setLeftList(available);
      setLeftSelected([]);
      setRightSelected([]);
      setIsAssignOpen(true);
    } catch (e: any) {
      toast({ title: 'Error', description: 'Failed to load assignments', variant: 'destructive' });
    }
  };

  const moveRight = () => {
    const toMove = leftSelected;
    setRightList(prev => [...prev, ...toMove].sort());
    setLeftList(prev => prev.filter(i => !toMove.includes(i)));
    setLeftSelected([]);
  };
  const moveLeft = () => {
    const toMove = rightSelected;
    setLeftList(prev => [...prev, ...toMove].sort());
    setRightList(prev => prev.filter(i => !toMove.includes(i)));
    setRightSelected([]);
  };

  const saveAssignments = async () => {
    if (!assignTemplateId) return;
    setSavingAssign(true);
    const toAdd = rightList.filter(t => !initialAssignedTypes.includes(t));
    const toRemove = initialAssignedTypes.filter(t => !rightList.includes(t));
    try {
      // 0) Load source template (name/description/schema) so we can replicate per-tenant
      const { data: srcTemplate, error: srcErr } = await supabase
        .from('report_templates')
        .select('id, name, description, template_schema')
        .eq('id', assignTemplateId)
        .single();
      if (srcErr || !srcTemplate) throw (srcErr || new Error('Source template not found'));

      // 1) Expand selected subtypes to ALL tenant_ids that have orgs of those subtypes
      let tenantsForSelected: string[] = [];
      if (rightList.length > 0) {
        const { data: tenantRows, error: tenantErr } = await supabase
          .from('organizations')
          .select('tenant_id, organization_type')
          .in('organization_type', rightList as any);
        if (tenantErr) throw tenantErr;
        tenantsForSelected = Array.from(new Set((tenantRows || []).map((r: any) => r.tenant_id))).filter(Boolean);
      }

      // 2) Ensure a tenant-local report_template exists per tenant (by name) and map tenant -> template_id
      const tenantToTemplateId: Record<string, string> = {};
      if (tenantsForSelected.length > 0) {
        // Fetch any existing tenant-local templates by name in bulk
        const { data: existingTemplates } = await supabase
          .from('report_templates')
          .select('id, tenant_id')
          .in('tenant_id', tenantsForSelected)
          .eq('name', srcTemplate.name)
          .is('organization_id', null);
        (existingTemplates || []).forEach((rt: any) => {
          if (rt.tenant_id && rt.id) tenantToTemplateId[rt.tenant_id] = rt.id;
        });
        // Insert missing tenant-local templates
        const missingTenants = tenantsForSelected.filter(t => !tenantToTemplateId[t]);
        if (missingTenants.length > 0) {
          const rows = missingTenants.map(t => ({
            tenant_id: t,
            name: srcTemplate.name,
            description: srcTemplate.description,
            template_schema: (srcTemplate as any).template_schema,
            is_active: true,
            organization_id: null,
            created_by: profile?.profileData?.user_id || null,
          }));
          const { data: inserted, error: insErr } = await supabase
            .from('report_templates')
            .insert(rows)
            .select('id, tenant_id');
          if (insErr) throw insErr;
          (inserted || []).forEach((rt: any) => {
            if (rt.tenant_id && rt.id) tenantToTemplateId[rt.tenant_id] = rt.id;
          });
        }
      }

      // 3) Fetch existing assignments for these tenants/subtypes referencing the tenant-local template ids
      let existing: Array<{ tenant_id: string; target_organization_type: string; element_id: string }> = [];
      const templateIdsAcrossTenants = Object.values(tenantToTemplateId);
      if (tenantsForSelected.length > 0 && rightList.length > 0 && templateIdsAcrossTenants.length > 0) {
        const { data: existingRows, error: existErr } = await supabase
          .from('platform_assignments')
          .select('tenant_id, target_organization_type, element_id')
          .eq('element_type', 'report_template')
          .eq('target_type', 'organization_type')
          .in('tenant_id', tenantsForSelected)
          .in('element_id', templateIdsAcrossTenants)
          .in('target_organization_type', rightList as any);
        if (existErr) throw existErr;
        existing = (existingRows || []) as any;
      }

      // 4) Build missing assignment rows across all relevant tenants for all SELECTED subtypes
      const missingRows: any[] = [];
      for (const t of tenantsForSelected) {
        const templateId = tenantToTemplateId[t];
        if (!templateId) continue;
        for (const subtype of rightList) {
          const already = existing.some(e => e.tenant_id === t && e.target_organization_type === subtype && e.element_id === templateId);
          if (!already) {
            missingRows.push({
              tenant_id: t,
              element_type: 'report_template',
              element_id: templateId,
              target_type: 'organization_type',
              target_organization_type: subtype,
            });
          }
        }
      }
      if (missingRows.length > 0) {
        const { error: addErr } = await supabase.from('platform_assignments').insert(missingRows);
        if (addErr) throw addErr;
      }

      // 5) Remove deselected subtypes across ALL tenants for all tenant-local template ids sharing this name
      if (toRemove.length > 0) {
        const { data: allRt } = await supabase
          .from('report_templates')
          .select('id')
          .eq('name', srcTemplate.name)
          .is('organization_id', null);
        const allTemplateIds = (allRt || []).map((r: any) => r.id);
        if (allTemplateIds.length > 0) {
          const { error: delErr } = await supabase
            .from('platform_assignments')
            .delete()
            .eq('element_type', 'report_template')
            .eq('target_type', 'organization_type')
            .in('element_id', allTemplateIds)
            .in('target_organization_type', toRemove as any);
          if (delErr) throw delErr;
        }
      }

      setIsAssignOpen(false);
      toast({ title: 'Assignments saved', description: 'Subtype assignments updated across tenants.' });
    } catch (e: any) {
      toast({ title: 'Error', description: 'Failed to save assignments', variant: 'destructive' });
    } finally {
      setSavingAssign(false);
    }
  };

  // (Removed inline edit modal/state)

  // No navigation here: let visibility be controlled by nav and server RLS.

  useEffect(() => {
    const loadTemplates = async () => {
      if (!tenantId) return;
      setIsLoading(true);
      const { data } = await supabase
        .from('report_templates')
        .select('id,name,description')
        .eq('tenant_id', tenantId)
        .is('organization_id', null)
        .order('name', { ascending: true });
      setPlatformTemplates((data || []) as Array<{ id: string; name: string; description: string | null }>);
      setIsLoading(false);
    };
    loadTemplates();
  }, [tenantId]);

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Layers className="h-5 w-5" /> Repository</h1>
        <p className="text-sm text-muted-foreground">Manage platform elements</p>
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-muted-foreground">Platform-level report templates</div>
            <Button size="sm" onClick={handleOpenAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Report
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Report Name</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="w-20 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {platformTemplates.map(t => (
                    <TableRow key={t.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell className="text-muted-foreground">{t.description || ''}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openAssignModal(t.id)}>
                            <LayersIcon className="h-4 w-4" />
                            <span className="sr-only">Assign Subtypes</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigate(`/repository/reports/${t.id}`)}>
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">View More</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && platformTemplates.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-sm text-muted-foreground text-center py-6">
                        No platform forms found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Add Report Dialog */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Report</DialogTitle>
                <DialogDescription>Create a platform-level report template.</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Report Name</Label>
                  <Input value={newReportName} onChange={(e) => setNewReportName(e.target.value)} placeholder="Incident Report" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea rows={3} value={newReportDescription} onChange={(e) => setNewReportDescription(e.target.value)} placeholder="Describe this report template" />
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
                      <div className="text-sm text-muted-foreground">No fields added yet.</div>
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
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={isSaving}>Cancel</Button>
                <Button onClick={handleSaveReport} disabled={isSaving} className="gap-2">
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit moved to full-page Report Builder */}

          {/* Assign Subtypes Dialog */}
          <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Assign Organization Subtypes</DialogTitle>
                <DialogDescription>Select subtypes that should have this report template available.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="border rounded-md p-3">
                  <div className="font-medium mb-2 text-sm">Unselected</div>
                  <div className="space-y-1 max-h-60 overflow-auto">
                    {leftList.map(item => (
                      <label key={item} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="accent-primary" checked={leftSelected.includes(item)} onChange={(e) => {
                          setLeftSelected(prev => e.target.checked ? [...prev, item] : prev.filter(i => i !== item));
                        }} />
                        <span>{item.split('_').join(' ')}</span>
                      </label>
                    ))}
                    {leftList.length === 0 && (
                      <div className="text-xs text-muted-foreground">None</div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={moveRight}
                    disabled={leftSelected.length === 0}
                    className="w-32 gap-2 border bg-background hover:border-foreground/40 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-100 shadow-sm"
                  >
                    <span>Add</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={moveLeft}
                    disabled={rightSelected.length === 0}
                    className="w-32 gap-2 border bg-background hover:border-foreground/40 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-100 shadow-sm"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Remove</span>
                  </Button>
                </div>
                <div className="border rounded-md p-3">
                  <div className="font-medium mb-2 text-sm">Selected</div>
                  <div className="space-y-1 max-h-60 overflow-auto">
                    {rightList.map(item => (
                      <label key={item} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="accent-primary" checked={rightSelected.includes(item)} onChange={(e) => {
                          setRightSelected(prev => e.target.checked ? [...prev, item] : prev.filter(i => i !== item));
                        }} />
                        <span>{item.split('_').join(' ')}</span>
                      </label>
                    ))}
                    {rightList.length === 0 && (
                      <div className="text-xs text-muted-foreground">None</div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsAssignOpen(false)} disabled={savingAssign}>Cancel</Button>
                <Button onClick={saveAssignments} disabled={savingAssign} className="gap-2">
                  {savingAssign && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Assignments
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        <TabsContent value="equipment"></TabsContent>
      </Tabs>
    </div>
  );
}


